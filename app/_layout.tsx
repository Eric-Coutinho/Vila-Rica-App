import { Inter_400Regular } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#343346' }, headerTintColor: 'white' }}>
        <Stack.Screen name="index" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} /> {/* Criar rota */}
        <Stack.Screen name="home" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800} }} />
        <Stack.Screen name="login" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800} }} />
        <Stack.Screen name="recover" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800} }} />
      </Stack>
    );
}
