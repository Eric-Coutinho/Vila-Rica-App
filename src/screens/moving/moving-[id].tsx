import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  cancelReservation,
  finishMoveReservation,
  getReservationById,
} from "../../services/reservationService";
import { getErrorMessage } from "../../services/api";
import {
  RESERVATION_STATUS_COLOR,
  Reservation,
} from "../../types/reservations";
import { styles } from "./moving-idStyles";

function formatDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match
    ? `${match[3]}/${match[2]}/${match[1].slice(2)}`
    : new Date(value).toLocaleDateString("pt-BR");
}

export default function MovingReservationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setReservation(await getReservationById(id));
    } catch {
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function finish() {
    if (!id) return;
    setActing(true);
    try {
      setReservation(await finishMoveReservation(id));
      alert("Mudança finalizada com sucesso.");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível finalizar a mudança.")}`,
      );
    } finally {
      setActing(false);
    }
  }

  function requestCancellation() {
    Alert.alert(
      "Cancelar mudança",
      "Tem certeza de que deseja cancelar esta mudança?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar mudança",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            setActing(true);
            try {
              setReservation(await cancelReservation(id));
              alert("Mudança cancelada com sucesso.");
            } catch (error) {
              alert(
                `Erro - ${getErrorMessage(error, "Não foi possível cancelar a mudança.")}`,
              );
            } finally {
              setActing(false);
            }
          },
        },
      ],
    );
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#466CA5" />
      </View>
    );
  if (!reservation)
    return (
      <View style={styles.centered}>
        <Text>Reserva não encontrada.</Text>
      </View>
    );
  const contactLabel = reservation.permissions.isManager
    ? "Contatar Morador"
    : "Contatar Síndico";

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>
          Reserva{`\n`}
          {formatDate(reservation.date)}
        </Text>
        <View
          style={[
            styles.dot,
            { backgroundColor: RESERVATION_STATUS_COLOR[reservation.status] },
          ]}
        />
      </View>
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Hora:</Text>
        <Text style={styles.detailText}>
          {reservation.time} - {reservation.endTime || "—"}
        </Text>
        <Text style={styles.detailLabel}>Empresa de Mudança:</Text>
        <Text style={styles.detailText}>
          {reservation.company || "Não informada"}
        </Text>
        {reservation.permissions.isManager && (
          <>
            <Text style={styles.detailLabel}>Morador:</Text>
            <Text style={styles.detailText}>{reservation.reservedBy.name}</Text>
          </>
        )}
        {reservation.permissions.canFinish && (
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 22 }]}
            onPress={finish}
            disabled={acting}
          >
            <Text style={styles.actionText}>Finalizar Mudança</Text>
          </TouchableOpacity>
        )}
        {reservation.permissions.canCancel && (
          <TouchableOpacity
            style={styles.cancelDetailButton}
            onPress={requestCancellation}
            disabled={acting}
          >
            <Text style={styles.actionText}>Cancelar Mudança</Text>
          </TouchableOpacity>
        )}
        {(reservation.permissions.canFinish ||
          reservation.permissions.canCancel) && (
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 12, marginBottom: 0 }]}
            onPress={() =>
              alert("A tela de conversa será adicionada em breve.")
            }
          >
            <Text style={styles.actionText}>{contactLabel}</Text>
          </TouchableOpacity>
        )}
        {!reservation.permissions.canFinish &&
          !reservation.permissions.canCancel && (
            <Text style={styles.notice}>
              Esta mudança já foi encerrada ou cancelada.
            </Text>
          )}
      </View>
    </ScrollView>
  );
}
