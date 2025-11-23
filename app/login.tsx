import React, { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type ApiUser = {
  _id?: string;
  email?: string;
  name?: string;
  recoverCode?: string;
};

type ApiResponse =
  | { ok: true; user: ApiUser }
  | { ok: false; message?: string };

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const API_BASE = "http://localhost:3000/api";

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      alert("Erro - Preencha email e senha");
      return;
    }
  
    try {
      setLoading(true);
  
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });
  
      const raw = await res.text();
      console.log("raw:", raw);
  
      let data: ApiResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as ApiResponse) : null;
      } catch (parseErr) {
        console.warn("Login erro ao parsear JSON:", parseErr);
      }
      console.log("Login body parsed:", data);
  
      if (!data) {
        alert(`Erro - Resposta inválida do servidor: ${raw || "vazia"}`);
        return;
      }
  
      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Falha no login"}`);
        return;
      }
  
      alert(`Sucesso - Bem-vindo, ${data.user?.name ?? data.user?.email}`);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.push({ pathname: '/home', params: { name: data.user.name } })
    } catch (err: any) {
      console.error("Login fetch error:", err);
      alert(`Erro - Falha de conexão: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCancel = () => {
    setEmail("");
    setSenha("");
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
              <ActivityIndicator />
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
    </View>
  );
};

export default LoginScreen;

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
  forgotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 19,
  },
  forgotLink: {
    marginLeft: 6,
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 19,
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
