import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

type MessageAuthor = "user" | "bot";

type ChatMessage = {
  id: string;
  text: string;
  author: MessageAuthor;
  createdAt: Date;
};

type QuickQuestion = {
  question: string;
  answer: string;
};

type SupportStatus = "answered" | "waiting" | "urgent";

type SupportChat = {
  id: string;
  date: string;
  question: string;
  status: SupportStatus;
};

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    question: "Como faço para reservar o salão de festas?",
    answer:
      "As reservas do salão de festas são realizadas na tela que é acessada pelo botão 'Salão de festas' na tela principal do aplicativo. Gostaria que eu marcasse uma reserva?",
  },
  {
    question: "Como faço para gerar o boleto do condomínio esse mês?",
    answer:
      "Infelizmente essa funcionalidade ainda não está disponível no aplicativo. Gostaria de falar com o síndico para obter informações mais detalhadas?",
  },
];

const MOCK_SUPPORT_CHATS: SupportChat[] = [
  {
    id: "#2131239231",
    date: "07/10/2024",
    question: "Como gero uma nova via do boleto?",
    status: "answered",
  },
  {
    id: "#2131239232",
    date: "07/10/2024",
    question: "Quero alterar o meu email de cadastro",
    status: "waiting",
  },
  {
    id: "#2131239233",
    date: "07/10/2024",
    question: "Como abrir uma nova reclamação?",
    status: "urgent",
  },
];

export default function ChatbotScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const messagesScrollRef = useRef<ScrollView>(null);

  const [loadingRole, setLoadingRole] = useState(true);
  const [isSupportUser, setIsSupportUser] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | SupportStatus>(
    "all",
  );

  useEffect(() => {
    let mounted = true;

    async function loadUserRole() {
      try {
        const rawUser =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);

        const user = rawUser ? JSON.parse(rawUser) : null;

        const normalizedRole = String(user?.role || "Morador")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

        const supportRoles = ["sindico", "adm", "admin", "administrador"];

        if (mounted) {
          setIsSupportUser(supportRoles.includes(normalizedRole));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        if (mounted) {
          setIsSupportUser(false);
        }
      } finally {
        if (mounted) {
          setLoadingRole(false);
        }
      }
    }

    loadUserRole();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSupportChats = useMemo(() => {
    return MOCK_SUPPORT_CHATS.filter((chat) => {
      const matchesDate =
        filterDate.trim() === "" || chat.date.includes(filterDate.trim());

      const matchesStatus =
        filterStatus === "all" || chat.status === filterStatus;

      return matchesDate && matchesStatus;
    });
  }, [filterDate, filterStatus]);

  const createMessage = (text: string, author: MessageAuthor): ChatMessage => ({
    id: `${Date.now()}-${author}-${Math.random()}`,
    text,
    author,
    createdAt: new Date(),
  });

  const sendQuickQuestion = (item: QuickQuestion) => {
    const userMessage = createMessage(item.question, "user");

    const botMessage = createMessage(item.answer, "bot");

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      botMessage,
    ]);
  };

  const sendTypedMessage = () => {
    const text = messageInput.trim();

    if (!text) {
      return;
    }

    const userMessage = createMessage(text, "user");

    const matchingQuestion = QUICK_QUESTIONS.find(
      (item) => normalizeText(item.question) === normalizeText(text),
    );

    setMessages((currentMessages) => {
      if (!matchingQuestion) {
        return [...currentMessages, userMessage];
      }

      const botMessage = createMessage(matchingQuestion.answer, "bot");

      return [...currentMessages, userMessage, botMessage];
    });

    setMessageInput("");
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

  const getStatusColor = (status: SupportStatus) => {
    switch (status) {
      case "answered":
        return "#20df25";

      case "waiting":
        return "#ffe600";

      case "urgent":
        return "#ff1010";

      default:
        return "#999";
    }
  };

  const openSupportChat = (chat: SupportChat) => {
    Alert.alert(
      chat.id,
      "A visualização completa deste chat será adicionada junto com a API do chatbot.",
    );
  };

  if (loadingRole) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#466CA5" />
      </View>
    );
  }

  if (isSupportUser) {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.supportPage}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.supportContent}>
            <Image
              source={require("../../../assets/images/mascote.png")}
              style={styles.supportMascot}
              resizeMode="contain"
            />

            <Text style={styles.supportTitle}>Suporte{"\n"}necessário</Text>

            <View style={styles.filtersRow}>
              <View style={styles.filterColumn}>
                <Text style={styles.filterLabel}>Data</Text>

                <TextInput
                  style={styles.dateInput}
                  value={filterDate}
                  onChangeText={setFilterDate}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor="#777"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              <View style={styles.filterColumn}>
                <Text style={styles.filterLabel}>Status</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={(value) =>
                      setFilterStatus(value as "all" | SupportStatus)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Status" value="all" />

                    <Picker.Item label="Respondido" value="answered" />

                    <Picker.Item label="Aguardando" value="waiting" />

                    <Picker.Item label="Urgente" value="urgent" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.supportList}>
              {filteredSupportChats.map((chat) => (
                <View key={chat.id} style={styles.supportCard}>
                  <View style={styles.supportCardHeader}>
                    <Text style={styles.supportCardId}>{chat.id}</Text>

                    <View
                      style={[
                        styles.supportStatusDot,
                        {
                          backgroundColor: getStatusColor(chat.status),
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.supportCardDate}>{chat.date}</Text>

                  <Text style={styles.supportCardQuestion}>
                    {chat.question}
                  </Text>

                  <TouchableOpacity
                    style={styles.viewChatButton}
                    activeOpacity={0.85}
                    onPress={() => openSupportChat(chat)}
                  >
                    <Text style={styles.viewChatButtonText}>Ver Chat</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {filteredSupportChats.length === 0 && (
                <View style={styles.emptySupport}>
                  <Text style={styles.emptySupportText}>
                    Nenhum atendimento encontrado.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.floatingChatButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={36} color="#fff" />
        </View>
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
              maxHeight: windowHeight * 0.7,
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
                key={item.question}
                style={styles.quickQuestionButton}
                activeOpacity={0.7}
                onPress={() => sendQuickQuestion(item)}
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
              onSubmitEditing={sendTypedMessage}
            />

            <TouchableOpacity
              style={styles.sendButton}
              activeOpacity={0.7}
              onPress={sendTypedMessage}
              disabled={!messageInput.trim()}
            >
              <Ionicons
                name="paper-plane-outline"
                size={31}
                color={messageInput.trim() ? "#111" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
