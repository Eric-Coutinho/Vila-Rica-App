import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./styles";
import ApartmentSection from "./ApartmentSection";
import PorterScheduleSection from "./PorterScheduleSection";
import { getStoredUser } from "../../services/session";
import { getDeliveryBadge } from "../../services/deliveryService";
import { unreadChatCount } from "../../services/directMessageService";
import { useFocusedRefresh } from "../directMessages/useFocusedRefresh";

const QUICK_BUTTONS_MORADORES: Record<string, string> = {
  "/party-saloon": "Salão de Festas",
  "/complaints": "Reclamações",
  "/meetings": "Assembléias",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/contact-manager": "Falar com Síndico",
  "/chatbot": "Chatbot de suporte",
};

const QUICK_BUTTONS_FUNCIONARIOS: Record<string, string> = {
  "/party-saloon": "Salão de Festas",
  "/notices": "Avisos",
  "/deliveries": "Encomendas",
  "/moving": "Mudanças",
  "/contact-manager": "Falar com Síndico",
  // "/clock-in": "Ponto",
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
  "/messages": "Mensagens",
  "/chatbot": "Chatbot",
  "https://charts.mongodb.com/charts-vilaricaapp-rtrdqtv/dashboards":
    "Relatórios",
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const nameFromParams = (params?.name as string) || undefined;

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [roleTitle, setRoleTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [deliveryBadge, setDeliveryBadge] = useState(0);
  const [messageBadge, setMessageBadge] = useState(0);
  useFocusedRefresh(
    React.useCallback(async (visible) => {
      try {
        const count = await unreadChatCount();
        if (visible()) setMessageBadge(count);
      } catch {
        // Keep the last known count until the next refresh.
      }
    }, []),
    ["sindico", "admin", "adm"].includes(roleTitle || ""),
    10000,
  );

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
        } else if (role === "funcionario" || role === "porteiro") {
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

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      void (async () => {
        try {
          const user = await getStoredUser();
          const role = String(user?.role || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          if (role === "morador" && mounted)
            setDeliveryBadge(await getDeliveryBadge());
          else if (mounted) setDeliveryBadge(0);
        } catch {
          if (mounted) setDeliveryBadge(0);
        }
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

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
                if (route.startsWith("https://")) {
                  Linking.openURL(route).catch(() =>
                    alert("Não foi possível abrir os relatórios."),
                  );
                  return;
                }
                router.push(route as any);
              }}
            >
              <Text style={styles.quickButtonText}>{label}</Text>
              {route === "/messages" && messageBadge > 0 && (
                <View
                  accessibilityLabel={messageBadge + " conversas não lidas"}
                  style={styles.deliveryBadge}
                >
                  <Text style={styles.deliveryBadgeText}>
                    {messageBadge > 99 ? "99+" : messageBadge}
                  </Text>
                </View>
              )}
              {route === "/deliveries" && deliveryBadge > 0 && (
                <View style={styles.deliveryBadge}>
                  <Text style={styles.deliveryBadgeText}>
                    {deliveryBadge > 99 ? "99+" : deliveryBadge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {roleTitle !== undefined &&
        (roleTitle === "funcionario" || roleTitle === "porteiro" ? (
          <PorterScheduleSection />
        ) : (
          <ApartmentSection
            manager={["sindico", "admin", "adm"].includes(roleTitle)}
          />
        ))}

    </ScrollView>
  );
}
