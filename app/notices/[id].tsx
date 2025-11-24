import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API_BASE = "http://localhost:3000/api";

type CommentItem = {
  _id: string;
  text: string;
  createdAt?: string;
  author?: any;
  replies?: any[];
};

type Notice = {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "closed";
  referente?: any[];
  comments?: CommentItem[];
  createdBy?: any;
};

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams() as { id?: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<{ [k: string]: string }>({});
  const [isSindico, setIsSindico] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "closed">(
    "active"
  );
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const raw =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);
        const parsed = raw ? JSON.parse(raw) : null;
        const uid = parsed?._id || parsed?.id || null;
        setUserId(uid);

        const role = String(parsed?.role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (mounted)
          setIsSindico(
            role === "sindico" || role === "síndico" || role === "admin"
          );
      } catch (err) {
        console.warn("Erro ao ler user:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const raw =
          (await AsyncStorage.getItem("user")) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("user")
            : null);
        const parsed = raw ? JSON.parse(raw) : null;
        const uid = parsed?._id || parsed?.id || null;

        const headers: any = { "Content-Type": "application/json" };
        if (uid) headers["x-user-id"] = String(uid);

        const resNotice = await fetch(`${API_BASE}/notices/${id}`, {
          method: "GET",
          headers,
        });
        if (resNotice.ok) {
          const body = await resNotice.json().catch(() => ({}));
          const n = body.notice || body;
          if (mounted) {
            setNotice(n);
            setSelectedStatus(n?.status === "closed" ? "closed" : "active");
          }
        } else {
          console.warn("Erro ao buscar aviso:", resNotice.status);
        }

        const resComments = await fetch(`${API_BASE}/notices/${id}/comments`, {
          method: "GET",
          headers,
        });
        if (resComments.ok) {
          const body = await resComments.json().catch(() => ({}));
          const cs = body.comments || [];
          if (mounted) setComments(cs);
        } else {
          console.warn("Erro ao buscar comentários:", resComments.status);
        }
      } catch (err) {
        console.error("Erro carregar aviso:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDateDisplay = (iso?: any) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.valueOf())) return String(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!id) return;
    setLoading(true);
    try {
      const raw =
        (await AsyncStorage.getItem("user")) ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("user")
          : null);
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?._id || parsed?.id || null;

      const headers: any = { "Content-Type": "application/json" };
      if (uid) headers["x-user-id"] = String(uid);

      const res = await fetch(`${API_BASE}/notices/${id}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: newComment.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Erro ${body.message || "Falha ao adicionar comentário"}`);
      } else {
        const body = await res.json().catch(() => ({}));
        await refreshComments();
        setNewComment("");
      }
    } catch (err) {
      console.error("Erro add comment:", err);
      alert("Erro - Não foi possível adicionar comentário");
    } finally {
      setLoading(false);
    }
  };

  async function refreshComments() {
    if (!id) return;
    try {
      const raw =
        (await AsyncStorage.getItem("user")) ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("user")
          : null);
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?._id || parsed?.id || null;
      const headers: any = { "Content-Type": "application/json" };
      if (uid) headers["x-user-id"] = String(uid);

      const res = await fetch(`${API_BASE}/notices/${id}/comments`, {
        method: "GET",
        headers,
      });
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        setComments(body.comments || []);
      }
    } catch (err) {
      console.error("refresh comments err", err);
    }
  }

  const handleReply = async (commentId: string) => {
    const text = (replyText[commentId] || "").trim();
    if (!text) return;
    if (!id) return;
    try {
      const raw =
        (await AsyncStorage.getItem("user")) ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("user")
          : null);
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?._id || parsed?.id || null;
      const headers: any = { "Content-Type": "application/json" };
      if (uid) headers["x-user-id"] = String(uid);

      const res = await fetch(
        `${API_BASE}/notices/${id}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(`Erro - ${b.message || "Falha ao responder"}`);
      } else {
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        await refreshComments();
      }
    } catch (err) {
      console.error("reply err", err);
      alert("Erro - Não foi possível enviar resposta");
    }
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(notice?.status === "closed" ? "closed" : "active");
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!id) return;
    setSavingStatus(true);
    try {
      const raw =
        (await AsyncStorage.getItem("user")) ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("user")
          : null);
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?._id || parsed?.id || null;
      const headers: any = { "Content-Type": "application/json" };
      if (uid) headers["x-user-id"] = String(uid);

      const res = await fetch(`${API_BASE}/notices/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(`Erro ${b.message || "Falha ao atualizar status"}`);
      } else {
        const body = await res.json().catch(() => ({}));
        const resNotice = await fetch(`${API_BASE}/notices/${id}`, {
          method: "GET",
          headers,
        });
        if (resNotice.ok) {
          const nb = await resNotice.json().catch(() => ({}));
          setNotice(nb.notice || nb);
        }
        setStatusModalVisible(false);
      }
    } catch (err) {
      console.error("save status err", err);
      alert("Erro - Não foi possível atualizar status");
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          {notice.endDate
            ? `Data de fim: ${formatDateDisplay(notice.endDate)}`
            : ""}
        </Text>

        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.description}>{notice.description || "—"}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Referentes:</Text>
        <Text>
          {(notice.referente || [])
            .map((r: any) => `${r.kind}${r.refId ? " " + r.refId : ""}`)
            .join(", ") || "Todos"}
        </Text>
      </View>

      <Text style={[styles.label, { marginTop: 18 }]}>Comentários</Text>

      <View style={{ marginBottom: 12 }}>
        {comments.map((c) => {
          const author =
            c.author &&
            (typeof c.author === "object"
              ? c.author.name || c.author.email
              : c.author);
          const timeAgo = c.createdAt
            ? `${Math.round(
                (Date.now() - new Date(c.createdAt).getTime()) / 3600000
              )}h atrás`
            : "";
          return (
            <View key={c._id} style={styles.commentCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.commentAuthor}>{author || "Usuário"}</Text>
                <Text style={styles.commentTime}>{timeAgo}</Text>
              </View>
              <Text style={styles.commentText}>{c.text}</Text>

              {Array.isArray(c.replies) && c.replies.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  {c.replies.map((r: any) => (
                    <View key={r._id} style={styles.replyCard}>
                      <Text style={{ fontWeight: "700" }}>
                        {r.authorName || r.author}
                      </Text>
                      <Text>{r.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ marginTop: 8 }}>
                <TextInput
                  placeholder="Responder..."
                  value={replyText[c._id] || ""}
                  onChangeText={(t) =>
                    setReplyText((p) => ({ ...p, [c._id]: t }))
                  }
                  style={styles.replyInput}
                />
                <TouchableOpacity
                  style={styles.replyBtn}
                  onPress={() => handleReply(c._id)}
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
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Adicionar Comentário
        </Text>
      </TouchableOpacity>

      <Modal visible={statusModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
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

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { marginLeft: 8, backgroundColor: "#466CA5" },
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

const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSmall: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRowStatus: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#fff",
    fontWeight: "700",
    marginRight: 8,
  },

  pencilBtn: {
    marginLeft: 6,
  },

  pencilText: {
    fontSize: 18,
  },

  dateText: {
    color: "#333",
    marginTop: 6,
    fontSize: 16,
  },

  label: {
    fontWeight: "700",
    marginTop: 12,
    fontSize: 16,
  },

  description: {
    marginTop: 6,
    color: "#222",
    fontSize: 16,
  },

  commentCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  commentAuthor: {
    fontWeight: "700",
  },

  commentTime: {
    color: "#777",
  },

  commentText: {
    marginTop: 8,
  },

  replyCard: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "#f7f7f7",
    borderRadius: 6,
  },

  replyInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },

  replyBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#466CA5",
    borderRadius: 6,
  },

  newCommentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
    marginTop: 10,
  },

  addCommentBtn: {
    marginTop: 8,
    backgroundColor: "#466CA5",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },

  statusOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginTop: 8,
  },

  statusOptionSelected: {
    borderColor: "#466CA5",
    backgroundColor: "#eef6ff",
  },

  modalBtn: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
});
