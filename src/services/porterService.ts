import { apiFetch, ApiError } from "./api";
import { getStoredUser } from "./session";

export type WeeklyShift = { days: number[]; start: string; end: string };

export type Porter = {
  _id: string;
  name?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  schedule?: string;
  weeklySchedule?: WeeklyShift[];
};
export type NewPorter = Required<Omit<Porter, "_id" | "schedule">>;
export type PorterSchedule = Pick<Porter, "weeklySchedule" | "schedule">;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch("/auth/" + path, options, true);
  const data = await response.json();
  if (!response.ok || !data.ok)
    throw new ApiError(
      data.message || "Falha ao acessar a portaria.",
      response.status,
    );
  return data;
}

export async function getMyPorterSchedule(): Promise<PorterSchedule> {
  const me = await getStoredUser();
  if (!me?._id) throw new Error("Entre novamente para consultar sua escala.");
  const { user } = await request<{ user: Porter }>(
    "users/get/" + encodeURIComponent(me._id),
  );
  return { weeklySchedule: user.weeklySchedule, schedule: user.schedule };
}

export async function listPorters() {
  const result: Porter[] = [];
  let page = 1;
  while (true) {
    const data = await request<{ users: Porter[]; meta: { pages: number } }>(
      "list-users?role=funcionario&limit=100&page=" + page,
    );
    result.push(...data.users);
    if (page >= data.meta.pages)
      return result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "pt-BR"),
      );
    page++;
  }
}

export function createPorter(fields: NewPorter) {
  return request<{ initialPasswordEmailSent?: boolean }>("register", {
    method: "POST",
    body: JSON.stringify({ ...fields, role: "funcionario" }),
  });
}

export async function updateSchedule(
  id: string,
  weeklySchedule: WeeklyShift[],
) {
  const data = await request<{ user: Porter }>(
    "users/update/" + encodeURIComponent(id),
    {
      method: "PATCH",
      body: JSON.stringify({ weeklySchedule }),
    },
  );
  return data.user;
}
