import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  page: {
    width: "82%",
    maxWidth: 500,
    alignSelf: "center",
    paddingVertical: 32,
    gap: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 29,
    fontWeight: "700",
  },
  filters: {
    gap: 12,
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: "#f7f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    gap: 10,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
  dot: {
    borderRadius: 10,
    width: 17,
    height: 17,
  },
  yellow: {
    backgroundColor: "#ffda00",
  },
  green: {
    backgroundColor: "#23cb34",
  },
  center: {
    textAlign: "center",
    fontSize: 16,
  },
  info: {
    fontSize: 17,
  },
  button: {
    backgroundColor: "#466CA5",
    padding: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
  },
  error: {
    color: "#9b2730",
  },
});
