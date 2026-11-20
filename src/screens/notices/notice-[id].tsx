import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { apiFetch } from "@/src/services/api";
import { getStoredUser } from "@/src/services/session";
import { styles } from "./notice-idStyle";

type CommentItem = {
  _id: string;
  text: string;
  createdAt?: string;
  author?: any;
  replies?: any[];
};

type Referente = {
  kind: "Todos" | "Bloco" | "Apartamento" | "Morador";
  refId?: string;
  residentName?: string;
};

type Notice = {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "closed";
  referente?: Referente[];
  comments?: CommentItem[];
  createdBy?: any;
};

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSindico, setIsSindico] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "closed">(
    "active",
  );
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const user = await getStoredUser();

        const role = String(user?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();

        if (mounted) {
          setIsSindico(["sindico", "admin", "adm"].includes(role));
        }
      } catch {
        if (mounted) {
          setIsSindico(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const resolveResidentNames = async (
    referentes: Referente[] = [],
  ): Promise<Referente[]> => {
    return Promise.all(
      referentes.map(async (referente) => {
        if (referente.kind !== "Morador" || !referente.refId) {
          return referente;
        }

        try {
          const response = await apiFetch(
            `/auth/users/get/${encodeURIComponent(referente.refId)}`,
            {
              method: "GET",
            },
            true,
          );

          if (!response.ok) {
            return referente;
          }

          const data = await response.json();
          const resident = data.user || data.resident || data.data;

          return {
            ...referente,
            residentName: resident?.name || referente.refId,
          };
        } catch {
          return referente;
        }
      }),
    );
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadNotice() {
      setLoading(true);

      try {
        const noticeResponse = await apiFetch(
          `/notices/${encodeURIComponent(id!)}`,
          {
            method: "GET",
          },
          true,
        );

        if (noticeResponse.ok) {
          const body = await noticeResponse.json().catch(() => ({}));
          const noticeData = body.notice || body;

          const referentes = await resolveResidentNames(
            noticeData.referente || [],
          );

          if (mounted) {
            setNotice({
              ...noticeData,
              referente: referentes,
            });

            setSelectedStatus(
              noticeData?.status === "closed" ? "closed" : "active",
            );
          }
        } else if (mounted) {
          setNotice(null);
        }

        const commentsResponse = await apiFetch(
          `/notices/${encodeURIComponent(id!)}/comments`,
          {
            method: "GET",
          },
          true,
        );

        if (commentsResponse.ok) {
          const body = await commentsResponse.json().catch(() => ({}));

          if (mounted) {
            setComments(body.comments || []);
          }
        }
      } catch {
        if (mounted) {
          setNotice(null);
          setComments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNotice();

    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDateDisplay = (value?: string) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("pt-BR");
  };

  const formatReferente = (referente: Referente) => {
    if (referente.kind === "Todos") {
      return "Todos";
    }

    if (referente.kind === "Morador") {
      return `Morador: ${
        referente.residentName || referente.refId || "Não informado"
      }`;
    }

    return `${referente.kind}: ${referente.refId || "Não informado"}`;
  };

  const refreshComments = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await apiFetch(
        `/notices/${encodeURIComponent(id)}/comments`,
        {
          method: "GET",
        },
        true,
      );

      if (response.ok) {
        const body = await response.json().catch(() => ({}));
        setComments(body.comments || []);
      }
    } catch {
      alert("Erro - Não foi possível atualizar os comentários");
    }
  };

  const handleAddComment = async () => {
    const text = newComment.trim();

    if (!text || !id) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(
        `/notices/${encodeURIComponent(id)}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        },
        true,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        alert(`Erro - ${body.message || "Falha ao adicionar o comentário"}`);

        return;
      }

      setNewComment("");
      await refreshComments();
    } catch {
      alert("Erro - Não foi possível adicionar o comentário");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId: string) => {
    const text = (replyText[commentId] || "").trim();

    if (!text || !id) {
      return;
    }

    try {
      const response = await apiFetch(
        `/notices/${encodeURIComponent(
          id,
        )}/comments/${encodeURIComponent(commentId)}/reply`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        },
        true,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        alert(`Erro - ${body.message || "Falha ao responder"}`);
        return;
      }

      setReplyText((current) => ({
        ...current,
        [commentId]: "",
      }));

      await refreshComments();
    } catch {
      alert("Erro - Não foi possível enviar a resposta");
    }
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(notice?.status === "closed" ? "closed" : "active");
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!id) {
      return;
    }

    setSavingStatus(true);

    try {
      const response = await apiFetch(
        `/notices/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: selectedStatus,
          }),
        },
        true,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        alert(`Erro - ${body.message || "Falha ao atualizar o status"}`);

        return;
      }

      setNotice((current) =>
        current
          ? {
              ...current,
              status: selectedStatus,
            }
          : current,
      );

      setStatusModalVisible(false);
    } catch {
      alert("Erro - Não foi possível atualizar o status");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={styles.centered}>
        <Text>Aviso não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerSmall}>Aviso</Text>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{notice.title}</Text>
        </View>

        <View style={styles.titleRowStatus}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    notice.status === "active" ? "#2ecc71" : "#e74c3c",
                },
              ]}
            >
              {notice.status === "active" ? "Ativo" : "Fechado"}
            </Text>
          </View>

          {isSindico && (
            <TouchableOpacity
              style={styles.pencilBtn}
              onPress={handleOpenStatusModal}
            >
              <Text style={styles.pencilText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Data de início:</Text>

        <Text style={styles.dateText}>
          {formatDateDisplay(notice.startDate)}
        </Text>

        {notice.endDate && (
          <>
            <Text style={styles.label}>Data de fim:</Text>

            <Text style={styles.dateText}>
              {formatDateDisplay(notice.endDate)}
            </Text>
          </>
        )}

        <Text style={styles.label}>Descrição:</Text>

        <Text style={styles.description}>{notice.description || "—"}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Referentes:</Text>

        <Text>
          {(notice.referente || []).map(formatReferente).join(", ") || "Todos"}
        </Text>
      </View>

      <Text style={[styles.label, { marginTop: 18 }]}>Comentários</Text>

      <View style={{ marginBottom: 12 }}>
        {comments.map((comment) => {
          const author =
            comment.author && typeof comment.author === "object"
              ? comment.author.name || comment.author.email
              : comment.author;

          const hoursAgo = comment.createdAt
            ? Math.max(
                0,
                Math.round(
                  (Date.now() - new Date(comment.createdAt).getTime()) /
                    3600000,
                ),
              )
            : null;

          return (
            <View key={comment._id} style={styles.commentCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.commentAuthor}>{author || "Usuário"}</Text>

                <Text style={styles.commentTime}>
                  {hoursAgo !== null ? `${hoursAgo}h atrás` : ""}
                </Text>
              </View>

              <Text style={styles.commentText}>{comment.text}</Text>

              {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  {comment.replies.map((reply: any) => (
                    <View key={reply._id} style={styles.replyCard}>
                      <Text style={{ fontWeight: "700" }}>
                        {reply.authorName ||
                          reply.author?.name ||
                          reply.author ||
                          "Usuário"}
                      </Text>

                      <Text>{reply.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ marginTop: 8 }}>
                <TextInput
                  placeholder="Responder..."
                  value={replyText[comment._id] || ""}
                  onChangeText={(text) =>
                    setReplyText((current) => ({
                      ...current,
                      [comment._id]: text,
                    }))
                  }
                  style={styles.replyInput}
                />

                <TouchableOpacity
                  style={styles.replyBtn}
                  onPress={() => handleReply(comment._id)}
                >
                  <Text style={{ color: "#fff" }}>Responder</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <TextInput
        placeholder="Escrever comentário..."
        value={newComment}
        onChangeText={setNewComment}
        style={styles.newCommentInput}
        multiline
      />

      <TouchableOpacity style={styles.addCommentBtn} onPress={handleAddComment}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
          }}
        >
          Adicionar Comentário
        </Text>
      </TouchableOpacity>

      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Alterar status
            </Text>

            <TouchableOpacity
              onPress={() => setSelectedStatus("active")}
              style={[
                styles.statusOption,
                selectedStatus === "active" && styles.statusOptionSelected,
              ]}
            >
              <Text>Ativo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedStatus("closed")}
              style={[
                styles.statusOption,
                selectedStatus === "closed" && styles.statusOptionSelected,
              ]}
            >
              <Text>Fechado</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: "#ccc",
                  },
                ]}
                onPress={() => setStatusModalVisible(false)}
                disabled={savingStatus}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    marginLeft: 8,
                    backgroundColor: "#466CA5",
                  },
                ]}
                onPress={handleSaveStatus}
                disabled={savingStatus}
              >
                <Text style={{ color: "#fff" }}>
                  {savingStatus ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
