import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "@/lib/security/csp";
import { MemoryRateLimiter, clientKey } from "@/lib/security/rateLimit";
import { contactSchema } from "@/lib/validation/contact";
import { assertOwner, NotFoundOrForbidden } from "@/lib/authz";
import { loadEnv } from "@/lib/env";

describe("Content-Security-Policy", () => {
  it("Given a production build, When the policy is built, Then only nonce scripts run and framing is blocked", () => {
    const csp = buildCsp("abc", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("Given two requests, When nonces are created, Then they differ", () => {
    expect(createNonce()).not.toEqual(createNonce());
  });
});

describe("Rate limiting", () => {
  it("Given a limit of 2 per window, When a third request arrives, Then it is refused until the window resets", async () => {
    let now = 0;
    const limiter = new MemoryRateLimiter(2, 1000, () => now);
    expect((await limiter.consume("ip")).allowed).toBe(true);
    expect((await limiter.consume("ip")).allowed).toBe(true);
    expect((await limiter.consume("ip")).allowed).toBe(false);
    expect((await limiter.consume("other-ip")).allowed).toBe(true);
    now = 1001;
    expect((await limiter.consume("ip")).allowed).toBe(true);
  });

  it("Given proxy headers, When the client key is read, Then the first forwarded address is used", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });
});

describe("Input validation", () => {
  const valid = { name: "Sara", email: "sara@example.com", message: "I need a secure portfolio site." };

  it("Given a valid message, When validated, Then it passes", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("Given an extra field, a bad email or an oversized message, When validated, Then it is rejected", () => {
    expect(contactSchema.safeParse({ ...valid, role: "admin" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success).toBe(false);
  });
});

describe("Ownership checks (IDOR)", () => {
  const note = { id: "1", ownerId: "user-a", body: "secret" };

  it("Given the owner, When the record is checked, Then it is returned", () => {
    expect(assertOwner(note, "user-a")).toBe(note);
  });

  it("Given another user or a missing record, When checked, Then both fail the same way", () => {
    expect(() => assertOwner(note, "user-b")).toThrow(NotFoundOrForbidden);
    expect(() => assertOwner(undefined, "user-b")).toThrow(NotFoundOrForbidden);
  });
});

describe("Environment", () => {
  it("Given a short AUTH_SECRET, When the environment loads, Then startup fails with a clear message", () => {
    expect(() => loadEnv({ AUTH_SECRET: "short", AUTH_GITHUB_ID: "id", AUTH_GITHUB_SECRET: "s" })).toThrow(/AUTH_SECRET/);
  });
});
