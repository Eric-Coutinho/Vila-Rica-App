import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RecoverResponse =
  | { ok: true; message?: string; code?: string }
  | { ok: false; message?: string };

const RecoverScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const API_BASE = "http://localhost:3000";

  const handleContinue = async () => {
    if (!email.trim()) {
      alert("Preencha o email");
      return;
    }

    try {
      setLoading(true);
      console.log("Recover POST", `${API_BASE}/recover`, {
        email: email.trim(),
      });

      const res = await fetch(`${API_BASE}/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const raw = await res.text();
      console.log("Recover status:", res.status, "raw:", raw);

      let data: RecoverResponse | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn("Recover parse error", e);
      }

      if (!data) {
        alert("Resposta inválida do servidor: " + raw);
        return;
      }

      if (!data.ok) {
        alert(data.message ?? "Falha na recuperação");
        return;
      }

      if ("code" in data && data.code) {
        alert(
          `Código gerado: ${data.code} (apenas dev). Verifique seu email em produção.`
        );
      } else {
        alert(data.message ?? "Código enviado por email");
      }

      router.push({ pathname: "/code", params: { email: email.trim() } });
    } catch (err: any) {
      console.error("[Recover] error:", err);
      alert("Erro de conexão: " + (err?.message ?? String(err)));
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBlock: 50,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 50,
  },
  subtitle: {
    width: "85%",
    fontSize: 22,
    fontWeight: "500",
    textAlign: "justify",
    marginBottom: 20,
  },
  form: {
    width: "85%",
    marginTop: 18,
  },
  label: {
    fontSize: 20,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
    fontSize: 22,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: "#4b77b9",
    marginTop: 48,
  },
  buttonDanger: {
    backgroundColor: "#b85a56",
    marginTop: 48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "500",
  },
});
