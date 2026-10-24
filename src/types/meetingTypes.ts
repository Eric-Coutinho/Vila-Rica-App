export type AssemblyStatus = "Pendente" | "Concluída" | "Cancelada";
export type AssemblyType = "Ordinária" | "Extraordinária";

export type AssemblyReply = {
  _id: string;
  text: string;
  createdAt?: string;
  user?: { name?: string; email?: string } | string;
};

export type AssemblyComment = {
  _id: string;
  text: string;
  createdAt?: string;
  user?: { name?: string; email?: string } | string;
  replies?: AssemblyReply[];
};

export type Assembly = {
  _id: string;
  date: string;
  status: AssemblyStatus;
  description: string;
  type: AssemblyType;
  ata?: string | null;
  comments?: AssemblyComment[];
};
