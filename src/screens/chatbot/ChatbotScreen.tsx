import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { styles } from "./ChatbotStyles";
import SupportCasesScreen from "./SupportCasesScreen";
import {
  escalateSupportConversation,
  getCurrentSupportConversation,
  sendSupportMessage,
  startNewSupportConversation,
} from "@/src/services/supportService";
import { getStoredUser } from "@/src/services/session";
import type { SupportAction, SupportConversation } from "@/src/types/support";

const QUICK_QUESTIONS: Array<{
  key: string;
  question: string;
}> = [
  {
    key: "party_saloon",
    question: "Como faço para reservar o salão de festas?",
  },
  { key: "move", question: "Como posso agendar uma mudança?" },
  { key: "assemblies", question: "Como consulto as assembleias?" },
];

const ALLOWED_ACTION_ROUTES = new Set([
  "new_chat",
  "/party-saloon",
  "/moving",
  "/meetings",
  "/complaints",
  "/notices",
]);

function isManager(role?: string) {
  const normalized = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return ["sindico", "admin", "adm", "administrador"].includes(normalized);
}

export default function ChatbotScreen() {
  const [loadingRole, setLoadingRole] = useState(true);
  const [manager, setManager] = useState(false);

  useEffect(() => {
    getStoredUser()
      .then((user) => setManager(isManager(user?.role)))
      .catch(() => setManager(false))
      .finally(() => setLoadingRole(false));
  }, []);

  if (loadingRole) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#466CA5" size="large" />
      </View>
    );
  }
  return manager ? <SupportCasesScreen /> : <ResidentChat />;
}

function ResidentChat() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const messagesScrollRef = useRef<ScrollView>(null);
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversation = useCallback(() => {
    let active = true;
    setLoading(true);
    getCurrentSupportConversation()
      .then((item) => active && setConversation(item))
      .catch(() => active && setConversation(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadConversation);

  const sendMessage = async (question?: string, quickReplyKey?: string) => {
    const text = (question || messageInput).trim();
    if (!text || sending) return;
    setMessageInput("");
    setSending(true);
    try {
      const result = await sendSupportMessage(
        text,
        conversation?.id,
        quickReplyKey,
      );
      setConversation(result.conversation);
    } catch (error) {
      const textError =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua pergunta.";
      setConversation((current) =>
        current
          ? {
              ...current,
              messages: [
                ...current.messages,
                {
                  id: `error-${Date.now()}`,
                  author: "assistant",
                  text: textError,
                  sources: [],
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : current,
      );
    } finally {
      setSending(false);
    }
  };

  const startNewChat = async () => {
    if (sending) return;
    setSending(true);
    try {
      setConversation(await startNewSupportConversation());
    } finally {
      setSending(false);
    }
  };

  const escalate = async () => {
    if (!conversation || conversation.status || sending) return;
    setSending(true);
    try {
      setConversation(await escalateSupportConversation(conversation.id));
    } finally {
      setSending(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  const messages = conversation?.messages || [];

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#466CA5" size="large" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.residentPage,
          { paddingBottom: windowHeight * 0.56 + 45 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.residentContent}>
          <Image
            source={require("../../../assets/images/mascote.png")}
            style={styles.residentMascot}
            resizeMode="contain"
          />
          <Text style={styles.greeting}>Olá!{"\n"}Como posso ajudar?</Text>
        </View>
      </ScrollView>

      <View style={styles.chatPositioner}>
        <View
          style={[styles.chatContainer, { maxHeight: windowHeight * 0.66 }]}
        >
          <View style={styles.quickQuestionsCard}>
            <View style={styles.chatTitleRow}>
              <Ionicons name="hardware-chip-outline" size={31} color="#111" />
              <Text style={styles.chatTitle}>Chat</Text>
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={startNewChat}
                disabled={sending}
              >
                <Text style={styles.newChatButtonText}>Iniciar novo chat</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.commonQuestionsTitle}>
              Perguntas mais comuns:
            </Text>
            {QUICK_QUESTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.quickQuestionButton}
                activeOpacity={0.7}
                disabled={sending}
                onPress={() => sendMessage(item.question, item.key)}
              >
                <Text style={styles.questionBullet}>•</Text>
                <Text style={styles.quickQuestionText}>{item.question}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {messages.length > 0 && (
            <ScrollView
              ref={messagesScrollRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              nestedScrollEnabled
              onContentSizeChange={() =>
                messagesScrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((message, index) => {
                const resident = message.author === "resident";
                const manager = message.author === "manager";
                const canEscalate =
                  !conversation?.status &&
                  message.author === "assistant" &&
                  index === messages.length - 1;
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      resident
                        ? styles.userMessage
                        : manager
                          ? styles.managerMessage
                          : styles.botMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageAuthor,
                        resident
                          ? styles.userMessageText
                          : styles.botMessageText,
                      ]}
                    >
                      {resident ? "Morador" : manager ? "Síndico" : "ChatBot"}
                    </Text>
                    <Text
                      style={[
                        styles.messageText,
                        resident
                          ? styles.userMessageText
                          : styles.botMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    {message.sources?.length ? (
                      <Text style={styles.messageSources}>
                        Fonte: {message.sources.join(", ")}
                      </Text>
                    ) : null}
                    {message.suggestedAction &&
                    ALLOWED_ACTION_ROUTES.has(message.suggestedAction.route) ? (
                      <TouchableOpacity
                        style={styles.suggestedActionButton}
                        onPress={() =>
                          message.suggestedAction?.route === "new_chat"
                            ? startNewChat()
                            : router.push(message.suggestedAction!.route as any)
                        }
                      >
                        <Text style={styles.suggestedActionText}>
                          {message.suggestedAction.label}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    {canEscalate ? (
                      <TouchableOpacity
                        style={styles.unsatisfiedButton}
                        onPress={escalate}
                      >
                        <Text style={styles.unsatisfiedButtonText}>
                          Minha dúvida não foi resolvida
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    <Text
                      style={[
                        styles.messageDate,
                        resident
                          ? styles.userMessageDate
                          : styles.botMessageDate,
                      ]}
                    >
                      {formatDate(message.createdAt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {sending ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#466CA5" />
              <Text style={styles.typingText}>Aguarde um momento...</Text>
            </View>
          ) : null}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder="Sua dúvida..."
              placeholderTextColor="#aaa"
              multiline
              maxLength={500}
              editable={!sending}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={!messageInput.trim() || sending}
            >
              <Ionicons
                name="paper-plane-outline"
                size={31}
                color={messageInput.trim() && !sending ? "#111" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
