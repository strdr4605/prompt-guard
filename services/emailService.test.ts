import { describe, it, expect } from "vitest";
import { detectEmails, anonymizeEmails, filterDismissedEmails } from "./emailService.ts";

describe("detectEmails", () => {
  it("detects single email", () => {
    expect(detectEmails("Contact me at test@example.com")).toEqual(["test@example.com"]);
  });

  it("detects multiple emails", () => {
    expect(detectEmails("Email john@test.com or jane@test.com")).toEqual([
      "john@test.com",
      "jane@test.com",
    ]);
  });

  it("deduplicates case-insensitive", () => {
    expect(detectEmails("Email Test@Example.com and test@example.com")).toEqual([
      "Test@Example.com",
    ]);
  });

  it("returns empty array when no emails", () => {
    expect(detectEmails("No emails here")).toEqual([]);
  });

  it("handles complex email formats", () => {
    expect(detectEmails("Contact user.name+tag@sub.domain.com")).toEqual([
      "user.name+tag@sub.domain.com",
    ]);
  });
});

describe("anonymizeEmails", () => {
  it("replaces single email", () => {
    expect(anonymizeEmails("Contact test@example.com please", ["test@example.com"])).toBe(
      "Contact [EMAIL_ADDRESS] please"
    );
  });

  it("replaces multiple emails", () => {
    const text = "Email john@test.com or jane@test.com";
    const result = anonymizeEmails(text, ["john@test.com", "jane@test.com"]);
    expect(result).toBe("Email [EMAIL_ADDRESS] or [EMAIL_ADDRESS]");
  });

  it("replaces case-insensitively", () => {
    expect(anonymizeEmails("Email TEST@EXAMPLE.COM", ["test@example.com"])).toBe(
      "Email [EMAIL_ADDRESS]"
    );
  });

  it("only anonymizes specified emails", () => {
    const text = "Email john@test.com or jane@test.com";
    const result = anonymizeEmails(text, ["john@test.com"]);
    expect(result).toBe("Email [EMAIL_ADDRESS] or jane@test.com");
  });

  it("returns original text when no emails to anonymize", () => {
    expect(anonymizeEmails("Hello world", [])).toBe("Hello world");
  });

  it("handles emails with special regex characters", () => {
    expect(anonymizeEmails("Contact test+tag@example.com", ["test+tag@example.com"])).toBe(
      "Contact [EMAIL_ADDRESS]"
    );
  });
});

describe("filterDismissedEmails", () => {
  it("returns all emails when none dismissed", () => {
    expect(filterDismissedEmails(["a@test.com", "b@test.com"], [])).toEqual([
      "a@test.com",
      "b@test.com",
    ]);
  });

  it("filters out actively dismissed emails", () => {
    const dismissed = [{ email: "a@test.com", dismissedUntil: Date.now() + 10000 }];
    expect(filterDismissedEmails(["a@test.com", "b@test.com"], dismissed)).toEqual(["b@test.com"]);
  });

  it("includes expired dismissed emails", () => {
    const dismissed = [{ email: "a@test.com", dismissedUntil: Date.now() - 10000 }];
    expect(filterDismissedEmails(["a@test.com", "b@test.com"], dismissed)).toEqual([
      "a@test.com",
      "b@test.com",
    ]);
  });

  it("filters case-insensitively", () => {
    const dismissed = [{ email: "A@TEST.COM", dismissedUntil: Date.now() + 10000 }];
    expect(filterDismissedEmails(["a@test.com"], dismissed)).toEqual([]);
  });

  it("handles dismissal without timestamp", () => {
    const dismissed = [{ email: "a@test.com" }];
    expect(filterDismissedEmails(["a@test.com", "b@test.com"], dismissed)).toEqual([
      "a@test.com",
      "b@test.com",
    ]);
  });
});
