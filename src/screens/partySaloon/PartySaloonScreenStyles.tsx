import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#333",
    fontSize: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  newNoticeButton: {
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  newNoticeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputSmallWrap: {
    flex: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  inputSmallWrapLast: {
    flex: 1,
    marginBottom: 8,
  },
  smallLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  smallInput: {
    width: "100%",
    fontSize: 14,
    backgroundColor: "white",
    borderColor: "#747474",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    backgroundColor: "#fff",
    height: 39,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 39,
  },

  avisoCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
  },
  avisoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avisoTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    textAlign: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
    marginTop: 4,
  },
  avisoDate: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  avisoRef: {
    fontSize: 16,
    color: "#333",
    marginTop: 6,
    marginBottom: 8,
  },

  cardButton: {
    marginTop: 6,
    backgroundColor: "#466CA5",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    paddingHorizontal: 18,
    width: "100%",
  },
  cardButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyBox: {
    padding: 18,
    alignItems: "center",
  },
  listContainer: {
    marginTop: 22,
  },
  errorText: {
    color: "#b42318",
    fontSize: 15,
    textAlign: "center",
    marginTop: 18,
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
