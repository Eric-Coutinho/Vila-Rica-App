import React, { useCallback, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  conversation,
  acknowledge,
  sendDirectMessage,
  type Conversation,
  type Message,
} from "../../services/directMessageService";
import { getErrorMessage } from "../../services/api";
import { useFocusedRefresh } from "./useFocusedRefresh";
import { styles as s } from "./DirectChatSCreenStyles";

const roleNames = {
  resident: "Morador",
  employee: "Funcionário",
  manager: "Síndico",
};
function when(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DirectChatScreen({
  participantId,
}: {
  participantId?: string;
}) {
  const manager = participantId !== undefined;
  const id = participantId ?? "mine";
  const [chat, setChat] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const count = useRef<number | undefined>(undefined);
  const lock = useRef(false);
  const retry = useRef<{ text: string; key: string } | null>(null);
  const list = useRef<FlatList<Message>>(null);
  const follow = useRef(!manager);

  const refresh = useCallback(
    async (visible: () => boolean) => {
      try {
        const result = await conversation(id, count.current);
        if (!visible()) return;
        if (result) {
          setChat(result);
          if (manager) {
            const unread = result.messages
              .filter((m) => m.unread)
              .map((m) => m.id);
            if (unread.length) await acknowledge(id, unread);
          }
          if (visible()) count.current = result.messages.length;
        }
        if (visible()) setLoadError("");
      } catch (err) {
        if (visible())
          setLoadError(getErrorMessage(err, "Falha ao carregar a conversa."));
      }
    },
    [id, manager, revision],
  );
  useFocusedRefresh(refresh);
  async function send() {
    const text = draft.trim();
    if (!text || lock.current) return;
    lock.current = true;
    setBusy(true);
    setSendError("");
    if (retry.current?.text !== text)
      retry.current = {
        text,
        key:
          Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
      };
    try {
      await sendDirectMessage(id, text, retry.current.key);
      retry.current = null;
      setDraft("");
      follow.current = true;
      setRevision((n) => n + 1);
    } catch (err) {
      setSendError(getErrorMessage(err, "Falha ao enviar. Tente novamente."));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const person = chat?.person;
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={s.page}>
        {!manager && <Text style={s.title}>Falar com o síndico</Text>}
        {!!loadError && <Text style={s.error}>{loadError}</Text>}
        {manager && person ? (
          <View style={s.header}>
            <Text style={s.title}>
              Mensagem de{"\n"}
              {person.name}
            </Text>
            <View style={s.line}>
              <Ionicons name="person-circle-outline" size={32} />
              <Text style={s.meta}>
                {person.employee
                  ? "Funcionário"
                  : [
                      person.block && "Bloco " + person.block,
                      person.apartment && "Apartamento " + person.apartment,
                    ]
                      .filter(Boolean)
                      .join("\n") || "Morador"}
              </Text>
            </View>
            {chat?.messages[0] && (
              <View style={s.line}>
                <Ionicons name="calendar-outline" size={27} />
                <Text style={s.meta}>
                  {new Date(chat.messages[0].sentAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </Text>
              </View>
            )}
          </View>
        ) : null}
        <FlatList
          ref={list}
          style={s.history}
          data={chat?.messages ?? []}
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              e.nativeEvent;
            follow.current =
              contentSize.height - contentOffset.y - layoutMeasurement.height <
              80;
          }}
          onContentSizeChange={() => {
            if (follow.current) list.current?.scrollToEnd({ animated: false });
          }}
          ListHeaderComponent={
            manager && person ? <Text style={s.subtitle}>Conversa</Text> : null
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.line}>
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="#292d33"
                />
                <Text style={s.author}>{roleNames[item.role]}</Text>
                <Text style={s.time}>{when(item.sentAt)}</Text>
              </View>
              <Text selectable style={s.body}>
                {item.text}
              </Text>
            </View>
          )}
        />
        {!!sendError && <Text style={s.error}>{sendError}</Text>}
        <View style={manager ? s.managerComposer : s.composer}>
          <View style={s.inputRow}>
            <View style={s.inputBox}>
              <Text
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                aria-hidden
                numberOfLines={5}
                style={[s.inputFont, s.measure]}
              >
                {draft + "\u200b"}
              </Text>
              <TextInput
                style={[s.inputFont, s.input]}
                accessibilityLabel="Mensagem"
                multiline
                maxLength={2000}
                editable={!busy}
                placeholder={manager ? "Responder..." : "Sua mensagem..."}
                value={draft}
                onChangeText={setDraft}
              />
            </View>
            <Pressable
              accessibilityLabel="Enviar mensagem"
              accessibilityRole="button"
              style={s.sendIcon}
              disabled={busy || !draft.trim() || !chat}
              onPress={() => void send()}
            >
              <Ionicons
                name="paper-plane-outline"
                size={26}
                color={draft.trim() ? "#222" : "#777"}
              />
            </Pressable>
          </View>
          {manager && (
            <Pressable
              style={s.button}
              accessibilityRole="button"
              disabled={!chat || busy || !draft.trim()}
              onPress={() => void send()}
            >
              <Text style={s.buttonText}>Adicionar Resposta</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
