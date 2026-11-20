import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";
import { apiFetch, getErrorMessage } from "../../services/api";
import {
  clearRecoveryChallenge,
  getRecoveryChallenge,
} from "../../services/session";

const RedefineScreen: React.FC = () => {
  const router = useRouter();
  const [challenge, setChallenge] = useState<{
    email: string;
    code: string;
  } | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [senha, setSenha] = useState<string>("");
  const [newSenha, setNewSenha] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    getRecoveryChallenge()
      .then((stored) => {
        if (!mounted) return;
        if (!stored) {
          router.replace("/recover");
          return;
        }
        setChallenge(stored);
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleRedefine = async () => {
    if (!senha || !newSenha) {
      alert("Erro - Preencha os dois campos de senha.");
      return;
    }
    if (senha !== newSenha) {
      alert("Erro - As senhas não coincidem.");
      return;
    }
    if (!challenge) {
      alert(
        "Erro - Email ou código ausente. Volte para a recuperação e solicite um novo código.",
      );
      router.push("/recover");
      return;
    }
    if (senha.length < 8) {
      alert("Erro - A senha deve ter ao menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: challenge.email,
          code: challenge.code,
          newPassword: senha,
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!data) {
        alert("Erro - Resposta inválida do servidor: " + raw);
        return;
      }

      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Falha ao redefinir senha"}`);
        return;
      }

      await clearRecoveryChallenge();
      alert(`Sucesso - ${data.message ?? "Senha redefinida com sucesso"}`);
      router.replace("/login");
    } catch (error) {
      alert(`Erro - ${getErrorMessage(error, "Falha ao redefinir senha")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await clearRecoveryChallenge();
    router.replace("/");
  };

  if (initializing) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
