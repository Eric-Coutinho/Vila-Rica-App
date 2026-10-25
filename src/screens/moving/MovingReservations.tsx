import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { listMoveReservations } from "../../services/reservationService";
import { getStoredUser } from "../../services/session";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_OPTIONS,
  ReservationStatus,
  ReservationSummary,
} from "../../types/reservations";
import { styles } from "./MovingReservationStyles";

type StatusFilter = "all" | ReservationStatus;

function isManager(role?: string) {
  const normalized = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return ["sindico", "admin", "adm"].includes(normalized);
}

function formatDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}`;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
}

function formatFilterDate(value: Date) {
  return `${String(value.getDate()).padStart(2, "0")}/${String(
    value.getMonth() + 1,
  ).padStart(2, "0")}/${value.getFullYear()}`;
}

export default function MovingReservationsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState(false);
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [residentFilter, setResidentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getStoredUser()
      .then((user) => setManager(isManager(user?.role)))
      .catch(() => setManager(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      listMoveReservations()
        .then((items) => {
          if (active) {
            setReservations(items);
          }
        })
        .catch(() => {
          if (active) {
            setReservations([]);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const filtered = useMemo(
    () =>
      reservations.filter((item) => {
        const byDate =
          !dateFilter ||
          item.date.startsWith(
            `${dateFilter.getFullYear()}-${String(
              dateFilter.getMonth() + 1,
            ).padStart(2, "0")}-${String(dateFilter.getDate()).padStart(
              2,
              "0",
            )}`,
          );

        const byResident =
          !residentFilter.trim() ||
          item.reservedBy.name
            .toLowerCase()
            .includes(residentFilter.trim().toLowerCase());

        const byStatus = statusFilter === "all" || item.status === statusFilter;

        return byDate && byResident && byStatus;
      }),
    [dateFilter, residentFilter, reservations, statusFilter],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#466CA5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Horários de{"\n"}Mudança</Text>

      {!manager && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/create-moving-reservation")}
        >
          <Text style={styles.actionText}>Reservar horário</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filters}>
        {manager && (
          <>
            <Text style={styles.label}>Data</Text>

            {Platform.OS === "web" ? (
              <input
                type="date"
                value={
                  dateFilter
                    ? `${dateFilter.getFullYear()}-${String(
                        dateFilter.getMonth() + 1,
                      ).padStart(2, "0")}-${String(
                        dateFilter.getDate(),
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={(event) => {
                  const value = event.target.value;

                  setDateFilter(value ? new Date(`${value}T12:00:00`) : null);
                }}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    {dateFilter
                      ? formatFilterDate(dateFilter)
                      : "Filtro por data..."}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateFilter || new Date()}
                    mode="date"
                    onChange={(_, value) => {
                      setShowDatePicker(Platform.OS === "ios");

                      if (value) {
                        setDateFilter(value);
                      }
                    }}
                  />
                )}
              </>
            )}

            <Text style={[styles.label, { marginTop: 12 }]}>Morador</Text>

            <TextInput
              style={styles.input}
              placeholder="Filtro por morador..."
              value={residentFilter}
              onChangeText={setResidentFilter}
            />
          </>
        )}

        <Text style={[styles.label, { marginTop: manager ? 12 : 0 }]}>
          Status
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#929292",
            borderRadius: 5,
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          <Picker
            selectedValue={statusFilter}
            onValueChange={(value: StatusFilter) => setStatusFilter(value)}
            style={{ height: 44 }}
          >
            {RESERVATION_STATUS_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {manager ? "Reservas atuais" : "Suas Reservas Anteriores"}
      </Text>

      {filtered.map((reservation) => (
        <View key={reservation.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Reserva {formatDate(reservation.date)}
            </Text>

            <View
              style={[
                styles.dot,
                {
                  backgroundColor: RESERVATION_STATUS_COLOR[reservation.status],
                },
              ]}
            />
          </View>

          <Text style={styles.cardText}>
            Hora:{"\n"}
            {reservation.time} - {reservation.endTime || "—"}
          </Text>

          <Text style={styles.cardResident}>
            Status: {RESERVATION_STATUS_LABEL[reservation.status]}
          </Text>

          {manager && (
            <Text style={styles.cardResident}>
              Morador: {reservation.reservedBy.name}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 16, marginBottom: 0 }]}
            onPress={() => router.push(`/moving/${reservation.id}`)}
          >
            <Text style={styles.actionText}>Ver Reserva</Text>
          </TouchableOpacity>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text>Nenhuma reserva de mudança encontrada.</Text>
        </View>
      )}
    </ScrollView>
  );
}
