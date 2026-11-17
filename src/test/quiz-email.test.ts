import { describe, expect, it } from "vitest";
import { validateQuizEmail } from "@/lib/quiz-email";

describe("Required quiz email", () => {
  it("rejects a missing email before completion", () => {
    expect(validateQuizEmail(undefined)).toBeUndefined();
    expect(validateQuizEmail("")).toBeUndefined();
  });
  it("rejects invalid email addresses", () => {
    expect(validateQuizEmail("invalid-address")).toBeUndefined();
    expect(validateQuizEmail("person@gmail")).toBeUndefined();
  });
  it("preserves a valid Gmail address for redemption", () => {
    expect(validateQuizEmail(" person@gmail.com ")).toBe("person@gmail.com");
  });
  it("also accepts a valid address from another provider", () => {
    expect(validateQuizEmail("person@example.com")).toBe("person@example.com");
  });
});