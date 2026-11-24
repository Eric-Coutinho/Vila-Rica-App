import React from "react";
import { Picker } from "@react-native-picker/picker";
import { Text, TouchableOpacity, View } from "react-native";
import type { ChartRow } from "../../services/reportService";
import { colors, styles as s } from "./styles";

export const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const money = (cents: number) => currency.format(cents / 100);
export const number = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export function Button({
  label,
  onPress,
  secondary,
  disabled,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[s.button, secondary && s.secondary, disabled && s.disabled]}
    >
      <Text style={secondary ? s.tabLabel : s.white}>{label}</Text>
    </TouchableOpacity>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={s.select}>
        <Picker
          accessibilityLabel={label}
          style={s.picker}
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
        >
          {options.map((o) => (
            <Picker.Item key={o.value} label={o.label} value={o.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
export function YearControl({
  label,
  year,
  onChange,
}: {
  label: string;
  year: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={label + ", ano anterior"}
          onPress={() => onChange(Math.max(1900, year - 1))}
          style={s.tab}
        >
          <Text style={s.tabLabel}>‹</Text>
        </TouchableOpacity>
        <Text style={s.subhead}>{year}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={label + ", próximo ano"}
          onPress={() => onChange(Math.min(9999, year + 1))}
          style={s.tab}
        >
          <Text style={s.tabLabel}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <View style={s.card}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>
        {typeof value === "number" ? number(value) : value}
      </Text>
      {!!detail && <Text style={s.hint}>{detail}</Text>}
    </View>
  );
}
export function Bar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  return (
    <View style={s.track}>
      <View
        style={[
          s.bar,
          {
            backgroundColor: color,
            width: ((max ? Math.min(100, (100 * Math.abs(value)) / max) : 0) +
              "%") as `${number}%`,
          },
        ]}
      />
    </View>
  );
}
export function Bars({
  title,
  rows,
  cash = false,
}: {
  title: string;
  rows: ChartRow[];
  cash?: boolean;
}) {
  const max = rows.reduce((n, r) => Math.max(n, Math.abs(r.value)), 0);
  return (
    <View style={s.panel}>
      <Text style={s.subhead}>{title}</Text>
      {!rows.length && <Text style={s.hint}>Sem dados neste recorte.</Text>}
      {rows.map((row, i) => (
        <View key={row.label + i} style={s.chartRow}>
          <View style={s.spread}>
            <Text style={s.text}>{row.label}</Text>
            <Text style={s.tabLabel}>
              {cash ? money(row.value) : number(row.value)}
            </Text>
          </View>
          <Bar
            value={row.value}
            max={max}
            color={cash ? colors.amber : colors.blue}
          />
        </View>
      ))}
    </View>
  );
}
