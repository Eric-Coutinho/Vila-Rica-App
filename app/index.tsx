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
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <Link href="/home" style={styles.button}>
          Ir para a home
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {

  },
  body: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  banner: {
    maxWidth: 1000
  },
  image: {
    width: 500,
    height: 200,
    objectFit: "fill",
  },
});
