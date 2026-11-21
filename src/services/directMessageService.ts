import { apiFetch, ApiError } from "./api";

export type Person = {
  id: string;
  name: string;
  employee: boolean;
  block: string;
  apartment: string;
};
export type InboxItem = Person & { lastAt: string; unread: boolean };
export type Message = {
  id: string;
  role: "resident" | "employee" | "manager";
  text: string;
  sentAt: string;
  unread: boolean;
};
export type Conversation = { person: Person; messages: Message[] };

async function request(
  path: string,
  options: RequestInit = {},
  loading = false,
) {
  const response = await apiFetch(
    "/direct-messages" + path,
    options,
    true,
    loading,
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.message || "Falha ao acessar as mensagens.",
      response.status,
    );
  }
  return response;
}

export async function inbox(loading: boolean): Promise<InboxItem[]> {
  const response = await request("", {}, loading);
  return (await response.json()).chats;
}
export async function unreadChatCount(): Promise<number> {
  return (await (await request("/badge")).json()).count;
}
export async function conversation(
  id: string,
  count?: number,
): Promise<Conversation | null> {
  const suffix = count === undefined ? "" : "?knownCount=" + count;
  const response = await request(
    "/" + encodeURIComponent(id) + suffix,
    {},
    count === undefined,
  );
  return response.status === 204 ? null : response.json();
}
export async function acknowledge(id: string, ids: string[]) {
  for (let i = 0; i < ids.length; i += 200) {
    await request("/" + encodeURIComponent(id) + "/read", {
      method: "POST",
      body: JSON.stringify({ ids: ids.slice(i, i + 200) }),
    });
  }
}
export async function sendDirectMessage(
  id: string,
  text: string,
  clientId: string,
) {
  await request(
    "/" + encodeURIComponent(id),
    { method: "POST", body: JSON.stringify({ text, clientId }) },
    true,
  );
}
