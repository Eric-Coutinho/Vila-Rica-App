import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styles as s, webField } from "./DeliveryFieldsStyle";

export function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function DateField({
  label,
  value,
  change,
  time = false,
}: {
  label: string;
  value: Date | null;
  change: (date: Date | null) => void;
  time?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const base = value || new Date();
  const clock = base.toTimeString().slice(0, 5);
  function merge(selected: Date) {
    const next = new Date(base);
    if (time) next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    else
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
    change(next);
  }
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {Platform.OS === "web" ? (
        <input
          aria-label={label}
          type={time ? "time" : "date"}
          style={webField}
          value={value ? (time ? clock : dateKey(value)) : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) return change(null);
            const selected = new Date(
              time ? dateKey(base) + "T" + raw : raw + "T12:00:00",
            );
            if (Number.isFinite(selected.getTime())) merge(selected);
          }}
        />
      ) : (
        <>
          <Pressable
            style={s.control}
            accessibilityRole="button"
            onPress={() => setOpen(!open)}
          >
            <Text>
              {value
                ? time
                  ? clock
                  : value.toLocaleDateString("pt-BR")
                : "dd/mm/aaaa"}
            </Text>
            <Ionicons
              name={time ? "time-outline" : "calendar-outline"}
              size={18}
            />
          </Pressable>
          {open && (
            <DateTimePicker
              value={base}
              mode={time ? "time" : "date"}
              onChange={(event, selected) => {
                setOpen(false);
                if (event.type === "set" && selected) merge(selected);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

export function ChoiceField({
  label,
  value,
  options,
  change,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  change: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {Platform.OS === "web" ? (
        <select
          aria-label={label}
          style={webField}
          value={value}
          onChange={(e) => change(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            style={s.control}
            onPress={() => setOpen(!open)}
          >
            <Text numberOfLines={1} style={s.selected}>
              {options.find((o) => o.value === value)?.label}
            </Text>
            <Ionicons name="chevron-down" size={18} />
          </Pressable>
          {open && (
            <ScrollView nestedScrollEnabled style={s.options}>
              {options.map((o) => (
                <Pressable
                  key={o.value}
                  style={s.option}
                  onPress={() => {
                    change(o.value);
                    setOpen(false);
                  }}
                >
                  <Text>{o.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

export function Sheet({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.sheetBody}
          >
            <Text style={s.sheetTitle}>{title}</Text>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Action({
  title,
  onPress,
  cancel = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  cancel?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[s.button, cancel && s.cancel, disabled && s.disabled]}
      onPress={onPress}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
