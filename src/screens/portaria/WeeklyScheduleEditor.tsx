import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { WeeklyShift } from "../../services/porterService";
import { styles, webClock } from "./WeeklyScheduleEditorStyles";

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const blankShift = (): WeeklyShift => ({ days: [], start: "", end: "" });
export const describeShift = (shift: WeeklyShift) =>
  weekdays.filter((_, i) => shift.days.includes(i + 1)).join(", ") +
  " · " +
  shift.start +
  " às " +
  shift.end +
  (shift.end < shift.start ? " (dia seguinte)" : "");

function Clock({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: (time: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hour, minute] = (value || "08:00").split(":").map(Number);
  return (
    <View style={styles.field}>
      <Text>{label}</Text>
      {Platform.OS === "web" ? (
        <input
          type="time"
          aria-label={label}
          value={value}
          style={webClock}
          onChange={(event) => change(event.target.value)}
        />
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            style={styles.control}
            onPress={() => setOpen(true)}
          >
            <Text>{value || "Selecionar"}</Text>
          </Pressable>
          {open && (
            <DateTimePicker
              mode="time"
              is24Hour
              value={new Date(2000, 0, 1, hour, minute)}
              onChange={(event, date) => {
                setOpen(false);
                if (event.type === "set" && date)
                  change(
                    [date.getHours(), date.getMinutes()]
                      .map((n) => String(n).padStart(2, "0"))
                      .join(":"),
                  );
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

export default function WeeklyScheduleEditor({
  value,
  change,
}: {
  value: WeeklyShift[];
  change: (next: WeeklyShift[]) => void;
}) {
  function patch(index: number, fields: Partial<WeeklyShift>) {
    change(
      value.map((shift, i) => (i === index ? { ...shift, ...fields } : shift)),
    );
  }
  return (
    <View style={styles.editor}>
      <Text style={styles.title}>Escala semanal</Text>
      {value.map((shift, index) => (
        <View key={index} style={styles.group}>
          <View style={styles.header}>
            <Text style={styles.heading}>Turno {index + 1}</Text>
            {value.length > 1 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => change(value.filter((_, i) => i !== index))}
              >
                <Text style={styles.action}>Remover</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.times}>
            <Clock
              label="Entrada"
              value={shift.start}
              change={(start) => patch(index, { start })}
            />
            <Clock
              label="Saída"
              value={shift.end}
              change={(end) => patch(index, { end })}
            />
          </View>
          {!!shift.end && shift.end < shift.start && (
            <Text>Saída no dia seguinte.</Text>
          )}
          <Text>Dias de entrada</Text>
          <View style={styles.days}>
            {weekdays.map((label, i) => {
              const day = i + 1,
                selected = shift.days.includes(day);
              return (
                <Pressable
                  key={day}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  style={[styles.day, selected && styles.selected]}
                  onPress={() =>
                    patch(index, {
                      days: selected
                        ? shift.days.filter((d) => d !== day)
                        : [...shift.days, day].sort((a, b) => a - b),
                    })
                  }
                >
                  <Text style={selected && styles.light}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        style={styles.add}
        onPress={() => change([...value, blankShift()])}
      >
        <Text style={styles.action}>Adicionar outro horário</Text>
      </Pressable>
    </View>
  );
}
