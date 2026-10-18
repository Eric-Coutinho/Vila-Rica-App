export type ReservationStatus =
  | "created"
  | "waiting_for_payment"
  | "confirmed"
  | "ended"
  | "canceled";

export type ReservationGuest = {
  id: string;
  _id?: string;
  name: string;
  cpf: string;
  birthDate: string;
};

export type ReservationPerson = {
  email?: string;
  name: string;
  apartamento: string;
  bloco: string;
};

export type ReservationSummary = {
  id: string;
  _id?: string;
  type: "party_saloon" | "move";
  date: string;
  time: string;
  startsAt: string;
  occasion: string;
  status: ReservationStatus;
  guestCount: number;
  reservedBy: ReservationPerson;
  createdAt?: string;
  updatedAt?: string;
};

export type ReservationPermissions = {
  isOwner: boolean;
  isManager: boolean;
  canConfirmReservation: boolean;
  canConfirmPayment: boolean;
  canCancel: boolean;
  canManageGuests: boolean;
};

export type Reservation = ReservationSummary & {
  guests: ReservationGuest[];
  guestEditingDeadline: string;
  reservationConfirmedAt?: string | null;
  paymentConfirmedAt?: string | null;
  canceledAt?: string | null;
  requiresPaymentContact: boolean;
  requiresRefundContact: boolean;
  permissions: ReservationPermissions;
};

export type ReservationGuestInput = {
  name: string;
  cpf: string;
  birthDate: string;
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  created: "Criada",
  waiting_for_payment: "Aguardando pagamento",
  confirmed: "Confirmada",
  ended: "Encerrada",
  canceled: "Cancelada",
};

export const RESERVATION_STATUS_COLOR: Record<ReservationStatus, string> = {
  created: "#f4c430",
  waiting_for_payment: "#f28c28",
  confirmed: "#20c55a",
  ended: "#6b7280",
  canceled: "#e53935",
};

export const RESERVATION_STATUS_OPTIONS: Array<{
  label: string;
  value: "all" | ReservationStatus;
}> = [
  { label: "Todos", value: "all" },
  { label: RESERVATION_STATUS_LABEL.created, value: "created" },
  {
    label: RESERVATION_STATUS_LABEL.waiting_for_payment,
    value: "waiting_for_payment",
  },
  { label: RESERVATION_STATUS_LABEL.confirmed, value: "confirmed" },
  { label: RESERVATION_STATUS_LABEL.ended, value: "ended" },
  { label: RESERVATION_STATUS_LABEL.canceled, value: "canceled" },
];
