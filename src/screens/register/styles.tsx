import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
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
    marginTop: 8,
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
    paddingVertical: 8,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  dateInput: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },

  registerButton: {
    marginTop: 14,
    backgroundColor: "#466CA5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 10,
    backgroundColor: "#a33",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
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
  selectElement: {
    padding: 8,
    fontSize: 16,
    color: "#9b9b9b",
  },
});
