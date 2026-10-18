import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ApiError, getErrorMessage } from "@/src/services/api";
import {
  addReservationGuest,
  cancelReservation,
  confirmReservation,
  confirmReservationPayment,
  getReservationById,
  removeReservationGuest,
} from "@/src/services/reservationService";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
  Reservation,
} from "@/src/types/reservations";

type MessageModalState = {
  visible: boolean;
  title: string;
  message: string;
  leavePage?: boolean;
};

type ConfirmationState = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm?: () => void;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR").format(parsed);
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function PartySaloonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const reservationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCpf, setGuestCpf] = useState("");
  const [guestBirthDate, setGuestBirthDate] = useState("");
  const [messageModal, setMessageModal] = useState<MessageModalState>({
    visible: false,
    title: "",
    message: "",
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
  });

  const showMessage = (title: string, message: string, leavePage = false) =>
    setMessageModal({ visible: true, title, message, leavePage });

  const loadReservation = useCallback(async () => {
    if (!reservationId) {
      showMessage(
        "Falha ao acessar",
        "Sem acesso, tente novamente mais tarde",
        true,
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setReservation(await getReservationById(reservationId));
    } catch (error) {
      setReservation(null);
      if (error instanceof ApiError && error.status === 404) {
        showMessage(
          "Falha ao acessar",
          "Sem acesso, tente novamente mais tarde",
          true,
        );
      } else {
        showMessage(
          "Falha ao carregar",
          getErrorMessage(error, "Não foi possível buscar a reserva."),
          true,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  const filteredGuests = useMemo(() => {
    const term = filterName.trim().toLowerCase();
    if (!reservation) return [];
    return term
      ? reservation.guests.filter((guest) =>
          guest.name.toLowerCase().includes(term),
        )
      : reservation.guests;
  }, [filterName, reservation]);

  const guestDeadlinePassed = useMemo(() => {
    if (
      !reservation?.permissions.isOwner ||
      reservation.permissions.canManageGuests
    ) {
      return false;
    }
    const deadline = new Date(reservation.guestEditingDeadline).getTime();
    const startsAt = new Date(reservation.startsAt).getTime();
    return deadline <= Date.now() && startsAt > Date.now();
  }, [reservation]);

  async function runAction(
    action: () => Promise<Reservation>,
    successMessage: string,
  ) {
    try {
      setActionLoading(true);
      setReservation(await action());
      showMessage("Sucesso", successMessage);
      return true;
    } catch (error) {
      showMessage(
        "Não foi possível concluir",
        getErrorMessage(error, "Tente novamente mais tarde."),
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  function requestCancellation() {
    setConfirmation({
      visible: true,
      title: "Cancelar reserva",
      message: "Tem certeza de que deseja cancelar esta reserva?",
      confirmText: "Cancelar reserva",
      onConfirm: () => {
        if (!reservationId) return;
        void runAction(
          () => cancelReservation(reservationId),
          reservation?.paymentConfirmedAt
            ? "Reserva cancelada. Entre em contato com o síndico para verificar a devolução do pagamento."
            : "Reserva cancelada com sucesso.",
        );
      },
    });
  }

  async function handleAddGuest() {
    if (!reservationId || !guestName.trim()) {
      return showMessage("Dados incompletos", "Informe o nome do convidado.");
    }
    const cpf = guestCpf.replace(/\D/g, "");
    if (cpf.length !== 11) {
      return showMessage("CPF inválido", "Informe os 11 números do CPF.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(guestBirthDate)) {
      return showMessage(
        "Data inválida",
        "Informe a data de nascimento no formato AAAA-MM-DD.",
      );
    }

    const added = await runAction(
      () =>
        addReservationGuest(reservationId, {
          name: guestName.trim(),
          cpf,
          birthDate: guestBirthDate,
        }),
      "Convidado adicionado com sucesso.",
    );
    if (!added) return;
    setGuestName("");
    setGuestCpf("");
    setGuestBirthDate("");
    setGuestModalVisible(false);
  }

  function requestGuestRemoval(guestId: string, guestNameValue: string) {
    if (!reservationId) return;
    setConfirmation({
      visible: true,
      title: "Remover convidado",
      message: `Deseja remover ${guestNameValue} da reserva?`,
      confirmText: "Remover",
      onConfirm: () => {
        void runAction(
          () => removeReservationGuest(reservationId, guestId),
          "Convidado removido com sucesso.",
        );
      },
    });
  }

  function confirmPendingAction() {
    const action = confirmation.onConfirm;
    setConfirmation((current) => ({
      ...current,
      visible: false,
      onConfirm: undefined,
    }));
    action?.();
  }

  const closeMessageModal = () => {
    const leavePage = messageModal.leavePage;
    setMessageModal((current) => ({ ...current, visible: false }));
    if (leavePage) router.replace("/party-saloon");
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
              <View>
                <Text style={styles.headerTitle}>
                  Reserva{"\n"}
                  {formatDate(reservation.date)}
                </Text>
                <Text style={styles.reservationTime}>{reservation.time}</Text>
              </View>
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
            <Text style={styles.statusLabel}>
              {RESERVATION_STATUS_LABEL[reservation.status]}
            </Text>

            {reservation.requiresPaymentContact && (
              <View style={styles.informationNotice}>
                <Text style={styles.informationNoticeText}>
                  Entre em contato com o síndico para receber os dados de
                  pagamento.
                </Text>
              </View>
            )}

            {reservation.requiresRefundContact && (
              <View style={styles.warningNotice}>
                <Text style={styles.warningNoticeText}>
                  Esta reserva foi cancelada após o pagamento. Entre em contato
                  com o síndico para verificar a devolução.
                </Text>
              </View>
            )}

            {reservation.permissions.canConfirmReservation && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                disabled={actionLoading}
                onPress={() =>
                  reservationId &&
                  runAction(
                    () => confirmReservation(reservationId),
                    "Reserva confirmada. Agora ela aguarda o pagamento.",
                  )
                }
              >
                <Text style={styles.actionButtonText}>Confirmar reserva</Text>
              </TouchableOpacity>
            )}

            {reservation.permissions.canConfirmPayment && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                disabled={actionLoading}
                onPress={() =>
                  reservationId &&
                  runAction(
                    () => confirmReservationPayment(reservationId),
                    "Pagamento confirmado. A reserva está confirmada.",
                  )
                }
              >
                <Text style={styles.actionButtonText}>Confirmar pagamento</Text>
              </TouchableOpacity>
            )}

            {reservation.permissions.canCancel && (
              <TouchableOpacity
                style={styles.cancelReservationButton}
                activeOpacity={0.85}
                disabled={actionLoading}
                onPress={requestCancellation}
              >
                <Text style={styles.cancelReservationButtonText}>
                  Cancelar reserva
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.informationRow}>
              <View style={styles.informationColumn}>
                <Text style={styles.informationLabel}>Reservante:</Text>
                <Text style={styles.informationText}>
                  Bloco {reservation.reservedBy.bloco || "—"} Ap{" "}
                  {reservation.reservedBy.apartamento || "—"}
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
              <Text style={styles.informationText}>{reservation.occasion}</Text>
            </View>

            {reservation.permissions.canManageGuests && (
              <TouchableOpacity
                style={styles.addGuestButton}
                onPress={() => setGuestModalVisible(true)}
              >
                <Text style={styles.addGuestButtonText}>
                  Adicionar convidado
                </Text>
              </TouchableOpacity>
            )}

            {guestDeadlinePassed && (
              <View style={styles.warningNotice}>
                <Text style={styles.warningNoticeText}>
                  O prazo para alterar convidados terminou 24 horas antes da
                  reserva. Entre em contato com o síndico.
                </Text>
              </View>
            )}

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
              {filteredGuests.map((guest) => (
                <View key={guest.id} style={styles.guestCard}>
                  <Text style={styles.guestName} numberOfLines={2}>
                    {guest.name}
                  </Text>
                  <Text style={styles.guestInformation}>
                    {formatCpf(guest.cpf)}
                  </Text>
                  <Text style={styles.guestInformation}>
                    {formatDate(guest.birthDate)}
                  </Text>
                  {reservation.permissions.canManageGuests && (
                    <TouchableOpacity
                      style={styles.removeGuestButton}
                      disabled={actionLoading}
                      onPress={() => requestGuestRemoval(guest.id, guest.name)}
                    >
                      <Text style={styles.removeGuestButtonText}>Remover</Text>
                    </TouchableOpacity>
                  )}
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

      <Modal
        transparent
        visible={loading || actionLoading}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#466CA5" />
            <Text style={styles.loadingText}>
              {loading ? "Buscando reserva..." : "Atualizando reserva..."}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={guestModalVisible}
        animationType="fade"
        onRequestClose={() => setGuestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.guestModalBox}>
            <Text style={styles.modalTitle}>Adicionar convidado</Text>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Nome completo"
            />
            <Text style={styles.inputLabel}>CPF</Text>
            <TextInput
              style={styles.modalInput}
              value={guestCpf}
              onChangeText={(value) => setGuestCpf(formatCpf(value))}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              maxLength={14}
            />
            <Text style={styles.inputLabel}>Data de nascimento</Text>
            <TextInput
              style={styles.modalInput}
              value={guestBirthDate}
              onChangeText={setGuestBirthDate}
              placeholder="AAAA-MM-DD"
              maxLength={10}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryModalButton}
                onPress={() => setGuestModalVisible(false)}
              >
                <Text style={styles.secondaryModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryModalButton}
                onPress={handleAddGuest}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={messageModal.visible}
        animationType="fade"
        onRequestClose={closeMessageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{messageModal.title}</Text>
            <Text style={styles.modalMessage}>{messageModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeMessageModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={confirmation.visible}
        animationType="fade"
        onRequestClose={() =>
          setConfirmation((current) => ({ ...current, visible: false }))
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{confirmation.title}</Text>
            <Text style={styles.modalMessage}>{confirmation.message}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryModalButton}
                onPress={() =>
                  setConfirmation((current) => ({
                    ...current,
                    visible: false,
                    onConfirm: undefined,
                  }))
                }
              >
                <Text style={styles.secondaryModalButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerModalButton}
                onPress={confirmPendingAction}
              >
                <Text style={styles.modalButtonText}>
                  {confirmation.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
