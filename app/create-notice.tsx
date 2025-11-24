import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_BASE = "http://localhost:3000/api";

type Referente = {
  id: string;
  type: "Bloco" | "Apartamento" | "Morador" | "Todos";
  value: string;
};

type Resident = {
  _id: string;
  name: string;
  bloco?: string;
  apartamento?: string;
  [k: string]: any;
};

export default function NovoAviso() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [description, setDescription] = useState("");
  const [refType, setRefType] = useState<Referente["type"] | null>(null);
  const [refValue, setRefValue] = useState<string | null>(null);
  const [referentes, setReferentes] = useState<Referente[]>([]);

  const [isSindico, setIsSindico] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [fetchedResidents, setFetchedResidents] = useState(false);

  const blocos = Array.from({ length: 7 }, (_, i) => String(i + 1));
  const aptos = Array.from({ length: 32 }, (_, i) => String(i + 1));

  function onChangeDateMobile(setter: (d: Date | null) => void) {
    return function (_e: any, selected?: Date) {
      if (Platform.OS !== "ios") {
        setShowStartPicker(false);
        setShowEndPicker(false);
      }
      if (selected) setter(selected);
    };
  }

  function onChangeDateWeb(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (d: Date | null) => void
  ) {
    const val = e.target.value;
    if (!val) {
      setter(null);
      return;
    }
    const [y, m, d] = val.split("-").map(Number);
    setter(new Date(y, m - 1, d));
  }

  function formatDate(d: Date | null) {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        let raw: string | null = null;
        try {
          raw = await AsyncStorage.getItem("user");
        } catch (e) {
          console.warn("Erro - ", e);
        }
        if (!raw && typeof localStorage !== "undefined") {
          raw = localStorage.getItem("user");
        }
        if (!raw) {
          if (mounted) setIsSindico(false);
          return;
        }
        const u = JSON.parse(raw);
        const role = String(u?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (mounted) setIsSindico(role === "sindico");
      } catch (err) {
        console.warn("Erro ao ler user:", err);
        if (mounted) setIsSindico(false);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchResidents() {
      if (fetchedResidents || refType !== "Morador") return;
      setLoadingResidents(true);
      try {
        const res = await fetch(`${API_BASE}/user/getAll`);
        if (!res.ok) throw new Error("Falha ao buscar moradores");
        const arr = await res.json();
        if (!mounted) return;
        const mapped: Resident[] = (arr || []).map((u: any) => ({
          _id: u._id,
          name: u.name,
          bloco: u.bloco,
          apartamento: u.apartamento,
          ...u,
        }));
        setResidents(mapped);
        setFetchedResidents(true);
      } catch (err) {
        console.warn("Erro ao buscar moradores:", err);
      } finally {
        if (mounted) setLoadingResidents(false);
      }
    }
    fetchResidents();
    return () => {
      mounted = false;
    };
  }, [refType, fetchedResidents]);

  function addReferente() {
    if (referentes.some((r) => r.type === "Todos")) {
      return alert(
        "Já existe um referente 'Todos'. Remova-o para adicionar outros referentes."
      );
    }

    if (!refType) return alert("Atenção - Selecione o tipo de referente.");

    if (refType === "Todos") {
      const newRef: Referente = {
        id: String(Date.now()),
        type: "Todos",
        value: "Todos",
      };
      setReferentes((s) => [...s, newRef]);
      setRefType(null);
      setRefValue(null);
      return;
    }

    if (refType === "Bloco") {
      if (!refValue) return alert("Atenção - Selecione o número do bloco.");
      const newRef: Referente = {
        id: String(Date.now()),
        type: "Bloco",
        value: String(refValue),
      };
      setReferentes((s) => [...s, newRef]);
      setRefType(null);
      setRefValue(null);
      return;
    }

    if (refType === "Apartamento") {
      if (!refValue)
        return alert("Atenção - Selecione o número do apartamento.");
      const newRef: Referente = {
        id: String(Date.now()),
        type: "Apartamento",
        value: String(refValue),
      };
      setReferentes((s) => [...s, newRef]);
      setRefType(null);
      setRefValue(null);
      return;
    }

    if (refType === "Morador") {
      if (!refValue) return alert("Atenção - Selecione um morador.");
      const newRef: Referente = {
        id: String(Date.now()),
        type: "Morador",
        value: String(refValue),
      };
      setReferentes((s) => [...s, newRef]);
      setRefType(null);
      setRefValue(null);
      return;
    }
  }

  function removeReferente(id: string) {
    setReferentes((s) => s.filter((r) => r.id !== id));
  }

  async function handleCreate() {
    if (!title.trim()) return alert("Erro - Título é obrigatório.");
    if (!startDate) return alert("Erro - Data início é obrigatória.");
    if (referentes.length === 0)
      return alert("Erro - Adicione ao menos um referente.");
    if (!isSindico) {
      return alert("Acesso negado - Apenas Síndico pode criar avisos.");
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      startDate: formatDate(startDate),
      endDate: endDate ? formatDate(endDate) : undefined,
      referentes: referentes.map((r) => ({ type: r.type, value: r.value })),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201 || res.ok) {
        alert("Sucesso - Aviso criado.");
        router.back();
        return;
      }
      const data = await res.json().catch(() => ({}));
      alert(`Erro ${data.message || "Falha ao criar aviso."}`);
    } catch (err) {
      console.error("Erro criar aviso:", err);
      alert("Erro - Não foi possível conectar ao servidor.");
    }
  }

  if (loadingUser) {
    return (
      <View style={styles.centered}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  function showReferentes() {
    const text =
      referentes.length > 0
        ? `Referentes\n${referentes
            .map((r) => `${r.type}: ${r.value}`)
            .join("\n")}`
        : "Referentes\nNenhum referente adicionado.";

    if (Platform.OS === "web") {
      alert(text);
    } else {
      Alert.alert("Referentes", text);
    }
  }

  const hasTodos = referentes.some((r) => r.type === "Todos");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>Novo Aviso</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          placeholder="Título do aviso"
          placeholderTextColor="#9b9b9b"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              Data Início <Text style={{ color: "#cc0000" }}>*</Text>
            </Text>

            {Platform.OS === "web" ? (
              <input
                type="date"
                value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                onChange={(e) => onChangeDateWeb(e as any, setStartDate)}
                style={styles.webDateInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={{ color: startDate ? "#000" : "#777" }}>
                    {startDate ? formatDate(startDate) : "dd/mm/aaaa"}
                  </Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate ?? new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date(2100, 11, 31)}
                    onChange={onChangeDateMobile((d) => setStartDate(d))}
                  />
                )}
              </>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Data Fim</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                onChange={(e) => onChangeDateWeb(e as any, setEndDate)}
                style={styles.webDateInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={{ color: endDate ? "#000" : "#777" }}>
                    {endDate ? formatDate(endDate) : "dd/mm/aaaa"}
                  </Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate ?? new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date(2100, 11, 31)}
                    onChange={onChangeDateMobile((d) => setEndDate(d))}
                  />
                )}
              </>
            )}
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          Descrição do aviso
        </Text>
        <TextInput
          placeholder="Descrição (500 caracteres)"
          placeholderTextColor="#9b9b9b"
          value={description}
          onChangeText={(t) => setDescription(t)}
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={6}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Referente a:</Text>

        {!hasTodos ? (
          <View style={styles.refRow}>
            <View >
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={refType}
                  onValueChange={(v) => {
                    setRefType(v as Referente["type"]);
                    setRefValue(null);
                  }}
                  mode="dropdown"
                  style={[
                    styles.selectElement,
                    { color: refType ? "#000" : "#9b9b9b" },
                  ]}
                >
                  <Picker.Item label="Tipo" value={null} />
                  <Picker.Item label="Todos" value="Todos" />
                  <Picker.Item label="Bloco" value="Bloco" />
                  <Picker.Item label="Apartamento" value="Apartamento" />
                  <Picker.Item label="Morador" value="Morador" />
                </Picker>
              </View>
            </View>

            <View style={{ flex: 1, marginBottom: 8 }}>
              {refType ? (
                <>
                  {refType === "Bloco" && (
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={refValue}
                        onValueChange={(v) => setRefValue(String(v))}
                        mode="dropdown"
                        style={[
                          styles.selectElement,
                          { color: refValue ? "#000" : "#9b9b9b" },
                        ]}
                      >
                        <Picker.Item label="Bloco" value={null} />
                        {blocos.map((b) => (
                          <Picker.Item key={b} label={b} value={b} />
                        ))}
                      </Picker>
                    </View>
                  )}

                  {refType === "Apartamento" && (
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={refValue}
                        onValueChange={(v) => setRefValue(String(v))}
                        mode="dropdown"
                        style={[
                          styles.selectElement,
                          { color: refValue ? "#000" : "#9b9b9b" },
                        ]}
                      >
                        <Picker.Item label="Apartamento" value={null} />
                        {aptos.map((a) => (
                          <Picker.Item key={a} label={a} value={a} />
                        ))}
                      </Picker>
                    </View>
                  )}

                  {refType === "Morador" &&
                    (loadingResidents ? (
                      <View style={{ padding: 12 }}>
                        <Text>Carregando moradores...</Text>
                      </View>
                    ) : (
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={refValue}
                          onValueChange={(v) => setRefValue(String(v))}
                          mode="dropdown"
                          style={[
                            styles.selectElement,
                            { color: refValue ? "#000" : "#9b9b9b" },
                          ]}
                        >
                          <Picker.Item
                            label="Selecione um morador"
                            value={null}
                          />
                          {residents.map((u) => {
                            const label = `${u.name} (${u.bloco ?? "–"}/${
                              u.apartamento ?? "–"
                            })`;
                            return (
                              <Picker.Item
                                key={u._id}
                                label={label}
                                value={label}
                              />
                            );
                          })}
                        </Picker>
                      </View>
                    ))}
                </>
              ) : null}
            </View>

            <TouchableOpacity style={styles.addRefBtn} onPress={addReferente}>
              <Text style={styles.addRefBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}

        <TouchableOpacity style={styles.viewRefsBtn} onPress={showReferentes}>
          <Text style={styles.viewRefsText}>Ver Referentes</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 14 }}>
          {referentes.map((r) => (
            <View key={r.id} style={styles.refChip}>
              <Text style={styles.refChipText}>
                {r.type}: {r.value}
              </Text>
              <TouchableOpacity onPress={() => removeReferente(r.id)}>
                <Text style={styles.refRemove}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Criar Aviso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  formCard: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
    borderColor: "#e2e2e2",
    borderWidth: 1,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    marginBottom: 16,
  },

  inputReferente: {
    width: "100%",
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    marginBlock: 8,
  },

  textarea: {
    height: 120,
    textAlignVertical: "top",
  },

  dateInput: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },

  webDateInput: {
    boxSizing: "border-box",
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#747474",
    borderRadius: 4,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: 8
  },
  selectElement: {
    padding: 8,
    fontSize: 16,
    color: "#9b9b9b",
  },

  refRow: {
    marginTop: 6,
  },

  addRefBtn: {
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addRefBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  viewRefsBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  viewRefsText: {
    color: "#466CA5",
    fontWeight: "700",
  },

  refChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  refChipText: {
    color: "#333",
  },
  refRemove: {
    color: "#a33",
    fontWeight: "700",
  },

  createBtn: {
    marginTop: 12,
    backgroundColor: "#466CA5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#a33",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  bellFab: {
    position: "absolute",
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#343346",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  bellIcon: {
    color: "#fff",
    fontSize: 20,
  },
});
