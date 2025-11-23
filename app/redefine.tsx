import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const RedefineScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const emailParam = (params?.email as string) || undefined;
  const codeParam = (params?.code as string) || undefined;

  const [senha, setSenha] = useState<string>("");
  const [newSenha, setNewSenha] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE = "http://localhost:3000/api";

  const handleRedefine = async () => {
    if (!senha || !newSenha) {
      alert("Erro - Preencha os dois campos de senha.");
      return;
    }
    if (senha !== newSenha) {
      alert("Erro - As senhas não coincidem.");
      return;
    }
    if (!emailParam || !codeParam) {
      alert("Erro - Email ou código ausente. Volte para a recuperação e solicite um novo código.");
      router.push("/recover");
      return;
    }
    if (senha.length < 6) {
      alert("Erro - A senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam.trim(),
          code: codeParam.trim(),
          newPassword: senha,
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn("parse /reset response error", e);
      }

      if (!data) {
        alert("Erro - Resposta inválida do servidor: " + raw);
        return;
      }

      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Falha ao redefinir senha"}`);
        return;
      }

      alert(`Sucesso - ${data.message ?? "Senha redefinida com sucesso"}`);
      router.push("/login");
    } catch (err: any) {
      console.error("/reset error:", err);
      alert(`Erro - Falha de conexão: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Redefinir Senha</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nova senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Senha..."
            placeholderTextColor="#9b9b9b"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            textContentType="newPassword"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha..."
            placeholderTextColor="#9b9b9b"
            secureTextEntry
            value={newSenha}
            onChangeText={setNewSenha}
            textContentType="newPassword"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleRedefine}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>Redefinir</Text>
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
    </View>
  );
};

export default RedefineScreen;

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
