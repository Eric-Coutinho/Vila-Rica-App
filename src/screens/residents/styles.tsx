import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  registerButton: {
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  selectBox: {
    width: "48%",
  },
  selectLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  selectTouchable: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  selectText: {
    fontSize: 14,
  },
  nameInput: {
    width: "100%",
    fontSize: 16,
    textAlign: "left",
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  moradorCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  cardSmall: {
    fontSize: 13,
    marginBottom: 6,
    color: "#333",
  },

  cardButton: {
    marginTop: 8,
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyBox: {
    padding: 18,
    alignItems: "center",
  },
});
