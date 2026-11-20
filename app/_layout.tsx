import { Inter_400Regular } from "@expo-google-fonts/inter";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppFeedbackProvider, {
  useAppDialog,
} from "../src/components/AppFeedbackProvider";
import { clearSession } from "../src/services/session";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  function LogoutButton() {
    const router = useRouter();
    const { showDialog } = useAppDialog();

    const handleLogout = async () => {
      const confirmLogout = async () => {
        try {
          await clearSession();
          router.replace("/");
        } catch {
          showDialog({
            title: "Erro",
            text: "Não foi possível encerrar a sessão.",
            showCancel: false,
            confirmText: "OK",
          });
        }
      };

      showDialog({
        title: "Sair",
        text: "Deseja realmente sair?",
        cancelText: "Cancelar",
        confirmText: "Sair",
        showCancel: true,
        onConfirm: () => void confirmLogout(),
      });
    };

    return (
      <Pressable
        onPress={handleLogout}
        style={{
          marginRight: 16,
          padding: 6,
        }}
        accessibilityLabel="Sair"
      >
        <MaterialIcons name="logout" size={27} color="white" />
      </Pressable>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppFeedbackProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#343346" },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
              headerRight: () => <LogoutButton />,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="2fa"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="recover"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="code"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="redefine"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="entrance"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                fontWeight: "800",
              },
            }}
          />
          <Stack.Screen
            name="register-porter"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                fontWeight: "800",
              },
            }}
          />
          <Stack.Screen
            name="residents"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="notices"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="meetings"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-meeting"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="meetings/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-notice"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="residents/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="residents/import"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="notices/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="party-saloon"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="moving"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-moving-reservation"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="moving/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-party-saloon-reservation"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="party-saloon/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="chatbot"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="support/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="complaints"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-complaint"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="complaints/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="deliveries"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="create-delivery"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
          <Stack.Screen
            name="deliveries/[id]"
            options={{
              title: "Vila Rica Residencial",
              headerTitleStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              },
            }}
          />
        </Stack>
      </AppFeedbackProvider>
    </GestureHandlerRootView>
  );
}
