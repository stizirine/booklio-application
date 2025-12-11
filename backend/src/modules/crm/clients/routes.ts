import { Router, type Response } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import { AppointmentModel } from '../appointments/model.js';
import {
  handleClientDuplicateError,
  handleDatabaseError,
  handleNotFoundError,
  handleValidationError,
} from '../errors.js';
import { InvoiceModel } from '../invoices/model.js';

import { ClientModel, type Client } from './model.js';

type ClientAggregate = {
  totalAmount: number;
  dueAmount: number;
  invoiceCount: number;
  lastInvoiceAt: Date | null;
};

type SimplifiedAppointment = {
  _id: string;
  tenantId: string;
  clientId: string;
  title?: string | null;
  startAt: Date;
  endAt: Date;
  status: string;
  notes?: {
    reason?: string;
    comment?: string;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

type ClientListItem = (Client & { _id: string }) &
  Partial<ClientAggregate> & {
    appointments?: SimplifiedAppointment[];
    invoiceSummary?: InvoiceSummary;
  };

type InvoiceSummary = ClientAggregate;

type SimplifiedInvoice = {
  _id: string;
  tenantId: string;
  clientId: string;
  totalAmount: number;
  advanceAmount: number;
  creditAmount: number;
  currency: string;
  status: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  remainingAmount?: number;
};

export const router = Router();

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));

  try {
    // Vérifier si un client existe déjà avec le même nom + prénom + téléphone
    const existingClient = await ClientModel.findOne({
      tenantId: current.tenantId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      deletedAt: null,
    });

    if (existingClient) {
      // Client existe : mettre à jour avec les nouvelles données
      const updated = await ClientModel.findOneAndUpdate(
        { _id: existingClient._id, tenantId: current.tenantId },
        {
          email: parsed.data.email || existingClient.email,
          address: parsed.data.address || existingClient.address,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        client: updated,
        message: 'Client existant mis à jour',
        wasExisting: true,
      });
    } else {
      // Client n'existe pas : créer un nouveau
      const created = await ClientModel.create({
        tenantId: current.tenantId,
        deletedAt: null,
        ...parsed.data,
      });
      return res.status(201).json({
        client: created,
        message: 'Nouveau client créé',
        wasExisting: false,
      });
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e.code === 11000 || e.code === '11000')) {
      return res.status(409).json(handleClientDuplicateError());
    }
    console.error('Error creating client:', e);
    return res.status(500).json(handleDatabaseError(e));
  }
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const {
    q,
    limit = '20',
    page = '1',
    sort = '-createdAt',
    format,
    includeDeleted,
    onlyDeleted,
    includeAppointments = 'true',
    appointmentsLimit = '10',
  } = req.query as Record<string, string | undefined>;

  // Désactiver les rendez-vous si explicitement demandé
  const shouldIncludeAppointments = includeAppointments !== 'false';
  const filter: Record<string, unknown> = { tenantId: current.tenantId };
  if (onlyDeleted === 'true') filter.deletedAt = { $ne: null };
  else if (includeDeleted === 'true') {
    // pas de contrainte sur deletedAt
  } else {
    filter.deletedAt = null;
  }
  if (q) {
    filter.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ];
  }
  const lim = Math.max(1, Math.min(100, Number(limit)));
  const pg = Math.max(1, Number(page));
  const itemsPromise = ClientModel.find(filter)
    .sort(sort as string)
    .skip((pg - 1) * lim)
    .limit(lim);
  const totalPromise = ClientModel.countDocuments(filter);
  const amountsPromise = InvoiceModel.aggregate([
    { $match: { tenantId: current.tenantId, deletedAt: null } },
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
  const [items, total, amounts] = await Promise.all([itemsPromise, totalPromise, amountsPromise]);

  const amountMap = new Map<string, ClientAggregate>();
  for (const a of amounts as Array<{
    _id: unknown;
    totalAmount: number;
    dueAmount: number;
    invoiceCount?: number;
    lastInvoiceAt?: Date;
  }>) {
    amountMap.set(String(a._id), {
      totalAmount: a.totalAmount || 0,
      dueAmount: a.dueAmount || 0,
      invoiceCount: a.invoiceCount || 0,
      lastInvoiceAt: a.lastInvoiceAt || null,
    });
  }

  // Récupérer les rendez-vous par défaut (sauf si désactivé)
  const appointmentsMap = new Map<string, SimplifiedAppointment[]>();
  if (shouldIncludeAppointments) {
    const clientIds = items.map((c: Client & { _id: string }) => String(c._id));
    const appointmentsLimitNum = Math.max(1, Math.min(50, Number(appointmentsLimit)));

    // Ordre de priorité des statuts
    const statusOrder = ['in_progress', 'scheduled', 'rescheduled', 'created', 'done', 'canceled'];

    const appointments = await AppointmentModel.find({
      tenantId: current.tenantId,
      clientId: { $in: clientIds },
      deletedAt: null,
    })
      .sort({ startAt: -1 }) // Tri par date décroissante seulement
      .limit(clientIds.length * appointmentsLimitNum);

    // Grouper les rendez-vous par client
    for (const apt of appointments) {
      const clientId = String(apt.clientId);
      if (!appointmentsMap.has(clientId)) {
        appointmentsMap.set(clientId, []);
      }
      const clientAppointments = appointmentsMap.get(clientId)!;

      // Limiter le nombre de rendez-vous par client
      if (clientAppointments.length < appointmentsLimitNum) {
        clientAppointments.push({
          _id: String(apt._id),
          tenantId: String(apt.tenantId),
          clientId: String(apt.clientId),
          title: apt.title ?? null,
          startAt: apt.startAt,
          endAt: apt.endAt,
          status: apt.status,
          notes: apt.notes ?? null,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          deletedAt: apt.deletedAt ?? null,
        });
      }
    }

    // Trier les rendez-vous de chaque client selon l'ordre de priorité
    for (const [, clientAppointments] of appointmentsMap) {
      clientAppointments.sort((a, b) => {
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
    }
  }

  const itemsWithAmounts: ClientListItem[] = items.map(
    (c: Client & { toObject?: () => unknown }) => {
      const agg = amountMap.get(String((c as { _id: string })._id)) || {
        totalAmount: 0,
        dueAmount: 0,
        invoiceCount: 0,
        lastInvoiceAt: null,
      };
      const base = ((): Client & { _id: string } => {
        if (
          typeof (c as unknown as { toObject?: () => Client & { _id: string } }).toObject ===
          'function'
        ) {
          return (c as unknown as { toObject: () => Client & { _id: string } }).toObject();
        }
        return c as Client & { _id: string };
      })();

      const result: ClientListItem = {
        ...base,
        invoiceSummary: {
          totalAmount: agg.totalAmount,
          dueAmount: agg.dueAmount,
          invoiceCount: agg.invoiceCount,
          lastInvoiceAt: agg.lastInvoiceAt,
        },
      };

      // Ajouter les rendez-vous par défaut (sauf si désactivé)
      if (shouldIncludeAppointments) {
        result.appointments = appointmentsMap.get(String(base._id)) || [];
      }

      return result;
    }
  );
  if (format === 'csv') {
    const headers = ['_id', 'firstName', 'lastName', 'email', 'phone', 'address', 'createdAt'];
    const lines = [headers.join(',')].concat(
      items.map((c: Client) =>
        [
          c._id,
          c.firstName,
          c.lastName,
          c.email || '',
          c.phone || '',
          (c.address || '').replace(/\n/g, ' '),
          c.createdAt?.toISOString() || '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
    return res.send(lines.join('\n'));
  }
  return res.json({ items: itemsWithAmounts, total, page: pg, pages: Math.ceil(total / lim) });
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const {
    includeInvoices,
    invoicesLimit,
    includeAppointments = 'true',
    appointmentsLimit = '10',
  } = req.query as Record<string, string | undefined>;
  const item = await ClientModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
    deletedAt: null,
  });
  if (!item) return res.status(404).json(handleNotFoundError('client'));
  let invoiceSummary: InvoiceSummary | undefined = undefined;
  let invoices: SimplifiedInvoice[] | undefined = undefined;
  let appointments: SimplifiedAppointment[] | undefined = undefined;

  const promises: Array<Promise<void>> = [];
  // Toujours inclure invoiceSummary par défaut
  promises.push(
    InvoiceModel.aggregate([
      { $match: { tenantId: current.tenantId, deletedAt: null, clientId: item._id } },
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
    ]).then((arr) => {
      const s = (arr?.[0] as unknown as InvoiceSummary & { _id?: unknown }) || null;
      invoiceSummary = s
        ? {
            totalAmount: s.totalAmount || 0,
            dueAmount: s.dueAmount || 0,
            invoiceCount: s.invoiceCount || 0,
            lastInvoiceAt: s.lastInvoiceAt || null,
          }
        : { totalAmount: 0, dueAmount: 0, invoiceCount: 0, lastInvoiceAt: null };
    })
  );
  if (includeInvoices === 'true') {
    const lim = Math.max(1, Math.min(200, Number(invoicesLimit || '50')));
    promises.push(
      InvoiceModel.find({
        tenantId: current.tenantId,
        clientId: item._id,
        deletedAt: null,
      })
        .sort('-createdAt')
        .limit(lim)
        .then((docs) => {
          invoices = docs.map((inv) => {
            const base: SimplifiedInvoice = {
              _id: String(inv._id),
              tenantId: String(inv.tenantId),
              clientId: String(inv.clientId),
              totalAmount: Number(inv.totalAmount || 0),
              advanceAmount: Number(inv.advanceAmount || 0),
              creditAmount: Number(inv.creditAmount || 0),
              currency: String(inv.currency),
              status: String(inv.status),
            };
            if (inv.notes != null) base.notes = String(inv.notes);
            if (inv.createdAt) base.createdAt = inv.createdAt;
            if (inv.updatedAt) base.updatedAt = inv.updatedAt;
            if (
              typeof (inv as unknown as { remainingAmount?: number }).remainingAmount === 'number'
            ) {
              base.remainingAmount = (
                inv as unknown as { remainingAmount: number }
              ).remainingAmount;
            }
            base.deletedAt = (inv.deletedAt as Date | null) ?? null;
            return base;
          });
        })
    );
  }

  // Récupérer les rendez-vous par défaut (sauf si désactivé)
  const shouldIncludeAppointments = includeAppointments !== 'false';
  if (shouldIncludeAppointments) {
    const appointmentsLimitNum = Math.max(1, Math.min(50, Number(appointmentsLimit)));

    // Ordre de priorité des statuts
    const statusOrder = ['in_progress', 'scheduled', 'rescheduled', 'created', 'done', 'canceled'];

    promises.push(
      AppointmentModel.find({
        tenantId: current.tenantId,
        clientId: item._id,
        deletedAt: null,
      })
        .sort({ startAt: -1 }) // Tri par date décroissante seulement
        .limit(appointmentsLimitNum)
        .then((docs) => {
          appointments = docs.map((apt) => ({
            _id: String(apt._id),
            tenantId: String(apt.tenantId),
            clientId: String(apt.clientId),
            title: apt.title ?? null,
            startAt: apt.startAt,
            endAt: apt.endAt,
            status: apt.status,
            notes: apt.notes ?? null,
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt,
            deletedAt: apt.deletedAt ?? null,
          }));

          // Trier les rendez-vous selon l'ordre de priorité
          appointments.sort((a, b) => {
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
        })
    );
  }

  if (promises.length > 0) await Promise.all(promises);

  return res.json({ client: item, invoiceSummary, invoices, appointments });
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  try {
    const updated = await ClientModel.findOneAndUpdate(
      { _id: req.params.id, tenantId: current.tenantId, deletedAt: null },
      parsed.data,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'not_found' });
    return res.json({ client: updated });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e.code === 11000 || e.code === '11000')) {
      const error = e as { keyPattern?: Record<string, unknown> };
      return res.status(409).json({
        error: 'duplicate_client',
        fields: Object.keys(error.keyPattern || {}),
      });
    }
    console.error('Error updating client:', e);
    return res.status(500).json(handleDatabaseError(e));
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const { cascade, hard } = req.query as Record<string, string | undefined>;
  if (cascade !== 'true') {
    return res.status(400).json({
      error: 'cascade_required',
      message: 'Passer ?cascade=true pour confirmer la suppression et ses effets.',
    });
  }
  let client: Client | null = null;
  if (hard === 'true') {
    client = await ClientModel.findOneAndDelete({
      _id: req.params.id,
      tenantId: current.tenantId,
    });
  } else {
    client = await ClientModel.findOneAndUpdate(
      { _id: req.params.id, tenantId: current.tenantId },
      { deletedAt: new Date() },
      { new: true }
    );
  }
  if (!client) return res.json({ ok: true });
  await Promise.all([
    AppointmentModel.deleteMany({
      tenantId: current.tenantId,
      clientId: req.params.id,
    }),
    InvoiceModel.deleteMany({
      tenantId: current.tenantId,
      clientId: req.params.id,
    }),
  ]);
  return res.json({
    ok: true,
    cascaded: { appointments: true, invoices: true },
    hardDeleted: hard === 'true',
  });
});

// Restaurer un client soft-deleted
router.post('/:id/restore', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  try {
    const restored = await ClientModel.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: current.tenantId,
        deletedAt: { $ne: null },
      },
      { deletedAt: null },
      { new: true }
    );
    if (!restored) return res.status(404).json({ error: 'not_found_or_not_deleted' });
    return res.json({ client: restored });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e.code === 11000 || e.code === '11000')) {
      return res.status(409).json({
        error: 'duplicate_client',
        message: 'Conflit email/phone lors de la restauration.',
      });
    }
    console.error('Error restoring client:', e);
    return res.status(500).json(handleDatabaseError(e));
  }
});
