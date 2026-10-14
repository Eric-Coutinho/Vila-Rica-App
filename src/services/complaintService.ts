import { ApiError, apiFetch } from "./api";
import type {
  Complaint,
  ComplaintListFilters,
  ComplaintPagination,
  ComplaintResidentOption,
  ComplaintStatus,
  ComplaintSummary,
  CreateComplaintInput,
} from "../types/complaint";

type ErrorResponse = {
  ok?: boolean;
  message?: string;
};

type ComplaintResponse = ErrorResponse & {
  complaint?: Complaint;
};

type ComplaintListResponse = ErrorResponse & {
  complaints?: ComplaintSummary[];
  meta?: ComplaintPagination;
};

type UsersResponse = ErrorResponse & {
  users?: {
    _id: string;
    name?: string;
    bloco?: string;
    apartamento?: string;
  }[];
};

async function parseJson<T>(response: Response): Promise<T> {
  return response.json().catch(() => ({}) as T);
}

function ensureSuccess(
  response: Response,
  data: ErrorResponse,
  fallback: string,
): void {
  if (!response.ok || data.ok === false) {
    throw new ApiError(data.message || fallback, response.status);
  }
}

function buildQuery(filters: ComplaintListFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.date?.trim()) params.set("date", filters.date.trim());
  if (filters.number?.trim()) params.set("number", filters.number.trim());
  if (filters.title?.trim()) params.set("title", filters.title.trim());
  if (filters.resident?.trim()) params.set("resident", filters.resident.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listComplaints(
  filters: ComplaintListFilters = {},
): Promise<{
  complaints: ComplaintSummary[];
  meta: ComplaintPagination;
}> {
  const response = await apiFetch(
    `/complaints${buildQuery(filters)}`,
    { method: "GET" },
    true,
  );
  const data = await parseJson<ComplaintListResponse>(response);
  ensureSuccess(response, data, "Não foi possível carregar as reclamações.");

  return {
    complaints: data.complaints ?? [],
    meta: data.meta ?? {
      total: data.complaints?.length ?? 0,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      pages: 1,
    },
  };
}

export async function getComplaintById(id: string): Promise<Complaint> {
  const response = await apiFetch(
    `/complaints/${encodeURIComponent(id)}`,
    { method: "GET" },
    true,
  );
  const data = await parseJson<ComplaintResponse>(response);
  ensureSuccess(response, data, "Não foi possível carregar a reclamação.");

  if (!data.complaint) {
    throw new ApiError("Reclamação não encontrada.", 404);
  }

  return data.complaint;
}

export async function createComplaint(
  input: CreateComplaintInput,
): Promise<Complaint> {
  const payload = {
    title: input.title,
    description: input.description,
    occurrenceDate: input.occurrenceDate,
    involvedResidentIds: input.involved.residents.map(
      (resident) => resident.id,
    ),
    involvedApartments: input.involved.apartments.map((apartment) => ({
      bloco: apartment.bloco,
      apartamento: apartment.apartamento,
    })),
    useDefaultContact: input.useDefaultContact,
    ...(input.useDefaultContact
      ? {}
      : {
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
        }),
  };

  const response = await apiFetch(
    "/complaints",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
  const data = await parseJson<ComplaintResponse>(response);
  ensureSuccess(response, data, "Não foi possível registrar a reclamação.");

  if (!data.complaint) {
    throw new ApiError("A API não retornou a reclamação criada.", 500);
  }

  return data.complaint;
}

export async function addComplaintMessage(
  complaintId: string,
  text: string,
): Promise<Complaint> {
  const response = await apiFetch(
    `/complaints/${encodeURIComponent(complaintId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
    true,
  );
  const data = await parseJson<ComplaintResponse>(response);
  ensureSuccess(response, data, "Não foi possível adicionar a resposta.");

  if (!data.complaint) {
    throw new ApiError("A API não retornou a reclamação atualizada.", 500);
  }

  return data.complaint;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: Exclude<ComplaintStatus, "created">,
): Promise<Complaint> {
  const response = await apiFetch(
    `/complaints/${encodeURIComponent(complaintId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    true,
  );
  const data = await parseJson<ComplaintResponse>(response);
  ensureSuccess(response, data, "Não foi possível atualizar o status.");

  if (!data.complaint) {
    throw new ApiError("A API não retornou a reclamação atualizada.", 500);
  }

  return data.complaint;
}

export async function deleteComplaint(complaintId: string): Promise<void> {
  const response = await apiFetch(
    `/complaints/${encodeURIComponent(complaintId)}`,
    { method: "DELETE" },
    true,
  );
  const data = await parseJson<ErrorResponse>(response);
  ensureSuccess(response, data, "Não foi possível excluir a reclamação.");
}

export async function listComplaintResidents(): Promise<
  ComplaintResidentOption[]
> {
  const response = await apiFetch(
    "/auth/list-users?role=morador&limit=200",
    { method: "GET" },
    true,
  );
  const data = await parseJson<UsersResponse>(response);
  ensureSuccess(response, data, "Não foi possível carregar os moradores.");

  return (data.users ?? []).map((user) => ({
    id: user._id,
    _id: user._id,
    name: user.name || "Morador",
    bloco: user.bloco,
    apartamento: user.apartamento,
  }));
}
