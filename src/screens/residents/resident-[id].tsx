import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmModal from "../../components/ConfirmModal.tsx";

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

  const [isEditing, setIsEditing] = useState(false);

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);

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

      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split("/");

      return new Date(Number(year), Number(month) - 1, Number(day));
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
          console.warn("Não foi possível interpretar o usuário armazenado.");
        }
      }

      const response = await fetch(`${API_BASE}/auth/users/get/${id}`, {
        method: "GET",
        headers,
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Não foi possível carregar o morador.");
      }

      const userData =
        data.user || data.resident || data.data || (data as Resident);

      if (!userData) {
        throw new Error("A API não retornou os dados do morador.");
      }

      setResident(userData);

      setName(userData.name ?? "");
      setBloco(userData.bloco ?? null);
      setApartamento(userData.apartamento ?? null);
      setRelacao(userData.relacao ?? userData.relation ?? null);
      setCpf(userData.cpf ?? "");
      setEmail(userData.email ?? "");
      setTelefone(userData.telefone ?? userData.phone ?? "");
      setBirthDate(parseBirthDate(userData.birthDate));
      setRole(userData.role ?? null);

      setLastAccess(
        formatDateTime(
          userData.lastAccess ??
            userData.accessDate ??
            userData.updatedAt ??
            userData.createdAt,
        ),
      );

      setIsEditing(false);
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
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrincipalButton = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setShowUpdateModal(true);
    // handleConfirmar();
  };

  const handleConfirmar = async () => {
    if (!id) {
      return alert("Erro ID do morador não encontrado.");
    }

    if (!name.trim()) {
      return alert("Erro Nome é obrigatório.");
    }

    if (!bloco) {
      return alert("Erro Selecione o Bloco.");
    }

    if (!apartamento) {
      return alert("Erro Selecione o Apartamento.");
    }

    if (!relacao) {
      return alert("Erro Selecione a Relação.");
    }

    if (!birthDate) {
      return alert("Erro Informe a data de nascimento.");
    }

    if (!role) {
      return alert("Erro Selecione o tipo de acesso.");
    }

    try {
      setUpdating(true);
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        throw new Error("Usuário não encontrado no armazenamento local.");
      }

      const loggedUser = JSON.parse(storedUser);

      if (!loggedUser?._id) {
        throw new Error("ID do usuário logado não encontrado.");
      }

      const payload = {
        name: name.trim(),
        bloco,
        apartamento,
        relacao,
        cpf: cpf.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        birthDate: formatDateForApi(birthDate),
        role,
      };

      const response = await fetch(`${API_BASE}/auth/users/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedUser._id,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || "Não foi possível atualizar os dados do morador.",
        );
      }

      const updatedUser = data.user || data.resident || data.data;

      if (updatedUser) {
        setResident(updatedUser);

        setName(updatedUser.name ?? "");
        setBloco(updatedUser.bloco ?? null);
        setApartamento(updatedUser.apartamento ?? null);
        setRelacao(updatedUser.relacao ?? updatedUser.relation ?? null);
        setCpf(updatedUser.cpf ?? "");
        setEmail(updatedUser.email ?? "");
        setTelefone(updatedUser.telefone ?? updatedUser.phone ?? "");
        setBirthDate(parseBirthDate(updatedUser.birthDate));
        setRole(updatedUser.role ?? null);

        setLastAccess(
          formatDateTime(
            updatedUser.lastAccess ??
              updatedUser.accessDate ??
              updatedUser.updatedAt ??
              updatedUser.createdAt,
          ),
        );
      } else {
        setResident((current) => ({
          ...current,
          _id: id,
          name,
          bloco,
          apartamento,
          relacao,
          cpf,
          email,
          telefone,
          birthDate: formatDateForApi(birthDate),
          role,
        }));
      }

      setShowDatePicker(false);
      setIsEditing(false);

      alert("Sucesso, os dados do morador foram atualizados com sucesso.");
    } catch (error: any) {
      console.error("Erro ao atualizar morador:", error);

      alert(`Erro, ${error?.message || "Não foi possível atualizar os dados do morador."}`,
      );
    }
    finally {
      setUpdating(false);
    }
  };

  const handleCancelar = () => {
    if (!isEditing) {
      router.back();
      return;
    }

    if (resident) {
      setName(resident.name ?? "");
      setBloco(resident.bloco ?? null);
      setApartamento(resident.apartamento ?? null);
      setRelacao(resident.relacao ?? resident.relation ?? null);
      setCpf(resident.cpf ?? "");
      setEmail(resident.email ?? "");
      setTelefone(resident.telefone ?? resident.phone ?? "");
      setBirthDate(parseBirthDate(resident.birthDate));
      setRole(resident.role ?? null);
    }

    setShowDatePicker(false);
    setIsEditing(false);
  };

  const excluirMorador = async () => {
    if (!id) {
      Alert.alert("Erro", "ID do morador não encontrado.");
      return;
    }

    try {
      setDeleting(true);

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        throw new Error("Usuário não encontrado no armazenamento local.");
      }

      const loggedUser = JSON.parse(storedUser);

      if (!loggedUser?._id) {
        throw new Error("ID do usuário logado não encontrado.");
      }

      const response = await fetch(`${API_BASE}/auth/users/delete/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedUser._id,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Não foi possível excluir o morador.");
      }

      setShowDeleteModal(false);

      alert(`Sucesso, ${resident?.name ?? "Morador"} foi excluído com sucesso.`);

      router.back();
    } catch (error: any) {
      console.error("Erro ao excluir morador:", error);

      alert("Erro, não foi possível excluir o morador.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#466CA5" />

        <Text style={styles.loadingText}>Carregando dados do morador...</Text>
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
          <Text style={styles.headerTitle}>{resident?.name || "Morador"} {
          isEditing ? 
          <Ionicons name="trash" size={25} color="#cc0000" onPress={() => setShowDeleteModal(true)} />
        //   <TouchableOpacity
        //   style={styles.deleteButton}
        //   onPress={() => setShowDeleteModal(true)}
        //   activeOpacity={0.85}
        //   disabled={deleting}
        // ></TouchableOpacity>
          : <></>
          }</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={75} color="#292D32" />
            </View>
          {
          isEditing ?
            <TouchableOpacity
            style={styles.editAvatarButton}
              activeOpacity={0.8}
              disabled={!isEditing}
            >
              <Ionicons
                name="pencil"
                size={21}
                color="#235DFF"
                />
            </TouchableOpacity>
            : <></>  
            }
        </View>

          <Text style={styles.label}>
            Nome <Text style={styles.required}>*</Text>
          </Text>

          <TextInput
            placeholder="Nome completo..."
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={name}
            onChangeText={setName}
            editable={isEditing}
          />

          <Text style={styles.label}>
            Bloco <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bloco}
              onValueChange={(v) => {
                if (isEditing) {
                  setBloco(v === null ? null : String(v));
                }
              }}
              enabled={isEditing}
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: bloco ? "#000" : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item label="Bloco" value={null} />

              {blocos.map((b) => (
                <Picker.Item key={b} label={b} value={b} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            Apartamento <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={apartamento}
              onValueChange={(v) => {
                if (isEditing) {
                  setApartamento(v === null ? null : String(v));
                }
              }}
              enabled={isEditing}
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: apartamento ? "#000" : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item label="Apartamento" value={null} />

              {aptos.map((a) => (
                <Picker.Item key={a} label={a} value={a} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            Relação <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={relacao}
              onValueChange={(v) => {
                if (isEditing) {
                  setRelacao(v === null ? null : String(v));
                }
              }}
              enabled={isEditing}
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: relacao ? "#000" : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item label="Relação" value={null} />

              {relacoes.map((r) => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>CPF</Text>

          <TextInput
            placeholder="CPF..."
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            editable={isEditing}
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            placeholder="Email@example.com"
            style={styles.input}
            placeholderTextColor="#9b9b9b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Text style={styles.label}>
            Data de nascimento <Text style={styles.required}>*</Text>
          </Text>

          {Platform.OS === "web" ? (
            <input
              type="date"
              value={dateToWebValue(birthDate)}
              onChange={onChangeDateWeb}
              disabled={!isEditing}
              style={{
                boxSizing: "border-box",
                width: "100%",
                padding: 12,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "#747474",
                borderRadius: 4,
                backgroundColor: isEditing ? "#fff" : "#f2f2f2",
                fontSize: 16,
                color: "#000",
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: isEditing ? "#fff" : "#f2f2f2",
                  },
                ]}
                onPress={() => {
                  if (isEditing) {
                    setShowDatePicker(true);
                  }
                }}
                disabled={!isEditing}
              >
                <Text
                  style={{
                    color: birthDate ? "#000" : "#777",
                  }}
                >
                  {birthDate ? formatDate(birthDate) : "Data de nascimento..."}
                </Text>
              </TouchableOpacity>

              {showDatePicker && isEditing && (
                <DateTimePicker
                  value={birthDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
            </>
          )}

          <Text style={styles.label}>
            Tipo de acesso <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={role}
              onValueChange={(v) => {
                if (isEditing) {
                  setRole(v === null ? null : String(v));
                }
              }}
              enabled={isEditing}
              mode="dropdown"
              style={[
                styles.selectElement,
                {
                  color: role ? "#000" : "#9b9b9b",
                },
              ]}
            >
              <Picker.Item label="Acesso" value={null} />

              {tiposAcesso.map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>

          <Text style={styles.lastAccessLabel}>Data da última alteração:</Text>

          <Text style={styles.lastAccessValue}>
            {lastAccess || "Não informado"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handlePrincipalButton}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>
            {isEditing ? "Confirmar" : "Alterar dados"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelar}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelButtonText}>
            {isEditing ? "Cancelar" : "Voltar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.85}
          disabled={deleting}
        >
          <Text
            style={styles.deleteButtonText}
          >
            Excluir Morador
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Excluir morador"
        text={`Tem certeza que deseja excluir ${resident?.name ?? "este morador"}?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={excluirMorador}
        cancelText="Cancelar"
        confirmText="Excluir"
        loading={deleting}
      />
      <ConfirmModal
        visible={showUpdateModal}
        title="Confirmar alteração"
        text="Tem certeza que deseja salvar as alterações deste morador?"
        onCancel={() => setShowUpdateModal(false)}
        onConfirm={handleConfirmar}
        cancelText="Cancelar"
        confirmText="Confirmar"
        loading={updating}
      />
    </KeyboardAvoidingView>
  );
}
