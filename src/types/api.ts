export type ApiUser = {
  _id: string;
  email: string;
  name?: string;
  bloco?: string;
  apartamento?: string;
  relacao?: string;
  cpf?: string;
  telefone?: string;
  birthDate?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SessionUser = Pick<ApiUser, "_id" | "name" | "role">;

export type ApiMessageResponse = {
  ok: true;
  message?: string;
};

export type VerifyTwoFactorResponse = ApiMessageResponse & {
  accessToken: string;
  user: ApiUser;
};

