import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ApiError, getErrorMessage } from "../../services/api";
import {
  addComplaintMessage,
  deleteComplaint,
  getComplaintById,
  updateComplaintStatus,
} from "../../services/complaintService";
import { getStoredUser } from "../../services/session";
import {
  COMPLAINT_STATUS_COLOR,
  COMPLAINT_STATUS_LABEL,
  type Complaint,
  type ComplaintStatus,
} from "../../types/complaint";
import { styles } from "./complaint-idStyles";

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

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60_000);
  const hours = Math.floor(difference / 3_600_000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ComplaintDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const complaintId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [involvedModalVisible, setInvolvedModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<Exclude<ComplaintStatus, "created">>("under_review");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      try {
        if (!complaintId) {
          throw new ApiError("ID da reclamação não informado.", 400);
        }

        const [user, foundComplaint] = await Promise.all([
          getStoredUser(),
          getComplaintById(complaintId),
        ]);
        if (!active) return;

        const role = normalize(String(user?.role || ""));
        const manager = ["sindico", "admin", "adm"].includes(role);
        setIsManager(manager);
        setComplaint(foundComplaint);
        setSelectedStatus(
          foundComplaint.status === "closed" ? "closed" : "under_review",
        );
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          getErrorMessage(error, "Não foi possível carregar a reclamação."),
        );
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [complaintId, router]);

  const handleAddResponse = async () => {
    const text = reply.trim();
    if (!complaint || !text || complaint.status === "closed") return;

    setSending(true);
    try {
      const updated = await addComplaintMessage(complaint.id, text);
      setComplaint(updated);
      setReply("");
    } catch (error) {
      Alert.alert(
        "Erro",
        getErrorMessage(error, "Não foi possível adicionar a resposta."),
      );
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
      }
    } finally {
      setSending(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!complaint || !isManager) return;

    setSavingStatus(true);
    try {
      const updated = await updateComplaintStatus(complaint.id, selectedStatus);
      setComplaint(updated);
      setStatusModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        getErrorMessage(error, "Não foi possível atualizar o status."),
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const confirmDelete = () => {
    if (!complaint || isManager || deleting) return;

    const remove = async () => {
      setDeleting(true);
      try {
        await deleteComplaint(complaint.id);
        Alert.alert("Sucesso", "Reclamação excluída.");
        router.replace("/complaints");
      } catch (error) {
        Alert.alert(
          "Erro",
          getErrorMessage(error, "Não foi possível excluir a reclamação."),
        );
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === "web") {
      if (globalThis.confirm("Deseja realmente excluir esta reclamação?")) {
        void remove();
      }
      return;
    }

    Alert.alert(
      "Excluir reclamação",
      "Deseja realmente excluir esta reclamação?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => void remove() },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#466CA5" />
        <Text style={styles.loadingText}>Carregando reclamação...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>
          {errorMessage || "Reclamação não encontrada."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/complaints")}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const closed = complaint.status === "closed";

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Reclamação</Text>
        <Text style={styles.number}>{complaint.number}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {COMPLAINT_STATUS_LABEL[complaint.status]}
          </Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: COMPLAINT_STATUS_COLOR[complaint.status] },
            ]}
          />

          {isManager && (
            <TouchableOpacity
              style={styles.editStatusButton}
              accessibilityLabel="Alterar status"
              onPress={() => {
                setSelectedStatus(closed ? "closed" : "under_review");
                setStatusModalVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color="#2764d7" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.complaintTitle}>{complaint.title}</Text>
          <Text style={styles.description}>{complaint.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={31} color="#222" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>{complaint.createdBy.name}</Text>
              <Text style={styles.infoText}>
                Bloco {complaint.createdBy.bloco}
              </Text>
              <Text style={styles.infoText}>
                Apartamento {complaint.createdBy.apartamento}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={29} color="#222" />
            <Text style={styles.infoMainText}>
              {formatDate(complaint.occurrenceDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.involvedButton}
            activeOpacity={0.75}
            onPress={() => setInvolvedModalVisible(true)}
          >
            <Text style={styles.involvedButtonText}>Ver envolvidos</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.responsesTitle}>Respostas</Text>

        <View style={styles.messagesList}>
          {complaint.messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageCard,
                message.authorRole === "resident"
                  ? styles.residentMessage
                  : styles.managerMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageAuthorRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={31}
                    color="#222"
                  />
                  <Text style={styles.messageAuthor}>{message.authorName}</Text>
                </View>
                <Text style={styles.messageTime}>
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>

              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}

          {complaint.messages.length === 0 && (
            <Text style={styles.noMessagesText}>
              Ainda não há respostas nesta reclamação.
            </Text>
          )}
        </View>

        {closed ? (
          <View style={styles.closedNotice}>
            <Ionicons name="lock-closed-outline" size={19} color="#555" />
            <Text style={styles.closedNoticeText}>
              Esta reclamação foi encerrada e não aceita novas respostas.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.replyInput}
              value={reply}
              onChangeText={setReply}
              placeholder="Responder..."
              placeholderTextColor="#aaa"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.replyCounter}>{reply.length}/500</Text>

            <TouchableOpacity
              style={[
                styles.addResponseButton,
                (sending || !reply.trim()) && styles.buttonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleAddResponse}
              disabled={sending || !reply.trim()}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Adicionar resposta</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {!isManager && (
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={confirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Excluir reclamação</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={involvedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInvolvedModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInvolvedModalVisible(false)}
        >
          <Pressable
            style={styles.involvedModal}
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>Moradores</Text>

              {complaint.involved.residents.length > 0 ? (
                <View style={styles.residentsGrid}>
                  {complaint.involved.residents.map((resident) => (
                    <View key={resident.id} style={styles.residentItem}>
                      <Ionicons
                        name="person-circle-outline"
                        size={48}
                        color="#30343b"
                      />
                      <Text style={styles.residentName}>{resident.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyModalText}>
                  Nenhum morador específico informado.
                </Text>
              )}

              <Text style={styles.modalSectionTitle}>Apartamentos</Text>

              {complaint.involved.apartments.length > 0 ? (
                <View style={styles.apartmentsGrid}>
                  {complaint.involved.apartments.map((apartment) => (
                    <View key={apartment.id} style={styles.apartmentItem}>
                      <Text style={styles.apartmentText}>
                        Apartamento {apartment.apartamento}
                      </Text>
                      <Text style={styles.apartmentText}>
                        Bloco {apartment.bloco}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyModalText}>
                  Nenhum apartamento específico informado.
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setStatusModalVisible(false)}
        >
          <Pressable
            style={styles.statusModal}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.statusModalTitle}>Alterar status</Text>
            <Text style={styles.currentStatusText}>
              Status atual: {COMPLAINT_STATUS_LABEL[complaint.status]}
            </Text>

            <TouchableOpacity
              style={[
                styles.statusOption,
                selectedStatus === "under_review" &&
                  styles.statusOptionSelected,
              ]}
              onPress={() => setSelectedStatus("under_review")}
            >
              <View
                style={[
                  styles.optionDot,
                  { backgroundColor: COMPLAINT_STATUS_COLOR.under_review },
                ]}
              />
              <Text style={styles.statusOptionText}>Em análise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                selectedStatus === "closed" && styles.statusOptionSelected,
              ]}
              onPress={() => setSelectedStatus("closed")}
            >
              <View
                style={[
                  styles.optionDot,
                  { backgroundColor: COMPLAINT_STATUS_COLOR.closed },
                ]}
              />
              <Text style={styles.statusOptionText}>Encerrada</Text>
            </TouchableOpacity>

            <View style={styles.statusActions}>
              <TouchableOpacity
                style={styles.statusCancelButton}
                onPress={() => setStatusModalVisible(false)}
                disabled={savingStatus}
              >
                <Text style={styles.statusCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusSaveButton,
                  savingStatus && styles.buttonDisabled,
                ]}
                onPress={handleSaveStatus}
                disabled={savingStatus}
              >
                {savingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
