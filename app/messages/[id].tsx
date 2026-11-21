import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import DirectChatScreen from "../../src/screens/directMessages/DirectChatScreen";

export default function ReceivedChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id))
    return <Text>Conversa inválida.</Text>;
  return <DirectChatScreen key={id} participantId={id} />;
}
