import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

type Aviso = {
  id: string;
  title: string;
  start?: string;
  end?: string;
  date?: string;
  reference: string;
  status: "active" | "closed";
};

export default function NoticesScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSindico, setIsSindico] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const [avisos] = useState<Aviso[]>([
    {
      id: "1",
      title: "Corte da energia elétrica",
      start: "07/10/2024",
      end: "08/10/2024",
      reference: "Todos",
      status: "active",
    },
    {
      id: "2",
      title: "Dedetização caixa da água",
      date: "07/10/2024",
      reference: "Bloco 07",
      status: "closed",
    },
    {
      id: "3",
      title: "Problemas com infiltrações",
      date: "07/10/2024",
      reference: "Apartamento 23",
      status: "closed",
    },
  ]);

  useEffect(() => {
    let mounted = true;
    async function loadUserRole() {
      try {
        const raw = await AsyncStorage.getItem("user");
        let userObj = null;
        if (raw) {
          userObj = JSON.parse(raw);
        } else if (typeof localStorage !== "undefined") {
          const raw2 = localStorage.getItem("user");
          if (raw2) userObj = JSON.parse(raw2);
        }

        if (!mounted) return;

        if (userObj && userObj.role) {
          const role = String(userObj.role)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          setIsSindico(role === "sindico");
        } else {
          setIsSindico(false);
        }
      } catch (err) {
        console.warn("Erro ao ler user do storage:", err);
        if (mounted) setIsSindico(false);
      } finally {
        if (mounted) setLoading(false);
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

  const filtered = avisos.filter((a) => {
    const byTitle =
      filterTitle.trim() === "" ||
      a.title.toLowerCase().includes(filterTitle.toLowerCase());
    const byDate =
      filterDate.trim() === "" ||
      (a.date && a.date.includes(filterDate)) ||
      (a.start && a.start.includes(filterDate)) ||
      (a.end && a.end.includes(filterDate));
    const byStatus =
      !filterStatus || filterStatus === "all"
        ? true
        : a.status === filterStatus;
    return byTitle && byDate && byStatus;
  });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>Avisos</Text>

      {isSindico && (
        <TouchableOpacity
          style={styles.newNoticeButton}
          activeOpacity={0.85}
          onPress={() => {
            router.push("/create-notice");
          }}
        >
          <Text style={styles.newNoticeButtonText}>Novo Aviso</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filtersRow}>
        <View style={styles.inputSmallWrap}>
          <Text style={styles.smallLabel}>Data</Text>
          <TextInput
            placeholder="dd/mm/aaaa"
            value={filterDate}
            onChangeText={setFilterDate}
            style={styles.smallInput}
          />
        </View>

        <View style={styles.inputSmallWrap}>
          <Text style={styles.smallLabel}>Status</Text>
          <TouchableOpacity
            style={styles.selectSmall}
            onPress={() =>
              setFilterStatus((prev) =>
                prev === null
                  ? "all"
                  : prev === "all"
                  ? "active"
                  : prev === "active"
                  ? "closed"
                  : null
              )
            }
          >
            <Text style={styles.selectSmallText}>
              {filterStatus === null
                ? "Status"
                : filterStatus === "all"
                ? "Todos"
                : filterStatus}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.smallLabel}>Título</Text>
        <TextInput
          placeholder="Filtro por título..."
          value={filterTitle}
          onChangeText={setFilterTitle}
          style={styles.smallInput}
        />
      </View>

      <View style={{ marginBlock: 22 }}>
        {filtered.map((a) => (
          <View key={a.id} style={styles.avisoCard}>
            <View style={styles.avisoHeader}>
              <Text style={styles.avisoTitle}>{a.title}</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      a.status === "active" ? "#2ecc71" : "#e74c3c",
                  },
                ]}
              />
            </View>

            <Text style={styles.avisoDate}>
              {a.start && a.end ? `${a.start} - ${a.end}` : a.date ?? ""}
            </Text>

            <Text style={styles.avisoRef}>Referente a: {a.reference}</Text>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => {
                console.log("Ver aviso", a.id);
                // router.push(`/aviso/${a.id}`);
              }}
            >
              <Text style={styles.cardButtonText}>Ver Aviso</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text>Nenhum aviso encontrado.</Text>
          </View>
        )}
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
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  newNoticeButton: {
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  newNoticeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputSmallWrap: {
    width: "49%",
    marginRight: 8,
    marginBottom: 8
  },
  smallLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  smallInput: {
    width: "100%",
    fontSize: 14,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
  },
  selectSmall: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  selectSmallText: {
    color: "#000",
    fontSize: 14,
  },

  avisoCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
  },
  avisoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avisoTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    textAlign: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  avisoDate: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  avisoRef: {
    fontSize: 16,
    color: "#333",
    marginTop: 6,
    marginBottom: 8,
  },

  cardButton: {
    marginTop: 6,
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    paddingHorizontal: 18,
    width: "100%"
  },
  cardButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyBox: {
    padding: 18,
    alignItems: "center",
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
