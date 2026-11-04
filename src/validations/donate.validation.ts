import { z } from "zod";

export const donateSchema = z.object({
  amount: z.number().min(1, { error: "Amount must be at least $1" }),
  provider: z.enum(["paypal", "mercadopago"]).optional(),
});

export type DonateSchemaType = z.infer<typeof donateSchema>;
