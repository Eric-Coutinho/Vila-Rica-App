import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  /*
   * TELA DO MORADOR
   */

  residentPage: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    backgroundColor: "#fff",
  },

  residentContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    alignItems: "center",
  },

  residentMascot: {
    width: 175,
    height: 175,
  },

  greeting: {
    color: "#050505",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    textAlign: "center",
    marginTop: -6,
  },

  chatPositioner: {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 20,
  alignItems: "center",
},

chatContainer: {
  width: "100%",
  maxWidth: 600,
  minHeight: 350,
  padding: 14,
  backgroundColor: "#dedede",
  borderRadius: 6,
  flexShrink: 1,
  overflow: "hidden",

  elevation: 7,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowRadius: 6,
},

  quickQuestionsCard: {
    width: "100%",
    paddingHorizontal: 9,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    flexShrink: 0,
  },

  chatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  chatTitle: {
    color: "#111",
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 9,
  },

  commonQuestionsTitle: {
    color: "#111",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 8,
  },

  quickQuestionButton: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    paddingRight: 5,
  },

  questionBullet: {
    width: 20,
    color: "#2525ff",
    fontSize: 18,
    textAlign: "center",
  },

  quickQuestionText: {
    flex: 1,
    color: "#2525ff",
    fontSize: 16,
    lineHeight: 21,
    textDecorationLine: "underline",
  },

  /*
   * Somente essa região recebe scroll quando as mensagens
   * ultrapassam o espaço disponível.
   */
  messagesScroll: {
    flexShrink: 1,
    minHeight: 0,
    marginTop: 12,
  },

  messagesContent: {
    paddingTop: 2,
    paddingBottom: 4,
  },

  messageBubble: {
    maxWidth: "84%",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 14,
    marginBottom: 10,
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4a75b5",
    borderBottomRightRadius: 4,
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  userMessageText: {
    color: "#fff",
  },

  botMessageText: {
    color: "#222",
  },

  messageDate: {
    alignSelf: "flex-end",
    marginTop: 5,
    fontSize: 10,
  },

  userMessageDate: {
    color: "#e1e9f5",
  },

  botMessageDate: {
    color: "#777",
  },

  /*
   * flexShrink: 0 mantém o campo de mensagem sempre visível.
   */
  messageInputContainer: {
    width: "100%",
    minHeight: 57,
    maxHeight: 105,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 12,
    paddingLeft: 9,
    paddingRight: 7,
    backgroundColor: "#fafafa",
    borderRadius: 4,
  },

  messageInput: {
    flex: 1,
    maxHeight: 90,
    paddingVertical: Platform.OS === "web" ? 13 : 8,
    color: "#222",
    fontSize: 18,
    textAlignVertical: "center",
  },

  sendButton: {
    width: 47,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * TELA DO SÍNDICO/ADMINISTRADOR
   */

  supportPage: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 18,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },

  supportContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    alignItems: "center",
  },

  supportMascot: {
    width: 145,
    height: 145,
  },

  supportTitle: {
    color: "#111",
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },

  filtersRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  filterColumn: {
    width: "47%",
  },

  filterLabel: {
    color: "#111",
    fontSize: 14,
    marginBottom: 2,
  },

  dateInput: {
    width: "100%",
    height: 38,
    paddingHorizontal: 6,
    color: "#111",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#929292",
    borderRadius: 4,
    fontSize: 17,
  },

  pickerContainer: {
    width: "100%",
    height: 38,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#929292",
    borderRadius: 4,
  },

  picker: {
    width: "100%",
    height: 38,
    color: "#111",
    fontSize: 16,
  },

  supportList: {
    width: "100%",
    marginTop: 22,
  },

  supportCard: {
    width: "100%",
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 19,
  },

  supportCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  supportCardId: {
    color: "#111",
    fontSize: 21,
    fontWeight: "500",
  },

  supportStatusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },

  supportCardDate: {
    color: "#111",
    fontSize: 17,
    textAlign: "center",
    marginTop: 8,
  },

  supportCardQuestion: {
    minHeight: 48,
    color: "#111",
    fontSize: 17,
    lineHeight: 21,
    marginTop: 8,
  },

  viewChatButton: {
    width: "100%",
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a75b5",
    borderRadius: 7,
    marginTop: 8,
  },

  viewChatButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },

  emptySupport: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptySupportText: {
    color: "#555",
    fontSize: 16,
  },

  floatingChatButton: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#343346",
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#d2d2d2",

    elevation: 7,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
  },
});