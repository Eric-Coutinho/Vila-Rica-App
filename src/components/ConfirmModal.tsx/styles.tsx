import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 22,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },

  modalText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#444",
    marginBottom: 22,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },

  confirmButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: "#466CA5",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});