import { API_BASE_URL, ApiError, apiFetch } from "./api";
import { getAccessToken } from "./session";

export type ApartmentResident = {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  cpf?: string;
  birthDate?: string;
};

export type ApartmentInfo = {
  bloco: string;
  apartamento: string;
  isRented: boolean;
  contact: string;
  responsible: { id: string; name: string; phone: string } | null;
  residents: ApartmentResident[];
};

export type ApartmentCandidate = { id: string; name: string };

async function readBody(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.ok) {
    throw new ApiError(
      body?.message || "Não foi possível carregar os apartamentos.",
      response.status,
    );
  }
  return body;
}

export async function getMyApartments(): Promise<ApartmentInfo[]> {
  const response = await apiFetch("/apartments/mine", { method: "GET" }, true);
  const body = await readBody(response);
  return Array.isArray(body.apartments) ? body.apartments : [];
}

export async function findApartment(
  bloco: string,
  apartamento: string,
): Promise<ApartmentInfo> {
  const params = new URLSearchParams({ bloco, apartamento });
  const response = await apiFetch(
    `/apartments?${params.toString()}`,
    { method: "GET" },
    true,
  );
  return (await readBody(response)).apartment as ApartmentInfo;
}

export async function searchApartmentCandidates(
  search: string,
): Promise<ApartmentCandidate[]> {
  if (search.trim().length < 4) return [];
  const response = await apiFetch(
    `/apartments/candidates?search=${encodeURIComponent(search.trim())}`,
    { method: "GET" },
    true,
  );
  const body = await readBody(response);
  return Array.isArray(body.users) ? body.users : [];
}

export async function updateApartment(
  apartment: Pick<ApartmentInfo, "bloco" | "apartamento">,
  data: { isRented: boolean; contact: string; responsibleId?: string },
): Promise<ApartmentInfo> {
  const response = await apiFetch(
    `/apartments/${encodeURIComponent(apartment.bloco)}/${encodeURIComponent(apartment.apartamento)}`,
    { method: "PATCH", body: JSON.stringify(data) },
    true,
  );
  return (await readBody(response)).apartment as ApartmentInfo;
}

export async function linkResidentToApartment(
  apartment: Pick<ApartmentInfo, "bloco" | "apartamento">,
  userId: string,
  relation: string,
): Promise<ApartmentInfo> {
  const response = await apiFetch(
    `/apartments/${encodeURIComponent(apartment.bloco)}/${encodeURIComponent(apartment.apartamento)}/residents`,
    { method: "POST", body: JSON.stringify({ userId, relation }) },
    true,
  );
  return (await readBody(response)).apartment as ApartmentInfo;
}

export async function unlinkResidentFromApartment(
  apartment: Pick<ApartmentInfo, "bloco" | "apartamento">,
  userId: string,
): Promise<ApartmentInfo> {
  const response = await apiFetch(
    `/apartments/${encodeURIComponent(apartment.bloco)}/${encodeURIComponent(apartment.apartamento)}/residents/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
    true,
  );
  return (await readBody(response)).apartment as ApartmentInfo;
}

export async function importResidentsSpreadsheet(file: FormData): Promise<{
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
  warnings?: Array<{ row: number; message: string }>;
}> {
  const token = await getAccessToken();
  if (!token)
    throw new ApiError("Sessão não encontrada. Faça login novamente.", 401);
  const response = await fetch(`${API_BASE_URL}/auth/import-users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: file,
  });
  return readBody(response);
}

export const residentImportTemplateUrl = `${API_BASE_URL.replace(/\/api$/, "")}/templates/Adicionar_moradores.xlsx`;
