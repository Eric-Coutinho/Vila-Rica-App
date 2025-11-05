import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecoverScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

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
            onPress={() => {
              /* envio formulario */
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => {
              /* cancelar */
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
    backgroundColor: "#white",
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
