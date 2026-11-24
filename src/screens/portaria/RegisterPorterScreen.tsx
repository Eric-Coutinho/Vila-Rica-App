import { parentRoutes } from "../../navigation/parentRoutes";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createPorter, type NewPorter } from "../../services/porterService";
import { getErrorMessage } from "../../services/api";
import { getStoredUser } from "../../services/session";
import { useAppDialog } from "../../components/AppFeedbackProvider";
import { styles } from "./RegisterPorterScreenStyles";

const labels: Record<keyof NewPorter, string> = {
  name: "Nome",
  cpf: "CPF",
  email: "E-mail",
  birthDate: "Data de nascimento",
  schedule: "Escala",
};
function maskBirthDate(text: string) {
  return text
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
}
export default function RegisterPorterScreen() {
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const [form, setForm] = useState<NewPorter>({
    name: "",
    cpf: "",
    email: "",
    birthDate: "",
    schedule: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    getStoredUser()
      .then((user) => {
        if (!active) return;
        const role = user?.role
          ?.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (role && ["sindico", "adm", "admin"].includes(role))
          setAllowed(true);
        else router.replace(user ? "/home" : "/login");
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function submit() {
    if (busy) return;
    const [day, month, year] = form.birthDate.split("/");
    const iso = [year, month, day].join("-");
    const date = new Date(iso + "T00:00:00Z");
    if (!form.name.trim() || !form.schedule.trim())
      return setError("Preencha o nome e a escala.");
    if (!/^\d{11}$/.test(form.cpf))
      return setError("Informe os 11 dígitos do CPF.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Informe um e-mail válido.");
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== iso ||
      date.getTime() > Date.now()
    )
      return setError("Informe uma data de nascimento válida.");
    setBusy(true);
    setError("");
    try {
      const result = await createPorter({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        schedule: form.schedule.trim(),
        birthDate: iso,
      });
      router.dismissTo(parentRoutes["register-porter"]);
      showDialog({
        title: "Porteiro cadastrado",
        text: result.initialPasswordEmailSent
          ? "A senha inicial foi enviada por e-mail."
          : "Cadastro concluído. O envio da senha inicial por e-mail não foi confirmado.",
        showCancel: false,
        confirmText: "OK",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao cadastrar porteiro."));
      setBusy(false);
    }
  }
  if (!allowed) return null;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastrar Porteiro</Text>
      </View>
      <View style={styles.form}>
        {(Object.keys(labels) as (keyof NewPorter)[]).map((key) => (
          <View key={key}>
            <Text style={styles.selectLabel}>{labels[key]}</Text>
            <TextInput
              accessibilityLabel={labels[key]}
              style={styles.nameInput}
              value={form[key]}
              editable={!busy}
              keyboardType={
                key === "email"
                  ? "email-address"
                  : key === "cpf" || key === "birthDate"
                    ? "number-pad"
                    : "default"
              }
              autoCapitalize={key === "name" ? "words" : "none"}
              multiline={key === "schedule"}
              placeholder={
                key === "schedule"
                  ? "Ex.: 12×36, das 7h às 19h"
                  : key === "birthDate"
                    ? "DD/MM/AAAA"
                    : labels[key]
              }
              maxLength={key === "schedule" ? 250 : undefined}
              onChangeText={(text) =>
                setForm((current) => ({
                  ...current,
                  [key]:
                    key === "birthDate"
                      ? maskBirthDate(text)
                      : key === "cpf"
                        ? text.replace(/\D/g, "").slice(0, 11)
                        : text,
                }))
              }
            />
          </View>
        ))}
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <TouchableOpacity
        style={styles.registerButton}
        disabled={busy}
        onPress={() => void submit()}
      >
        <Text style={styles.registerButtonText}>Cadastrar Porteiro</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={busy}
        onPress={() => router.dismissTo(parentRoutes["register-porter"])}
      >
        <Text style={styles.cancel}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
