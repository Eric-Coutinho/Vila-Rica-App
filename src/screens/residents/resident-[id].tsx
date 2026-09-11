import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const [bloco, setBloco] = useState<string | null>(null);
  const [apartamento, setApartamento] = useState<string | null>(null);
  const [relacao, setRelacao] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [lastAccess, setLastAccess] = useState("");

  const blocos = Array.from({ length: 7 }, (_, i) => String(i + 1));
  const aptos = Array.from({ length: 32 }, (_, i) => String(i + 1));
  const relacoes = ["Morador", "Inquilino", "Proprietário"];
  const tiposAcesso = ["Morador", "Síndico", "Funcionário"];

  useEffect(() => {
    carregarMorador();
  }, [id]);

  function parseBirthDate(value?: string): Date | null {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.substring(0, 10).split("-");

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split("/");

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  function formatDate(d: Date | null) {
    if (!d) return "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }

  function formatDateForApi(d: Date | null) {
    if (!d) return "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }

  function onChangeDate(event: any, selected?: Date) {
    setShowDatePicker(Platform.OS === "ios");

    if (selected) {
      setBirthDate(selected);
    }
  }

  function onChangeDateWeb(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    if (!val) {
      setBirthDate(null);
      return;
    }

    const [year, month, day] = val.split("-").map(Number);

    setBirthDate(new Date(year, month - 1, day));
  }

  function dateToWebValue(d: Date | null) {
    if (!d) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

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
          console.warn(
            "Não foi possível interpretar o usuário armazenado."
          );
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
      setBloco(userData.bloco ?? null);
      setApartamento(userData.apartamento ?? null);
      setRelacao(
        userData.relacao ??
          userData.relation ??
          null
      );
      setCpf(userData.cpf ?? "");
      setEmail(userData.email ?? "");
      setTelefone(
        userData.telefone ??
          userData.phone ??
          ""
      );
      setBirthDate(parseBirthDate(userData.birthDate));
      setRole(userData.role ?? null);

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
        error?.message ||
          "Não foi possível carregar os dados do morador.",
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
    if (!name.trim()) {
      return Alert.alert("Erro", "Nome é obrigatório.");
    }

    if (!bloco) {
      return Alert.alert("Erro", "Selecione o Bloco.");
    }

    if (!apartamento) {
      return Alert.alert("Erro", "Selecione o Apartamento.");
    }

    if (!relacao) {
      return Alert.alert("Erro", "Selecione a Relação.");
    }

    if (!birthDate) {
      return Alert.alert(
        "Erro",
        "Informe a data de nascimento."
      );
    }

    if (!role) {
      return Alert.alert(
        "Erro",
        "Selecione o tipo de acesso."
      );
    }

    Alert.alert(
      "Atualizar",
      "A rota responsável por salvar as alterações ainda não foi configurada."
    );

    const payload = {
      name,
      bloco,
      apartamento,
      relacao,
      cpf,
      email,
      telefone,
      birthDate: formatDateForApi(birthDate),
      role,
    };

    console.log("Dados para atualização:", payload);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#466CA5"
        />

        <Text style={styles.loadingText}>
          Carregando dados do morador...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
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
              <Ionicons
                name="person"
                size={75}
                color="#292D32"
              />
            </View>

            <TouchableOpacity
              style={styles.editAvatarButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pencil"
                size={21}
                color="#235DFF"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            Nome{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          <TextInput
            placeholder="Nome completo..."
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>
            Bloco{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bloco}
              onValueChange={(v) =>
                setBloco(
                  v === null ? null : String(v)
                )
              }
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: bloco
                    ? "#000"
                    : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item
                label="Bloco"
                value={null}
              />

              {blocos.map((b) => (
                <Picker.Item
                  key={b}
                  label={b}
                  value={b}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            Apartamento{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={apartamento}
              onValueChange={(v) =>
                setApartamento(
                  v === null ? null : String(v)
                )
              }
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: apartamento
                    ? "#000"
                    : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item
                label="Apartamento"
                value={null}
              />

              {aptos.map((a) => (
                <Picker.Item
                  key={a}
                  label={a}
                  value={a}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            Relação{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={relacao}
              onValueChange={(v) =>
                setRelacao(
                  v === null ? null : String(v)
                )
              }
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: relacao
                    ? "#000"
                    : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item
                label="Relação"
                value={null}
              />

              {relacoes.map((r) => (
                <Picker.Item
                  key={r}
                  label={r}
                  value={r}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            CPF
          </Text>

          <TextInput
            placeholder="CPF..."
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            placeholder="Email@example.com"
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Data de nascimento{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          {Platform.OS === "web" ? (
            <input
              type="date"
              value={dateToWebValue(birthDate)}
              onChange={onChangeDateWeb}
              style={{
                boxSizing: "border-box",
                width: "100%",
                padding: 12,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "#747474",
                borderRadius: 4,
                backgroundColor: "#fff",
                fontSize: 16,
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <Text
                  style={{
                    color: birthDate
                      ? "#000"
                      : "#777",
                  }}
                >
                  {birthDate
                    ? formatDate(birthDate)
                    : "Data de nascimento..."}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    birthDate ??
                    new Date(2000, 0, 1)
                  }
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
            </>
          )}

          <Text style={styles.label}>
            Tipo de acesso{" "}
            <Text style={styles.required}>
              *
            </Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={role}
              onValueChange={(v) =>
                setRole(
                  v === null ? null : String(v)
                )
              }
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: role
                    ? "#000"
                    : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item
                label="Acesso"
                value={null}
              />

              {tiposAcesso.map((t) => (
                <Picker.Item
                  key={t}
                  label={t}
                  value={t}
                />
              ))}
            </Picker>
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
          <Text
            style={styles.registerButtonText}
          >
            Atualizar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text
            style={styles.cancelButtonText}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}