import { z } from 'zod';

export const AppointmentStatuses = {
  Scheduled: 'scheduled',
  InProgress: 'in_progress',
  Done: 'done',
  Canceled: 'canceled',
  Rescheduled: 'rescheduled',
} as const;

export const AppointmentStatusValues = [
  AppointmentStatuses.Scheduled,
  AppointmentStatuses.InProgress,
  AppointmentStatuses.Done,
  AppointmentStatuses.Canceled,
  AppointmentStatuses.Rescheduled,
] as const;

export const AppointmentStatusSchema = z.enum([
  AppointmentStatuses.Scheduled,
  AppointmentStatuses.InProgress,
  AppointmentStatuses.Done,
  AppointmentStatuses.Canceled,
  AppointmentStatuses.Rescheduled,
] as [
  typeof AppointmentStatuses.Scheduled,
  typeof AppointmentStatuses.InProgress,
  typeof AppointmentStatuses.Done,
  typeof AppointmentStatuses.Canceled,
  typeof AppointmentStatuses.Rescheduled,
]);

export type AppointmentStatus = (typeof AppointmentStatusValues)[number];
