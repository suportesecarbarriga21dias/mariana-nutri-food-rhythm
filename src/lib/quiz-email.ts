import { z } from "zod";

// Shared by quiz validation and the future server-side redemption action.
export const quizEmailSchema = z.string().trim().max(254).email();

export function validateQuizEmail(value: unknown): string | undefined {
  const result = quizEmailSchema.safeParse(value);
  return result.success ? result.data : undefined;
}