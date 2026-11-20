import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    backgroundColor: "#F47D15",
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
