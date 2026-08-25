import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./styles";

export default function RegisterScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [bloco, setBloco] = useState<string | null>(null);
  const [apartamento, setApartamento] = useState<string | null>(null);
  const [relacao, setRelacao] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipoAcesso, setTipoAcesso] = useState<string | null>(null);

  const blocos = Array.from({ length: 7 }, (_, i) => String(i + 1));
  const aptos = Array.from({ length: 32 }, (_, i) => String(i + 1));
  const relacoes = ["Morador", "Inquilino", "Proprietário"];
  const tiposAcesso = ["Morador", "Síndico", "Funcionário"];

  const API_BASE = "http://localhost:3000/api";

  function onChangeDate(event: any, selected?: Date) {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) setBirthDate(selected);
  }

  function onChangeDateWeb(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val) {
      setBirthDate(null);
      return;
    }
    const [year, month, day] = val.split("-").map((p) => Number(p));
    const d = new Date(year, month - 1, day);
    setBirthDate(d);
  }

  function formatDate(d: Date | null) {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  async function validateAndSubmit() {
    if (!nome.trim()) return alert("Erro - Nome é obrigatório.");
    if (!bloco) return alert("Erro - Selecione o Bloco.");
    if (!apartamento) return alert("Erro - Selecione o Apartamento.");
    if (!relacao) return alert("Erro - Selecione a Relação.");
    if (!birthDate) return alert("Erro - Informe a data de nascimento.");
    if (!tipoAcesso) return alert("Erro - Selecione o tipo de acesso.");

    const payload = {
      email,
      password: "SenhaBase",
      name: nome,
      bloco,
      apartamento,
      relacao,
      cpf,
      telefone,
      birthDate: formatDate(birthDate),
      role: tipoAcesso
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        // if (data.user) {
        //   await AsyncStorage.setItem("user", JSON.stringify(data.user));
        // }
        alert("Sucesso - Morador cadastrado.");
        router.push('/residents');
        return;
      }

      if (res.status === 409) {
        return alert(`Erro - ${data.message}. Email já cadastrado.`);
      }

      alert(`Erro - ${data.message}. Falha ao cadastrar. Tente novamente.`);
    } catch (err) {
      console.error("Falha no fetch register:", err);
      alert("Erro - Não foi possível conectar ao servidor.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Novo Morador</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>
          Nome <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        <TextInput
          placeholder="Nome completo..."
          style={styles.input}
          placeholderTextColor="#9b9b9b"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>
          Bloco <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={bloco}
            onValueChange={(v) => setBloco(String(v))}
            mode="dropdown"
            style={[
              styles.selectElement,
              { color: bloco ? "#000" : "#9b9b9b" },
            ]}
          >
            <Picker.Item label="Bloco" value={null} />
            {blocos.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>
          Apartamento <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={apartamento}
            onValueChange={(v) => setApartamento(String(v))}
            mode="dropdown"
            style={[
              styles.selectElement,
              { color: apartamento ? "#000" : "#9b9b9b" },
            ]}
          >
            <Picker.Item label="Apartamento" value={null} />
            {aptos.map((a) => (
              <Picker.Item key={a} label={a} value={a} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>
          Relação <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={relacao}
            onValueChange={(v) => setRelacao(String(v))}
            mode="dropdown"
            style={[
              styles.selectElement,
              { color: relacao ? "#000" : "#9b9b9b" },
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
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Email@example.com"
          style={styles.input}
          placeholderTextColor="#9b9b9b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* <Text style={styles.label}>Telefone</Text>
        <TextInput
          placeholder="41 91234-5678"
          placeholderTextColor="#9b9b9b"
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        /> */}

        <Text style={styles.label}>
          Data de nascimento <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        {Platform.OS === "web" ? (
          <input
            type="date"
            value={birthDate ? birthDate.toISOString().slice(0, 10) : ""}
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
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: birthDate ? "#000" : "#777" }}>
                {birthDate ? formatDate(birthDate) : "Data de nascimento..."}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
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
          Tipo de acesso <Text style={{ color: "#cc0000" }}>*</Text>
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tipoAcesso}
            onValueChange={(v) => setTipoAcesso(String(v))}
            mode="dropdown"
            style={[
              styles.selectElement,
              { color: tipoAcesso ? "#000" : "#9b9b9b" },
            ]}
          >
            <Picker.Item label="Acesso" value={null} />
            {tiposAcesso.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={validateAndSubmit}
        >
          <Text style={styles.registerButtonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.bellFab}
        onPress={() => alert("Funcionalidade em desenvolvimento...")}
        activeOpacity={0.85}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
