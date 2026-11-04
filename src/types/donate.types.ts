export interface DonatePayload {
  amount: number;
  provider?: "paypal" | "mercadopago";
}

export interface DonateResponse {
  url?: string;
  id?: string;
  preferenceId?: string;
}

