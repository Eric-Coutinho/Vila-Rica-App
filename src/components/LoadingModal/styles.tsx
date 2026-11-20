import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  box: {
    minWidth: 210,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  text: {
    marginTop: 14,
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
