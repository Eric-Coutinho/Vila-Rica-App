import { apiFetch, ApiError } from "./api";
import type {
  SupportCaseStatus,
  SupportChatResponse,
  SupportConversation,
} from "../types/support";

async function readBody(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.ok) {
    throw new ApiError(
      body?.message || "Não foi possível concluir a solicitação.",
      response.status,
    );
  }
  return body;
}

export async function sendSupportMessage(
  message: string,
  conversationId?: string,
  quickReplyKey?: string,
): Promise<SupportChatResponse> {
  const response = await apiFetch(
    "/support/chat",
    {
      method: "POST",
      body: JSON.stringify({ message, conversationId, quickReplyKey }),
    },
    true,
  );

  return (await readBody(response)) as SupportChatResponse;
}

export async function getCurrentSupportConversation(): Promise<SupportConversation | null> {
  const response = await apiFetch(
    "/support/conversations/current",
    { method: "GET" },
    true,
  );
  const body = await readBody(response);
  return body.conversation || null;
}

export async function startNewSupportConversation(): Promise<SupportConversation> {
  const response = await apiFetch(
    "/support/conversations/new",
    { method: "POST" },
    true,
  );
  return (await readBody(response)).conversation as SupportConversation;
}

export async function escalateSupportConversation(
  id: string,
): Promise<SupportConversation> {
  const response = await apiFetch(
    `/support/conversations/${id}/escalate`,
    { method: "POST" },
    true,
  );
  return (await readBody(response)).conversation as SupportConversation;
}

export async function listSupportCases(filters: {
  date?: string;
  status?: SupportCaseStatus | "";
}): Promise<SupportConversation[]> {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  const response = await apiFetch(
    `/support/conversations${query ? `?${query}` : ""}`,
    { method: "GET" },
    true,
  );
  const body = await readBody(response);
  return Array.isArray(body.conversations) ? body.conversations : [];
}

export async function getSupportCase(id: string): Promise<SupportConversation> {
  const response = await apiFetch(
    `/support/conversations/${id}`,
    { method: "GET" },
    true,
  );
  return (await readBody(response)).conversation as SupportConversation;
}

export async function replySupportCase(
  id: string,
  text: string,
): Promise<SupportConversation> {
  const response = await apiFetch(
    `/support/conversations/${id}/messages`,
    { method: "POST", body: JSON.stringify({ text }) },
    true,
  );
  return (await readBody(response)).conversation as SupportConversation;
}

export async function updateSupportCaseStatus(
  id: string,
  status: SupportCaseStatus,
): Promise<SupportConversation> {
  const response = await apiFetch(
    `/support/conversations/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true,
  );
  return (await readBody(response)).conversation as SupportConversation;
}
