export interface LegalDocumentData {
  description?: string | null;
}

export interface LegalDocumentResponse {
  success: boolean;
  message?: string;
  data: LegalDocumentData | null;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

export type ConsumerRequestType = "arrepentimiento" | "baja";

export type ConsumerPaymentMethod = "paypal" | "mercadopago" | "otro";

export interface ConsumerRequestPayload {
  tipo: ConsumerRequestType;
  nombre: string;
  email: string;
  idioma: "es" | "en";
  medioPago?: ConsumerPaymentMethod;
  operacion?: string;
  comentario?: string;
}

export interface ConsumerRequestResult {
  codigo: string;
  tipo: ConsumerRequestType;
  fecha: string;
}
