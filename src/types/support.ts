export type SupportHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type SupportAction = {
  label: string;
  route: string;
};

export type SupportChatResponse = {
  answer: string;
  sources: string[];
  suggestedAction?: SupportAction;
};
