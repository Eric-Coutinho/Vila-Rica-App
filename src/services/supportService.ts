import { apiFetch, ApiError } from "./api";
import type { SupportChatResponse, SupportHistoryItem } from "../types/support";

export async function sendSupportMessage(
  message: string,
  history: SupportHistoryItem[],
): Promise<SupportChatResponse> {
  const response = await apiFetch(
    "/support/chat",
    {
      method: "POST",
      body: JSON.stringify({ message, history }),
    },
    true,
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.ok) {
    throw new ApiError(
      body?.message || "Não foi possível enviar sua pergunta.",
      response.status,
    );
  }

  return {
    answer: String(body.answer || ""),
    sources: Array.isArray(body.sources) ? body.sources.map(String) : [],
    suggestedAction:
      body.suggestedAction &&
      typeof body.suggestedAction.label === "string" &&
      typeof body.suggestedAction.route === "string"
        ? body.suggestedAction
        : undefined,
  };
}
