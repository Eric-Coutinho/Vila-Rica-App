import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  clearRecoveryEmail,
  getRecoveryEmail,
  saveRecoveryChallenge,
} from "../../services/session";
import { styles } from "./styles";

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
  const [email, setEmail] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<Array<TextInput | null>>(Array(length).fill(null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    getRecoveryEmail()
      .then((pending) => {
        if (!mounted) return;
        if (!pending?.email) {
          router.replace("/recover");
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
    const clean = text.replace(/\s+/g, "").slice(0, length - index);
    const next = [...code];

    if (clean.length > 1) {
      [...clean].forEach((character, offset) => {
        next[index + offset] = character;
      });
      setCode(next);
      inputsRef.current[Math.min(index + clean.length, length - 1)]?.focus();
      return;
    }

    next[index] = clean;
    setCode(next);
    if (clean && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== "Backspace") return;
    if (!code[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleContinue = async () => {
    const joinedCode = code.join("");
    if (joinedCode.length !== length) {
      alert(`Erro - Preencha o código de ${length} caracteres.`);
      return;
    }
    if (!email) {
      router.replace("/recover");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code: joinedCode }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        alert(`Erro - ${data.message || "Código inválido ou expirado"}`);
        return;
      }

      await saveRecoveryChallenge(email, joinedCode);
      await clearRecoveryEmail();
      onContinue?.(joinedCode);
      alert(`Sucesso - ${data.message || "Código válido"}`);
      router.push("/redefine");
    } catch (error) {
      alert(`Erro - ${getErrorMessage(error, "Falha ao validar o código")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    onCancel?.();
    await clearRecoveryEmail();
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
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Preencha os campos abaixo com o código que recebeu no email.
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
              accessibilityLabel={`Código ${index + 1}`}
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
