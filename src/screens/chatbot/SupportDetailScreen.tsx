import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./ChatbotStyles";
import {
  getSupportCase,
  replySupportCase,
  updateSupportCaseStatus,
} from "@/src/services/supportService";
import type {
  SupportCaseStatus,
  SupportConversation,
} from "@/src/types/support";

const STATUS_LABEL: Record<SupportCaseStatus, string> = {
  resolved: "Resolvido",
  in_analysis: "Em análise",
  closed: "Fechada",
};

const STATUS_COLOR: Record<SupportCaseStatus, string> = {
  resolved: "#20df25",
  in_analysis: "#ffe600",
  closed: "#ff1010",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<SupportCaseStatus>("in_analysis");

  const load = useCallback(() => {
    if (!id) return () => undefined;
    let active = true;
    setLoading(true);
    getSupportCase(id)
      .then((item) => active && setConversation(item))
      .catch(
        (reason) =>
          active &&
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível buscar o chat.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);
  useFocusEffect(load);

  const saveStatus = async () => {
    if (!conversation || saving) return;
    setSaving(true);
    try {
      setConversation(
        await updateSupportCaseStatus(conversation.id, selectedStatus),
      );
      setStatusModalVisible(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSaving(false);
    }
  };

  const submitReply = async () => {
    if (!conversation || !reply.trim() || saving) return;
    setSaving(true);
    try {
      setConversation(await replySupportCase(conversation.id, reply));
      setReply("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível enviar a resposta.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#466CA5" size="large" />
      </View>
    );
  if (!conversation)
    return (
      <View style={styles.loadingContainer}>
        <Text>{error || "Chat não encontrado."}</Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.detailPage}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.detailTitle}>Suporte{"\n"}ChatBot</Text>
      <Text style={styles.detailCase}>#{conversation.caseNumber}</Text>
      <View style={styles.supportStatusRow}>
        <Text style={styles.supportStatusText}>
          {STATUS_LABEL[conversation.status || "in_analysis"]}
        </Text>
        <View
          style={[
            styles.supportDetailStatusDot,
            {
              backgroundColor:
                STATUS_COLOR[conversation.status || "in_analysis"],
            },
          ]}
        />
        <TouchableOpacity
          style={styles.supportEditStatusButton}
          accessibilityLabel="Alterar status"
          onPress={() => {
            setSelectedStatus(conversation.status || "in_analysis");
            setStatusModalVisible(true);
          }}
        >
          <Ionicons name="pencil-outline" size={20} color="#2764d7" />
        </TouchableOpacity>
      </View>
      <View style={styles.residentInfo}>
        <Text style={styles.residentInfoText}>Morador</Text>
        <Text style={styles.residentInfoText}>
          Bloco {conversation.resident.bloco || "—"}
          {"\n"}Apartamento {conversation.resident.apartamento || "—"}
        </Text>
      </View>
      <Text style={styles.createdAt}>
        Criado em {formatDate(conversation.createdAt)}
      </Text>
      <Text style={styles.detailSectionTitle}>Suporte</Text>
      {conversation.messages.map((message) => (
        <View
          key={message.id}
          style={[
            styles.detailMessageCard,
            message.author === "manager" ? styles.detailManagerCard : null,
          ]}
        >
          <Text style={styles.detailMessageAuthor}>
            {message.author === "resident"
              ? "Morador"
              : message.author === "manager"
                ? "Síndico"
                : "ChatBot"}
          </Text>
          <Text style={styles.detailMessageDate}>
            {formatDate(message.createdAt)}
          </Text>
          <Text style={styles.detailMessageText}>{message.text}</Text>
        </View>
      ))}
      {error ? <Text style={styles.supportError}>{error}</Text> : null}
      <TextInput
        style={styles.replyInput}
        value={reply}
        onChangeText={setReply}
        placeholder="Responder..."
        placeholderTextColor="#999"
        multiline
        maxLength={4000}
        editable={!saving}
      />
      <TouchableOpacity
        style={[
          styles.replyButton,
          (!reply.trim() || saving) && styles.disabledButton,
        ]}
        onPress={submitReply}
        disabled={!reply.trim() || saving}
      >
        <Text style={styles.replyButtonText}>Adicionar Resposta</Text>
      </TouchableOpacity>
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable
          style={styles.supportModalOverlay}
          onPress={() => setStatusModalVisible(false)}
        >
          <Pressable
            style={styles.supportStatusModal}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.supportStatusModalTitle}>Alterar status</Text>
            <Text style={styles.supportCurrentStatusText}>
              Status atual: {STATUS_LABEL[conversation.status || "in_analysis"]}
            </Text>
            {(["in_analysis", "resolved", "closed"] as SupportCaseStatus[]).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.supportStatusOption,
                    selectedStatus === status &&
                      styles.supportStatusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <View
                    style={[
                      styles.supportOptionDot,
                      { backgroundColor: STATUS_COLOR[status] },
                    ]}
                  />
                  <Text style={styles.supportStatusOptionText}>
                    {STATUS_LABEL[status]}
                  </Text>
                </TouchableOpacity>
              ),
            )}
            <View style={styles.supportStatusActions}>
              <TouchableOpacity
                style={styles.supportStatusCancelButton}
                onPress={() => setStatusModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.supportStatusCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.supportStatusSaveButton,
                  saving && styles.disabledButton,
                ]}
                onPress={saveStatus}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.replyButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
