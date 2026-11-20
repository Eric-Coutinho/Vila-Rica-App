import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { apiFetch } from "../../services/api";
import { getStoredUser } from "../../services/session";
import { Assembly, AssemblyStatus } from "../../types/meetingTypes";
import { styles } from "./MeetingsScreenStyles";

const DOT_COLORS: Record<AssemblyStatus, string> = {
  Concluída: "#00df19",
  Pendente: "#ff9d00",
  Cancelada: "#ed1010",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR");
}

function userIsManager(role?: string): boolean {
  const normalized = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return ["sindico", "admin", "adm"].includes(normalized);
}

export default function MeetingsScreen() {
  const router = useRouter();
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | AssemblyStatus>("");
  const [descriptionFilter, setDescriptionFilter] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [user, response] = await Promise.all([
          getStoredUser(),
          apiFetch("/assembly", { method: "GET" }, true),
        ]);
        if (!active) return;
        setIsManager(userIsManager(user?.role));
        if (!response.ok) {
          setAssemblies([]);
          return;
        }
        const body = await response.json().catch(() => ({}));
        setAssemblies(Array.isArray(body) ? body : body.assemblies || []);
      } catch {
        if (active) setAssemblies([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = assemblies.filter((assembly) => {
    const matchesDate =
      !dateFilter.trim() ||
      formatDate(assembly.date).includes(dateFilter.trim());
    const matchesStatus = !statusFilter || assembly.status === statusFilter;
    const matchesDescription =
      !descriptionFilter.trim() ||
      assembly.description
        .toLowerCase()
        .includes(descriptionFilter.trim().toLowerCase());
    return matchesDate && matchesStatus && matchesDescription;
  });

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Assembléias</Text>
      {isManager && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-meeting")}
        >
          <Text style={styles.createButtonText}>Nova Assembléia</Text>
        </TouchableOpacity>
      )}
      <View style={styles.filtersRow}>
        <View style={styles.filter}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            placeholder="dd/mm/aaaa"
            value={dateFilter}
            onChangeText={setDateFilter}
          />
        </View>
        <View style={styles.filter}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "" | AssemblyStatus)
              }
              style={styles.picker}
            >
              <Picker.Item label="Status" value="" />
              <Picker.Item label="Concluída" value="Concluída" />
              <Picker.Item label="Pendente" value="Pendente" />
              <Picker.Item label="Cancelada" value="Cancelada" />
            </Picker>
          </View>
        </View>
      </View>
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição..."
        value={descriptionFilter}
        onChangeText={setDescriptionFilter}
      />
      <View style={styles.cards}>
        {filtered.map((assembly) => (
          <View key={assembly._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Assembléia</Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      DOT_COLORS[assembly.status] || DOT_COLORS.Pendente,
                  },
                ]}
              />
            </View>
            <Text style={styles.cardDate}>{formatDate(assembly.date)}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {assembly.description}
            </Text>
            <Text style={styles.type}>{assembly.type}</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() =>
                router.push({
                  pathname: "/meetings/[id]",
                  params: { id: assembly._id },
                })
              }
            >
              <Text style={styles.infoButtonText}>Ver Informações</Text>
            </TouchableOpacity>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text>Nenhuma assembléia encontrada.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
