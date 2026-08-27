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
    fontWeight: "600",
    fontSize: 17,
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
    fontSize: 17
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
    fontSize: 17,
  },
  nameInput: {
    width: "100%",
    fontSize: 17,
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  cardSmall: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
  },

  cardButton: {
    marginTop: 8,
    backgroundColor: "#466CA5",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  cardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  emptyBox: {
    padding: 18,
    alignItems: "center",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: "#b85a56",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  modalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#777",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#b85a56",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmDeleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
