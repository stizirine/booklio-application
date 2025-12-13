import { Router, type Response } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import {
  handleInvoicePaymentExceedsError,
  handleNotFoundError,
  handleValidationError,
} from '../errors.js';

import { SupportedCurrencies, SupportedCurrencySchema } from './currency.js';
import { InvoiceModel } from './model.js';
import { InvoiceStatuses } from './status.js';

export const router = Router();
// Fix: notes as structured object

const notesSchema = z
  .object({
    reason: z.string().optional(),
    comment: z.string().optional(),
  })
  .nullish();

const paymentEntrySchema = z.object({
  amount: z.number().min(0.01),
  method: z.string().optional(),
  reference: z.string().optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Schéma pour prescriptionSnapshot (simplifié pour la validation)
const prescriptionSnapshotSchema = z.object({
  kind: z.enum(['glasses', 'contacts']),
  correction: z.object({
    od: z.object({
      sphere: z.number().nullable().optional(),
      cylinder: z.number().nullable().optional(),
      axis: z.number().nullable().optional(),
      add: z.number().nullable().optional(),
      prism: z.object({
        value: z.number().nullable().optional(),
        base: z.string().nullable().optional(),
      }).nullable().optional(),
    }),
    og: z.object({
      sphere: z.number().nullable().optional(),
      cylinder: z.number().nullable().optional(),
      axis: z.number().nullable().optional(),
      add: z.number().nullable().optional(),
      prism: z.object({
        value: z.number().nullable().optional(),
        base: z.string().nullable().optional(),
      }).nullable().optional(),
    }),
  }),
  glassesParams: z.object({
    lensType: z.string().optional(),
    index: z.string().optional(),
    treatments: z.array(z.string()).optional(),
    pd: z.union([z.number(), z.object({
      mono: z.object({
        od: z.number(),
        og: z.number(),
      }),
      near: z.number().optional(),
    })]).optional(),
    segmentHeight: z.number().optional(),
    vertexDistance: z.number().optional(),
    baseCurve: z.number().optional(),
    frame: z.object({
      type: z.string().optional(),
      eye: z.number().optional(),
      bridge: z.number().optional(),
      temple: z.number().optional(),
      material: z.string().optional(),
    }).optional(),
  }).optional(),
  contactLensParams: z.any().optional(),
  issuedAt: z.string().datetime().optional(),
}).optional();

// Schéma pour les items de facture
const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
  category: z.enum(['frame', 'lens', 'service']).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  discountAmount: z.number().min(0).optional(),
  frameData: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    material: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  lensData: z.object({
    material: z.string().optional(),
    index: z.string().optional(),
    treatment: z.string().optional(),
    brand: z.string().optional(),
    rightEye: z.object({
      sphere: z.string().optional(),
      cylinder: z.string().optional(),
      axis: z.string().optional(),
      add: z.string().optional(),
    }).optional(),
    leftEye: z.object({
      sphere: z.string().optional(),
      cylinder: z.string().optional(),
      axis: z.string().optional(),
      add: z.string().optional(),
    }).optional(),
    pd: z.union([z.number(), z.object({
      mono: z.object({
        od: z.number(),
        og: z.number(),
      }),
      near: z.number().optional(),
    })]).optional(),
  }).optional(),
});

const createSchema = z.object({
  clientId: z.string().min(1).refine(
    (val) => {
      // Vérifier que c'est un ObjectId MongoDB valide (24 caractères hexadécimaux)
      return /^[0-9a-fA-F]{24}$/.test(val);
    },
    {
      message: 'clientId must be a valid MongoDB ObjectId',
    }
  ),
  type: z.enum(['InvoiceClient', 'Invoice']).optional().default('Invoice'),
  totalAmount: z.number().min(0),
  advanceAmount: z.number().min(0).default(0),
  creditAmount: z.number().min(0).default(0),
  currency: SupportedCurrencySchema.default(SupportedCurrencies.EUR),
  notes: notesSchema,
  payment: paymentEntrySchema.optional(), // Objet unique (rétrocompatibilité)
  payments: z.array(paymentEntrySchema).optional(), // Tableau de paiements
  prescriptionId: z.string().optional(), // ID de la prescription optique
  prescriptionSnapshot: prescriptionSnapshotSchema, // Snapshot de prescription
  items: z.array(invoiceItemSchema).optional(), // Items de la facture
});

