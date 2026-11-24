import { parentRoutes } from "../../navigation/parentRoutes";
import { Ionicons } from "@expo/vector-icons";
import { styles as complaintStyles } from "../complaints/complaint-idStyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useAppDialog } from "../../components/AppFeedbackProvider";
import { getErrorMessage } from "../../services/api";
import {
  addDeliveryMessage,
  getDelivery,
  updateDeliveryStatus,
} from "../../services/deliveryService";
import { getStoredUser } from "../../services/session";
import {
  DELIVERY_STATUS_LABEL,
  type Delivery,
  DELIVERY_STATUS_COLOR,
} from "../../types/delivery";

import { styles as s } from "./DeliveryDetailStyles";

const managerRole = (role?: string) =>
  ["sindico", "admin", "adm"].includes(
    String(role || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase(),
  );
export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [manager, setManager] = useState(false);
  const [message, setMessage] = useState("");
  const [statusModal, setStatusModal] = useState(false);
  const [nextStatus, setNextStatus] = useState<"under_review" | "resolved">(
    "under_review",
  );
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const user = await getStoredUser();
      setManager(managerRole(user?.role));
      const item = await getDelivery(id);
      setDelivery(item);
      setNextStatus(item.status === "resolved" ? "resolved" : "under_review");
    } catch (error) {
      showDialog({
        title: "Erro",
        text: getErrorMessage(error, "Não foi possível carregar a reclamação."),
        showCancel: false,
        confirmText: "OK",
        onConfirm: () => router.dismissTo(parentRoutes["deliveries/[id]"]),
      });
    }
  }, [id, router, showDialog]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const send = async () => {
    if (!delivery || !message.trim()) return;
    try {
      const updated = await addDeliveryMessage(delivery.id, message.trim());
      setDelivery(updated);
      setMessage("");
    } catch (error) {
      showDialog({
        title: "Erro",
        text: getErrorMessage(error, "Não foi possível adicionar a resposta."),
        showCancel: false,
        confirmText: "OK",
      });
    }
  };
  const saveStatus = async () => {
    if (!delivery) return;
    try {
      const updated = await updateDeliveryStatus(delivery.id, nextStatus);
      setDelivery(updated);
      setStatusModal(false);
    } catch (error) {
      showDialog({
        title: "Erro",
        text: getErrorMessage(error, "Não foi possível atualizar o status."),
        showCancel: false,
        confirmText: "OK",
      });
    }
  };
  if (!delivery)
    return (
      <View style={s.center}>
        <Text>Carregando encomenda...</Text>
      </View>
    );
  const complaint = delivery.complaint;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page}>
      <Text style={s.title}>Encomendas</Text>
      <Text style={s.number}>{delivery.number}</Text>
      <TouchableOpacity
        disabled={!manager}
        onPress={() => {
          setNextStatus(
            delivery.status === "resolved" ? "resolved" : "under_review",
          );
          setStatusModal(true);
        }}
        style={s.status}
      >
        <Text style={s.statusText}>
          {DELIVERY_STATUS_LABEL[delivery.status]}
        </Text>
        {manager && (
          <Ionicons name="create-outline" color="#3562ff" size={22} />
        )}
      </TouchableOpacity>
      <View style={s.section}>
        <Text style={s.heading}>Descrição:</Text>
        <Text style={s.text}>
          {complaint?.description || "Nenhuma reclamação registrada."}
        </Text>
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Data da entrega:</Text>
        <Text style={s.text}>
          {new Date(delivery.deliveredAt).toLocaleString("pt-BR")}
        </Text>
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Data do recebimento:</Text>
        <Text style={s.text}>
          {delivery.receivedAt
            ? new Date(delivery.receivedAt).toLocaleString("pt-BR")
            : "Não informado"}
        </Text>
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Porteiro que recebeu:</Text>
        <Text style={s.text}>{delivery.porter?.name || "Porteiro"}</Text>
      </View>
      <Text style={s.commentsTitle}>Comentários</Text>
      {complaint?.messages?.map((item, index) => (
        <View key={item.id} style={[s.message, index > 0 && s.reply]}>
          <View style={s.authorRow}>
            <Ionicons name="person-circle-outline" size={32} color="#292d33" />
            <Text style={s.messageAuthor}>
              {item.authorRole === "manager" ? "Síndico" : "Morador"}
            </Text>
            <Text style={s.when}>
              {new Date(item.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <Text style={s.messageText}>{item.text}</Text>
        </View>
      ))}
      {delivery.status !== "resolved" && (
        <>
          <TextInput
            style={s.replyInput}
            value={message}
            onChangeText={setMessage}
            maxLength={500}
            multiline
            placeholder="Responder..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={s.primary} onPress={() => void send()}>
            <Text style={s.primaryText}>Adicionar Resposta</Text>
          </TouchableOpacity>
        </>
      )}
      <Modal
        visible={statusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModal(false)}
      >
        <Pressable style={s.overlay} onPress={() => setStatusModal(false)}>
          <Pressable style={s.modal} onPress={(e) => e.stopPropagation()}>
            <Text style={s.modalTitle}>Alterar status</Text>
            <Text style={complaintStyles.currentStatusText}>
              Status atual: {DELIVERY_STATUS_LABEL[delivery.status]}
            </Text>
            {(["under_review", "resolved"] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  complaintStyles.statusOption,
                  status === nextStatus && complaintStyles.statusOptionSelected,
                ]}
                onPress={() => setNextStatus(status)}
              >
                <View
                  style={[
                    complaintStyles.optionDot,
                    { backgroundColor: DELIVERY_STATUS_COLOR[status] },
                  ]}
                />
                <Text style={complaintStyles.statusOptionText}>
                  {DELIVERY_STATUS_LABEL[status]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.primary}
              onPress={() => void saveStatus()}
            >
              <Text style={s.primaryText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.cancel}
              onPress={() => setStatusModal(false)}
            >
              <Text style={s.primaryText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
