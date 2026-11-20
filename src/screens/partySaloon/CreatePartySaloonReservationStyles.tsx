import {
  Platform,
  StyleSheet,
} from "react-native";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  formCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",

    borderRadius: 8,
    padding: 12,

    backgroundColor: "#fafafa",

    borderColor: "#e2e2e2",
    borderWidth: 1,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  required: {
    color: "#cc0000",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },

  input: {
    width: "100%",

    fontSize: 16,

    backgroundColor: "#fff",

    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,

    paddingHorizontal: 8,
    paddingVertical:
      Platform.OS === "web" ? 8 : 9,

    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  rowItem: {
    flex: 1,
  },

  dateInput: {
    width: "100%",

    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,

    paddingVertical: 10,
    paddingHorizontal: 8,

    backgroundColor: "#fff",

    marginBottom: 16,

    minHeight: 40,
    justifyContent: "center",
  },

  webInput: {
    boxSizing: "border-box",

    width: "100%",
    height: 40,

    padding: 8,

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#747474",
    borderRadius: 4,

    backgroundColor: "#fff",

    fontSize: 16,

    marginBottom: 16,
  },

  addGuestButton: {
    width: "100%",

    backgroundColor: "#466CA5",

    paddingVertical: 11,

    borderRadius: 6,

    alignItems: "center",

    marginBottom: 12,
  },

  addGuestButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  guestsContainer: {
    width: "100%",

    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 4,

    backgroundColor: "#fff",

    overflow: "hidden",

    marginBottom: 4,
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#f0f0f0",

    borderBottomWidth: 1,
    borderBottomColor: "#bdbdbd",

    paddingVertical: 7,
    paddingHorizontal: 5,
  },

  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 8,
    paddingHorizontal: 5,

    borderBottomWidth: 1,
    borderBottomColor: "#e2e2e2",
  },

  tableText: {
    fontSize: 11,
    color: "#333",
    paddingRight: 4,
  },

  nameColumn: {
    flex: 1.5,
  },

  cpfColumn: {
    flex: 1.2,
  },

  dateColumn: {
    flex: 1,
  },

  removeColumn: {
    width: 30,

    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: "#a33",
    fontSize: 16,
    fontWeight: "700",
  },

  emptyGuests: {
    paddingVertical: 20,
    alignItems: "center",
  },

  emptyGuestsText: {
    color: "#777",
    fontSize: 13,
  },

  confirmButton: {
    width: "100%",
    maxWidth: 700,

    alignSelf: "center",

    marginTop: 14,

    backgroundColor: "#466CA5",

    paddingVertical: 12,

    borderRadius: 8,

    alignItems: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelButton: {
    width: "100%",
    maxWidth: 700,

    alignSelf: "center",

    marginTop: 10,

    backgroundColor: "#a33",

    paddingVertical: 12,

    borderRadius: 8,

    alignItems: "center",
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },
});