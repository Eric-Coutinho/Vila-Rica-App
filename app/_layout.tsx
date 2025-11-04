import { Stack } from "expo-router";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="index" options={{ title: "Vila Rica Residencial"}} /> {/* Criar rota */}
        <Stack.Screen name="home" options={{ title: "Vila Rica Residencial"}} />
      </Stack>
    );
}
