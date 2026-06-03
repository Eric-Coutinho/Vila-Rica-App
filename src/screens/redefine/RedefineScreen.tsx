import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";

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
