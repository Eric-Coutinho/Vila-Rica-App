import React, { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../services/api";
import {
  listPorters,
  updateSchedule,
  type Porter,
  type WeeklyShift,
} from "../../services/porterService";
import { useAppDialog } from "../../components/AppFeedbackProvider";
import { styles } from "./PortariaScreenStyles";
import WeeklyScheduleEditor, {
  blankShift,
  describeShift,
} from "./WeeklyScheduleEditor";

const nameKey = (value: string) =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
const birthLabel = (value?: string) =>
  value?.replace(/^(\d{4})-(\d\d)-(\d\d).*$/, "$3/$2/$1") || "Não informada";

export default function PortariaScreen() {
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const [rows, setRows] = useState<Porter[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState("");
  const [schedule, setSchedule] = useState<WeeklyShift[]>([]);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setReady(false);
      setError("");
      setEditing("");
      listPorters()
        .then((data) => {
          if (active) {
            setRows(data);
            setReady(true);
          }
        })
        .catch((err) => {
          if (active)
            setError(getErrorMessage(err, "Falha ao carregar porteiros."));
        });
      return () => {
        active = false;
      };
    }, [reload]),
  );

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateSchedule(editing, schedule);
      setRows((current) =>
        current.map((row) => (row._id === updated._id ? updated : row)),
      );
      setEditing("");
    } catch (err) {
      showDialog({
        title: "Escala",
        text: getErrorMessage(err, "Falha ao salvar a escala."),
        showCancel: false,
        confirmText: "OK",
      });
    } finally {
      setSaving(false);
    }
  }

  const filtered = rows.filter((row) =>
    nameKey(row.name || "").includes(nameKey(name)),
  );
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portaria</Text>
      </View>
      {error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={() => setReload((n) => n + 1)}>
            <Text>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {ready && (
        <>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.registerButton}
            onPress={() => router.push("/register-porter")}
          >
            <Text style={styles.registerButtonText}>Cadastrar Porteiro</Text>
          </TouchableOpacity>
          <Text style={styles.selectLabel}>Nome</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Nome..."
            accessibilityLabel="Filtrar por nome"
          />
          <View style={styles.cards}>
            {filtered.map((row) => (
              <View key={row._id} style={styles.moradorCard}>
                <Text style={styles.cardTitle}>{row.name}</Text>
                <Text style={styles.cardSmall}>
                  CPF: {row.cpf || "Não informado"}
                </Text>
                <Text style={styles.cardSmall}>
                  E-mail: {row.email || "Não informado"}
                </Text>
                <Text style={styles.cardSmall}>
                  Data de nascimento: {birthLabel(row.birthDate)}
                </Text>
                {editing === row._id ? (
                  <View style={styles.editor}>
                    {!!row.schedule && !row.weeklySchedule?.length && (
                      <Text style={styles.cardSmall}>
                        Escala anterior: {row.schedule}
                      </Text>
                    )}
                    <WeeklyScheduleEditor
                      value={schedule}
                      change={setSchedule}
                    />
                    <TouchableOpacity
                      style={styles.cardButton}
                      disabled={saving}
                      onPress={() => void save()}
                    >
                      <Text style={styles.cardButtonText}>Salvar escala</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancel}
                      disabled={saving}
                      onPress={() => setEditing("")}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardSmall}>
                      Escala:{" "}
                      {row.weeklySchedule?.length
                        ? "\n" +
                          row.weeklySchedule.map(describeShift).join("\n")
                        : row.schedule || "Não informada"}
                    </Text>
                    <TouchableOpacity
                      style={styles.cardButton}
                      disabled={saving}
                      onPress={() => {
                        setSchedule(
                          row.weeklySchedule?.length
                            ? row.weeklySchedule
                            : [blankShift()],
                        );
                        setEditing(row._id);
                      }}
                    >
                      <Text style={styles.cardButtonText}>Editar escala</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
            {!filtered.length && (
              <Text style={styles.cardSmall}>
                {name.trim()
                  ? "Nenhum porteiro encontrado."
                  : "Nenhum porteiro cadastrado."}
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
