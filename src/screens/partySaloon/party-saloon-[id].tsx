import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./party-saloonidStyles";

const API_BASE = "http://localhost:3000/api";

type ReservationStatus =
  | "confirmed"
  | "waiting"
  | "canceled"
  | "closed";

type Guest = {
  name: string;
  cpf: string;
  birthDate: string;
  arrivalTime?: string;
};

type Reservation = {
  _id: string;
  type: "party_saloon" | "move";
  date: string;
  time: string;
  occasion: string;
  status: ReservationStatus;
  guests: Guest[];

  reservedBy: {
    email: string;
    name: string;
    apartamento: string;
    bloco: string;
  };
};

type ErrorModalState = {
  visible: boolean;
  title: string;
  message: string;
};

export default function PartySaloonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();

  const reservationId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(true);

  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    visible: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    let mounted = true;

    async function getReservation() {
      setLoading(true);

      try {
        if (!reservationId) {
          if (mounted) {
            setErrorModal({
              visible: true,
              title: "Falha ao acessar",
              message: "Sem acesso, tente novamente mais tarde",
            });
          }

          return;
        }

        const rawUser =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);

        const storedUser = rawUser ? JSON.parse(rawUser) : null;
        const userId = storedUser?._id || storedUser?.id;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (userId) {
          headers["x-user-id"] = String(userId);
        }

        const response = await fetch(
          `${API_BASE}/reservation/get-reservation/${reservationId}`,
          {
            method: "GET",
            headers,
          },
        );

        const body = await response.json().catch(() => ({}));

        if (response.status === 404) {
          if (mounted) {
            setReservation(null);

            setErrorModal({
              visible: true,
              title: "Falha ao acessar",
              message: "Sem acesso, tente novamente mais tarde",
            });
          }

          return;
        }

        if (!response.ok) {
          if (mounted) {
            setReservation(null);

            setErrorModal({
              visible: true,
              title: "Falha ao carregar",
              message:
                body?.message ||
                "Não foi possível buscar os dados da reserva.",
            });
          }

          return;
        }

        const reservationData = body?.reservation || body?.data || body;

        if (mounted) {
          setReservation({
            ...reservationData,
            guests: Array.isArray(reservationData?.guests)
              ? reservationData.guests
              : [],
          });
        }
      } catch (error) {
        console.error("Erro ao buscar reserva:", error);

        if (mounted) {
          setReservation(null);

          setErrorModal({
            visible: true,
            title: "Falha ao carregar",
            message:
              "Não foi possível conectar com o servidor. Tente novamente mais tarde.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getReservation();

    return () => {
      mounted = false;
    };
  }, [reservationId]);

  const filteredGuests = useMemo(() => {
    if (!reservation) {
      return [];
    }

    const normalizedFilter = filterName.trim().toLowerCase();

    if (!normalizedFilter) {
      return reservation.guests;
    }

    return reservation.guests.filter((guest) =>
      guest.name.toLowerCase().includes(normalizedFilter),
    );
  }, [filterName, reservation]);

  const formatDate = (value?: string) => {
    if (!value) {
      return "—";
    }

    /*
     * Extrai diretamente a parte YYYY-MM-DD para impedir que o fuso
     * horário altere o dia apresentado.
     */
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoDate) {
      const [, year, month, day] = isoDate;
      return `${day}/${month}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const getStatusColor = (status?: ReservationStatus) => {
    switch (status) {
      case "confirmed":
        return "#16dc23";

      case "waiting":
        return "#e6b422";

      case "canceled":
      case "closed":
        return "#c94d49";

      default:
        return "#999";
    }
  };

  const closeErrorModal = () => {
    setErrorModal((current) => ({
      ...current,
      visible: false,
    }));

    router.replace("/party-saloon");
  };

  return (
    <View style={styles.screen}>
      {reservation && (
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Reserva{"\n"}
                {formatDate(reservation.date)}
              </Text>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: getStatusColor(
                      reservation.status,
                    ),
                  },
                ]}
              />
            </View>

            {/*
              O endpoint para cancelar uma reserva não foi informado.
              Quando ele existir, substitua "disabled" pelo onPress
              responsável por chamar esse endpoint.
            */}
            <TouchableOpacity
              style={styles.cancelReservationButton}
              activeOpacity={0.85}
              disabled
            >
              <Text style={styles.cancelReservationButtonText}>
                Cancelar reserva
              </Text>
            </TouchableOpacity>

            <View style={styles.informationRow}>
              <View style={styles.informationColumn}>
                <Text style={styles.informationLabel}>Reservante:</Text>

                <Text style={styles.informationText}>
                  Bloco {reservation.reservedBy?.bloco || "—"} Ap{" "}
                  {reservation.reservedBy?.apartamento || "—"}
                </Text>
              </View>

              <View style={styles.informationColumn}>
                <Text style={styles.informationLabel}>Convidados:</Text>

                <Text style={styles.informationText}>
                  {reservation.guests.length}
                </Text>
              </View>
            </View>

            <View style={styles.occasionContainer}>
              <Text style={styles.informationLabel}>Ocasião:</Text>

              <Text style={styles.informationText}>
                {reservation.occasion || "—"}
              </Text>
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Nome</Text>

              <TextInput
                style={styles.filterInput}
                value={filterName}
                onChangeText={setFilterName}
                placeholder="Filtro por nome..."
                placeholderTextColor="#777"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.guestsContainer}>
              {filteredGuests.map((guest, index) => (
                <View
                  key={`${guest.cpf}-${index}`}
                  style={styles.guestCard}
                >
                  <Text
                    style={styles.guestName}
                    numberOfLines={2}
                  >
                    {guest.name}
                  </Text>

                  <Text style={styles.guestInformation}>
                    {guest.cpf}
                  </Text>

                  <Text style={styles.guestInformation}>
                    {formatDate(guest.birthDate)}
                  </Text>

                  <Text style={styles.guestInformation}>
                    Chegada: {guest.arrivalTime || "--:--"}
                  </Text>
                </View>
              ))}
            </View>

            {filteredGuests.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum convidado encontrado.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {!reservation && !loading && (
        <View style={styles.emptyScreen} />
      )}

      <Modal
        transparent
        visible={loading}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Buscando reserva...
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={errorModal.visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeErrorModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {errorModal.title}
            </Text>

            <Text style={styles.modalMessage}>
              {errorModal.message}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={closeErrorModal}
            >
              <Text style={styles.modalButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}