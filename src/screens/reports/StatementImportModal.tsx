import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "../../services/api";
import { importFile, type ImportPreview } from "../../services/reportService";
import { Button, money, months, Select } from "./ReportWidget";
import { styles as s } from "./styles";

export default function StatementImportModal({
  initialYear,
  onClose,
  onImported,
}: {
  initialYear: number;
  onClose: () => void;
  onImported: (period: string) => void;
}) {
  const [year, setYear] = useState(String(initialYear));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset>();
  const [preview, setPreview] = useState<ImportPreview>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const period = year + "-" + month.padStart(2, "0");
  function reset() {
    setPreview(undefined);
    setError("");
  }
  async function pick() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        reset();
        setFile(result.assets[0]);
      }
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível selecionar o arquivo."));
    }
  }
  async function submit() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await importFile(file, period, preview?.previous);
      if (preview) onImported(data.period);
      else setPreview(data);
    } catch (e) {
      setPreview(undefined);
      setError(getErrorMessage(e, "Não foi possível importar."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <View style={s.overlay}>
        <View style={s.modal}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.modalContent}
          >
            <Text style={s.heading}>Importar balancete</Text>
            <Text style={s.hint}>
              Escolha a competência à qual os lançamentos pertencem.
            </Text>
            <View pointerEvents={busy ? "none" : "auto"} style={s.row}>
              <Select
                label="Mês dos dados"
                value={month}
                options={months.map((label, i) => ({
                  label,
                  value: String(i + 1),
                }))}
                onChange={(v) => {
                  reset();
                  setMonth(v);
                }}
              />
              <View style={s.field}>
                <Text style={s.label}>Ano dos dados</Text>
                <TextInput
                  accessibilityLabel="Ano dos dados"
                  style={s.input}
                  value={year}
                  editable={!busy}
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={(v) => {
                    reset();
                    setYear(v.replace(/\D/g, ""));
                  }}
                />
              </View>
            </View>
            <Button
              secondary
              disabled={busy}
              label={file ? "Trocar planilha" : "Selecionar planilha Excel"}
              onPress={pick}
            />
            {file && <Text style={s.text}>{file.name}</Text>}
            {preview && (
              <View style={s.panel}>
                <Text style={s.subhead}>
                  {months[Number(month) - 1]} de {year}
                </Text>
                <Text style={s.text}>{preview.count} lançamentos</Text>
                <Text style={s.text}>
                  Entradas · {money(preview.totals.income)}
                </Text>
                <Text style={s.text}>
                  Saídas · {money(preview.totals.expense)}
                </Text>
                {preview.statedPeriod && preview.statedPeriod !== period && (
                  <Text style={s.error}>
                    O título da planilha indica{" "}
                    {preview.statedPeriod.split("-").reverse().join("/")}. Ao
                    confirmar, os dados serão gravados na competência escolhida
                    acima.
                  </Text>
                )}
                {preview.identical ? (
                  <Text style={s.hint}>
                    Estes lançamentos já estão registrados nesta competência.
                  </Text>
                ) : (
                  !!preview.previous && (
                    <Text style={s.error}>
                      Esta competência já possui lançamentos. Confirmar
                      substituirá os dados deste mês.
                    </Text>
                  )
                )}
              </View>
            )}
            {!!error && (
              <Text accessibilityLiveRegion="polite" style={s.error}>
                {error}
              </Text>
            )}
            <Button
              label={
                preview
                  ? preview.identical
                    ? "Concluir"
                    : preview.previous
                      ? "Confirmar substituição"
                      : "Confirmar importação"
                  : "Conferir lançamentos"
              }
              disabled={
                !file || busy || !/^\d{4}$/.test(year) || Number(year) < 1900
              }
              onPress={submit}
            />
            <Button
              label="Cancelar"
              secondary
              disabled={busy}
              onPress={onClose}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
