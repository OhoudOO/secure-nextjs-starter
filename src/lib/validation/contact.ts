import { z } from "zod";

// Every external input goes through a schema with lengths and formats; unknown keys are rejected.
export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    message: z.string().trim().min(10).max(5000),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;
