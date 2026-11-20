export type DeliveryStatus =
  | "at_reception"
  | "received"
  | "under_review"
  | "resolved";

export type DeliveryResident = { id: string; name: string };
export type DeliveryApartment = { bloco: string; apartamento: string };
export type DeliveryMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "resident" | "manager";
  text: string;
  createdAt: string;
};

export type Delivery = {
  id: string;
  number: string;
  status: DeliveryStatus;
  deliveredAt: string;
  sender: string;
  recipientApartment: DeliveryApartment;
  recipientResident: DeliveryResident | null;
  receivedAt: string | null;
  receivedBy: DeliveryResident | null;
  porter: DeliveryResident | null;
  hasComplaint: boolean;
  createdAt: string;
  complaint?: {
    description: string;
    createdAt: string;
    messages: DeliveryMessage[];
  } | null;
};

export type DeliveryFilters = {
  date?: string;
  status?: DeliveryStatus;
  number?: string;
  bloco?: string;
  apartamento?: string;
};

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  at_reception: "Na portaria",
  received: "Recebido",
  under_review: "Em análise com o síndico",
  resolved: "Resolvido",
};

export const DELIVERY_STATUS_COLOR: Record<DeliveryStatus, string> = {
  at_reception: "#ffad00",
  received: "#20df25",
  under_review: "#ffe600",
  resolved: "#20df25",
};
