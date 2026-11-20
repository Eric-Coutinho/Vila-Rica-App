import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
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

import { apiFetch, getErrorMessage } from "../../services/api";
import {
  clearTwoFactorEmail,
  getTwoFactorEmail,
  saveSession,
} from "../../services/session";
import type { VerifyTwoFactorResponse } from "../../types/api";
import { styles } from "./styles";

const LENGTH = 6;

const TwoFAScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>(Array(LENGTH).fill(null));

  useEffect(() => {
    let mounted = true;
    getTwoFactorEmail()
      .then((pending) => {
        if (!mounted) return;
        if (!pending?.email) {
          router.replace("/login");
          return;
        }
        setEmail(pending.email);
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\s+/g, "").slice(0, LENGTH - index);
    const next = [...code];

    if (clean.length > 1) {
      [...clean].forEach((character, offset) => {
        next[index + offset] = character;
      });
      setCode(next);
      inputsRef.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
      return;
    }

    next[index] = clean;
    setCode(next);
    if (clean && index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== "Backspace") return;
    if (!code[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const joinedCode = code.join("");
    if (!email) {
      router.replace("/login");
      return;
    }
    if (joinedCode.length !== LENGTH) {
      alert(`Erro - Preencha o código de ${LENGTH} caracteres.`);
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/auth/verify-2fa", {
        method: "POST",
        body: JSON.stringify({ email, code: joinedCode }),
      });
      const data = (await response.json()) as VerifyTwoFactorResponse & {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.accessToken || !data.user) {
        alert(`Erro - ${data.message || "Código inválido ou expirado"}`);
        return;
      }

      await saveSession(data.accessToken, data.user);
      await clearTwoFactorEmail();
      alert(`Sucesso - Bem-vindo, ${data.user.name || data.user.email}`);
      router.replace("/home");
    } catch (error) {
      alert(`Erro - ${getErrorMessage(error, "Falha ao validar o código")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await clearTwoFactorEmail();
    router.replace("/login");
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
        <Text style={styles.title}>Autenticação em duas etapas</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de 6 caracteres para o email{" "}
          <Text style={styles.email}>{email}</Text>. Digite o código abaixo.
        </Text>

        <View style={styles.codeRow}>
          {code.map((character, index) => (
            <TextInput
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              value={character}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              style={styles.codeInput}
              keyboardType="default"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={1}
              returnKeyType="done"
              textContentType={
                Platform.OS === "ios" ? "oneTimeCode" : undefined
              }
              autoFocus={index === 0}
              accessibilityLabel={`Código 2FA ${index + 1}`}
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
