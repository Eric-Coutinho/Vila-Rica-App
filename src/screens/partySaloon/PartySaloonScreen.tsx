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

import { listPartySaloonReservations } from "@/src/services/reservationService";
import { getStoredUser } from "@/src/services/session";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_OPTIONS,
  ReservationStatus,
  ReservationSummary,
} from "@/src/types/reservations";
import { styles } from "./PartySaloonScreenStyles";

type StatusFilter = "all" | ReservationStatus;

function formatDate(value?: string) {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : new Intl.DateTimeFormat("pt-BR").format(parsed);
}

function formatFilterDate(value: Date | null) {
  if (!value) return "";
  return [
    String(value.getDate()).padStart(2, "0"),
    String(value.getMonth() + 1).padStart(2, "0"),
    value.getFullYear(),
  ].join("/");
}

export default function PartySaloonScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterReservedBy, setFilterReservedBy] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then((user) => {
        if (!active) return;
        const role = String(user?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        setIsManager(["sindico", "admin", "adm"].includes(role));
      })
      .catch(() => active && setIsManager(false));
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setErrorMessage("");

      listPartySaloonReservations()
        .then((items) => active && setReservations(items))
        .catch((error) => {
          if (!active) return;
          setReservations([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as reservas.",
          );
        })
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, []),
  );

  const filtered = useMemo(
    () =>
      reservations.filter((reservation) => {
        const byResident =
          !filterReservedBy.trim() ||
          reservation.reservedBy.name
            .toLowerCase()
            .includes(filterReservedBy.trim().toLowerCase());
        const byDate =
          !filterDate ||
          formatDate(reservation.date) === formatFilterDate(filterDate);
        const byStatus =
          filterStatus === "all" || reservation.status === filterStatus;
        return byResident && byDate && byStatus;
      }),
    [filterDate, filterReservedBy, filterStatus, reservations],
  );

  const onChangeDate = (_event: unknown, selected?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) setFilterDate(selected);
  };

  const onChangeDateWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return setFilterDate(null);
    const [year, month, day] = value.split("-").map(Number);
    setFilterDate(new Date(year, month - 1, day));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#466CA5" />
        <Text style={styles.loadingText}>Buscando reservas...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>Salão de Festas</Text>

      {!isManager && (
        <TouchableOpacity
          style={styles.newNoticeButton}
          activeOpacity={0.85}
          onPress={() => router.push("/create-party-saloon-reservation")}
        >
          <Text style={styles.newNoticeButtonText}>Nova Reserva</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filtersRow}>
        <View style={styles.inputSmallWrap}>
          <Text style={styles.smallLabel}>Data</Text>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={
                filterDate
                  ? `${filterDate.getFullYear()}-${String(
                      filterDate.getMonth() + 1,
                    ).padStart(2, "0")}-${String(filterDate.getDate()).padStart(
                      2,
                      "0",
                    )}`
                  : ""
              }
              onChange={onChangeDateWeb}
              style={{
                boxSizing: "border-box",
                width: "100%",
                height: 39,
                padding: 8,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "#747474",
                borderRadius: 4,
                backgroundColor: "#fff",
                fontSize: 14,
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.smallInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: filterDate ? "#000" : "#777" }}>
                  {filterDate ? formatFilterDate(filterDate) : "Selecionar..."}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={filterDate ?? new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.inputSmallWrapLast}>
          <Text style={styles.smallLabel}>Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filterStatus}
              onValueChange={(value: StatusFilter) => setFilterStatus(value)}
              style={styles.picker}
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
      </View>

      {isManager && (
        <View>
          <Text style={styles.smallLabel}>Reservado por</Text>
          <TextInput
            placeholder="Filtro por nome..."
            value={filterReservedBy}
            onChangeText={setFilterReservedBy}
            style={styles.smallInput}
          />
        </View>
      )}

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.listContainer}>
        {filtered.map((reservation) => (
          <View key={reservation.id} style={styles.avisoCard}>
            <View style={styles.avisoHeader}>
              <Text style={styles.avisoTitle}>{reservation.occasion}</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      RESERVATION_STATUS_COLOR[reservation.status],
                  },
                ]}
              />
            </View>
            <Text style={styles.statusText}>
              {RESERVATION_STATUS_LABEL[reservation.status]}
            </Text>
            <Text style={styles.avisoDate}>
              Data: {formatDate(reservation.date)}
            </Text>
            <Text style={styles.avisoDate}>Horário: {reservation.time}</Text>
            <Text style={styles.avisoRef}>
              Reservado por: {reservation.reservedBy.name}
            </Text>
            <Text style={styles.avisoRef}>
              Bloco {reservation.reservedBy.bloco} • Apartamento{" "}
              {reservation.reservedBy.apartamento}
            </Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() =>
                router.push({
                  pathname: "/party-saloon/[id]",
                  params: { id: reservation.id },
                })
              }
            >
              <Text style={styles.cardButtonText}>Ver Reserva</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!errorMessage && filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text>Nenhuma reserva encontrada.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
