export type ComplaintStatus = "created" | "under_review" | "closed";

export type ComplaintPerson = {
  id: string;
  name: string;
};

export type ComplaintApartment = {
  id: string;
  bloco: string;
  apartamento: string;
};

export type ComplaintInvolved = {
  residents: ComplaintPerson[];
  apartments: ComplaintApartment[];
};

export type ComplaintMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "resident" | "manager";
  text: string;
  createdAt: string;
};

export type Complaint = {
  id: string;
  number: string;
  title: string;
  description: string;
  occurrenceDate: string;
  createdAt: string;
  status: ComplaintStatus;
  createdBy: ComplaintPerson & {
    bloco: string;
    apartamento: string;
  };
  involved: ComplaintInvolved;
  messages: ComplaintMessage[];
  useDefaultContact: boolean;
  contactEmail?: string;
  contactPhone?: string;
  mine?: boolean;
};

export type CreateComplaintInput = Pick<
  Complaint,
  | "title"
  | "description"
  | "occurrenceDate"
  | "involved"
  | "useDefaultContact"
  | "contactEmail"
  | "contactPhone"
> & {
  createdBy: Complaint["createdBy"];
};

export const COMPLAINT_STATUS_LABEL: Record<ComplaintStatus, string> = {
  created: "Criada",
  under_review: "Em análise",
  closed: "Encerrada",
};

export const COMPLAINT_STATUS_COLOR: Record<ComplaintStatus, string> = {
  created: "#20df25",
  under_review: "#ffe600",
  closed: "#ff1010",
};
