import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createMoveReservation } from "../../services/reservationService";
import { getErrorMessage } from "../../services/api";
import { styles } from "./CreateMovingReservationsStyles";

function datePayload(date: Date | null) {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
}
function dateLabel(date: Date | null) {
  return date ? date.toLocaleDateString("pt-BR") : "dd/mm/aaaa";
}
function timeLabel(date: Date | null) {
  return date
    ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : "hh:mm";
}

export default function CreateMovingReservationScreen() {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [company, setCompany] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [saving, setSaving] = useState(false);

  async function createReservation() {
    if (!date || !startTime || !endTime || !company.trim())
      return alert("Preencha todos os campos da reserva.");
    if (timeLabel(endTime) <= timeLabel(startTime))
      return alert("O horário final deve ser posterior ao inicial.");
    setSaving(true);
    try {
      await createMoveReservation({
        date: datePayload(date),
        startTime: timeLabel(startTime),
        endTime: timeLabel(endTime),
        company: company.trim(),
      });
      alert("Reserva de mudança criada com sucesso.");
      router.replace("/moving");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível criar a reserva.")}`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Reservar{`\n`}Horário</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Data</Text>
        {Platform.OS === "web" ? (
          <input
            type="date"
            value={datePayload(date)}
            onChange={(event) =>
              setDate(
                event.target.value
                  ? new Date(`${event.target.value}T12:00:00`)
                  : null,
              )
            }
            style={styles.webInput as any}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDate(true)}
            >
              <Text>{dateLabel(date)}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, value) => {
                  setShowDate(Platform.OS === "ios");
                  if (value) setDate(value);
                }}
              />
            )}
          </>
        )}
        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={styles.field}>
            <Text style={styles.label}>Hora início</Text>
            {Platform.OS === "web" ? (
              <input
                type="time"
                value={timeLabel(startTime).replace("hh:mm", "")}
                onChange={(event) => {
                  const [h, m] = event.target.value.split(":").map(Number);
                  const selected = new Date();
                  selected.setHours(h, m, 0, 0);
                  setStartTime(selected);
                }}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStart(true)}
                >
                  <Text>{timeLabel(startTime)}</Text>
                </TouchableOpacity>
                {showStart && (
                  <DateTimePicker
                    value={startTime || new Date()}
                    mode="time"
                    is24Hour
                    onChange={(_, value) => {
                      setShowStart(Platform.OS === "ios");
                      if (value) setStartTime(value);
                    }}
                  />
                )}
              </>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Hora fim</Text>
            {Platform.OS === "web" ? (
              <input
                type="time"
                value={timeLabel(endTime).replace("hh:mm", "")}
                onChange={(event) => {
                  const [h, m] = event.target.value.split(":").map(Number);
                  const selected = new Date();
                  selected.setHours(h, m, 0, 0);
                  setEndTime(selected);
                }}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEnd(true)}
                >
                  <Text>{timeLabel(endTime)}</Text>
                </TouchableOpacity>
                {showEnd && (
                  <DateTimePicker
                    value={endTime || new Date()}
                    mode="time"
                    is24Hour
                    onChange={(_, value) => {
                      setShowEnd(Platform.OS === "ios");
                      if (value) setEndTime(value);
                    }}
                  />
                )}
              </>
            )}
          </View>
        </View>
        <Text style={[styles.label, { marginTop: 12 }]}>
          Nome da empresa de mudança
        </Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="Nome empresa..."
        />
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={createReservation}
        disabled={saving}
      >
        <Text style={styles.actionText}>
          {saving ? "Criando..." : "Criar reserva"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.actionText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
