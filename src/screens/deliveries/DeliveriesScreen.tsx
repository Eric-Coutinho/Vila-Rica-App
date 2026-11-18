import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "../../services/api";
import {
  createDeliveryComplaint,
  listDeliveries,
  receiptCandidates,
  receiveDelivery,
} from "../../services/deliveryService";
import { getStoredUser } from "../../services/session";
import {
  DELIVERY_STATUS_LABEL,
  type Delivery,
  type DeliveryResident,
} from "../../types/delivery";
import {
  Action,
  ChoiceField,
  DateField,
  Sheet,
  dateKey,
} from "./DeliveryFields";
import { ResidentField } from "./ResidentField";
import { styles as s } from "./DeliveriesScreenStyles";

export default function DeliveriesScreen() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [rows, setRows] = useState<Delivery[]>([]);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [item, setItem] = useState<Delivery | null>(null);
  const [mode, setMode] = useState<"receive" | "report">("receive");
  const [people, setPeople] = useState<DeliveryResident[]>([]);
  const [receiver, setReceiver] = useState("");
  const [when, setWhen] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const manager = ["sindico", "adm", "admin"].includes(role);
  const porter = ["porteiro", "funcionario"].includes(role);
  const resident = role === "morador";

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setReady(false);
      setError("");
      Promise.all([getStoredUser(), listDeliveries()])
        .then(([user, data]) => {
          if (!active) return;
          setRole(
            (user?.role || "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase(),
          );
          setRows(data);
          setReady(true);
        })
        .catch((err) => {
          if (active)
            setError(getErrorMessage(err, "Falha ao carregar as encomendas."));
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const apartments = new Map<string, string>();
  function unitKey(row: Delivery) {
    return JSON.stringify([
      row.recipientApartment.bloco,
      row.recipientApartment.apartamento,
    ]);
  }
  rows.forEach((row) =>
    apartments.set(
      unitKey(row),
      "Bloco " +
        row.recipientApartment.bloco +
        " Ap " +
        row.recipientApartment.apartamento,
    ),
  );
  const visible = rows.filter(
    (row) =>
      (!date || dateKey(new Date(row.deliveredAt)) === dateKey(date)) &&
      (!status || row.status === status) &&
      (!unit || unitKey(row) === unit) &&
      row.number.includes(number.trim()),
  );
  function openDetail(delivery: Delivery) {
    router.push({
      pathname: "/deliveries/[id]",
      params: { id: String(delivery.id) },
    });
  }
  async function openForm(row: Delivery, action: "receive" | "report") {
    setError("");
    try {
      const defaults =
        action === "receive" ? await receiptCandidates(row.id) : [];
      setPeople(defaults);
      setReceiver("");
      setWhen(new Date());
      setDescription("");
      setFormError("");
      setMode(action);
      setItem(row);
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao abrir o formulário."));
    }
  }
  async function save() {
    if (!item || !when || saving) return;
    setSaving(true);
    setFormError("");
    try {
      const updated =
        mode === "receive"
          ? await receiveDelivery(item.id, {
              receivedAt: when.toISOString(),
              receivedById: receiver,
            })
          : await createDeliveryComplaint(item.id, {
              createdAt: when.toISOString(),
              description: description.trim(),
            });
      setRows((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
      setItem(null);
    } catch (err) {
      setFormError(getErrorMessage(err, "Falha ao salvar."));
    } finally {
      setSaving(false);
    }
  }
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>Encomendas</Text>
      {porter && (
        <View style={s.create}>
          <Action
            title="Nova Encomenda"
            onPress={() => router.push("/create-delivery")}
          />
        </View>
      )}
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
                { value: "", label: "Status" },
                ...Object.entries(DELIVERY_STATUS_LABEL).map(
                  ([value, label]) => ({ value, label }),
                ),
              ]}
            />
          </View>
        </View>
        {manager || porter ? (
          <ChoiceField
            label="Apartamento"
            value={unit}
            change={setUnit}
            options={[
              { value: "", label: "Filtro por apartamento..." },
              ...Array.from(apartments, ([value, label]) => ({
                value,
                label,
              })).sort((a, b) =>
                a.label.localeCompare(b.label, "pt-BR", { numeric: true }),
              ),
            ]}
          />
        ) : (
          resident && (
            <View>
              <Text style={s.label}>Número</Text>
              <TextInput
                style={s.input}
                placeholder="Filtro número..."
                value={number}
                onChangeText={setNumber}
              />
            </View>
          )
        )}
        {!!date && (
          <Pressable onPress={() => setDate(null)}>
            <Text>Limpar data</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
      <View style={s.cards}>
        {visible.map((row) => (
          <View key={row.id} style={s.card}>
            <View style={s.head}>
              <Text style={s.number}>{row.number}</Text>
              {(resident || (manager && row.hasComplaint)) && (
                <Pressable
                  style={s.warning}
                  accessibilityLabel={
                    row.hasComplaint
                      ? "Ver reclamação"
                      : "Reclamar da encomenda"
                  }
                  hitSlop={5}
                  onPress={() =>
                    row.hasComplaint
                      ? openDetail(row)
                      : void openForm(row, "report")
                  }
                >
                  <Ionicons
                    name={row.hasComplaint ? "warning" : "warning-outline"}
                    color={row.hasComplaint ? "#ef4352" : "#222"}
                    size={24}
                  />
                </Pressable>
              )}
            </View>
            <Text style={s.info}>
              Status: {DELIVERY_STATUS_LABEL[row.status]}
            </Text>
            <Text style={s.info}>
              Data da entrega:{"\n"}
              {new Date(row.deliveredAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </Text>
            {!manager && (
              <Text style={s.info}>
                Origem:{"\n"}
                {row.sender}
              </Text>
            )}
            {manager && (
              <Text style={s.info}>
                Porteiro que recebeu:{"\n"}
                {row.porter?.name}
              </Text>
            )}
            {(manager || porter) && (
              <Text style={s.info}>{apartments.get(unitKey(row))}</Text>
            )}
            {(resident || porter) && row.status === "at_reception" && (
              <Action
                title="Confirmar recebimento"
                onPress={() => void openForm(row, "receive")}
              />
            )}
            {row.hasComplaint && !porter && (
              <Action title="Ver reclamação" onPress={() => openDetail(row)} />
            )}
          </View>
        ))}
      </View>
      {ready && visible.length === 0 && (
        <Text style={s.empty}>Nenhuma encomenda encontrada.</Text>
      )}
      {item && (
        <Sheet
          title={
            mode === "receive"
              ? "Recebimento de encomenda"
              : "Reclamação da encomenda"
          }
          close={() => {
            if (!saving) setItem(null);
          }}
        >
          <View style={s.form}>
            {mode === "receive" ? (
              <ResidentField
                label="Quem recebeu"
                defaults={people}
                selected={receiver}
                change={setReceiver}
              />
            ) : (
              <View>
                <Text style={s.label}>Descrição do problema</Text>
                <TextInput
                  style={[s.input, s.area]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={500}
                />
              </View>
            )}
            <DateField
              label={
                mode === "receive"
                  ? "Data do recebimento"
                  : "Data da reclamação"
              }
              value={when}
              change={setWhen}
            />
          </View>
          {!!formError && <Text style={s.error}>{formError}</Text>}
          <Action
            title={mode === "receive" ? "Confirmar" : "Criar reclamação"}
            disabled={
              saving ||
              !when ||
              !(mode === "receive" ? receiver : description.trim())
            }
            onPress={() => void save()}
          />
          <Action
            title="Cancelar"
            disabled={saving}
            cancel
            onPress={() => setItem(null)}
          />
        </Sheet>
      )}
    </ScrollView>
  );
}
