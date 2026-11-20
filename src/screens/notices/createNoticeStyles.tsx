import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  formCard: {
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

  input: {
    width: "100%",
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    marginBottom: 16,
  },

  inputReferente: {
    width: "100%",
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    marginBlock: 8,
  },

  textarea: {
    height: 120,
    textAlignVertical: "top",
  },

  dateInput: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },

  webDateInput: {
    boxSizing: "border-box",
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#747474",
    borderRadius: 4,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: 8
  },
  selectElement: {
    padding: 8,
    fontSize: 16,
    color: "#9b9b9b",
  },

  refRow: {
    marginTop: 6,
  },

  addRefBtn: {
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addRefBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  viewRefsBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  viewRefsText: {
    color: "#466CA5",
    fontWeight: "700",
  },

  refChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  refChipText: {
    color: "#333",
  },
  refRemove: {
    color: "#a33",
    fontWeight: "700",
  },

  createBtn: {
    marginTop: 12,
    backgroundColor: "#466CA5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#a33",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  bellFab: {
    position: "absolute",
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#343346",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  bellIcon: {
    color: "#fff",
    fontSize: 20,
  },
});
