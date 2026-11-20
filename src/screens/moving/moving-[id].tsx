import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConfirmModal from "../../components/ConfirmModal.tsx";
import { getErrorMessage } from "../../services/api";
import {
  cancelReservation,
  confirmReservation,
  confirmReservationPayment,
  finishMoveReservation,
  getReservationById,
} from "../../services/reservationService";
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

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

  async function approve() {
    if (!id) return;
    setActing(true);
    try {
      setReservation(await confirmReservation(id));
      alert("Mudança aprovada. Aguardando confirmação do pagamento.");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível aprovar a mudança.")}`,
      );
    } finally {
      setActing(false);
    }
  }

  async function confirmPayment() {
    if (!id) return;
    setActing(true);
    try {
      setReservation(await confirmReservationPayment(id));
      alert("Pagamento confirmado. A mudança está confirmada.");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível confirmar o pagamento.")}`,
      );
    } finally {
      setActing(false);
    }
  }

  function requestCancellation() {
    setShowCancellationModal(true);
  }

  async function confirmCancellation() {
    if (!id || !reservation) return;
    const refusing =
      reservation.permissions.isManager &&
      reservation.permissions.canConfirmReservation;
    setActing(true);
    try {
      setReservation(await cancelReservation(id));
      setShowCancellationModal(false);
      alert(refusing ? "Mudança recusada." : "Mudança cancelada com sucesso.");
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível cancelar a mudança.")}`,
      );
    } finally {
      setActing(false);
    }
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
  const refusing =
    reservation.permissions.isManager &&
    reservation.permissions.canConfirmReservation;

  return (
    <>
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
              <Text style={styles.detailText}>
                {reservation.reservedBy.name}
              </Text>
            </>
          )}
          {reservation.permissions.isManager &&
            reservation.permissions.canConfirmReservation && (
              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 22 }]}
                onPress={approve}
                disabled={acting}
              >
                <Text style={styles.actionText}>Aprovar Mudança</Text>
              </TouchableOpacity>
            )}
          {reservation.permissions.isManager &&
            reservation.permissions.canConfirmPayment && (
              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 12 }]}
                onPress={confirmPayment}
                disabled={acting}
              >
                <Text style={styles.actionText}>Confirmar Pagamento</Text>
              </TouchableOpacity>
            )}
          {reservation.requiresPaymentContact && reservation.permissions.isOwner == true &&(
            <Text style={styles.notice}>
              Por favor, entre em contato com o síndico para obter informações
              de pagamento da taxa.
            </Text>
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
              <Text style={styles.actionText}>
                {refusing ? "Recusar Mudança" : "Cancelar Mudança"}
              </Text>
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
                {reservation.status === "canceled" &&
                !reservation.permissions.isManager
                  ? "Esta mudança já foi encerrada ou cancelada. Entre em contato com o síndico."
                  : "Esta mudança já foi encerrada ou cancelada."}
              </Text>
            )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showCancellationModal}
        title={refusing ? "Recusar mudança" : "Cancelar mudança"}
        text={
          refusing
            ? "Tem certeza que deseja recusar esta reserva de mudança?"
            : "Tem certeza que deseja cancelar esta mudança?"
        }
        onCancel={() => setShowCancellationModal(false)}
        onConfirm={confirmCancellation}
        cancelText="Voltar"
        confirmText={refusing ? "Recusar" : "Cancelar"}
        loading={acting}
      />
    </>
  );
}