const updateSchema = z.object({
  clientId: z.string().min(1).optional(),
  totalAmount: z.number().min(0).optional(),
  advanceAmount: z.number().min(0).optional(),
  creditAmount: z.number().min(0).optional(),
  currency: SupportedCurrencySchema.optional(),
  notes: notesSchema,
  items: z.array(invoiceItemSchema).optional(), // Items de la facture
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  const { payment, payments, advanceAmount, prescriptionSnapshot, ...restData } = parsed.data;

  // Construire le payload de base
  const invoicePayload: Record<string, unknown> = {
    tenantId: current.tenantId,
    deletedAt: null,
    ...restData,
  };

  // Ajouter prescriptionSnapshot si fourni (convertir issuedAt en Date si présent)
  if (prescriptionSnapshot) {
    const snapshot: Record<string, unknown> = { ...prescriptionSnapshot };
    if (snapshot.issuedAt && typeof snapshot.issuedAt === 'string') {
      snapshot.issuedAt = new Date(snapshot.issuedAt);
    }
    invoicePayload.prescriptionSnapshot = snapshot;
  }

  // Gestion des paiements : priorité dans l'ordre payments > payment > advanceAmount
  if (payments && payments.length > 0) {
    // Si payments (tableau) est fourni, l'utiliser directement
    invoicePayload.payments = payments.map((p) => ({
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      paidAt: p.paidAt ? new Date(p.paidAt) : new Date(),
      notes: p.notes,
    }));
    // advanceAmount sera calculé automatiquement par le hook pre-validate
  } else if (payment) {
    // Si payment (objet unique) est fourni, créer un tableau avec un seul élément
    invoicePayload.payments = [
      {
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
        notes: payment.notes,
      },
    ];
    // advanceAmount sera calculé automatiquement par le hook pre-validate
  } else if (advanceAmount !== undefined) {
    // Si pas de payment/payments mais advanceAmount fourni, l'utiliser (mode classique)
    invoicePayload.advanceAmount = advanceAmount;
  }

  const created = await InvoiceModel.create(invoicePayload);

  // Calculer le invoiceSummary mis à jour pour le client
  const invoiceSummaryResult = await InvoiceModel.aggregate([
    { $match: { tenantId: current.tenantId, deletedAt: null, clientId: created.clientId } },
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

  const summary = invoiceSummaryResult[0];
  const invoiceSummary = summary
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

  return res.status(201).json({
    invoice: {
      _id: created._id,
      tenantId: created.tenantId,
      clientId: created.clientId,
      totalAmount: created.totalAmount,
      advanceAmount: created.advanceAmount,
      creditAmount: created.creditAmount,
      currency: created.currency,
      status: created.status,
      notes: created.notes,
      items: created.items || [],
      payments: created.payments || [],
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
      remainingAmount: created.remainingAmount,
    },
    invoiceSummary,
  });
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const {
    clientId,
    type,
    limit = '20',
    page = '1',
    sort = '-createdAt',
    format,
    includeDeleted,
    onlyDeleted,
    includeClient,
  } = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = { tenantId: current.tenantId };
  if (clientId) filter.clientId = clientId;
  if (type) filter.type = type;
  if (onlyDeleted === 'true') filter.deletedAt = { $ne: null };
  else if (includeDeleted === 'true') {
    /* no filter */
  } else filter.deletedAt = null;
  const lim = Math.max(1, Math.min(100, Number(limit)));
  const pg = Math.max(1, Number(page));
  const q = InvoiceModel.find(filter)
    .sort(sort as string)
    .skip((pg - 1) * lim)
    .limit(lim);
  const includeClientFlag = includeClient !== 'false';
  if (includeClientFlag) {
    q.populate({ path: 'clientId', model: 'Client', select: 'firstName lastName email phone' });
  }
  const [items, total] = await Promise.all([q, InvoiceModel.countDocuments(filter)]);
  const mapped = items.map((inv) => {
    const client: unknown = inv.clientId as unknown;
    const clientObj =
      includeClientFlag && client && typeof client === 'object'
        ? (client as {
            _id: string;
            firstName: string;
            lastName: string;
            email?: string;
            phone?: string;
          })
        : undefined;
    // Récupérer les items depuis le document Mongoose
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoiceItems = (inv as any).items || [];
    return {
      _id: inv._id,
      tenantId: inv.tenantId,
      clientId: inv.clientId,
      client: clientObj
        ? {
            _id: String(clientObj._id),
            firstName: clientObj.firstName,
            lastName: clientObj.lastName,
            email: clientObj.email,
            phone: clientObj.phone,
          }
        : undefined,
      totalAmount: inv.totalAmount,
      advanceAmount: inv.advanceAmount,
      creditAmount: inv.creditAmount,
      currency: inv.currency,
      status: inv.status,
      notes: inv.notes,
      items: Array.isArray(invoiceItems) ? invoiceItems : [],
      payments: inv.payments || [],
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      deletedAt: inv.deletedAt,
      remainingAmount: inv.remainingAmount,
    };
  });
  if (format === 'csv') {
    const headers = [
      '_id',
      'clientId',
      'totalAmount',
      'advanceAmount',
      'creditAmount',
      'remainingAmount',
      'status',
      'currency',
      'createdAt',
    ];
    const lines = [headers.join(',')].concat(
      mapped.map((i) =>
        [
          i._id,
          i.clientId,
          i.totalAmount,
          i.advanceAmount,
          i.creditAmount,
          i.remainingAmount,
          i.status,
          i.currency,
          i.createdAt,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    return res.send(lines.join('\n'));
  }
  return res.json({
    items: mapped,
    total,
    page: pg,
    pages: Math.ceil(total / lim),
  });
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const { includeClient } = req.query as Record<string, string | undefined>;
  const q = InvoiceModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
    deletedAt: null,
  });
  const includeClientFlag = includeClient !== 'false';
  if (includeClientFlag) {
    q.populate({ path: 'clientId', model: 'Client', select: 'firstName lastName email phone' });
  }
  const inv = await q;
  if (!inv) return res.status(404).json(handleNotFoundError('invoice'));
  // Récupérer les items depuis le document Mongoose
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceItems = (inv as any).items || [];
  return res.json({
    invoice: {
      _id: inv._id,
      tenantId: inv.tenantId,
      clientId: inv.clientId,
      client: (() => {
        const client: unknown = inv.clientId as unknown;
        if (!includeClientFlag || !client || typeof client !== 'object') return undefined;
        const c = client as {
          _id: string;
          firstName: string;
          lastName: string;
          email?: string;
          phone?: string;
        };
        return {
          _id: String(c._id),
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
        };
      })(),
      totalAmount: inv.totalAmount,
      advanceAmount: inv.advanceAmount,
      creditAmount: inv.creditAmount,
      currency: inv.currency,
      status: inv.status,
      notes: inv.notes,
      items: Array.isArray(invoiceItems) ? invoiceItems : [],
      payments: inv.payments || [],
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      deletedAt: inv.deletedAt,
      remainingAmount: inv.remainingAmount,
    },
  });
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error(
      'Invoice PATCH validation error:',
      JSON.stringify(parsed.error.format(), null, 2)
    );
    return res.status(400).json(handleValidationError(parsed.error));
  }
  const updated = await InvoiceModel.findOneAndUpdate(
    { _id: req.params.id, tenantId: current.tenantId },
    parsed.data,
    { new: true }
  );
  if (!updated) return res.status(404).json(handleNotFoundError('invoice'));

  // Calculer le invoiceSummary mis à jour pour le client
  const invoiceSummaryResult = await InvoiceModel.aggregate([
    { $match: { tenantId: current.tenantId, deletedAt: null, clientId: updated.clientId } },
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

  const summary = invoiceSummaryResult[0];
  const invoiceSummary = summary
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

  return res.json({
    invoice: {
      _id: updated._id,
      tenantId: updated.tenantId,
      clientId: updated.clientId,
      totalAmount: updated.totalAmount,
      advanceAmount: updated.advanceAmount,
      creditAmount: updated.creditAmount,
      currency: updated.currency,
      status: updated.status,
      notes: updated.notes,
      items: updated.items || [],
      payments: updated.payments || [],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
      remainingAmount: updated.remainingAmount,
    },
    invoiceSummary,
  });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const { hard } = req.query as Record<string, string | undefined>;

  // Récupérer la facture avant de la supprimer pour obtenir le clientId
  const invoice = await InvoiceModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
  });

  if (!invoice) return res.status(404).json(handleNotFoundError('invoice'));

  const clientId = invoice.clientId;

  if (hard === 'true') {
    await InvoiceModel.deleteOne({
      _id: req.params.id,
      tenantId: current.tenantId,
    });
  } else {
    await InvoiceModel.findOneAndUpdate(
      { _id: req.params.id, tenantId: current.tenantId },
      { deletedAt: new Date() }
    );
  }

  // Calculer le invoiceSummary mis à jour pour le client
  const invoiceSummaryResult = await InvoiceModel.aggregate([
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

  const summary = invoiceSummaryResult[0];
  const invoiceSummary = summary
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

  return res.json({ ok: true, hardDeleted: hard === 'true', invoiceSummary, clientId });
});

// Ajouter un paiement à une facture
router.post('/:id/payments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const paymentSchema = z.object({
    amount: z.number().min(0.01),
    method: z.string().optional(),
    reference: z.string().optional(),
    paidAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  });

  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));

  const invoice = await InvoiceModel.findOne({
    _id: req.params.id,
    tenantId: current.tenantId,
    deletedAt: null,
  });

  if (!invoice) return res.status(404).json(handleNotFoundError('invoice'));

  // Vérifier que le paiement ne dépasse pas le montant restant
  const currentPaid = (invoice.advanceAmount || 0) + (invoice.creditAmount || 0);
  const remaining = Math.max(0, (invoice.totalAmount || 0) - currentPaid);

  if (parsed.data.amount > remaining) {
    return res.status(400).json(handleInvoicePaymentExceedsError(remaining));
  }

  // Ajouter le paiement
  const newPayment = {
    amount: parsed.data.amount,
    method: parsed.data.method,
    reference: parsed.data.reference,
    paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date(),
    notes: parsed.data.notes,
  };

  // Initialiser le tableau s'il n'existe pas et ajouter le paiement
  if (!invoice.payments) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoice.payments = [] as any;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (invoice.payments as any[]).push(newPayment);

  // Sauvegarder (le hook pre-save calculera advanceAmount automatiquement)
  await invoice.save();

  // Calculer le invoiceSummary mis à jour
  const invoiceSummaryResult = await InvoiceModel.aggregate([
    { $match: { tenantId: current.tenantId, deletedAt: null, clientId: invoice.clientId } },
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

  const summary = invoiceSummaryResult[0];
  const invoiceSummary = summary
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

  return res.json({
    invoice: {
      _id: invoice._id,
      tenantId: invoice.tenantId,
      clientId: invoice.clientId,
      totalAmount: invoice.totalAmount,
      advanceAmount: invoice.advanceAmount,
      creditAmount: invoice.creditAmount,
      currency: invoice.currency,
      status: invoice.status,
      notes: invoice.notes,
      items: invoice.items || [],
      payments: invoice.payments,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      deletedAt: invoice.deletedAt,
      remainingAmount: invoice.remainingAmount,
    },
    invoiceSummary,
  });
});

// Supprimer un paiement spécifique d'une facture
router.delete(
  '/:id/payments/:paymentId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const current = req.user!;
    const invoice = await InvoiceModel.findOne({
      _id: req.params.id,
      tenantId: current.tenantId,
      deletedAt: null,
    });

    if (!invoice) return res.status(404).json(handleNotFoundError('invoice'));

    if (!invoice.payments || invoice.payments.length === 0) {
      return res.status(404).json(handleNotFoundError('payment'));
    }

    // Trouver l'index du paiement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIndex = (invoice.payments as any[]).findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => String(p._id) === req.params.paymentId
    );

    if (paymentIndex === -1) {
      return res.status(404).json(handleNotFoundError('payment'));
    }

    // Supprimer le paiement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (invoice.payments as any[]).splice(paymentIndex, 1);

    // Sauvegarder (le hook pre-save recalculera advanceAmount)
    await invoice.save();

    // Calculer le invoiceSummary mis à jour
    const invoiceSummaryResult = await InvoiceModel.aggregate([
      { $match: { tenantId: current.tenantId, deletedAt: null, clientId: invoice.clientId } },
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

    const summary = invoiceSummaryResult[0];
    const invoiceSummary = summary
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

    return res.json({
      invoice: {
        _id: invoice._id,
        tenantId: invoice.tenantId,
        clientId: invoice.clientId,
        totalAmount: invoice.totalAmount,
        advanceAmount: invoice.advanceAmount,
        creditAmount: invoice.creditAmount,
        currency: invoice.currency,
        status: invoice.status,
        notes: invoice.notes,
        items: invoice.items || [],
        payments: invoice.payments,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        deletedAt: invoice.deletedAt,
        remainingAmount: invoice.remainingAmount,
      },
      invoiceSummary,
    });
  }
);

// Recalculer le statut des factures en fonction des montants
router.post('/recalc', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const schema = z.object({
    clientId: z.string().optional(),
    dryRun: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
  const { clientId, dryRun = false } = parsed.data;

  const filter: Record<string, unknown> = {
    tenantId: current.tenantId,
    deletedAt: null,
  };
  if (clientId) filter.clientId = clientId;

  const cursor = InvoiceModel.find(filter).cursor();
  let scanned = 0;
  let changed = 0;
  const changes: Array<{ id: string; from: string; to: string }> = [];

  function computeStatus(
    total: number,
    advance: number,
    credit: number
  ): (typeof InvoiceStatuses)[keyof typeof InvoiceStatuses] {
    const paid = (advance || 0) + (credit || 0);
    const remaining = Math.max(0, (total || 0) - paid);
    if ((total || 0) > 0 && remaining === 0) return InvoiceStatuses.Paid;
    if (paid > 0 && remaining > 0) return InvoiceStatuses.Partial;
    return InvoiceStatuses.Draft;
  }

  for await (const inv of cursor) {
    scanned += 1;
    const desired = computeStatus(
      inv.totalAmount || 0,
      inv.advanceAmount || 0,
      inv.creditAmount || 0
    );
    if (inv.status !== desired) {
      changed += 1;
      changes.push({ id: String(inv._id), from: inv.status, to: desired });
      if (!dryRun) {
        await InvoiceModel.updateOne({ _id: inv._id }, { $set: { status: desired } });
      }
    }
  }

  return res.json({ scanned, changed, dryRun, changes });
});
