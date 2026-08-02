import test from "node:test";
import assert from "node:assert/strict";
import { sendOtpEmail } from "../src/utils/otpDelivery.js";

test("sendOtpEmail returns a fallback result instead of throwing when delivery fails", async () => {
  const failingTransport = {
    sendMail: async () => {
      throw new Error("SMTP unavailable");
    },
  };

  const result = await sendOtpEmail({
    toEmail: "test@example.com",
    otp: "123456",
    name: "Test User",
    type: "registration",
    transport: failingTransport,
    log: {
      warn: () => {},
      error: () => {},
    },
  });

  assert.equal(result.delivered, false);
  assert.match(result.reason, /SMTP|delivery/i);
});
