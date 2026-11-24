import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getErrorMessage } from "../../services/api";
import {
  readDashboard,
  readHistory,
  type FinancialRow,
  type Dashboard,
  type Section,
} from "../../services/reportService";
import FinancePanel from "./FinancePanel";
import { Bars, Button, MetricCard, YearControl } from "./ReportWidget";
import { styles as s } from "./styles";

const sections: [Section, string][] = [
  ["finance", "Financeiro"],
  ["residents", "Moradores"],
  ["notices", "Avisos"],
  ["complaints", "Reclamações"],
  ["reservations", "Reservas"],
];
export default function ReportsScreen() {
  const [section, setSection] = useState<Section>("finance");
  const [year, setYear] = useState(new Date().getFullYear());
  const requestId = useRef(0);
  const [history, setHistory] = useState<FinancialRow[] | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setError("");
    setDashboard(null);
    try {
      if (section === "finance") {
        const data = await readHistory();
        if (requestId.current === id) setHistory(data);
      } else {
        const data = await readDashboard(section, year);
        if (requestId.current === id) setDashboard(data);
      }
    } catch (e) {
      if (requestId.current === id) {
        setError(getErrorMessage(e, "Erro ao abrir o relatório."));
        setHistory(null);
      }
    }
  }, [section, year]);
  useFocusEffect(
    useCallback(() => {
      void reload();
      return () => {
        requestId.current++;
      };
    }, [reload]),
  );
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>Relatórios</Text>
      <View style={s.tabs}>
        {sections.map(([key, label]) => (
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: key === section }}
            style={[s.tab, key === section && s.tabOn]}
            key={key}
            onPress={() => {
              if (key !== section) {
                setDashboard(null);
                setSection(key);
              }
            }}
          >
            <Text style={key === section ? s.white : s.tabLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!error && (
        <View style={s.panel}>
          <Text style={s.error}>{error}</Text>
          <Button secondary label="Tentar novamente" onPress={reload} />
        </View>
      )}
      {section === "finance" && history && !error && (
        <FinancePanel rows={history} reload={reload} />
      )}
      {section !== "finance" && (
        <>
          <Text style={s.heading}>
            {sections.find((row) => row[0] === section)?.[1]}
          </Text>
          {section !== "residents" && (
            <View style={s.panel}>
              <YearControl
                label="Ano de criação"
                year={year}
                onChange={setYear}
              />
            </View>
          )}
          {dashboard && (
            <>
              <Text style={s.hint}>{dashboard.note}</Text>
              <View style={s.cards}>
                {dashboard.metrics.map((m) => (
                  <MetricCard key={m.label} {...m} />
                ))}
              </View>
              {dashboard.charts.map((c) => (
                <Bars key={c.title} {...c} />
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
