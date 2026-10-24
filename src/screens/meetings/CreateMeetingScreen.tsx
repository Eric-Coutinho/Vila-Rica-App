import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { apiFetch, getErrorMessage } from "../../services/api";
import { getStoredUser } from "../../services/session";
import { AssemblyType } from "../../types/meetingTypes";
import { styles } from "./CreateMeetingScreenStyles";

function isManager(role?: string): boolean {
  const normalized = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return ["sindico", "admin", "adm"].includes(normalized);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function CreateMeetingScreen() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AssemblyType | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then((user) => {
        if (!active) return;
        if (!isManager(user?.role)) {
          alert("Acesso negado - apenas o síndico pode criar assembléias.");
          router.replace("/meetings");
          return;
        }
        setCheckingAccess(false);
      })
      .catch(() => {
        if (active) router.replace("/meetings");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function createAssembly() {
    if (!date) return alert("Selecione a data da assembléia.");
    if (!description.trim())
      return alert("Informe os temas que serão abordados.");
    if (!type) return alert("Selecione o tipo da assembléia.");
    setSaving(true);
    try {
      const response = await apiFetch(
        "/assembly",
        {
          method: "POST",
          body: JSON.stringify({
            date: date.toISOString(),
            description: description.trim(),
            type,
          }),
        },
        true,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(
          `Erro - ${body.message || "Não foi possível criar a assembléia."}`,
        );
        return;
      }
      alert("Assembléia criada com sucesso.");
      router.replace("/meetings");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível criar a assembléia.")}`,
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAccess)
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Nova Assembléia</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Data</Text>
        {Platform.OS === "web" ? (
          <TextInput
            style={styles.input}
            placeholder="dd/mm/aaaa"
            value={date ? formatDate(date) : ""}
            onChangeText={() => setShowPicker(true)}
            onFocus={() => setShowPicker(true)}
          />
        ) : (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text>{date ? formatDate(date) : "dd/mm/aaaa"}</Text>
          </TouchableOpacity>
        )}
        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}
        <Text style={styles.label}>Temas da assembléia</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Descreva os temas que serão abordados..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
        />
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => setType(value as AssemblyType | "")}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o tipo" value="" />
            <Picker.Item label="Ordinária" value="Ordinária" />
            <Picker.Item label="Extraordinária" value="Extraordinária" />
          </Picker>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={createAssembly}
          disabled={saving}
        >
          <Text style={styles.createButtonText}>
            {saving ? "Criando..." : "Criar Assembléia"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
