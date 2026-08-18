import { Platform, StyleSheet } from "react-native";

const BOX_SIZE = 44;

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
    textAlign: "center",
    marginBottom: 32,
  },
  subtitle: {
    width: "85%",
    fontSize: 22,
    fontWeight: "500",
    textAlign: "justify",
    marginBottom: 20,
  },
  email: {
    fontWeight: "700",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginBlock: 50,
    paddingHorizontal: 4,
  },
  codeInput: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 6,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  button: {
    width: "85%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: "#4b77b9",
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
});