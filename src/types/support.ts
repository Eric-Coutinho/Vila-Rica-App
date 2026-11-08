export type SupportMessageAuthor = "resident" | "assistant" | "manager";
export type SupportCaseStatus = "in_analysis" | "resolved" | "closed";

export type SupportAction = {
  label: string;
  route: string;
};

export type SupportMessage = {
  id: string;
  author: SupportMessageAuthor;
  text: string;
  sources: string[];
  suggestedAction?: SupportAction;
  createdAt: string;
};

export type SupportConversation = {
  id: string;
  caseNumber: number;
  status: SupportCaseStatus | null;
  resident: {
    name?: string;
    bloco?: string;
    apartamento?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  firstQuestion: string;
  messages: SupportMessage[];
};

export type SupportChatResponse = {
  answer: string;
  sources: string[];
  suggestedAction?: SupportAction;
  conversation: SupportConversation;
};
