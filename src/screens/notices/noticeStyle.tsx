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
    width: "49%",
    marginRight: 8,
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
  selectSmall: {
    borderWidth: 1,
    borderColor: "#747474",
    borderRadius: 4,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  selectSmallText: {
    color: "#000",
    fontSize: 14,
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
