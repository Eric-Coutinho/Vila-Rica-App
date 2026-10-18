import { ApiError, apiFetch } from "./api";
import type {
  Reservation,
  ReservationGuestInput,
  ReservationSummary,
} from "../types/reservations";

type ErrorResponse = {
  ok?: boolean;
  message?: string;
};

type ReservationResponse = ErrorResponse & {
  reservation?: Reservation;
};

type ReservationListResponse = ErrorResponse & {
  reservations?: ReservationSummary[];
};

async function parseJson<T>(response: Response): Promise<T> {
  return response.json().catch(() => ({} as T));
}

function ensureSuccess(
  response: Response,
  data: ErrorResponse,
  fallback: string,
) {
  if (!response.ok || data.ok === false) {
    throw new ApiError(data.message || fallback, response.status);
  }
}

function requireReservation(
  data: ReservationResponse,
  response: Response,
): Reservation {
  if (!data.reservation) {
    throw new ApiError("A API não retornou a reserva atualizada.", response.status);
  }
  return data.reservation;
}

export async function listPartySaloonReservations(): Promise<
  ReservationSummary[]
> {
  const response = await apiFetch(
    "/reservation/list-reservations/party_saloon",
    { method: "GET" },
    true,
  );
  const data = await parseJson<ReservationListResponse>(response);
  ensureSuccess(response, data, "Não foi possível carregar as reservas.");
  return data.reservations ?? [];
}

export async function getReservationById(id: string): Promise<Reservation> {
  const response = await apiFetch(
    `/reservation/get-reservation/${encodeURIComponent(id)}`,
    { method: "GET" },
    true,
  );
  const data = await parseJson<ReservationResponse>(response);
  ensureSuccess(response, data, "Não foi possível carregar a reserva.");
  return requireReservation(data, response);
}

async function patchReservation(
  id: string,
  action: "confirm" | "confirm-payment" | "cancel",
): Promise<Reservation> {
  const response = await apiFetch(
    `/reservation/${encodeURIComponent(id)}/${action}`,
    { method: "PATCH" },
    true,
  );
  const data = await parseJson<ReservationResponse>(response);
  ensureSuccess(response, data, "Não foi possível atualizar a reserva.");
  return requireReservation(data, response);
}

export const confirmReservation = (id: string) =>
  patchReservation(id, "confirm");

export const confirmReservationPayment = (id: string) =>
  patchReservation(id, "confirm-payment");

export const cancelReservation = (id: string) =>
  patchReservation(id, "cancel");

export async function addReservationGuest(
  reservationId: string,
  guest: ReservationGuestInput,
): Promise<Reservation> {
  const response = await apiFetch(
    `/reservation/${encodeURIComponent(reservationId)}/guests`,
    { method: "POST", body: JSON.stringify(guest) },
    true,
  );
  const data = await parseJson<ReservationResponse>(response);
  ensureSuccess(response, data, "Não foi possível adicionar o convidado.");
  return requireReservation(data, response);
}

export async function removeReservationGuest(
  reservationId: string,
  guestId: string,
): Promise<Reservation> {
  const response = await apiFetch(
    `/reservation/${encodeURIComponent(reservationId)}/guests/${encodeURIComponent(guestId)}`,
    { method: "DELETE" },
    true,
  );
  const data = await parseJson<ReservationResponse>(response);
  ensureSuccess(response, data, "Não foi possível remover o convidado.");
  return requireReservation(data, response);
}
