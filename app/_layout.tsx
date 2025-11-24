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
      <Stack.Screen name="index" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="home" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="login" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="recover" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="code" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="redefine" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="residents" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="register" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="notices" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="create-notice" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />
      <Stack.Screen name="notices/[id]" options={{ title: "Vila Rica Residencial", headerTitleStyle: { fontFamily: "Inter", fontSize: 24, color: "white", fontWeight: 800 } }} />

    </Stack>
  );
}
