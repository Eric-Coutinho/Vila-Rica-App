export type ComplaintStatus = "created" | "under_review" | "closed";

export type ComplaintPerson = {
  id: string;
  _id?: string;
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
  _id?: string;
  authorId: string;
  authorName: string;
  authorRole: "resident" | "manager";
  text: string;
  createdAt: string;
};

export type ComplaintSummary = {
  id: string;
  _id?: string;
  number: string;
  title: string;
  occurrenceDate: string;
  status: ComplaintStatus;
  createdBy: ComplaintPerson;
  createdAt: string;
  updatedAt: string;
};

export type Complaint = ComplaintSummary & {
  description: string;
  createdBy: ComplaintPerson & {
    bloco: string;
    apartamento: string;
  };
  involved: ComplaintInvolved;
  messages: ComplaintMessage[];
  useDefaultContact: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export type CreateComplaintInput = {
  title: string;
  description: string;
  occurrenceDate: string;
  involved: ComplaintInvolved;
  useDefaultContact: boolean;
  contactEmail?: string;
  contactPhone?: string;
};

export type ComplaintListFilters = {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  date?: string;
  number?: string;
  title?: string;
  resident?: string;
};

export type ComplaintPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ComplaintResidentOption = ComplaintPerson & {
  bloco?: string;
  apartamento?: string;
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
