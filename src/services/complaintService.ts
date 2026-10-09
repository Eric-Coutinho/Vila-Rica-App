import type {
  Complaint,
  ComplaintMessage,
  ComplaintStatus,
  CreateComplaintInput,
} from "../types/complaint";

// Enquanto a API de reclamações não estiver pronta, as telas usam este
// repositório em memória. Depois, somente as funções deste arquivo precisam
// ser trocadas por apiFetch; os componentes podem permanecer iguais.
let complaints: Complaint[] = [
  {
    id: "complaint-2131239231",
    number: "#2131239231",
    title: "Crianças correndo no pátio após as 22h",
    description:
      "Ontem por volta das 22 horas vi algumas crianças correndo no pátio, algumas delas estavam gritando, mas não consegui ver os rostos.",
    occurrenceDate: "2024-10-07T12:00:00.000Z",
    createdAt: "2024-10-07T12:00:00.000Z",
    status: "created",
    createdBy: {
      id: "current-resident",
      name: "Morador",
      bloco: "7",
      apartamento: "23",
    },
    involved: {
      residents: [
        { id: "resident-1", name: "Morador 1" },
        { id: "resident-2", name: "Morador 2" },
        { id: "resident-3", name: "Morador 3" },
      ],
      apartments: [
        { id: "apartment-23-7", apartamento: "23", bloco: "7" },
        { id: "apartment-24-7", apartamento: "24", bloco: "7" },
      ],
    },
    messages: [
      {
        id: "message-1",
        authorId: "manager-1",
        authorName: "Síndico",
        authorRole: "manager",
        text: "Vamos checar nas câmeras quais são as crianças e logo em seguida advertir seus responsáveis.\n\nObrigado pelo aviso.",
        createdAt: "2024-10-07T15:00:00.000Z",
      },
    ],
    useDefaultContact: true,
    mine: true,
  },
  {
    id: "complaint-2131239232",
    number: "#2131239232",
    title: "Barulho excessivo no apartamento vizinho",
    description:
      "O apartamento vizinho está com música alta durante a madrugada.",
    occurrenceDate: "2024-10-09T02:00:00.000Z",
    createdAt: "2024-10-09T09:00:00.000Z",
    status: "under_review",
    createdBy: {
      id: "current-resident",
      name: "Morador",
      bloco: "7",
      apartamento: "23",
    },
    involved: {
      residents: [],
      apartments: [
        { id: "apartment-24-7", apartamento: "24", bloco: "7" },
      ],
    },
    messages: [],
    useDefaultContact: true,
    mine: true,
  },
  {
    id: "complaint-2131239233",
    number: "#2131239233",
    title: "Portão da garagem aberto",
    description:
      "O portão da garagem permaneceu aberto por um período longo durante a noite.",
    occurrenceDate: "2024-10-12T23:00:00.000Z",
    createdAt: "2024-10-13T08:00:00.000Z",
    status: "closed",
    createdBy: {
      id: "current-resident",
      name: "Morador",
      bloco: "7",
      apartamento: "23",
    },
    involved: { residents: [], apartments: [] },
    messages: [],
    useDefaultContact: true,
    mine: true,
  },
  {
    id: "complaint-2131239234",
    number: "#2131239234",
    title: "Objeto deixado no corredor",
    description: "Há um objeto bloqueando parte do corredor do terceiro andar.",
    occurrenceDate: "2024-10-14T10:00:00.000Z",
    createdAt: "2024-10-14T10:30:00.000Z",
    status: "under_review",
    createdBy: {
      id: "resident-4",
      name: "Morador 4",
      bloco: "3",
      apartamento: "12",
    },
    involved: { residents: [], apartments: [] },
    messages: [],
    useDefaultContact: false,
    contactEmail: "morador4@example.com",
    contactPhone: "41912345678",
    mine: false,
  },
];

const cloneComplaint = (complaint: Complaint): Complaint =>
  JSON.parse(JSON.stringify(complaint)) as Complaint;

export async function listComplaints(options: {
  manager: boolean;
}): Promise<Complaint[]> {
  const visible = options.manager
    ? complaints
    : complaints.filter((complaint) => complaint.mine);

  return visible.map(cloneComplaint);
}

export async function getComplaintById(
  id: string,
): Promise<Complaint | null> {
  const complaint = complaints.find((item) => item.id === id);
  return complaint ? cloneComplaint(complaint) : null;
}

export async function createComplaint(
  input: CreateComplaintInput,
): Promise<Complaint> {
  const numericPart = String(Date.now()).slice(-10);
  const complaint: Complaint = {
    ...input,
    id: `complaint-${numericPart}`,
    number: `#${numericPart}`,
    createdAt: new Date().toISOString(),
    status: "created",
    messages: [],
    mine: true,
  };

  complaints = [complaint, ...complaints];
  return cloneComplaint(complaint);
}

export async function addComplaintMessage(
  complaintId: string,
  message: Omit<ComplaintMessage, "id" | "createdAt">,
): Promise<ComplaintMessage> {
  const complaint = complaints.find((item) => item.id === complaintId);
  if (!complaint) throw new Error("Reclamação não encontrada.");

  const created: ComplaintMessage = {
    ...message,
    id: `message-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  complaint.messages.push(created);
  return { ...created };
}

export async function updateComplaintStatus(
  complaintId: string,
  status: Exclude<ComplaintStatus, "created">,
): Promise<Complaint> {
  const complaint = complaints.find((item) => item.id === complaintId);
  if (!complaint) throw new Error("Reclamação não encontrada.");

  complaint.status = status;
  return cloneComplaint(complaint);
}
