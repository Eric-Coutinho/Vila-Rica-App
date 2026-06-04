import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

import { styles } from "./styles";

export default function ResidentsScreen() {
  const router = useRouter();

  const [filtroBloco, setFiltroBloco] = useState("Bloco");
  const [filtroApto, setFiltroApto] = useState("Apartamento");
  const [filtroNome, setFiltroNome] = useState("");

  const moradores = [
    {
      id: "1",
      name: "Morador 1",
      bloco: "Bloco 7",
      apartamento: "Apartamento 23",
      cpf: "123.456.789-00",
      phone: "41 91234-5678",
      birthdate: "01/01/2000",
    },
    {
      id: "2",
      name: "Morador 2",
      bloco: "Bloco 7",
      apartamento: "Apartamento 24",
      cpf: "234.567.890-11",
      phone: "41 97654-3210",
      birthdate: "03/03/1992",
    },
    {
      id: "3",
      name: "Morador 3",
      bloco: "Bloco 7",
      apartamento: "Apartamento 25",
      cpf: "345.678.901-22",
      phone: "41 99876-5432",
      birthdate: "12/12/2010",
    },
  ];

  const filtered = moradores.filter((m) => {
    const byName =
      filtroNome.trim() === "" ||
      m.name.toLowerCase().includes(filtroNome.toLowerCase());
    const byBloco = filtroBloco === "Bloco" || m.bloco === filtroBloco;
    const byApto = filtroApto === "Apartamento" || m.apartamento === filtroApto;
    return byName && byBloco && byApto;
  });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moradores</Text>
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => {
          console.log("Cadastrar Morador");
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
            onPress={() => {
              // exemplo simples: alterna valor para demo
              setFiltroBloco((prev) => (prev === "Bloco" ? "Bloco 7" : "Bloco"));
            }}
          >
            <Text style={styles.selectText}>{filtroBloco}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectBox}>
          <Text style={styles.selectLabel}>Apartamento</Text>
          <TouchableOpacity
            style={styles.selectTouchable}
            onPress={() => {
              setFiltroApto((prev) =>
                prev === "Apartamento" ? "Apartamento 23" : "Apartamento"
              );
            }}
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
        {filtered.map((m) => (
          <View key={m.id} style={styles.moradorCard}>
            <Text style={styles.cardTitle}>{m.name}</Text>

            <Text style={styles.cardSmall}>
              {m.bloco} {m.apartamento}
            </Text>

            <Text style={styles.cardSmall}>CPF: {m.cpf}</Text>
            <Text style={styles.cardSmall}>Telefone: {m.phone}</Text>
            <Text style={styles.cardSmall}>
              Data de Nascimento: {m.birthdate}
            </Text>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => {
                console.log("Ver informações de", m.name);
                // router.push(`/morador/${m.id}`);
              }}
            >
              <Text style={styles.cardButtonText}>Ver Informações</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text>Nenhum morador encontrado.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
