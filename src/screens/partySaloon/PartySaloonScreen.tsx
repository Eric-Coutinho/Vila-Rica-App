import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { styles } from "./PartySaloonScreenStyles";

const API_BASE = "http://localhost:3000/api";

type Reservation = {
  id: string;
  type: "party_saloon" | "move";
  date: string;
  time: string;
  occasion: string;
  status: "active" | "closed";

  reservedBy: {
    email: string;
    name: string;
    apartamento: string;
    bloco: string;
  };

  guests: {
    name: string;
    cpf: string;
    birthDate: string;
  }[];
};

export default function PartySaloonScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSindico, setIsSindico] = useState(false);

  const [filterReservedBy, setFilterReservedBy] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadUserRole() {
      try {
        const raw =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);

        const userObj = raw ? JSON.parse(raw) : null;

        if (!mounted) return;

        if (userObj?.role) {
          const role = String(userObj.role)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          setIsSindico(role === "sindico" || role === "admin");
        } else {
          setIsSindico(false);
        }
      } catch (err) {
        console.warn("Erro ao ler user do storage:", err);

        if (mounted) {
          setIsSindico(false);
        }
      }
    }

    loadUserRole();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchReservations() {
      setLoading(true);

      try {
        const raw =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);

        const parsed = raw ? JSON.parse(raw) : null;
        const userId = parsed?._id || parsed?.id;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (userId) {
          headers["x-user-id"] = String(userId);
        }

        const res = await fetch(
          `${API_BASE}/reservation/list-reservations/party_saloon`,
          {
            method: "GET",
            headers,
          }
        );

        console.log("Resposta da API:", res);

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));

          console.warn(
            "Falha ao buscar reservas:",
            res.status,
            errBody
          );

          if (!mounted) return;

          setReservations([]);
          return;
        }

        const body = await res.json().catch(() => ({}));

        console.log("Body das reservas:", body);

        const reservationsArray: any[] = Array.isArray(body)
          ? body
          : body.reservations || body.data || [];

        const mapped: Reservation[] = reservationsArray.map((r: any) => ({
          id: String(r._id || r.id || ""),

          type: r.type,

          date: r.date || "",

          time: r.time || "",

          occasion: r.occasion || "Sem ocasião",

          status:
            r.status === "closed"
              ? "closed"
              : "active",

          reservedBy: {
            email: r.reservedBy?.email || "",
            name: r.reservedBy?.name || "Usuário não informado",
            apartamento: r.reservedBy?.apartamento || "",
            bloco: r.reservedBy?.bloco || "",
          },

          guests: Array.isArray(r.guests)
            ? r.guests
            : [],
        }));

        if (!mounted) return;

        setReservations(mapped);
      } catch (err) {
        console.error("Erro ao buscar reservas:", err);

        if (!mounted) return;

        setReservations([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.valueOf())) {
      return dateString;
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  };

  const filtered = reservations.filter((reservation) => {
    const formattedDate = formatDate(reservation.date);

    const byReservedBy =
      filterReservedBy.trim() === "" ||
      reservation.reservedBy.name
      .toLowerCase()
      .includes(filterReservedBy.toLowerCase());

    const byDate =
      filterDate.trim() === "" ||
      formattedDate.includes(filterDate);

    const byStatus =
      !filterStatus || filterStatus === "all"
        ? true
        : reservation.status === filterStatus;

    return byReservedBy && byDate && byStatus;
  });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>Salão de Festas</Text>

      {isSindico && (
        <TouchableOpacity
          style={styles.newNoticeButton}
          activeOpacity={0.85}
          onPress={() => {
            // router.push("/create-party-saloon");
          }}
        >
          <Text style={styles.newNoticeButtonText}>
            Nova Reserva
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.filtersRow}>
        <View style={styles.inputSmallWrap}>
          <Text style={styles.smallLabel}>Data</Text>

          <TextInput
            placeholder="dd/mm/aaaa"
            value={filterDate}
            onChangeText={setFilterDate}
            style={styles.smallInput}
          />
        </View>

        <View style={styles.inputSmallWrap}>
          <Text style={styles.smallLabel}>Status</Text>

          <TouchableOpacity
            style={styles.selectSmall}
            onPress={() =>
              setFilterStatus((prev) =>
                prev === null
                  ? "all"
                  : prev === "all"
                    ? "active"
                    : prev === "active"
                      ? "closed"
                      : null
              )
            }
          >
            <Text style={styles.selectSmallText}>
              {filterStatus === null
                ? "Status"
                : filterStatus === "all"
                  ? "Todos"
                  : filterStatus}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.smallLabel}>
          Reservado por
        </Text>

        <TextInput
          placeholder="Filtro por nome..."
          value={filterReservedBy}
          onChangeText={setFilterReservedBy}
          style={styles.smallInput}
        />
      </View>

      <View style={{ marginBlock: 22 }}>
        {filtered.map((reservation) => (
          <View
            key={reservation.id}
            style={styles.avisoCard}
          >
            <View style={styles.avisoHeader}>
              <Text style={styles.avisoTitle}>
                {reservation.occasion}
              </Text>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      reservation.status === "active"
                        ? "#2ecc71"
                        : "#e74c3c",
                  },
                ]}
              />
            </View>

            <Text style={styles.avisoDate}>
              Data: {formatDate(reservation.date)}
            </Text>

            <Text style={styles.avisoDate}>
              Horário: {reservation.time}
            </Text>

            <Text style={styles.avisoRef}>
              Reservado por: {reservation.reservedBy.name}
            </Text>

            <Text style={styles.avisoRef}>
              Bloco {reservation.reservedBy.bloco} •
              Apartamento {reservation.reservedBy.apartamento}
            </Text>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => {
                // router.push(`/reservations/${reservation.id}`);
              }}
            >
              <Text style={styles.cardButtonText}>
                Ver Reserva
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text>
              Nenhuma reserva encontrada.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
