import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./ChatbotStyles";
import { listSupportCases } from "@/src/services/supportService";
import type {
  SupportCaseStatus,
  SupportConversation,
} from "@/src/types/support";

const STATUS_LABEL: Record<SupportCaseStatus, string> = {
  resolved: "Resolvido",
  in_analysis: "Em análise",
  closed: "Fechada",
};

const STATUS_COLOR: Record<SupportCaseStatus, string> = {
  resolved: "#20df25",
  in_analysis: "#ffe600",
  closed: "#ff1010",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function toApiDate(value: string): string | undefined {
  const brDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export default function SupportCasesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<SupportConversation[]>([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<SupportCaseStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    listSupportCases({ date: toApiDate(date), status })
      .then((result) => active && setItems(result))
      .catch(
        (reason) =>
          active &&
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível buscar os atendimentos.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [date, status]);

  useFocusEffect(load);

  return (
    <ScrollView
      contentContainerStyle={styles.supportPage}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.supportContent}>
        <Image
          source={require("../../../assets/images/mascote.png")}
          style={styles.supportMascot}
          resizeMode="contain"
        />
        <Text style={styles.supportTitle}>Suporte{"\n"}necessário</Text>
        <View style={styles.filtersRow}>
          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>Data</Text>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#777"
              maxLength={10}
            />
          </View>
          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(value) =>
                  setStatus(value as SupportCaseStatus | "")
                }
                style={styles.picker}
              >
                <Picker.Item label="Status" value="" />
                <Picker.Item label="Resolvido" value="resolved" />
                <Picker.Item label="Em análise" value="in_analysis" />
                <Picker.Item label="Fechada" value="closed" />
              </Picker>
            </View>
          </View>
        </View>
        {loading ? (
          <View style={styles.emptySupport}>
            <ActivityIndicator color="#466CA5" />
          </View>
        ) : null}
        {error ? <Text style={styles.supportError}>{error}</Text> : null}
        {!loading && !error ? (
          <View style={styles.supportList}>
            {items.map((item) => {
              const currentStatus = item.status || "in_analysis";
              return (
                <View key={item.id} style={styles.supportCard}>
                  <View style={styles.supportCardHeader}>
                    <Text style={styles.supportCardId}>#{item.caseNumber}</Text>
                    <View
                      style={[
                        styles.supportStatusDot,
                        { backgroundColor: STATUS_COLOR[currentStatus] },
                      ]}
                    />
                  </View>
                  <Text style={styles.supportCardDate}>
                    {formatDate(item.createdAt)} • {STATUS_LABEL[currentStatus]}
                  </Text>
                  <Text style={styles.supportCardQuestion} numberOfLines={3}>
                    {item.firstQuestion}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewChatButton}
                    onPress={() =>
                      router.push({
                        pathname: "/support/[id]",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.viewChatButtonText}>Ver Chat</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {items.length === 0 ? (
              <View style={styles.emptySupport}>
                <Text style={styles.emptySupportText}>
                  Nenhum atendimento encontrado.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
