import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const QUICK_BUTTONS_MORADORES = [
  "Salão de Festas",
  "Reclamações",
  "Assembléias",
  "Avisos",
  "Encomendas",
  "Mudanças",
  "Falar com Síndico",
];

const QUICK_BUTTONS_SINDICO = [
  "Salão de Festas",
  "Reclamações",
  "Assembléias",
  "Avisos",
  "Encomendas",
  "Mudanças",
  "Portaria",
  "Moradores",
  "Altrerar Síndico",
  "Relatório de custos",
  "Logs do sistema",
];

type User = {
  name?: string;
  email?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const nameFromParams = (params?.name as string) || undefined;

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const [quickButtons, setQuickButtons] = useState(QUICK_BUTTONS_MORADORES);

  useEffect(() => {
    let mounted = true;

    async function loadName() {
      try {
        if (nameFromParams) {
          if (mounted) setUserName(nameFromParams);
          return;
        }

        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const user: User = JSON.parse(raw);
          if (user?.name && mounted) {
            setUserName(user.name);
            return;
          }
        }

        if (mounted) setUserName("morador(a)");
      } catch (err) {
        console.warn("Erro ao carregar user:", err);
        if (mounted) setUserName("morador(a)");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadName();

    return () => {
      mounted = false;
    };
  }, [nameFromParams]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw);
      const role = (user.role || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (role === "sindico") setQuickButtons(QUICK_BUTTONS_SINDICO);
      else setQuickButtons(QUICK_BUTTONS_MORADORES);
    } catch (err) {
      console.warn("Erro ao ler user do localStorage:", err);
      setQuickButtons(QUICK_BUTTONS_MORADORES);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.greetingRow}>
        <Text style={styles.greetingText}>
          Olá, {userName ?? "morador(a)"}.
        </Text>
      </View>

      <View style={styles.quickSection}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.buttonsGrid}>
          {quickButtons.map((label) => (
            <TouchableOpacity
              key={label}
              style={styles.quickButton}
              activeOpacity={0.8}
              onPress={() => {
                console.log("clicou em", label);
                router.push("/residents");
              }}
            >
              <Text style={styles.quickButtonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.apartmentSection}>
        <Text style={styles.sectionTitle}>Seus Apartamentos:</Text>

        <View style={styles.apartmentCard}>
          <Text style={styles.apartmentTitle}>
            Apartamento 23{"\n"}Bloco 07
          </Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Apartamento Alugado?</Text>
            <Text style={styles.fieldValue}>Sim</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Responsável:</Text>
            <Text style={styles.fieldValue}>
              Silvana de Paula Coutinho Pereira
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Contato:</Text>
            <Text style={styles.fieldValue}>41 99700-3637</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
            Moradores:
          </Text>

          <View style={styles.moradoresGrid}>
            {[
              {
                name: "Nome Morador 1",
                doc: "123.456.789-00",
                phone: "41 91234-5678",
                age: "50 Anos",
              },
              {
                name: "Nome Morador 2",
                doc: "123.456.789-00",
                phone: "41 91234-5678",
                age: "48 Anos",
              },
              {
                name: "Nome Morador 3",
                doc: "123.456.789-00",
                phone: "41 91234-5678",
                age: "14 Anos",
              },
            ].map((m, i) => (
              <View key={i} style={styles.moradorCard}>
                <View style={styles.avatarPlaceholder}>
                  <Image
                    source={require("../assets/images/user.png")}
                    style={styles.userImg}
                  />
                </View>
                <Text style={styles.moradorName}>{m.name}</Text>
                <Text style={styles.moradorDoc}>{m.doc}</Text>
                <Text style={styles.moradorPhone}>{m.phone}</Text>
                <Text style={styles.moradorAge}>{m.age}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bellFab}
        onPress={() => {
          alert("Funcionalidade em desenvolvimento...");
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingRow: {
    alignItems: "center",
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "700",
  },
  quickSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonsGrid: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as any,
  quickButton: {
    backgroundColor: "#466CA5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
  },
  quickButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  apartmentSection: {
    marginTop: 12,
  },
  apartmentCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingBlock: 8,
    backgroundColor: "#fafafa",
    borderColor: "#e2e2e2",
    borderWidth: 1,
  },
  apartmentTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginBottom: 6,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  fieldValue: {
    width: "100%",
    fontSize: 16,
    textAlign: "left",
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingBlock: 4,
  },
  moradoresGrid: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  moradorCard: {
    width: "45%",
    backgroundColor: "#466CA5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
  },
  moradorName: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  moradorDoc: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
  },
  moradorPhone: {
    color: "#fff",
    fontSize: 12,
  },
  moradorAge: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
  },
  bellFab: {
    position: "absolute",
    right: 18,
    bottom: 32,
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
  userImg: {
    width: "100%",
    height: "100%",
  },
});
