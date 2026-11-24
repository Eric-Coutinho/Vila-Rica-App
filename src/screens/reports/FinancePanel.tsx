import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { FinancialRow } from "../../services/reportService";
import {
  Bars,
  Button,
  MetricCard,
  money,
  months,
  number,
  Select,
  YearControl,
} from "./ReportWidget";
import StatementImportModal from "./StatementImportModal";
import { colors, styles as s } from "./styles";

const monthOptions = months.map((label, i) => ({
  label,
  value: String(i + 1).padStart(2, "0"),
}));
const periodLabel = (year: number, month: string) =>
  month ? months[Number(month) - 1] + " de " + year : String(year);
function summarize(
  rows: FinancialRow[],
  year: number,
  month: string,
  category: string,
) {
  const coverage = new Set<string>();
  let income = 0,
    expense = 0;
  const groups = new Map<string, number>();
  for (const row of rows) {
    if (
      Number(row.period.slice(0, 4)) !== year ||
      (month && row.period.slice(5) !== month)
    )
      continue;
    coverage.add(row.period.slice(5));
    if (row.kind === "income") income += row.cents;
    else if (!category || row.category === category) {
      expense += row.cents;
      groups.set(row.category, (groups.get(row.category) || 0) + row.cents);
    }
  }
  return { income, expense, coverage, groups };
}
function delta(now: number, base: number, comparable: boolean) {
  if (!comparable) return "Sem cobertura comparável";
  if (!base) return "Sem base percentual";
  const percent = ((now - base) / Math.abs(base)) * 100;
  return (
    (percent > 0 ? "+" : "") + number(percent) + "% sobre o período comparado"
  );
}
export default function FinancePanel({
  rows,
  reload,
}: {
  rows: FinancialRow[];
  reload: () => void;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [comparison, setComparison] = useState(year - 1);
  const [baseMonth, setBaseMonth] = useState("");
  const [category, setCategory] = useState("");
  const [importing, setImporting] = useState(false);
  const categories = Array.from(
    new Set(rows.filter((r) => r.kind === "expense").map((r) => r.category)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const current = summarize(rows, year, month, category);
  const base = summarize(
    rows,
    comparison,
    month ? baseMonth || month : "",
    category,
  );
  const comparable =
    !!current.coverage.size &&
    !!base.coverage.size &&
    (month !== "" ||
      (current.coverage.size === base.coverage.size &&
        [...current.coverage].every((m) => base.coverage.has(m))));
  const series = monthOptions.map((m) => ({
    label: m.label,
    ...summarize(rows, year, m.value, category),
  }));
  const values = series.flatMap((m) => [m.income, m.expense]);
  const high = Math.max(0, ...values),
    low = Math.abs(Math.min(0, ...values));
  const scale = 144 / (high + low || 1);
  function choosePeriod(y: number, m: string) {
    setYear(y);
    setMonth(m);
    if (!m) {
      setComparison(y - 1);
      setBaseMonth("");
      return;
    }
    setComparison(m === "01" ? y - 1 : y);
    setBaseMonth(String(m === "01" ? 12 : Number(m) - 1).padStart(2, "0"));
  }
  return (
    <>
      <View style={s.spread}>
        <Text style={s.heading}>Gastos e receitas</Text>
        <Button label="Importar Excel" onPress={() => setImporting(true)} />
      </View>
      <View style={s.panel}>
        <View style={s.row}>
          <YearControl
            label="Ano dos dados"
            year={year}
            onChange={(y) => choosePeriod(y, month)}
          />
          <Select
            label="Período"
            value={month}
            options={[{ label: "Ano inteiro", value: "" }, ...monthOptions]}
            onChange={(m) => choosePeriod(year, m)}
          />
        </View>
        <View style={s.row}>
          <Select
            label="Categoria das saídas"
            value={category}
            options={[
              { label: "Todas as categorias", value: "" },
              ...categories.map((label) => ({ label, value: label })),
            ]}
            onChange={setCategory}
          />
        </View>
        <View style={s.row}>
          <YearControl
            label="Comparar com o ano"
            year={comparison}
            onChange={setComparison}
          />
          {!!month && (
            <Select
              label="Mês de comparação"
              value={baseMonth || month}
              options={monthOptions}
              onChange={setBaseMonth}
            />
          )}
        </View>
      </View>
      <Text style={s.subhead}>
        {periodLabel(year, month)} · comparação com{" "}
        {periodLabel(comparison, month ? baseMonth || month : "")}
      </Text>
      {!month && (
        <Text style={s.hint}>
          Meses importados: {current.coverage.size}/12 no período e{" "}
          {base.coverage.size}/12 na comparação. A variação anual usa anos com
          os mesmos meses disponíveis.
        </Text>
      )}
      {!!category && (
        <Text style={s.hint}>
          O filtro de categoria se aplica somente às saídas. O resultado compara
          toda a receita com as saídas selecionadas.
        </Text>
      )}
      <View style={s.cards}>
        {[
          ["Entradas", current.income, base.income],
          ["Saídas", current.expense, base.expense],
          [
            "Resultado do período",
            current.income - current.expense,
            base.income - base.expense,
          ],
        ].map(([label, n, b]) => (
          <MetricCard
            key={label}
            label={String(label)}
            value={current.coverage.size ? money(Number(n)) : "—"}
            detail={delta(Number(n), Number(b), comparable)}
          />
        ))}
      </View>
      {!current.coverage.size && (
        <Text style={s.hint}>
          Nenhum balancete importado para este período.
        </Text>
      )}
      <View style={s.panel}>
        <Text style={s.subhead}>Entradas e saídas em {year}</Text>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: colors.teal }]} />
          <Text style={s.hint}>Entradas</Text>
          <View style={[s.dot, { backgroundColor: colors.amber }]} />
          <Text style={s.hint}>Saídas</Text>
          <Text style={s.hint}>— Sem importação</Text>
        </View>
        <Text style={s.hint}>
          Maior valor: {money(high)}
          {low ? " · Menor valor: " + money(-low) : ""}
        </Text>
        <ScrollView horizontal contentContainerStyle={s.annualSeries}>
          {series.map((m, i) => {
            const key = monthOptions[i].value;
            const bars = (negative: boolean) =>
              [m.income, m.expense].map((v, j) => (
                <View
                  key={j}
                  style={[
                    s.columnBar,
                    {
                      height: scale * Math.max(0, negative ? -v : v),
                      backgroundColor: j === 0 ? colors.teal : colors.amber,
                    },
                  ]}
                />
              ));
            return (
              <TouchableOpacity
                key={key}
                accessibilityRole="button"
                accessibilityLabel={
                  m.label +
                  (m.coverage.size
                    ? ", entradas " +
                      money(m.income) +
                      ", saídas " +
                      money(m.expense)
                    : ", sem importação")
                }
                onPress={() => choosePeriod(year, key)}
                style={[s.monthColumn, key === month && s.selectedColumn]}
              >
                <View
                  style={[s.barPair, { height: Math.max(20, high * scale) }]}
                >
                  {m.coverage.size ? (
                    bars(false)
                  ) : (
                    <Text style={s.unavailable}>—</Text>
                  )}
                </View>
                {low > 0 && (
                  <View
                    style={[s.barPair, s.negativePair, { height: low * scale }]}
                  >
                    {bars(true)}
                  </View>
                )}
                <Text style={s.monthLabel}>{m.label.slice(0, 3)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={s.hint}>
          Toque em um mês para ver seus valores e categorias.
        </Text>
      </View>
      <Bars
        title={"Gastos por categoria · " + periodLabel(year, month)}
        cash
        rows={Array.from(current.groups, ([label, value]) => ({
          label,
          value,
        })).sort((a, b) => b.value - a.value)}
      />
      {importing && (
        <StatementImportModal
          initialYear={year}
          onClose={() => setImporting(false)}
          onImported={(period) => {
            setImporting(false);
            choosePeriod(Number(period.slice(0, 4)), period.slice(5));
            setCategory("");
            reload();
          }}
        />
      )}
    </>
  );
}
