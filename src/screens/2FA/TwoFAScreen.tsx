import React, { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./styles";

const LENGTH = 6;
const API_BASE = "http://localhost:3000/api";

const TwoFAScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params?.email as string) || "";

  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>(Array(LENGTH).fill(null));

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
    newCode[idx] = clean.slice(0, 1);
    setCode(newCode);

    if (clean && idx < LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key !== "Backspace") {
      return;
    }

    const newCode = [...code];

    if (code[idx] === "" && idx > 0) {
      newCode[idx - 1] = "";
      setCode(newCode);
      inputsRef.current[idx - 1]?.focus();
      return;
    }

    newCode[idx] = "";
    setCode(newCode);
  };

  const handleVerify = async () => {
    const joined = code.join("");

    if (!email.trim()) {
      alert("Erro - Email não informado. Volte para o login.");
      router.replace("/login");
      return;
    }

    if (joined.length !== LENGTH) {
      alert(`Erro - Preencha o código de ${LENGTH} dígitos.`);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: joined,
        }),
      });

      const raw = await res.text();

      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        console.warn("2FA erro ao parsear JSON:", parseErr);
      }

      if (!data) {
        alert(`Erro - Resposta inválida do servidor: ${raw || "vazia"}`);
        return;
      }

      if (!data.ok) {
        alert(`Erro - ${data.message ?? "Código inválido"}`);
        return;
      }

      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

    alert(`Sucesso - Bem-vindo, ${ data.user?.name ?? data.user?.email ?? "" }`);

      router.replace({
        pathname: "/home",
        params: { name: data.user?.name ?? "" },
      });
    } catch (err: any) {
      console.error("2FA verify error:", err);
      alert(`Erro - Falha de conexão: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCode(Array(LENGTH).fill(""));
    router.replace("/login");
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Autenticação em duas etapas</Text>

        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para o email{" "}
          <Text style={styles.email}>{email || "informado no login"}</Text>.
          Digite o código abaixo para continuar.
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, idx)}
              onKeyPress={(event) => handleKeyPress(event, idx)}
              style={styles.codeInput}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              maxLength={1}
              returnKeyType="done"
              textContentType={
                Platform.OS === "ios" ? ("oneTimeCode" as any) : undefined
              }
              autoFocus={idx === 0}
              accessible
              accessibilityLabel={`Código 2FA ${idx + 1}`}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Verificar código</Text>
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
};

export default TwoFAScreen;