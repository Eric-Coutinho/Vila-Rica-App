import { ApiError, apiFetch } from "./api";
import type {
  Delivery,
  DeliveryFilters,
  DeliveryResident,
  DeliveryStatus,
} from "../types/delivery";

type ResponseData = {
  ok?: boolean;
  message?: string;
  delivery?: Delivery;
  deliveries?: Delivery[];
  residents?: (DeliveryResident & {
    apartments?: { bloco: string; apartamento: string }[];
  })[];
  count?: number;
};

const json = <T>(response: Response) => response.json().catch(() => ({}) as T);
function ensure(response: Response, data: ResponseData, fallback: string) {
  if (!response.ok || data.ok === false)
    throw new ApiError(data.message || fallback, response.status);
}

function query(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });
  const text = params.toString();
  return text ? `?${text}` : "";
}

async function deliveryResult(response: Response, fallback: string) {
  const data = await json<ResponseData>(response);
  ensure(response, data, fallback);
  if (!data.delivery)
    throw new ApiError("A API não retornou a encomenda.", 500);
  return data.delivery;
}

export async function listDeliveries(filters: DeliveryFilters = {}) {
  const response = await apiFetch(
    `/deliveries${query(filters as Record<string, string | undefined>)}`,
    { method: "GET" },
    true,
  );
  const data = await json<ResponseData>(response);
  ensure(response, data, "Não foi possível carregar as encomendas.");
  return data.deliveries || [];
}

export async function getDelivery(id: string) {
  return deliveryResult(
    await apiFetch(
      `/deliveries/${encodeURIComponent(id)}`,
      { method: "GET" },
      true,
    ),
    "Não foi possível carregar a encomenda.",
  );
}

export async function createDelivery(input: {
  deliveredAt: string;
  sender: string;
  recipientType: "resident" | "apartment";
  recipientResidentId?: string;
  bloco?: string;
  apartamento?: string;
}) {
  return deliveryResult(
    await apiFetch(
      "/deliveries",
      { method: "POST", body: JSON.stringify(input) },
      true,
    ),
    "Não foi possível criar a encomenda.",
  );
}

export async function receiveDelivery(
  id: string,
  input: { receivedById?: string; receivedAt: string },
) {
  return deliveryResult(
    await apiFetch(
      `/deliveries/${encodeURIComponent(id)}/receive`,
      { method: "POST", body: JSON.stringify(input) },
      true,
    ),
    "Não foi possível confirmar o recebimento.",
  );
}

export async function createDeliveryComplaint(
  id: string,
  input: { description: string; createdAt: string },
) {
  return deliveryResult(
    await apiFetch(
      `/deliveries/${encodeURIComponent(id)}/complaint`,
      { method: "POST", body: JSON.stringify(input) },
      true,
    ),
    "Não foi possível criar a reclamação.",
  );
}

export async function addDeliveryMessage(id: string, text: string) {
  return deliveryResult(
    await apiFetch(
      `/deliveries/${encodeURIComponent(id)}/messages`,
      { method: "POST", body: JSON.stringify({ text }) },
      true,
    ),
    "Não foi possível adicionar a resposta.",
  );
}

export async function updateDeliveryStatus(
  id: string,
  status: Exclude<DeliveryStatus, "at_reception" | "received">,
) {
  return deliveryResult(
    await apiFetch(
      `/deliveries/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      true,
    ),
    "Não foi possível atualizar o status.",
  );
}

export async function getDeliveryBadge() {
  const response = await apiFetch("/deliveries/badge", { method: "GET" }, true);
  const data = await json<ResponseData>(response);
  ensure(response, data, "Não foi possível consultar as encomendas.");
  return data.count || 0;
}

export async function searchDeliveryResidents(search: string) {
  const response = await apiFetch(
    `/deliveries/residents${query({ search })}`,
    { method: "GET" },
    true,
  );
  const data = await json<ResponseData>(response);
  ensure(response, data, "Não foi possível pesquisar moradores.");
  return data.residents || [];
}

export async function receiptCandidates(id: string, search?: string) {
  const response = await apiFetch(
    `/deliveries/${encodeURIComponent(id)}/receipt-candidates${query({ search })}`,
    { method: "GET" },
    true,
  );
  const data = await json<ResponseData>(response);
  ensure(response, data, "Não foi possível carregar os moradores.");
  return data.residents || [];
}
