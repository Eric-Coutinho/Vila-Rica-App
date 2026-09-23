import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  page: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 28,
    paddingBottom: 40,
  },

  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  headerTitle: {
    color: "#000",
    fontSize: 29,
    lineHeight: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  statusDot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    marginLeft: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.12)",
  },

  cancelReservationButton: {
    width: "78%",
    maxWidth: 360,
    minHeight: 51,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b44c49",
    borderRadius: 8,
    marginBottom: 24,
  },

  cancelReservationButtonText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "500",
  },

  informationRow: {
    width: "78%",
    maxWidth: 360,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  informationColumn: {
    width: "48%",
  },

  informationLabel: {
    color: "#111",
    fontSize: 18,
    lineHeight: 25,
  },

  informationText: {
    color: "#111",
    fontSize: 18,
    lineHeight: 26,
  },

  occasionContainer: {
    width: "78%",
    maxWidth: 360,
    alignSelf: "center",
    marginTop: 13,
  },

  filterContainer: {
    width: "100%",
    marginTop: 30,
  },

  filterLabel: {
    color: "#111",
    fontSize: 15,
    marginBottom: 2,
  },

  filterInput: {
    width: "100%",
    height: 34,
    paddingHorizontal: 7,
    paddingVertical: Platform.OS === "web" ? 4 : 2,
    color: "#111",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#929292",
    borderRadius: 4,
    fontSize: 18,
  },

  guestsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },

  guestCard: {
    width: "48%",
    minHeight: 127,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dedede",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 9,
    marginBottom: 21,
  },

  guestName: {
    color: "#111",
    fontSize: 18,
    lineHeight: 23,
    textAlign: "center",
  },

  guestInformation: {
    color: "#111",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
  },

  emptyScreen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  loadingBox: {
    width: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  loadingText: {
    marginTop: 15,
    color: "#222",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalBox: {
    width: "100%",
    maxWidth: 420,
    padding: 22,
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  modalTitle: {
    color: "#222",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
  },

  modalMessage: {
    color: "#444",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 22,
  },

  modalButton: {
    minWidth: 110,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#466CA5",
    borderRadius: 6,
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});