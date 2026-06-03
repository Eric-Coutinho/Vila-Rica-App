import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./styles";

const QUICK_BUTTONS_MORADORES: Record<string,string> = {
  "/saloon": "Salão de Festas",
  "/complaints": "Reclamações",
  "/meetings": "Assembléias",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/falar-sindico": "Falar com Síndico",
};

const QUICK_BUTTONS_FUNCIONARIOS: Record<string,string> = {
  "/saloon": "Salão de Festas",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/falar-sindico": "Falar com Síndico",
  "/clock-in": "Ponto",
};

const QUICK_BUTTONS_SINDICO: Record<string,string> = {
  "/saloon": "Salão de Festas",
  "/complaints": "Reclamações",
  "/meetings": "Assembléias",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/entrance": "Portaria",
  "/residents": "Moradores",
  "/change-manager": "Alterar Síndico",
  "/costs-report": "Relatório de custos",
  "/chatbot": "Chatbot",
};


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

  const [quickButtons, setQuickButtons] = useState<Record<string, string>>(QUICK_BUTTONS_MORADORES);

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
    let mounted = true;
  
    async function loadUserRole() {
      try {
        let raw: string | null = null;
        try {
          raw = await AsyncStorage.getItem("user");
        } catch (e) {
          console.log(`Erro - ${e}`)
        }
  
        if (!raw && typeof localStorage !== "undefined") {
          try {
            raw = localStorage.getItem("user");
          } catch (e) {
            console.log(`Erro - ${e}`)
          }
        }
  
        if (!raw) {
          if (mounted) setQuickButtons(QUICK_BUTTONS_MORADORES);
          return;
        }
  
        const user = JSON.parse(raw);
        const role = String(user?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
  
        if (!mounted) return;
  
        if (role === "sindico") {
          setQuickButtons(QUICK_BUTTONS_SINDICO);
        } else if (role === "funcionario") {
          setQuickButtons(QUICK_BUTTONS_FUNCIONARIOS);
        } else {
          setQuickButtons(QUICK_BUTTONS_MORADORES);
        }
      } catch (err) {
        console.warn("Erro ao ler user do storage:", err);
        if (mounted) setQuickButtons(QUICK_BUTTONS_MORADORES);
      }
    }
  
    loadUserRole();
  
    return () => {
      mounted = false;
    };
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
          {Object.entries(quickButtons).map(([route, label]) => (
            <TouchableOpacity
              key={route}
              style={styles.quickButton}
              activeOpacity={0.8}
              onPress={() => {
                console.log("clicou em", label, "-> rota:", route);
                router.push(route as any);
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
                    source={require("../../../assets/images/user.png")}
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
