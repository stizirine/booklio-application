import { Router, type Request, type Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import { handleInvalidDatesError, handleNotFoundError, handleValidationError } from '../errors.js';
import { InvoiceModel } from '../invoices/model.js';

import { AppointmentModel, type Appointment, type AppointmentNotes } from './model.js';
import {
  AppointmentStatuses,
  AppointmentStatusSchema,
  AppointmentStatusValues,
  type AppointmentStatus,
} from './status.js';

import type { FilterQuery } from 'mongoose';

function isAllowedTransition(from: string, to: string): boolean {
  // Règles:
  // scheduled -> in_progress | canceled | rescheduled
  // in_progress -> done
  // Toute autre transition est refusée
  if (from === AppointmentStatuses.Scheduled) {
    return (
      to === AppointmentStatuses.InProgress ||
      to === AppointmentStatuses.Canceled ||
      to === AppointmentStatuses.Rescheduled
    );
  }
  if (from === AppointmentStatuses.InProgress) {
    return to === AppointmentStatuses.Done;
  }
  // Par défaut, pas de transition autorisée depuis canceled, rescheduled, done
  return false;
}

export const router = Router();

const createSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().optional(),
  startAt: z.string().transform((v) => new Date(v)),
  endAt: z.string().transform((v) => new Date(v)),
  status: AppointmentStatusSchema.optional(),
  notes: z.object({ reason: z.string().optional(), comment: z.string().optional() }).optional(),
});
// Liste des statuts autorisés
router.get('/statuses', requireAuth, async (_req: Request, res: Response) => {
  return res.json({
    statuses: [...AppointmentStatusValues],
    map: AppointmentStatuses,
  });
});

