import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from "./resident-id-styles";

const API_BASE = "http://localhost:3000/api";

type Resident = {
  _id?: string;
  name?: string;
  bloco?: string;
  apartamento?: string;
  relacao?: string;
  relation?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  phone?: string;
  birthDate?: string;
  role?: string;
  lastAccess?: string;
  accessDate?: string;
  updatedAt?: string;
  createdAt?: string;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  user?: Resident;
  resident?: Resident;
  data?: Resident;
};

export default function ResidentDetailScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [bloco, setBloco] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [relacao, setRelacao] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState("");
  const [lastAccess, setLastAccess] = useState("");

  useEffect(() => {
    carregarMorador();
  }, [id]);

  const formatDate = (value?: string) => {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.substring(0, 10).split("-");

      return `${day}/${month}/${year}`;
    }

    return value;
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("pt-BR");
  };

  const carregarMorador = async () => {
    try {
      if (!id) {
        throw new Error("ID do morador não encontrado.");
      }

      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (storedUser) {
        try {
          const loggedUser = JSON.parse(storedUser);

          if (loggedUser?._id) {
            headers["x-user-id"] = loggedUser._id;
          }
        } catch {
          console.warn("Não foi possível interpretar o usuário armazenado.");
        }
      }

      const response = await fetch(`${API_BASE}/auth/users/get/${id}`, {
        method: "GET",
        headers,
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || "Não foi possível carregar o morador."
        );
      }

      const userData =
        data.user ||
        data.resident ||
        data.data ||
        (data as Resident);

      if (!userData) {
        throw new Error("A API não retornou os dados do morador.");
      }

      setResident(userData);

      setName(userData.name ?? "");
      setBloco(userData.bloco ?? "");
      setApartamento(userData.apartamento ?? "");
      setRelacao(userData.relacao ?? userData.relation ?? "");
      setCpf(userData.cpf ?? "");
      setEmail(userData.email ?? "");
      setTelefone(userData.telefone ?? userData.phone ?? "");
      setBirthDate(formatDate(userData.birthDate));
      setRole(userData.role ?? "");

      setLastAccess(
        formatDateTime(
          userData.lastAccess ??
            userData.accessDate ??
            userData.updatedAt ??
            userData.createdAt
        )
      );
    } catch (error: any) {
      console.error("Erro ao carregar morador:", error);

      Alert.alert(
        "Erro",
        error?.message || "Não foi possível carregar os dados do morador.",
        [
          {
            text: "Voltar",
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizar = () => {
    Alert.alert(
      "Atualizar",
      "A rota responsável por salvar as alterações ainda não foi configurada."
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#466CA5" />

        <Text style={styles.loadingText}>
          Carregando dados do morador...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {resident?.name || "Morador"}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={75} color="#292D32" />
            </View>

            <TouchableOpacity
              style={styles.editAvatarButton}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={21} color="#235DFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            Nome <Text style={styles.required}>*</Text>
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome completo..."
          />

          <Text style={styles.label}>
            Bloco <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.fieldWithIcon}>
            <TextInput
              style={styles.input}
              value={bloco}
              onChangeText={setBloco}
              placeholder="Bloco"
            />

            <Ionicons
              name="chevron-down"
              size={20}
              color="#222"
              style={styles.inputIcon}
            />
          </View>

          <Text style={styles.label}>
            Apartamento <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.fieldWithIcon}>
            <TextInput
              style={styles.input}
              value={apartamento}
              onChangeText={setApartamento}
              placeholder="Apartamento"
            />

            <Ionicons
              name="chevron-down"
              size={20}
              color="#222"
              style={styles.inputIcon}
            />
          </View>

          <Text style={styles.label}>Relação</Text>

          <View style={styles.fieldWithIcon}>
            <TextInput
              style={styles.input}
              value={relacao}
              onChangeText={setRelacao}
              placeholder="Relação"
            />

            <Ionicons
              name="chevron-down"
              size={20}
              color="#222"
              style={styles.inputIcon}
            />
          </View>

          <Text style={styles.label}>
            CPF <Text style={styles.required}>*</Text>
          </Text>

          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={setCpf}
            placeholder="CPF"
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email..."
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Data de nascimento <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.fieldWithIcon}>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Data de nascimento..."
            />

            <Ionicons
              name="calendar-outline"
              size={19}
              color="#222"
              style={styles.inputIcon}
            />
          </View>

          <Text style={styles.label}>Tipo de acesso</Text>

          <View style={styles.fieldWithIcon}>
            <TextInput
              style={styles.input}
              value={role}
              onChangeText={setRole}
              placeholder="Acesso"
            />

            <Ionicons
              name="chevron-down"
              size={20}
              color="#222"
              style={styles.inputIcon}
            />
          </View>

          <Text style={styles.lastAccessLabel}>
            Data da última alteração:
          </Text>

          <Text style={styles.lastAccessValue}>
            {lastAccess || "Não informado"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleAtualizar}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>Atualizar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}