import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { sendSupportMessage } from "@/src/services/supportService";
import type { SupportAction } from "@/src/types/support";

type MessageAuthor = "user" | "bot";

type ChatMessage = {
  id: string;
  text: string;
  author: MessageAuthor;
  createdAt: Date;
  sources?: string[];
  action?: SupportAction;
};

const QUICK_QUESTIONS = [
  "Como faço para reservar o salão de festas?",
  "Como posso agendar uma mudança?",
  "Como consulto as assembleias?",
];

const ALLOWED_ACTION_ROUTES = new Set([
  "/party-saloon",
  "/moving",
  "/meetings",
  "/complaints",
  "/notices",
]);

export default function ChatbotScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const messagesScrollRef = useRef<ScrollView>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const createMessage = (
    text: string,
    author: MessageAuthor,
    extra: Pick<ChatMessage, "sources" | "action"> = {},
  ): ChatMessage => ({
    id: `${Date.now()}-${author}-${Math.random()}`,
    text,
    author,
    createdAt: new Date(),
    ...extra,
  });

  const sendMessage = async (question?: string) => {
    const text = (question || messageInput).trim();
    if (!text) {
      return;
    }
    const userMessage = createMessage(text, "user");
    setMessageInput("");
    setMessages((current) => [...current, userMessage]);
    setSending(true);

    try {
      const history = [...messages, userMessage].slice(-6).map((item) => ({
        role:
          item.author === "user" ? ("user" as const) : ("assistant" as const),
        content: item.text,
      }));
      const result = await sendSupportMessage(text, history);
      setMessages((current) => [
        ...current,
        createMessage(result.answer, "bot", {
          sources: result.sources,
          action: result.suggestedAction,
        }),
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua pergunta.";
      setMessages((current) => [...current, createMessage(message, "bot")]);
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.residentPage,
          {
            paddingBottom: windowHeight * 0.5 + 45,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          style={[
            styles.chatContainer,
            {
              maxHeight: windowHeight * 0.6,
            },
          ]}
        >
          <View style={styles.quickQuestionsCard}>
            <View style={styles.chatTitleRow}>
              <Ionicons name="hardware-chip-outline" size={31} color="#111" />

              <Text style={styles.chatTitle}>Chat</Text>
            </View>

            <Text style={styles.commonQuestionsTitle}>
              Perguntas mais comuns:
            </Text>

            {QUICK_QUESTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickQuestionButton}
                activeOpacity={0.7}
                disabled={sending}
                onPress={() => sendMessage(item)}
              >
                <Text style={styles.questionBullet}>•</Text>

                <Text style={styles.quickQuestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {messages.length > 0 && (
            <ScrollView
              ref={messagesScrollRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              onContentSizeChange={() => {
                messagesScrollRef.current?.scrollToEnd({
                  animated: true,
                });
              }}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.author === "user"
                      ? styles.userMessage
                      : styles.botMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.author === "user"
                        ? styles.userMessageText
                        : styles.botMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>

                  {message.action &&
                  ALLOWED_ACTION_ROUTES.has(message.action.route) ? (
                    <TouchableOpacity
                      style={styles.suggestedActionButton}
                      onPress={() => router.push(message.action!.route as any)}
                    >
                      <Text style={styles.suggestedActionText}>
                        {message.action.label}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <Text
                    style={[
                      styles.messageDate,
                      message.author === "user"
                        ? styles.userMessageDate
                        : styles.botMessageDate,
                    ]}
                  >
                    {formatMessageDate(message.createdAt)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {sending ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#466CA5" />
              <Text style={styles.typingText}>
                Consultando a base de conhecimento...
              </Text>
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
              returnKeyType="send"
              blurOnSubmit
              editable={!sending}
              onSubmitEditing={() => sendMessage()}
            />

            <TouchableOpacity
              style={styles.sendButton}
              activeOpacity={0.7}
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
