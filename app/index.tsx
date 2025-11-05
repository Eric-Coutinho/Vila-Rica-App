import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Image
          source={require("../assets/images/Vila Rica.jpeg")}
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
            source={require("../assets/images/mapa.png")}
            style={styles.image}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "10%",
  },
  titleText: {
    fontFamily: "Inter",
    fontSize: 30,
    display: "flex",
    padding: 10,
    justifyContent: "center",
    textAlign: "center",
    fontWeight: 600,
  },
  buttonLogin: {
    marginTop: 20,
    paddingBlock: 10,
    paddingHorizontal: 5,
    backgroundColor: "#466CA5",
    borderRadius: 5,
    color: "white",
    display: "flex",
    justifyContent: "center",
    width: "80%",
    fontSize: 30,
    fontWeight: 600,
  },
  buttonConhecer: {
    marginTop: 20,
    paddingBlock: 10,
    paddingHorizontal: 5,
    backgroundColor: "#BD3808",
    borderRadius: 5,
    color: "white",
    display: "flex",
    justifyContent: "center",
    width: "80%",
    fontSize: 30,
    fontWeight: 600,
  },
  banner: {
    width: "100%",
    height: "30%",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "fill",
  },
  mapa: {
    marginTop: 20,
    padding: 20,
    textAlign: "left"
  },
  mapaImagem: {
    display: 'flex',
    width: "100%",
    height: "800%",
    marginTop: 10,
  }
});
