import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name is too long" }),
  email: z
    .email({ error: "Invalid email address" })
    .max(254, { error: "Email is too long" }),
  phone: z
    .string()
    .trim()
    .max(40, { error: "Phone is too long" })
    .optional(),
  message: z
    .string()
    .trim()
    .min(1, { error: "Message is required" })
    .max(5000, { error: "Message is too long" }),
});

export type ContactSchemaType = z.infer<typeof contactSchema>;

export const consumerRequestSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name is too long" }),
  email: z
    .email({ error: "Invalid email address" })
    .max(254, { error: "Email is too long" }),
  medioPago: z
    .enum(["paypal", "mercadopago", "otro"])
    .or(z.literal(""))
    .optional(),
  operacion: z
    .string()
    .trim()
    .max(100, { error: "Operation is too long" })
    .optional(),
  comentario: z
    .string()
    .trim()
    .max(2000, { error: "Comment is too long" })
    .optional(),
});

export type ConsumerRequestSchemaType = z.infer<typeof consumerRequestSchema>;
