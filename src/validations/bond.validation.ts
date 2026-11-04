import { z } from "zod";

export const createBondSchema = z.object({
  offer: z
    .string()
    .trim()
    .min(1, { error: "Tell people what you can give" })
    .max(120, { error: "Keep the offer under 120 characters" }),
  want: z
    .string()
    .trim()
    .min(1, { error: "Tell people what you are looking for" })
    .max(120, { error: "Keep the want under 120 characters" }),
  description: z
    .string()
    .trim()
    .min(10, { error: "Add a little more detail (10+ characters)" })
    .max(300, { error: "Keep it under 300 characters" }),
  modality: z.enum(["physical", "online"]),
  radiusKm: z
    .number()
    .min(1, { error: "Radius must be at least 1 km" })
    .max(20000, { error: "Radius must be under 20,000 km" }),
});

export type CreateBondValues = z.infer<typeof createBondSchema>;

export const proposeBondSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Give this bond a name" })
    .max(60, { error: "Keep the name under 60 characters" }),
});

export type ProposeBondValues = z.infer<typeof proposeBondSchema>;
