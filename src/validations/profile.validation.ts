import { z } from "zod";

export const PROFILE_LIMITS = {
  nameMax: 60,
  phoneMax: 20,
  addressMax: 80,
  bioMax: 500,
  skillsMax: 50,
  linksMax: 5,
} as const;

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The backend validates almost nothing here (`updateNormalUserData` is a bag of
 * optional strings), so these caps are the only thing keeping junk out.
 */
export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(PROFILE_LIMITS.nameMax, {
        error: `Name must be at most ${PROFILE_LIMITS.nameMax} characters`,
      }),
    phone: z
      .string()
      .trim()
      .max(PROFILE_LIMITS.phoneMax, { error: "Phone number is too long" }),
    gender: z.enum(["", "MALE", "FEMALE"]),
    dateOfBirth: z
      .string()
      .max(10)
      .refine((value) => !value || value <= today(), {
        error: "Date of birth must be in the past",
      }),
    address: z
      .string()
      .trim()
      .max(PROFILE_LIMITS.addressMax, {
        error: `Location must be at most ${PROFILE_LIMITS.addressMax} characters`,
      }),
    bio: z
      .string()
      .trim()
      .max(PROFILE_LIMITS.bioMax, {
        error: `Tell your story in ${PROFILE_LIMITS.bioMax} characters or fewer`,
      }),
    skills: z.array(z.string()).max(PROFILE_LIMITS.skillsMax, {
      error: `Pick at most ${PROFILE_LIMITS.skillsMax} skills`,
    }),
    socialLinks: z
      .array(z.string().trim())
      .max(PROFILE_LIMITS.linksMax, {
        error: `Add at most ${PROFILE_LIMITS.linksMax} links`,
      })
      .refine(
        (links) =>
          links.every((link) => link === "" || z.url().safeParse(link).success),
        { error: "Each link must be a full URL, including https://" },
      ),
  });

export type ProfileValues = z.infer<typeof profileSchema>;
