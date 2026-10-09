import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { listComplaints } from "../../services/complaintService";
import { getStoredUser } from "../../services/session";
import {
  COMPLAINT_STATUS_COLOR,
  COMPLAINT_STATUS_LABEL,
  type Complaint,
  type ComplaintStatus,
} from "../../types/complaint";
import { styles } from "./ComplaintsScreenStyles";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(value),
  );

export default function ComplaintsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [residentFilter, setResidentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [numberFilter, setNumberFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ComplaintStatus
  >("all");

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function load() {
        setLoading(true);

        try {
          const user = await getStoredUser();
          const role = normalize(String(user?.role || ""));
          const manager = ["sindico", "admin", "adm"].includes(role);
          const result = await listComplaints({ manager });

          if (mounted) {
            setIsManager(manager);
            setComplaints(result);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      }

      load();

      return () => {
        mounted = false;
      };
    }, []),
  );

  const filteredComplaints = useMemo(() => {
    const normalizedResident = normalize(residentFilter);
    const normalizedTitle = normalize(titleFilter);
    const normalizedNumber = normalize(numberFilter).replace("#", "");
    const normalizedDate = dateFilter.replace(/\D/g, "");

    return complaints.filter((complaint) => {
      const matchesResident =
        !isManager ||
        !normalizedResident ||
        normalize(complaint.createdBy.name).includes(normalizedResident);

      const matchesDate =
        !normalizedDate ||
        formatDate(complaint.occurrenceDate)
          .replace(/\D/g, "")
          .includes(normalizedDate);

      const matchesNumber =
        !normalizedNumber ||
        complaint.number.replace(/\D/g, "").includes(normalizedNumber);

      const matchesTitle =
        !normalizedTitle || normalize(complaint.title).includes(normalizedTitle);

      const matchesStatus =
        statusFilter === "all" || complaint.status === statusFilter;

      return (
        matchesResident &&
        matchesDate &&
        matchesNumber &&
        matchesTitle &&
        matchesStatus
      );
    });
  }, [
    complaints,
    dateFilter,
    isManager,
    numberFilter,
    residentFilter,
    statusFilter,
    titleFilter,
  ]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#466CA5" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isManager ? "Reclamações" : "Suas\nReclamações"}
        </Text>

        {!isManager && (
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={() => router.push("/create-complaint")}
          >
            <Text style={styles.createButtonText}>Criar reclamação</Text>
          </TouchableOpacity>
        )}

        <View style={styles.filtersGrid}>
          {isManager && (
            <View style={styles.filterItem}>
              <Text style={styles.label}>Morador</Text>
              <TextInput
                style={styles.input}
                value={residentFilter}
                onChangeText={setResidentFilter}
                placeholder="Nome do morador..."
                placeholderTextColor="#888"
              />
            </View>
          )}

          <View style={styles.filterItem}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={dateFilter}
                onChangeText={setDateFilter}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#888"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
              <Ionicons name="calendar-outline" size={18} color="#111" />
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
                style={styles.picker}
              >
                <Picker.Item label="Todos" value="all" />
                <Picker.Item label="Criada" value="created" />
                <Picker.Item label="Em análise" value="under_review" />
                <Picker.Item label="Encerrada" value="closed" />
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              value={numberFilter}
              onChangeText={setNumberFilter}
              placeholder="#0000000000"
              placeholderTextColor="#888"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={titleFilter}
              onChangeText={setTitleFilter}
              placeholder="Título da reclamação..."
              placeholderTextColor="#888"
            />
          </View>
        </View>

        <View style={styles.list}>
          {filteredComplaints.map((complaint) => (
            <View key={complaint.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.complaintNumber}>{complaint.number}</Text>
                <View
                  accessibilityLabel={`Status: ${COMPLAINT_STATUS_LABEL[complaint.status]}`}
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        COMPLAINT_STATUS_COLOR[complaint.status],
                    },
                  ]}
                />
              </View>

              <Text style={styles.cardDate}>
                {formatDate(complaint.occurrenceDate)}
              </Text>

              {isManager && (
                <Text style={styles.cardResident}>
                  Morador: {complaint.createdBy.name}
                </Text>
              )}

              <Text style={styles.cardTitle}>{complaint.title}</Text>

              <TouchableOpacity
                style={styles.viewButton}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/complaints/[id]",
                    params: { id: complaint.id },
                  })
                }
              >
                <Text style={styles.viewButtonText}>Ver reclamação</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filteredComplaints.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma reclamação encontrada.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.chatButton}
        activeOpacity={0.85}
        accessibilityLabel="Abrir chatbot"
        onPress={() => router.push("/chatbot")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={34} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
