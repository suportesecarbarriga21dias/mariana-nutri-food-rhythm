import { describe, expect, it } from "vitest";
import { WHATSAPP_REDEMPTION_URL } from "@/config/whatsapp";

describe("Recipe redemption", () => {
  it("uses the exact requested WhatsApp destination, not Drive or checkout", () => {
    expect(WHATSAPP_REDEMPTION_URL).toBe("https://wa.me/message/GOUSAA5MGYA4D1");
  });
});