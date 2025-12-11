import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import {
  ContactType,
  DesignType,
  FrameType,
  LensIndex,
  LensType,
  MaterialFamily,
  PrismBase,
  ReplacementType,
  StabilisationType,
  Treatment,
  WearType,
} from '../../optician/enums.js';

import { DEFAULT_CURRENCY, SupportedCurrencyValues } from './currency.js';
import { InvoiceStatusValues, InvoiceStatuses } from './status.js';

export interface InvoiceNotes {
  reason?: string;
  comment?: string;
}

export interface PaymentEntry {
  amount: number;
  method?: string; // 'cash', 'card', 'transfer', 'check', etc.
  reference?: string; // numéro de chèque, référence de virement, etc.
  paidAt: Date;
  notes?: string;
}

// Snapshot de prescription au moment de la vente (immuable)
export interface PrescriptionSnapshotEyeCorrection {
  sphere?: number | null;
  cylinder?: number | null;
  axis?: number | null;
  add?: number | null;
  prism?: { value?: number | null; base?: PrismBase | null } | null;
}

export interface PrescriptionSnapshotGlassesParams {
  lensType: LensType;
  index: LensIndex;
  treatments?: Array<Treatment>;
  pd?: number | { mono: { od: number; og: number }; near?: number };
  segmentHeight?: number;
  vertexDistance?: number;
  baseCurve?: number;
  frame?: {
    type: FrameType;
    eye: number;
    bridge: number;
    temple: number;
    material?: string;
  };
}

export interface PrescriptionSnapshotContactParams {
  type: ContactType;
  design: DesignType;
  add?: number;
  toric?: { cylinder: number; axis: number; stabilisation?: StabilisationType };
  material: { family: MaterialFamily; waterContent?: number; dk_t?: number };
  schedule: { wear: WearType; replacement: ReplacementType };
  geometry: { bc: number; dia: number };
  options?: Array<'tint' | 'uv'>;
  care?: { solutionBrand?: string };
}

export interface PrescriptionSnapshot {
  kind: 'glasses' | 'contacts';
  correction: { od: PrescriptionSnapshotEyeCorrection; og: PrescriptionSnapshotEyeCorrection };
  glassesParams?: PrescriptionSnapshotGlassesParams;
  contactLensParams?: PrescriptionSnapshotContactParams;
  issuedAt?: Date;
}

const invoiceSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'OpticalPrescription', required: false },
    prescriptionSnapshot: {
      type: new Schema<PrescriptionSnapshot>(
        {
          kind: { type: String, enum: ['glasses', 'contacts'], required: true },
          correction: {
            type: new Schema(
              {
                od: {
                  type: new Schema(
                    {
                      sphere: { type: Number, required: false, default: null },
                      cylinder: { type: Number, required: false, default: null },
                      axis: { type: Number, required: false, default: null },
                      add: { type: Number, required: false, default: null },
                      prism: {
                        type: new Schema(
                          {
                            value: { type: Number, required: false, default: null },
                            base: {
                              type: String,
                              enum: Object.values(PrismBase),
                              required: false,
                              default: null,
                            },
                          },
                          { _id: false }
                        ),
                        required: false,
                        default: null,
                      },
                    },
                    { _id: false }
                  ),
                  required: true,
                },
                og: {
                  type: new Schema(
                    {
                      sphere: { type: Number, required: false, default: null },
                      cylinder: { type: Number, required: false, default: null },
                      axis: { type: Number, required: false, default: null },
                      add: { type: Number, required: false, default: null },
                      prism: {
                        type: new Schema(
                          {
                            value: { type: Number, required: false, default: null },
                            base: {
                              type: String,
                              enum: Object.values(PrismBase),
                              required: false,
                              default: null,
                            },
                          },
                          { _id: false }
                        ),
                        required: false,
                        default: null,
                      },
                    },
                    { _id: false }
                  ),
                  required: true,
                },
              },
              { _id: false }
            ),
            required: true,
          },
          glassesParams: {
            type: new Schema(
              {
                lensType: { type: String, enum: Object.values(LensType), required: false },
                index: { type: String, enum: Object.values(LensIndex) },
                treatments: {
                  type: [String],
                  enum: Object.values(Treatment),
                  default: [],
                },
                pd: { type: Schema.Types.Mixed },
                segmentHeight: { type: Number },
                vertexDistance: { type: Number },
                baseCurve: { type: Number },
                frame: {
                  type: new Schema(
                    {
                      type: { type: String, enum: Object.values(FrameType) },
                      eye: { type: Number },
                      bridge: { type: Number },
                      temple: { type: Number },
                      material: { type: String },
                    },
                    { _id: false }
                  ),
                },
              },
              { _id: false }
            ),
            required: false,
          },
          contactLensParams: {
            type: new Schema(
              {
                type: { type: String, enum: Object.values(ContactType) },
                design: { type: String, enum: Object.values(DesignType) },
                add: { type: Number },
                toric: {
                  type: new Schema(
                    {
                      cylinder: { type: Number },
                      axis: { type: Number },
                      stabilisation: { type: String, enum: Object.values(StabilisationType) },
                    },
                    { _id: false }
                  ),
                },
                material: {
                  type: new Schema(
                    {
                      family: { type: String, enum: Object.values(MaterialFamily) },
                      waterContent: { type: Number },
                      dk_t: { type: Number },
                    },
                    { _id: false }
                  ),
                },
                schedule: {
                  type: new Schema(
                    {
                      wear: { type: String, enum: Object.values(WearType) },
                      replacement: { type: String, enum: Object.values(ReplacementType) },
                    },
                    { _id: false }
                  ),
                },
                geometry: {
                  type: new Schema(
                    {
                      bc: { type: Number },
                      dia: { type: Number },
                    },
                    { _id: false }
                  ),
                },
                options: { type: [String], enum: ['tint', 'uv'], default: [] },
                care: { type: new Schema({ solutionBrand: { type: String } }, { _id: false }) },
              },
              { _id: false }
            ),
            required: false,
          },
          issuedAt: { type: Date, required: false },
        },
        { _id: false }
      ),
      required: false,
      default: undefined,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, required: true, min: 0, default: 0 },
    creditAmount: { type: Number, required: true, min: 0, default: 0 }, // avoir
    currency: {
      type: String,
      enum: [...SupportedCurrencyValues],
      required: true,
      default: DEFAULT_CURRENCY,
    },
    status: {
      type: String,
      enum: [...InvoiceStatusValues],
      default: InvoiceStatuses.Draft,
      index: true,
    },
    notes: {
      type: new Schema<InvoiceNotes>(
        {
          reason: { type: String, required: false },
          comment: { type: String, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    // Historique des paiements
    payments: {
      type: [
        new Schema<PaymentEntry>(
          {
            amount: { type: Number, required: true, min: 0 },
            method: { type: String, required: false },
            reference: { type: String, required: false },
            paidAt: { type: Date, required: true, default: () => new Date() },
            notes: { type: String, required: false },
          },
          { _id: true, timestamps: true }
        ),
      ],
      required: false,
      default: [],
    },
    deletedAt: { type: Date, required: false, index: true, default: null },
  },
  { timestamps: true }
);

invoiceSchema.virtual('remainingAmount').get(function (this: Invoice) {
  const paid = (this.advanceAmount || 0) + (this.creditAmount || 0);
  const remaining = Math.max(0, (this.totalAmount || 0) - paid);
  return remaining;
});

// Validation métier: calculer advanceAmount depuis payments, puis valider
invoiceSchema.pre('validate', function (next) {
  const self = this as unknown as Invoice & { payments?: PaymentEntry[] };

  // 1. Calculer advanceAmount à partir des paiements si présents
  if (self.payments && Array.isArray(self.payments) && self.payments.length > 0) {
    const totalPaid = self.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    self.advanceAmount = totalPaid;
  }

  // 2. Valider que avance + avoir <= total
  const total = Number(self.totalAmount || 0);
  const advance = Number(self.advanceAmount || 0);
  const credit = Number(self.creditAmount || 0);
  if (advance + credit > total) {
    return next(new Error('advance_plus_credit_exceeds_total'));
  }

  // 3. Mettre à jour le statut en fonction des montants
  const remaining = Math.max(0, total - (advance + credit));
  if (remaining === 0 && total > 0) self.status = InvoiceStatuses.Paid;
  else if (advance + credit > 0 && remaining > 0) self.status = InvoiceStatuses.Partial;
  else self.status = InvoiceStatuses.Draft;

  next();
});

export type Invoice = InferSchemaType<typeof invoiceSchema> & {
  _id: string;
} & { remainingAmount?: number };
export const InvoiceModel: Model<Invoice> =
  (mongoose.models.Invoice as Model<Invoice>) || mongoose.model<Invoice>('Invoice', invoiceSchema);
