import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";
import { apiFetch, getErrorMessage } from "../../services/api";
import { saveRecoveryEmail } from "../../services/session";

type RecoverResponse =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

const RecoverScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!email.trim()) {
      alert("Preencha o email");
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await apiFetch("/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const raw = await res.text();

      let data: RecoverResponse | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!data) {
        alert("Resposta inválida do servidor: " + raw);
        return;
      }

      if (!data.ok) {
        alert(data.message ?? "Falha na recuperação");
        return;
      }

      await saveRecoveryEmail(normalizedEmail);
      alert(data.message ?? "Se o email existir, o código será enviado.");
      router.push("/code");
    } catch (error) {
      alert(getErrorMessage(error, "Falha ao iniciar a recuperação"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar senha</Text>

        <Text style={styles.subtitle}>
          Um código será enviado para o email utilizado no cadastro, com esse
          código será possível redefinir sua senha.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email de cadastro</Text>
          <TextInput
            style={styles.input}
            placeholder="Email@example.com"
            placeholderTextColor="#9b9b9b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => router.push("/")}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecoverScreen;
