import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { styles } from "./styles";

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Image
          source={require("../../../assets/images/Vila Rica.jpeg")}
          style={styles.image}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.titleText}>
          Bem vindo à página do morador do Vila Rica!
        </Text>
        <Link href="/login" style={styles.buttonLogin}>
          Sou Morador
        </Link>
        <Link href="/home" style={styles.buttonConhecer}>
          Quero Conhecer
        </Link>
      </View>
      <View style={styles.mapa}>
        <Text style={{ fontWeight: 600, fontSize: 20 }}>Como chegar</Text>
        <View style={styles.mapaImagem}>
          <Image
            source={require("../../../assets/images/mapa.png")}
            style={styles.image}
          />
        </View>
      </View>
    </View>
  );
}

