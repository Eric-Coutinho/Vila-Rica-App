import type { CSSProperties } from "react";
import { StyleSheet } from "react-native";

export const webClock: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minWidth: 0,
  minHeight: 40,
  border: "1px solid #747474",
  borderRadius: 5,
  padding: "4px 8px",
  background: "white",
  color: "#222",
  fontSize: 16,
};
export const styles = StyleSheet.create({
  editor: { gap: 10 },
  title: { fontSize: 17, fontWeight: "600" },
  group: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: { fontWeight: "600", fontSize: 16 },
  action: { color: "#375c95", fontWeight: "600" },
  times: { flexDirection: "row", gap: 10 },
  field: { flex: 1, minWidth: 0, gap: 4 },
  control: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#747474",
  },
  days: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  day: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#758295",
    borderRadius: 5,
    backgroundColor: "white",
  },
  selected: { backgroundColor: "#466CA5", borderColor: "#466CA5" },
  light: { color: "white" },
  add: {
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#466CA5",
    borderRadius: 6,
  },
});
