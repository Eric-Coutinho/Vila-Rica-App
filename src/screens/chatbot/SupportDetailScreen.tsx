import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

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

  const changeStatus = async (status: SupportCaseStatus) => {
    if (!conversation || saving) return;
    setSaving(true);
    try {
      setConversation(await updateSupportCaseStatus(conversation.id, status));
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
      <View style={styles.statusEditRow}>
        <Text style={styles.statusEditLabel}>Status</Text>
        <View style={styles.detailPickerWrap}>
          <Picker
            selectedValue={conversation.status || "in_analysis"}
            onValueChange={(value) => changeStatus(value as SupportCaseStatus)}
            enabled={!saving}
            style={styles.detailPicker}
          >
            <Picker.Item label="Em análise" value="in_analysis" />
            <Picker.Item label="Resolvido" value="resolved" />
            <Picker.Item label="Fechada" value="closed" />
          </Picker>
        </View>
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
    </ScrollView>
  );
}
