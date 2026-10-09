import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { styles } from "./styles";
import { apiFetch, getErrorMessage } from "../../services/api";
import { saveTwoFactorEmail } from "../../services/session";

type ApiResponse =
  | {
      ok: true;
      requiresTwoFactor: true;
      message?: string;
      developmentCode?: string;
    }
  | {
      ok: false;
      message?: string;
    };

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      alert("Erro - Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: senha }),
      });

      const raw = await res.text();

      let data: ApiResponse | null = null;

      try {
        data = raw ? (JSON.parse(raw) as ApiResponse) : null;
      } catch {}

      if (!data) {
        alert(`Erro - Resposta inválida do servidor: ${raw || "vazia"}`);
        return;
      }

      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Falha no login"}`);
        return;
      }

      if (data.requiresTwoFactor) {
        await saveTwoFactorEmail(normalizedEmail);
        if (data.developmentCode) {
          alert(`Código de desenvolvimento: ${data.developmentCode}`);
        }
        router.replace("/2fa");
        return;
      }
    } catch (error) {
      alert(`Erro - ${getErrorMessage(error, "Falha no login")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setSenha("");
    router.push("/");
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Fazer Login</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email@example.com"
            placeholderTextColor="#9b9b9b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Senha..."
            placeholderTextColor="#9b9b9b"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <View style={styles.forgotRow}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/recover");
              }}
            >
              <Text style={styles.forgotLink}>Clique aqui</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator /> // Criar componente com esse loading
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Verificando login...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;
