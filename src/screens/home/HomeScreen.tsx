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
import ApartmentSection from "./ApartmentSection";
import { getStoredUser } from "../../services/session";

const QUICK_BUTTONS_MORADORES: Record<string, string> = {
  "/party-saloon": "Salão de Festas",
  "/complaints": "Reclamações",
  "/meetings": "Assembléias",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/contact-manager": "Falar com Síndico",
  "/chatbot": "Chatbot",
};

const QUICK_BUTTONS_FUNCIONARIOS: Record<string, string> = {
  "/party-saloon": "Salão de Festas",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/contact-manager": "Falar com Síndico",
  "/clock-in": "Ponto",
};

const QUICK_BUTTONS_SINDICO: Record<string, string> = {
  "/party-saloon": "Salão de Festas",
  "/complaints": "Reclamações",
  "/meetings": "Assembléias",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/entrance": "Portaria",
  "/residents": "Moradores",
  "/change-manager": "Alterar Síndico",
  "/costs-report": "Relatórios",
  "/chatbot": "Chatbot",
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const nameFromParams = (params?.name as string) || undefined;

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [roleTitle, setRoleTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const [quickButtons, setQuickButtons] = useState<Record<string, string>>(
    QUICK_BUTTONS_MORADORES,
  );

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        if (nameFromParams) {
          if (mounted) setUserName(nameFromParams);
          return;
        }

        const user = await getStoredUser();
        if (user?.name && mounted) {
          setUserName(user.name);
          return;
        }

        if (mounted) router.replace("/login");
      } catch {
        if (mounted) router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [nameFromParams]);

  useEffect(() => {
    let mounted = true;

    async function loadUserRole() {
      try {
        const user = await getStoredUser();
        if (!user) {
          if (mounted) setQuickButtons(QUICK_BUTTONS_MORADORES);
          return;
        }

        const role = String(user?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        if (!mounted) return;

        if (["sindico", "admin", "adm"].includes(role)) {
          setQuickButtons(QUICK_BUTTONS_SINDICO);
        } else if (role === "funcionario") {
          setQuickButtons(QUICK_BUTTONS_FUNCIONARIOS);
        } else {
          setQuickButtons(QUICK_BUTTONS_MORADORES);
        }
        setRoleTitle(role);
      } catch {
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
                router.push(route as any);
              }}
            >
              <Text style={styles.quickButtonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ApartmentSection
        manager={Boolean(
          roleTitle && ["sindico", "admin", "adm"].includes(roleTitle),
        )}
      />

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
