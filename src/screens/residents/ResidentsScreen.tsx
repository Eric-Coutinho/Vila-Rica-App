import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from "./styles";

type Morador = {
  _id: string;
  name?: string;
  bloco?: string;
  apartamento?: string;
  cpf?: string;
  telefone?: string;
  birthDate?: string;
  role?: string;
};

type UsersResponse = {
  ok: boolean;
  users?: Morador[];
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

const API_BASE = "http://localhost:3000/api";

export default function ResidentsScreen() {
  const router = useRouter();

  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filtroBloco, setFiltroBloco] = useState("Bloco");
  const [filtroApto, setFiltroApto] = useState("Apartamento");
  const [filtroNome, setFiltroNome] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moradorToDelete, setMoradorToDelete] = useState<Morador | null>(null);

  const handleDelete = (morador: Morador) => {
    setMoradorToDelete(morador);
    setShowDeleteModal(true);
  };

  const carregarMoradores = useCallback(async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        throw new Error("Usuário não encontrado no armazenamento local.");
      }

      const loggedUser = JSON.parse(storedUser);

      if (!loggedUser?._id) {
        throw new Error("ID do usuário logado não encontrado.");
      }

      const response = await fetch(`${API_BASE}/auth/list-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedUser._id,
        },
      });

      const data: UsersResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message || "Não foi possível carregar os moradores.",
        );
      }

      setMoradores(data.users ?? []);
    } catch (error: any) {
      console.error("Erro ao carregar moradores:", error);

      alert(
        `Erro: ${error?.message || "Não foi possível carregar a lista de moradores."}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMoradores();
  }, [carregarMoradores]);

  const blocos = useMemo(() => {
    const values = moradores
      .map((morador) => morador.bloco?.trim())
      .filter((bloco): bloco is string => Boolean(bloco));

    return Array.from(new Set(values)).sort();
  }, [moradores]);

  const apartamentos = useMemo(() => {
    const values = moradores
      .filter(
        (morador) => filtroBloco === "Bloco" || morador.bloco === filtroBloco,
      )
      .map((morador) => morador.apartamento?.trim())
      .filter((apartamento): apartamento is string => Boolean(apartamento));

    return Array.from(new Set(values)).sort();
  }, [moradores, filtroBloco]);

  const filtered = moradores.filter((m) => {
    const nome = m.name ?? "";
    const bloco = m.bloco ?? "";
    const apartamento = m.apartamento ?? "";

    const byName =
      filtroNome.trim() === "" ||
      nome.toLowerCase().includes(filtroNome.toLowerCase());

    const byBloco = filtroBloco === "Bloco" || bloco === filtroBloco;

    const byApto = filtroApto === "Apartamento" || apartamento === filtroApto;

    return byName && byBloco && byApto;
  });

  const formatDate = (value?: string) => {
    if (!value) return "-";

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.substring(0, 10).split("-");
      return `${day}/${month}/${year}`;
    }

    return value;
  };

  const excluirMorador = async (morador: Morador) => {
    if (!morador._id) {
      Alert.alert("Erro", "ID do morador não encontrado.");
      return;
    }

    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
      throw new Error("Usuário não encontrado no armazenamento local.");
    }

    const loggedUser = JSON.parse(storedUser);

    if (!loggedUser?._id) {
      throw new Error("ID do usuário logado não encontrado.");
    }

    try {
      setDeletingId(morador._id);

      const response = await fetch(
        `${API_BASE}/auth/users/delete/${morador._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": loggedUser._id,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Não foi possível excluir o morador.");
      }

      // Remove imediatamente da lista local
      setMoradores((current) =>
        current.filter((item) => item._id !== morador._id),
      );

      alert(`Sucesso, ${morador.name ?? "Morador"} foi excluído com sucesso.`,
      );
    } catch (error: any) {
      console.error("Erro ao excluir morador:", error);

      Alert.alert(
        "Erro",
        error?.message || "Não foi possível excluir o morador.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleBloco = () => {
    if (blocos.length === 0) {
      setFiltroBloco("Bloco");
      return;
    }

    const currentIndex = blocos.indexOf(filtroBloco);

    if (currentIndex === -1 || currentIndex >= blocos.length - 1) {
      setFiltroBloco("Bloco");
    } else {
      setFiltroBloco(blocos[currentIndex + 1]);
    }

    // Sempre que mudar o bloco, volta o apartamento para todos
    setFiltroApto("Apartamento");
  };

  const toggleApartamento = () => {
    if (apartamentos.length === 0) {
      setFiltroApto("Apartamento");
      return;
    }

    const currentIndex = apartamentos.indexOf(filtroApto);

    if (currentIndex === -1 || currentIndex >= apartamentos.length - 1) {
      setFiltroApto("Apartamento");
    } else {
      setFiltroApto(apartamentos[currentIndex + 1]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moradores</Text>
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => {
          router.push("/register");
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.registerButtonText}>Cadastrar Morador</Text>
      </TouchableOpacity>

      <View style={styles.filtersRow}>
        <View style={styles.selectBox}>
          <Text style={styles.selectLabel}>Bloco</Text>

          <TouchableOpacity
            style={styles.selectTouchable}
            onPress={toggleBloco}
          >
            <Text style={styles.selectText}>{filtroBloco}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectBox}>
          <Text style={styles.selectLabel}>Apartamento</Text>

          <TouchableOpacity
            style={styles.selectTouchable}
            onPress={toggleApartamento}
          >
            <Text style={styles.selectText}>{filtroApto}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.selectLabel}>Nome</Text>

        <TextInput
          placeholder="Nome..."
          value={filtroNome}
          onChangeText={setFiltroNome}
          style={styles.nameInput}
        />
      </View>

      <View style={{ marginTop: 14 }}>
        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12 }}>Carregando moradores...</Text>
          </View>
        ) : (
          <>
            {filtered.map((m) => (
              <View key={m._id} style={styles.moradorCard}>
                <Text style={styles.cardTitle}>
                  {m.name ?? "Nome não informado"}
                </Text>

                <Text style={styles.cardSmall}>
                  {m.bloco ?? "Bloco não informado"}{" "}
                  {m.apartamento ?? "Apartamento não informado"}
                </Text>

                <Text style={styles.cardSmall}>CPF: {m.cpf ?? "-"}</Text>

                <Text style={styles.cardSmall}>
                  Data de Nascimento: {formatDate(m.birthDate)}
                </Text>

                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => {
                    router.push(`/residents/${m._id}`);
                  }}
                >
                  <Text style={styles.cardButtonText}>Ver Informações</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(m)}
                  activeOpacity={0.85}
                  disabled={deletingId === m._id}
                >
                  {deletingId === m._id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Excluir Morador</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyBox}>
                <Text>Nenhum morador encontrado.</Text>
              </View>
            )}
          </>
        )}
      </View>
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setMoradorToDelete(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Excluir morador</Text>

            <Text style={styles.modalText}>
              Tem certeza que deseja excluir{" "}
              <Text style={{ fontWeight: "700" }}>
                {moradorToDelete?.name ?? "este morador"}
              </Text>
              ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setMoradorToDelete(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={async () => {
                  if (!moradorToDelete) return;

                  const morador = moradorToDelete;

                  setShowDeleteModal(false);
                  setMoradorToDelete(null);

                  await excluirMorador(morador);
                }}
                activeOpacity={0.85}
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
