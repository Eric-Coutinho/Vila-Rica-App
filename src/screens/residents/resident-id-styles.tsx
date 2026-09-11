import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginVertical: 22,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  formCard: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
    borderColor: "#e2e2e2",
    borderWidth: 1,
  },

  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
    height: 115,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 8,
    borderColor: "#292D32",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  editAvatarButton: {
    position: "absolute",
    right: "29%",
    bottom: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    fontSize: 16,
  },

  required: {
    color: "red",
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
    color: "#222",
  },

  fieldWithIcon: {
    position: "relative",
    width: "100%",
  },

  inputIcon: {
    position: "absolute",
    right: 8,
    top: 13,
  },

  lastAccessLabel: {
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
  },

  lastAccessValue: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
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
    fontSize: 16,
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
    fontSize: 16,
  },
// Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#444",
  },
    pickerWrapper: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  selectElement: {
    padding: 8,
    fontSize: 16,
    color: "#9b9b9b",
  },
    dateInput: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
});