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

import {
  addComplaintMessage,
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(value),
  );

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  const hours = Math.max(0, Math.floor(difference / 3_600_000));

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
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: "current-resident",
    name: "Morador",
  });
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [involvedModalVisible, setInvolvedModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    Exclude<ComplaintStatus, "created">
  >("under_review");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        if (!id) return;

        const [user, foundComplaint] = await Promise.all([
          getStoredUser(),
          getComplaintById(id),
        ]);

        if (!mounted) return;

        const role = normalize(String(user?.role || ""));
        const manager = ["sindico", "admin", "adm"].includes(role);

        setIsManager(manager);
        setCurrentUser({
          id: user?._id || (manager ? "manager-1" : "current-resident"),
          name: user?.name || (manager ? "Síndico" : "Morador"),
        });
        setComplaint(foundComplaint);

        if (foundComplaint?.status === "closed") {
          setSelectedStatus("closed");
        } else {
          setSelectedStatus("under_review");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddResponse = async () => {
    const text = reply.trim();

    if (!complaint || !text) return;

    setSending(true);

    try {
      const created = await addComplaintMessage(complaint.id, {
        authorId: currentUser.id,
        authorName: isManager ? "Síndico" : currentUser.name,
        authorRole: isManager ? "manager" : "resident",
        text,
      });

      setComplaint((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, created],
            }
          : current,
      );
      setReply("");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a resposta.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!complaint || !isManager) return;

    setSavingStatus(true);

    try {
      const updated = await updateComplaintStatus(
        complaint.id,
        selectedStatus,
      );
      setComplaint(updated);
      setStatusModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#466CA5" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Reclamação não encontrada.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/complaints")}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              {
                backgroundColor: COMPLAINT_STATUS_COLOR[complaint.status],
              },
            ]}
          />

          {isManager && (
            <TouchableOpacity
              style={styles.editStatusButton}
              accessibilityLabel="Alterar status"
              onPress={() => {
                setSelectedStatus(
                  complaint.status === "closed" ? "closed" : "under_review",
                );
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
              <Text style={styles.infoText}>
                {complaint.createdBy.name}
              </Text>
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

              <Ionicons
                name="return-down-back-outline"
                size={22}
                color="#222"
                style={styles.messageReplyIcon}
              />
            </View>
          ))}

          {complaint.messages.length === 0 && (
            <Text style={styles.noMessagesText}>
              Ainda não há respostas nesta reclamação.
            </Text>
          )}
        </View>

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

        <TouchableOpacity
          style={styles.addResponseButton}
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
      </ScrollView>

      <TouchableOpacity
        style={styles.chatButton}
        activeOpacity={0.85}
        accessibilityLabel="Abrir chatbot"
        onPress={() => router.push("/chatbot")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={34} color="#fff" />
      </TouchableOpacity>

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
                style={styles.statusSaveButton}
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
