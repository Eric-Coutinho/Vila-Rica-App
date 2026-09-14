import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./styles";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
};

export default function ConfirmModal({
  visible,
  title,
  text,
  onCancel,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>
            {title}
          </Text>

          <Text style={styles.modalText}>
            {text}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
