import { useRouter, useLocalSearchParams  } from "expo-router";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ActivityIndicator,
} from "react-native";

interface CodigoScreenProps {
  length?: number;
  onContinue?: (code: string) => void;
  onCancel?: () => void;
}

export default function CodigoScreen({
  length = 6,
  onContinue,
  onCancel,
}: CodigoScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const emailParam = (params?.email as string) || undefined;

  const LENGTH = length;
  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(""));
  const inputsRef = useRef<Array<TextInput | null>>(Array(LENGTH).fill(null));
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000";

  const handleChange = (text: string, idx: number) => {
    const clean = text.replace(/\s+/g, "");

    if (clean.length > 1) {
      const chars = clean.split("").slice(0, LENGTH - idx);
      const newCode = [...code];
      for (let i = 0; i < chars.length; i++) {
        newCode[idx + i] = chars[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(idx + chars.length, LENGTH - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[idx] = clean;
    setCode(newCode);

    if (clean && idx < LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (code[idx] === "" && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const newCode = [...code];
        newCode[idx - 1] = "";
        setCode(newCode);
      } else {
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      }
    }
  };

  const handleContinue = async () => {
    const joined = code.join("");
    if (joined.length < LENGTH) {
      alert(`Erro - Preencha o código de ${LENGTH} caracteres.`);
      return;
    }

    const email = emailParam;
    if (!email) {
      alert(
        "Email não fornecido. Volte para a tela de recuperação e informe seu email."
      );
      router.push("/recover");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: joined }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn("parse verify-code response error", e);
      }

      if (!data) {
        alert("Erro - Resposta inválida do servidor: " + raw);
        return;
      }

      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Código inválido"}`);
        return;
      }

      alert(`Sucesso - ${data.message ?? "Código válido"}`);
      onContinue?.(joined);

      router.push({
        pathname: "/redefine",
        params: { email: email.trim(), code: joined },
      });
    } catch (err: any) {
      console.error("verify-code error:", err);
      alert(`Erro - Falha de conexão: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    router.push("/"); // volta pra tela inicial
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Preencha os campos abaixo com o código que recebeu no email.
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              value={digit}
              onChangeText={(t) => handleChange(t, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              style={styles.codeInput}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              maxLength={1}
              returnKeyType="done"
              textContentType={
                Platform.OS === "ios" ? ("oneTimeCode" as any) : undefined
              }
              autoFocus={idx === 0}
              accessible
              accessibilityLabel={`Código ${idx + 1}`}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
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
  );
}

const BOX_SIZE = 44;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBlock: 50,
  },
  container: {
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
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginBlock: 50,
    paddingHorizontal: 4,
  },
  codeInput: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 6,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  button: {
    width: "85%",
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
