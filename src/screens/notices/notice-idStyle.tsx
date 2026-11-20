import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSmall: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRowStatus: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#fff",
    fontWeight: "700",
    marginRight: 8,
  },

  pencilBtn: {
    marginLeft: 6,
  },

  pencilText: {
    fontSize: 18,
  },

  dateText: {
    color: "#333",
    marginTop: 6,
    fontSize: 16,
  },

  label: {
    fontWeight: "700",
    marginTop: 12,
    fontSize: 16,
  },

  description: {
    marginTop: 6,
    color: "#222",
    fontSize: 16,
  },

  commentCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  commentAuthor: {
    fontWeight: "700",
  },

  commentTime: {
    color: "#777",
  },

  commentText: {
    marginTop: 8,
  },

  replyCard: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "#f7f7f7",
    borderRadius: 6,
  },

  replyInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },

  replyBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#466CA5",
    borderRadius: 6,
  },

  newCommentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
    marginTop: 10,
  },

  addCommentBtn: {
    marginTop: 8,
    backgroundColor: "#466CA5",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },

  statusOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginTop: 8,
  },

  statusOptionSelected: {
    borderColor: "#466CA5",
    backgroundColor: "#eef6ff",
  },

  modalBtn: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
});
