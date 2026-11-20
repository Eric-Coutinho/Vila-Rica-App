import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

import { styles } from "./styles";

type LoadingModalProps = {
  visible: boolean;
  text?: string;
};

export default function LoadingModal({
  visible,
  text = "Aguarde um momento...",
}: LoadingModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#466CA5" />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}
