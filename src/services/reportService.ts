import type { DocumentPickerAsset } from "expo-document-picker";
import { ApiError, apiFetch } from "./api";

export type Section =
  | "finance"
  | "residents"
  | "notices"
  | "complaints"
  | "reservations";
export type ChartRow = { label: string; value: number };
export type Dashboard = {
  metrics: { label: string; value: string | number }[];
  charts: { title: string; rows: ChartRow[] }[];
  note: string;
};
export type FinancialRow = {
  period: string;
  kind: "income" | "expense";
  category: string;
  cents: number;
};
export type ImportPreview = {
  period: string;
  previous: string;
  identical: boolean;
  statedPeriod: string | null;
  count: number;
  totals: { income: number; expense: number };
};

async function result(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok)
    throw new ApiError(
      body.message || "Não foi possível carregar o relatório.",
      response.status,
    );
  return body;
}
export async function readHistory(): Promise<FinancialRow[]> {
  return (await result(await apiFetch("/reports/finance", {}, true))).report;
}
export async function readDashboard(
  section: Exclude<Section, "finance">,
  year: number,
): Promise<Dashboard> {
  return (
    await result(
      await apiFetch("/reports/" + section + "?year=" + year, {}, true),
    )
  ).report;
}
export async function importFile(
  file: DocumentPickerAsset,
  period: string,
  previous?: string,
): Promise<ImportPreview> {
  const form = new FormData();
  if (file.file) form.append("file", file.file);
  else
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type:
        file.mimeType ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    } as unknown as Blob);
  form.append("period", period);
  form.append("mode", previous === undefined ? "preview" : "save");
  if (previous !== undefined) form.append("previous", previous);
  return (
    await result(
      await apiFetch(
        "/reports/finance/import",
        { method: "POST", body: form },
        true,
      ),
    )
  ).result;
}
