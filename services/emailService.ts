const EMAIL_REGEX =
  /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/gi;

export function detectEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) || [];
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const email of matches) {
    const lower = email.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(email);
    }
  }

  return unique;
}

export function anonymizeEmails(text: string, emails: string[]): string {
  let result = text;
  for (const email of emails) {
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "[EMAIL_ADDRESS]");
  }
  return result;
}

export function filterDismissedEmails(
  emails: string[],
  dismissedEmails: Array<{ email: string; dismissedUntil?: number }>
): string[] {
  const now = Date.now();
  const activeDismissals = dismissedEmails.filter(
    (d) => d.dismissedUntil && d.dismissedUntil > now
  );
  const dismissedSet = new Set(activeDismissals.map((d) => d.email.toLowerCase()));
  return emails.filter((email) => !dismissedSet.has(email.toLowerCase()));
}
