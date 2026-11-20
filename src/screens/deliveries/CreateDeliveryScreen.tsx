import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { createDelivery } from "../../services/deliveryService";
import { getErrorMessage } from "../../services/api";
import { Action, ChoiceField, DateField, Sheet } from "./DeliveryFields";
import { ResidentField } from "./ResidentField";
import { styles as s } from "./CreateDeliveryStyles";

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(new Date());
  const [sender, setSender] = useState("");
  const [type, setType] = useState("apartment");
  const [resident, setResident] = useState("");
  const [residentName, setResidentName] = useState("");
  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid =
    type === "resident" ? !!resident : !!(block.trim() && unit.trim());
  async function submit() {
    if (!valid || !date || !sender.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await createDelivery({
        deliveredAt: date.toISOString(),
        sender: sender.trim(),
        recipientType: type === "resident" ? "resident" : "apartment",
        recipientResidentId: resident,
        bloco: block.trim(),
        apartamento: unit.trim(),
      });
      if (router.canGoBack()) router.back();
      else router.replace("/deliveries");
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao registrar a encomenda."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>Nova{"\n"}Encomenda</Text>
      <View style={s.card}>
        <DateField label="Data *" value={date} change={setDate} />
        <DateField label="Hora" value={date} change={setDate} time />
        <Text style={s.label}>Destinatário *</Text>
        <Pressable
          accessibilityRole="button"
          style={s.picker}
          onPress={() => setOpen(true)}
        >
          <Text>
            {valid
              ? type === "resident"
                ? residentName
                : "Bloco " + block + " Ap " + unit
              : "Apartamento / Morador..."}
          </Text>
          <Text>＋</Text>
        </Pressable>
        <Text style={s.label}>Remetente *</Text>
        <TextInput
          style={[s.input, s.sender]}
          value={sender}
          onChangeText={setSender}
          placeholder="Nome da empresa / serviço (máx. 75 caracteres)"
          multiline
          maxLength={75}
        />
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
      <Action
        title="Criar Encomenda"
        disabled={busy || !valid || !date || !sender.trim()}
        onPress={() => void submit()}
      />
      <Action
        title="Cancelar"
        cancel
        disabled={busy}
        onPress={() => router.back()}
      />
      {open && (
        <Sheet title="Selecionar destinatário" close={() => setOpen(false)}>
          <ChoiceField
            label="Tipo"
            value={type}
            change={setType}
            options={[
              { label: "Apartamento", value: "apartment" },
              { label: "Morador", value: "resident" },
            ]}
          />
          {type === "resident" ? (
            <ResidentField
              label="Morador"
              selected={resident}
              change={(id, name) => {
                setResident(id);
                setResidentName(name || "");
              }}
            />
          ) : (
            <View style={s.row}>
              <View style={s.column}>
                <Text>Bloco</Text>
                <TextInput
                  style={s.input}
                  value={block}
                  onChangeText={setBlock}
                />
              </View>
              <View style={s.column}>
                <Text>Apartamento</Text>
                <TextInput
                  style={s.input}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>
          )}
          <Action
            title="Concluir"
            disabled={!valid}
            onPress={() => setOpen(false)}
          />
        </Sheet>
      )}
    </ScrollView>
  );
}
