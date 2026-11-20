import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { getErrorMessage } from "../../services/api";
import {
  getMyPorterSchedule,
  type PorterSchedule,
} from "../../services/porterService";
import { styles } from "./PorterScheduleSectionStyles";

const weekdays = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function PorterScheduleSection() {
  const [schedule, setSchedule] = useState<PorterSchedule | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setSchedule(null);
      setError("");
      getMyPorterSchedule()
        .then((result) => {
          if (active) setSchedule(result);
        })
        .catch((err) => {
          if (active)
            setError(
              getErrorMessage(err, "Não foi possível carregar sua escala."),
            );
        });
      return () => {
        active = false;
      };
    }, [attempt]),
  );

  const shifts = schedule?.weeklySchedule;
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>
        Minha escala
      </Text>
      {error ? (
        <View>
          <Text style={styles.note}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAttempt((n) => n + 1)}
          >
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : shifts?.length ? (
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.day, styles.headerText]}>Dia de entrada</Text>
            <Text style={[styles.hours, styles.headerText]}>Horário</Text>
          </View>
          {weekdays.map((day, i) => {
            const hours = shifts
              .filter((shift) => shift.days.includes(i + 1))
              .sort((a, b) => a.start.localeCompare(b.start))
              .map(
                ({ start, end }) =>
                  start + " às " + end + (end < start ? " (dia seguinte)" : ""),
              );
            return (
              <View key={day} style={styles.row} accessible>
                <Text style={styles.day}>{day}</Text>
                <Text style={styles.hours}>
                  {hours.join("\n") || "Sem turno iniciado"}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.note}>
          {schedule
            ? schedule.schedule?.trim() ||
              "Sua escala ainda não foi cadastrada."
            : "Carregando escala…"}
        </Text>
      )}
    </View>
  );
}
