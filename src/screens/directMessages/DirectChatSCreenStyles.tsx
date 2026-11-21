import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  page: {
    flex: 1,
    width: "90%",
    maxWidth: 540,
    alignSelf: "center",
    paddingTop: 22,
    paddingBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  history: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 8,
    gap: 15,
    paddingBottom: 12,
  },
  header: {
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  line: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  meta: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 19,
    fontWeight: "600",
  },
  card: {
    padding: 10,
    backgroundColor: "#f7f5f5",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 5,
    gap: 10,
  },
  author: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#555",
    flexShrink: 1,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  composer: {
    padding: 12,
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
  },
  managerComposer: {
    gap: 10,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f7f7",
    borderColor: "#d5d5d5",
    borderWidth: 1,
    borderRadius: 5,
  },
  inputBox: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 9,
    marginVertical: 9,
  },
  inputFont: {
    fontSize: 17,
    lineHeight: 22,
    includeFontPadding: false,
  },
  measure: { opacity: 0 },
  input: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    padding: 0,
    textAlignVertical: "top",
  },
  sendIcon: { padding: 10 },
  button: {
    backgroundColor: "#466CA5",
    padding: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  error: {
    color: "#9b2730",
    marginVertical: 5,
  },
});
