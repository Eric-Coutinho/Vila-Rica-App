import React, { useCallback, useRef, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { inbox, type InboxItem } from "../../services/directMessageService";
import { getErrorMessage } from "../../services/api";
import { DateField, ChoiceField, dateKey } from "../deliveries/DeliveryFields";
import { useFocusedRefresh } from "./useFocusedRefresh";
import { styles as s } from "./InboxScreenStyles";

export default function InboxScreen() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [error, setError] = useState("");
  const loaded = useRef(false);
  const [date, setDate] = useState<Date | null>(null);
  const [status, setStatus] = useState("");
  const [person, setPerson] = useState("");
  useFocusedRefresh(
    useCallback(async (visible) => {
      try {
        const rows = await inbox(!loaded.current);
        if (visible()) {
          setItems(rows);
          loaded.current = true;
          setError("");
        }
      } catch (err) {
        if (visible())
          setError(getErrorMessage(err, "Falha ao carregar conversas."));
      }
    }, []),
  );
  const filtered = items.filter(
    (c) =>
      (!person || c.id === person) &&
      (!status || c.unread === (status === "unread")) &&
      (!date || dateKey(new Date(c.lastAt)) === dateKey(date)),
  );
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>Mensagens{"\n"}Recebidas</Text>
      <View style={s.filters}>
        <View style={s.row}>
          <View style={s.half}>
            <DateField label="Data" value={date} change={setDate} />
          </View>
          <View style={s.half}>
            <ChoiceField
              label="Status"
              value={status}
              change={setStatus}
              options={[
                { value: "", label: "Todos" },
                { value: "unread", label: "Não lida" },
                { value: "read", label: "Lida" },
              ]}
            />
          </View>
        </View>
        <ChoiceField
          label="Morador ou funcionário"
          value={person}
          change={setPerson}
          options={[
            { value: "", label: "Todos" },
            ...items
              .map((i) => ({ value: i.id, label: i.name }))
              .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
          ]}
        />
        {!!date && (
          <Pressable onPress={() => setDate(null)}>
            <Text>Limpar data</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
      {filtered.map((c) => (
        <View key={c.id} style={s.card}>
          <View style={s.heading}>
            <Text style={s.name}>{c.name}</Text>
            <View style={[s.dot, c.unread ? s.yellow : s.green]} />
          </View>
          <Text style={s.center}>
            {c.unread ? "Não lida" : "Lida"} ·{" "}
            {new Date(c.lastAt).toLocaleDateString("pt-BR")}
          </Text>
          <Text style={s.info}>
            {c.employee
              ? "Funcionário"
              : [
                  c.block && "Bloco " + c.block,
                  c.apartment && "Apartamento " + c.apartment,
                ]
                  .filter(Boolean)
                  .join("\n") || "Morador"}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={s.button}
            onPress={() =>
              router.push({
                pathname: "/messages/[id]",
                params: { id: String(c.id) },
              })
            }
          >
            <Text style={s.buttonText}>Ver Chat</Text>
          </Pressable>
        </View>
      ))}
      {loaded.current && !error && !filtered.length && (
        <Text style={s.center}>Nenhuma conversa encontrada.</Text>
      )}
    </ScrollView>
  );
}