const updateSchema = createSchema.partial();

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  const data: z.infer<typeof createSchema> = parsed.data;
  if (data.endAt <= data.startAt) return res.status(400).json(handleInvalidDatesError());
  const created = await AppointmentModel.create({
    tenantId: current.tenantId,
    deletedAt: null,
    ...data,
  });
  return res.status(201).json({ appointment: created });
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const {
    clientId,
    from,
    to,
    status,
    limit = '50',
    page = '1',
    format,
    includeDeleted,
    onlyDeleted,
    includeClient = 'true',
    includeInvoiceSummary = 'true',
  } = req.query as Record<string, string | undefined>;
  const filter: FilterQuery<Appointment> = {
    tenantId: current.tenantId,
  } as FilterQuery<Appointment>;
  if (clientId) filter.clientId = clientId;
  if (status) filter.status = status;
  if (onlyDeleted === 'true') filter.deletedAt = { $ne: null };
  else if (includeDeleted === 'true') {
    /* no filter */
  } else filter.deletedAt = null;
  if (from || to) {
    filter.startAt = {};
    if (from) filter.startAt.$gte = new Date(from);
    if (to) filter.startAt.$lte = new Date(to);
  }
  const lim = Math.max(1, Math.min(200, Number(limit)));
  const pg = Math.max(1, Number(page));

  const shouldIncludeClient = includeClient !== 'false';
  const query = AppointmentModel.find(filter)
    .sort({ startAt: -1 }) // Tri par date décroissante seulement côté MongoDB
    .skip((pg - 1) * lim)
    .limit(lim);

  if (shouldIncludeClient) {
    query.populate({ path: 'clientId', model: 'Client', select: 'firstName lastName email phone' });
  }

  const [items, total] = await Promise.all([query, AppointmentModel.countDocuments(filter)]);

  // Récupérer les données de facturation si demandé
  const shouldIncludeInvoiceSummary = includeInvoiceSummary !== 'false';
  const invoiceSummaryMap = new Map<
    string,
    {
      totalAmount: number;
      dueAmount: number;
      invoiceCount: number;
      lastInvoiceAt: Date | null;
    }
  >();

  if (shouldIncludeInvoiceSummary && items.length > 0) {
    const clientIds = [
      ...new Set(
        items.map((apt) => {
          // Si clientId est un objet (à cause du populate), utiliser _id
          if (typeof apt.clientId === 'object' && apt.clientId !== null) {
            return new Types.ObjectId(String((apt.clientId as { _id: unknown })._id));
          }
          return new Types.ObjectId(apt.clientId);
        })
      ),
    ];
    const invoiceSummaries = await InvoiceModel.aggregate([
      { $match: { tenantId: current.tenantId, deletedAt: null, clientId: { $in: clientIds } } },
      {
        $group: {
          _id: '$clientId',
          totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
          dueAmount: {
            $sum: {
              $let: {
                vars: {
                  paid: {
                    $add: [{ $ifNull: ['$advanceAmount', 0] }, { $ifNull: ['$creditAmount', 0] }],
                  },
                },
                in: {
                  $max: [
                    0,
                    {
                      $subtract: [{ $ifNull: ['$totalAmount', 0] }, '$$paid'],
                    },
                  ],
                },
              },
            },
          },
          invoiceCount: { $sum: 1 },
          lastInvoiceAt: { $max: '$createdAt' },
        },
      },
    ]);

    for (const summary of invoiceSummaries) {
      invoiceSummaryMap.set(String(summary._id), {
        totalAmount: summary.totalAmount || 0,
        dueAmount: summary.dueAmount || 0,
        invoiceCount: summary.invoiceCount || 0,
        lastInvoiceAt: summary.lastInvoiceAt || null,
      });
    }
  }

  // Tri par statut puis par date (même logique que pour les clients)
  const statusOrder = ['in_progress', 'scheduled', 'rescheduled', 'created', 'done', 'canceled'];
  const sortedItems = items.sort((a, b) => {
    const statusA = statusOrder.indexOf(a.status);
    const statusB = statusOrder.indexOf(b.status);

    // Si un statut n'est pas dans la liste, le mettre à la fin
    const statusAIndex = statusA === -1 ? 999 : statusA;
    const statusBIndex = statusB === -1 ? 999 : statusB;

    if (statusAIndex !== statusBIndex) {
      return statusAIndex - statusBIndex; // Tri par statut (ordre de priorité)
    }

    // Si même statut, tri par date décroissante (plus récent en premier)
    return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
  });

  if (format === 'csv') {
    const headers = [
      '_id',
      'clientId',
      'title',
      'startAt',
      'endAt',
      'status',
      'notes.reason',
      'notes.comment',
      'createdAt',
    ];
    const lines = [headers.join(',')].concat(
      sortedItems.map((a) =>
        [
          a.id,
          String(a.clientId),
          a.title || '',
          a.startAt?.toISOString() || '',
          a.endAt?.toISOString() || '',
          a.status || '',
          (a.notes as AppointmentNotes)?.reason || '',
          (a.notes as AppointmentNotes)?.comment || '',
          a.createdAt?.toISOString() || '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"');
    return res.send(lines.join('\n'));
  }
  const mappedItems = sortedItems.map((apt) => {
    const client: unknown = apt.clientId as unknown;
    const clientObj =
      shouldIncludeClient && client && typeof client === 'object'
        ? (client as {
            _id: string;
            firstName: string;
            lastName: string;
            email?: string;
            phone?: string;
          })
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {
      _id: apt._id,
      tenantId: apt.tenantId,
      clientId:
        typeof apt.clientId === 'object' && apt.clientId !== null
          ? String((apt.clientId as { _id: unknown })._id)
          : String(apt.clientId),
      client: clientObj
        ? {
            _id: String(clientObj._id),
            firstName: clientObj.firstName,
            lastName: clientObj.lastName,
            email: clientObj.email,
            phone: clientObj.phone,
          }
        : undefined,
      title: apt.title,
      startAt: apt.startAt,
      endAt: apt.endAt,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
      deletedAt: apt.deletedAt,
    };

    // Ajouter invoiceSummary si demandé
    if (shouldIncludeInvoiceSummary) {
      const clientId =
        typeof apt.clientId === 'object' && apt.clientId !== null
          ? String((apt.clientId as { _id: unknown })._id)
          : String(apt.clientId);
      result.invoiceSummary = invoiceSummaryMap.get(clientId) || {
        totalAmount: 0,
        dueAmount: 0,
        invoiceCount: 0,
        lastInvoiceAt: null,
      };
    }

    return result;
  });

  return res.json({ items: mappedItems, total, page: pg, pages: Math.ceil(total / lim) });
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const { includeClient = 'true', includeInvoiceSummary = 'true' } = req.query as Record<
    string,
    string | undefined
  >;

  const shouldIncludeClient = includeClient !== 'false';
  const query = AppointmentModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
    deletedAt: null,
  });

  if (shouldIncludeClient) {
    query.populate({ path: 'clientId', model: 'Client', select: 'firstName lastName email phone' });
  }

  const item = await query;
  if (!item) return res.status(404).json(handleNotFoundError('appointment'));

  // Récupérer les données de facturation si demandé
  const shouldIncludeInvoiceSummary = includeInvoiceSummary !== 'false';
  let invoiceSummary:
    | {
        totalAmount: number;
        dueAmount: number;
        invoiceCount: number;
        lastInvoiceAt: Date | null;
      }
    | undefined = undefined;

  if (shouldIncludeInvoiceSummary) {
    const clientId =
      typeof item.clientId === 'object' && item.clientId !== null
        ? new Types.ObjectId(String((item.clientId as { _id: unknown })._id))
        : new Types.ObjectId(item.clientId);

    const invoiceSummaries = await InvoiceModel.aggregate([
      { $match: { tenantId: current.tenantId, deletedAt: null, clientId: clientId } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
          dueAmount: {
            $sum: {
              $let: {
                vars: {
                  paid: {
                    $add: [{ $ifNull: ['$advanceAmount', 0] }, { $ifNull: ['$creditAmount', 0] }],
                  },
                },
                in: {
                  $max: [
                    0,
                    {
                      $subtract: [{ $ifNull: ['$totalAmount', 0] }, '$$paid'],
                    },
                  ],
                },
              },
            },
          },
          invoiceCount: { $sum: 1 },
          lastInvoiceAt: { $max: '$createdAt' },
        },
      },
    ]);

    const summary = invoiceSummaries[0];
    invoiceSummary = summary
      ? {
          totalAmount: summary.totalAmount || 0,
          dueAmount: summary.dueAmount || 0,
          invoiceCount: summary.invoiceCount || 0,
          lastInvoiceAt: summary.lastInvoiceAt || null,
        }
      : {
          totalAmount: 0,
          dueAmount: 0,
          invoiceCount: 0,
          lastInvoiceAt: null,
        };
  }

  // Note: Pour un seul rendez-vous, le tri n'est pas nécessaire mais on garde la cohérence
  const client: unknown = item.clientId as unknown;
  const clientObj =
    shouldIncludeClient && client && typeof client === 'object'
      ? (client as {
          _id: string;
          firstName: string;
          lastName: string;
          email?: string;
          phone?: string;
        })
      : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedAppointment: any = {
    _id: item._id,
    tenantId: item.tenantId,
    clientId:
      typeof item.clientId === 'object' && item.clientId !== null
        ? String((item.clientId as { _id: unknown })._id)
        : String(item.clientId),
    client: clientObj
      ? {
          _id: String(clientObj._id),
          firstName: clientObj.firstName,
          lastName: clientObj.lastName,
          email: clientObj.email,
          phone: clientObj.phone,
        }
      : undefined,
    title: item.title,
    startAt: item.startAt,
    endAt: item.endAt,
    status: item.status,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    deletedAt: item.deletedAt,
  };

  // Ajouter invoiceSummary si demandé
  if (shouldIncludeInvoiceSummary && invoiceSummary) {
    mappedAppointment.invoiceSummary = invoiceSummary;
  }

  return res.json({ appointment: mappedAppointment });
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  // Si demande de changement de statut, vérifier la transition
  if (parsed.data.status) {
    const existing = await AppointmentModel.findOne({
      _id: req.params.id,
      tenantId: current.tenantId,
      deletedAt: null,
    });
    if (!existing) return res.status(404).json(handleNotFoundError('appointment'));
    const to = parsed.data.status as AppointmentStatus;
    if (!isAllowedTransition(existing.status as AppointmentStatus, to)) {
      return res.status(400).json(
        handleValidationError({
          flatten: () => ({
            fieldErrors: {
              status: [`Invalid transition from ${existing.status} to ${to}`],
            },
          }),
        })
      );
    }
  }
  const updated = await AppointmentModel.findOneAndUpdate(
    { _id: req.params.id, tenantId: current.tenantId, deletedAt: null },
    parsed.data,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'not_found' });
  return res.json({ appointment: updated });
});

// Mettre à jour uniquement le statut
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const body = (req.body || {}) as { status?: string };
  const StatusSchema = z.object({ status: AppointmentStatusSchema });
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  const existing = await AppointmentModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
    deletedAt: null,
  });
  if (!existing) return res.status(404).json({ error: 'not_found' });
  const to = parsed.data.status as AppointmentStatus;
  if (!isAllowedTransition(existing.status as AppointmentStatus, to)) {
    return res.status(400).json({ error: 'invalid_transition', from: existing.status, to });
  }
  const updated = await AppointmentModel.findOneAndUpdate(
    { _id: req.params.id, tenantId: current.tenantId, deletedAt: null },
    { status: to },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'not_found' });
  return res.json({ appointment: updated });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const { hard } = req.query as Record<string, string | undefined>;
  if (hard === 'true') {
    await AppointmentModel.deleteOne({
      _id: req.params.id,
      tenantId: current.tenantId,
    });
  } else {
    await AppointmentModel.findOneAndUpdate(
      { _id: req.params.id, tenantId: current.tenantId },
      { deletedAt: new Date() }
    );
  }
  return res.json({ ok: true, hardDeleted: hard === 'true' });
});
