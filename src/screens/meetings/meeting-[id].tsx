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

import { apiFetch, getErrorMessage } from "../../services/api";
import { getStoredUser } from "../../services/session";
import { Assembly, AssemblyComment, AssemblyStatus } from "../../types/meetingTypes";
import { styles } from "./meeting-idStyles";

function isManager(role?: string): boolean {
  const normalized = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return ["sindico", "admin", "adm"].includes(normalized);
}

function authorName(
  author?: { name?: string; email?: string } | string,
): string {
  if (typeof author === "string") return author;
  return author?.name || author?.email || "Morador";
}

function timeAgo(value?: string): string {
  if (!value) return "";
  const hours = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 3600000),
  );
  return `${hours}h atrás`;
}

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSindico, setIsSindico] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [ata, setAta] = useState("");
  const [savingAta, setSavingAta] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<AssemblyStatus>("Pendente");

  async function fetchAssembly(showLoading = false) {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const response = await apiFetch(
        `/assembly/${encodeURIComponent(id)}`,
        { method: "GET" },
        true,
      );
      if (!response.ok) {
        setAssembly(null);
        return;
      }
      const body = await response.json().catch(() => ({}));
      const data = body.assembly || body;
      setAssembly(data);
      setAta(data.ata || "");
      setNewStatus(data.status || "Pendente");
    } catch {
      setAssembly(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const user = await getStoredUser();
        if (active) setIsSindico(isManager(user?.role));
      } finally {
        if (active) await fetchAssembly(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function addComment() {
    const text = newComment.trim();
    if (!text || !id) return;
    try {
      const response = await apiFetch(
        `/assembly/${encodeURIComponent(id)}/comments`,
        { method: "POST", body: JSON.stringify({ text }) },
        true,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return alert(
          `Erro - ${body.message || "Não foi possível adicionar o comentário."}`,
        );
      }
      setNewComment("");
      await fetchAssembly();
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível adicionar o comentário.")}`,
      );
    }
  }

  async function addReply(commentId: string) {
    const text = replyText.trim();
    if (!text || !id) return;
    try {
      const response = await apiFetch(
        `/assembly/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}/reply`,
        { method: "POST", body: JSON.stringify({ text }) },
        true,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return alert(
          `Erro - ${body.message || "Não foi possível responder o comentário."}`,
        );
      }
      setReplyText("");
      setReplyingTo(null);
      await fetchAssembly();
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível responder o comentário.")}`,
      );
    }
  }

  async function saveAta() {
    if (!id || !ata.trim()) return alert("Informe a ata da reunião.");
    setSavingAta(true);
    try {
      const response = await apiFetch(
        `/assembly/${encodeURIComponent(id)}`,
        { method: "PUT", body: JSON.stringify({ ata: ata.trim() }) },
        true,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return alert(
          `Erro - ${body.message || "Não foi possível salvar a ata."}`,
        );
      }
      alert("Ata salva com sucesso.");
      await fetchAssembly();
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível salvar a ata.")}`,
      );
    } finally {
      setSavingAta(false);
    }
  }

  async function saveStatus() {
    if (!id) return;
    try {
      const response = await apiFetch(
        `/assembly/${encodeURIComponent(id)}`,
        { method: "PUT", body: JSON.stringify({ status: newStatus }) },
        true,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return alert(
          `Erro - ${body.message || "Não foi possível atualizar o status."}`,
        );
      }
      setStatusModal(false);
      await fetchAssembly();
    } catch (error) {
      alert(
        `Erro - ${getErrorMessage(error, "Não foi possível atualizar o status.")}`,
      );
    }
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  if (!assembly)
    return (
      <View style={styles.centered}>
        <Text>Assembléia não encontrada.</Text>
      </View>
    );

  const date = new Date(assembly.date);
  const occurred =
    !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
  const formattedDate = Number.isNaN(date.getTime())
    ? assembly.date
    : date.toLocaleDateString("pt-BR");
  const comments: AssemblyComment[] = assembly.comments || [];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Assembléia</Text>
      <Text style={styles.date}>{formattedDate}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.status}>{assembly.status}</Text>
        {isSindico && (
          <TouchableOpacity onPress={() => setStatusModal(true)}>
            <Text style={styles.editLink}>✎</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.label}>Descrição:</Text>
      <Text style={styles.body}>{assembly.description}</Text>
      <Text style={styles.label}>Ata da reunião:</Text>
      {isSindico && occurred ? (
        <>
          <TextInput
            style={styles.ataInput}
            value={ata}
            onChangeText={setAta}
            placeholder="Escreva a ata da reunião..."
            multiline
          />
          <TouchableOpacity
            style={styles.saveAta}
            onPress={saveAta}
            disabled={savingAta}
          >
            <Text style={styles.saveAtaText}>
              {savingAta ? "Salvando..." : "Salvar ata"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={assembly.ata ? styles.body : styles.muted}>
          {assembly.ata ||
            "A ata será disponibilizada após a realização da assembléia."}
        </Text>
      )}
      <Text style={styles.label}>Comentários</Text>
      {comments.map((comment) => (
        <View key={comment._id} style={styles.commentCard}>
          <View style={styles.commentTop}>
            <Text style={styles.author}>{authorName(comment.user)}</Text>
            <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          {(comment.replies || []).map((reply) => (
            <View key={reply._id} style={styles.replyCard}>
              <View style={styles.commentTop}>
                <Text style={styles.author}>{authorName(reply.user)}</Text>
                <Text style={styles.time}>{timeAgo(reply.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{reply.text}</Text>
            </View>
          ))}
          {replyingTo === comment._id ? (
            <>
              <TextInput
                style={styles.replyInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Responder..."
                multiline
              />
              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => addReply(comment._id)}
              >
                <Text style={styles.replyButtonText}>Responder</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(comment._id);
                setReplyText("");
              }}
            >
              <Text style={styles.replyLink}>Responder</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TextInput
        style={[styles.newComment, { marginTop: 18 }]}
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Adicionar comentário..."
        multiline
      />
      <TouchableOpacity style={styles.addComment} onPress={addComment}>
        <Text style={styles.addCommentText}>Adicionar Comentário</Text>
      </TouchableOpacity>
      <Modal
        visible={statusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Alterar status</Text>
            {(["Pendente", "Concluída", "Cancelada"] as AssemblyStatus[]).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.option,
                    newStatus === status && styles.optionSelected,
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text>{status}</Text>
                </TouchableOpacity>
              ),
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.action}
                onPress={() => setStatusModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.action, styles.actionPrimary]}
                onPress={saveStatus}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
