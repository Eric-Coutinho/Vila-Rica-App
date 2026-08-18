import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Alert, Pressable } from "react-native";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { MaterialIcons } from "@expo/vector-icons";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const confirmLogout = () => {
      AsyncStorage.removeItem("user")
        .then(() => {
          if (typeof localStorage !== "undefined") {
            try {
              localStorage.removeItem("user");
            } catch (err) {
              console.warn("Erro ao limpar localStorage:", err);
            }
          }

          router.replace("/");
        })
        .catch((err) => {
          console.error("Erro ao fazer logout:", err);
        });
    };

    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Deseja realmente sair?");
      if (confirmed) {
        confirmLogout();
      }
      return;
    }

    Alert.alert(
      "Sair",
      "Deseja realmente sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: confirmLogout,
        },
      ]
    );
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
      <MaterialIcons
        name="logout"
        size={27}
        color="white"
      />
    </Pressable>
  );
}

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
      </Stack>
    </GestureHandlerRootView>
  );
}