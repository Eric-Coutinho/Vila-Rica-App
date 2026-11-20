import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ApiError, getErrorMessage } from "../../services/api";
import { listComplaints } from "../../services/complaintService";
import { getStoredUser } from "../../services/session";
import {
  COMPLAINT_STATUS_COLOR,
  COMPLAINT_STATUS_LABEL,
  type ComplaintStatus,
  type ComplaintSummary,
} from "../../types/complaint";
import { styles } from "./ComplaintsScreenStyles";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
};

export default function ComplaintsScreen() {
  const router = useRouter();
  const requestId = useRef(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isManager, setIsManager] = useState<boolean | null>(null);
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const [residentFilter, setResidentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [numberFilter, setNumberFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ComplaintStatus>(
    "all",
  );

  useEffect(() => {
    let active = true;

    getStoredUser().then((user) => {
      if (!active) return;
      const role = normalize(String(user?.role || ""));
      setIsManager(["sindico", "admin", "adm"].includes(role));
    });

    return () => {
      active = false;
    };
  }, []);

  const apiFilters = useMemo(() => {
    const title = titleFilter.trim();
    const resident = residentFilter.trim();
    const date = dateFilter.trim();

    return {
      page: 1,
      limit: 100,
      status: statusFilter === "all" ? undefined : statusFilter,
      date: /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? date : undefined,
      number: numberFilter.replace(/\D/g, "") || undefined,
      title: title.length >= 2 ? title : undefined,
      resident: isManager && resident.length >= 2 ? resident : undefined,
    };
  }, [
    dateFilter,
    isManager,
    numberFilter,
    residentFilter,
    statusFilter,
    titleFilter,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (isManager === null) return undefined;
      void reloadKey;

      let active = true;
      const currentRequest = ++requestId.current;
      const timer = setTimeout(async () => {
        setRefreshing(true);
        setErrorMessage("");

        try {
          const result = await listComplaints(apiFilters);
          if (!active || currentRequest !== requestId.current) return;
          setComplaints(result.complaints);
          setTotal(result.meta.total);
          setPage(result.meta.page);
          setPages(result.meta.pages);
        } catch (error) {
          if (!active || currentRequest !== requestId.current) return;
          setErrorMessage(
            getErrorMessage(error, "Não foi possível carregar as reclamações."),
          );
          if (error instanceof ApiError && error.status === 401) {
            router.replace("/login");
          }
        } finally {
          if (active && currentRequest === requestId.current) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      }, 350);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [apiFilters, isManager, reloadKey, router]),
  );

  const handleLoadMore = async () => {
    if (loadingMore || page >= pages) return;

    setLoadingMore(true);
    setErrorMessage("");
    try {
      const result = await listComplaints({
        ...apiFilters,
        page: page + 1,
      });
      setComplaints((current) => {
        const byId = new Map(
          current.map((complaint) => [complaint.id, complaint]),
        );
        result.complaints.forEach((complaint) =>
          byId.set(complaint.id, complaint),
        );
        return [...byId.values()];
      });
      setTotal(result.meta.total);
      setPage(result.meta.page);
      setPages(result.meta.pages);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Não foi possível carregar mais reclamações."),
      );
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading || isManager === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#466CA5" />
        <Text style={styles.loadingText}>Carregando reclamações...</Text>
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

        {refreshing && (
          <View style={styles.refreshingRow}>
            <ActivityIndicator size="small" color="#466CA5" />
            <Text style={styles.refreshingText}>Atualizando...</Text>
          </View>
        )}

        {!!errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setReloadKey((value) => value + 1)}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!errorMessage && (
          <Text style={styles.resultCount}>
            {total === 1
              ? "1 reclamação encontrada"
              : `${total} reclamações encontradas`}
          </Text>
        )}

        <View style={styles.list}>
          {complaints.map((complaint) => (
            <View key={complaint.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.complaintNumber}>{complaint.number}</Text>
                <View
                  accessibilityLabel={`Status: ${COMPLAINT_STATUS_LABEL[complaint.status]}`}
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: COMPLAINT_STATUS_COLOR[complaint.status],
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

          {!errorMessage && complaints.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma reclamação encontrada.
              </Text>
            </View>
          )}

          {!errorMessage && page < pages && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color="#466CA5" />
              ) : (
                <Text style={styles.loadMoreButtonText}>Carregar mais</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
