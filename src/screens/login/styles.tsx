import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBlock: 50,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 50,
  },
  form: {
    width: "85%",
    marginTop: 18,
  },
  label: {
    fontSize: 20,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
    fontSize: 22,
  },
  forgotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 19,
  },
  forgotLink: {
    marginLeft: 6,
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 19,
  },

  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: "#466CA5",
    marginTop: 48,
  },
  buttonDanger: {
    backgroundColor: "#b85a56",
    marginTop: 48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "500",
  },
  loadingOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  justifyContent: "center",
  alignItems: "center",
},

loadingBox: {
  width: 220,
  paddingVertical: 25,
  paddingHorizontal: 20,
  borderRadius: 12,
  backgroundColor: "#fff",
  alignItems: "center",
  justifyContent: "center",
},

loadingText: {
  marginTop: 15,
  fontSize: 18,
  fontWeight: "500",
  textAlign: "center",
}
});
