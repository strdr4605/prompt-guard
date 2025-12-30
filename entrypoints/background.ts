/**
 * Service Worker (background script)
 * Handles email detection and storage
 */
const EMAIL_REGEX =
  /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/gi;

function detectEmails(text: string): string[] {
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

function anonymizeEmails(text: string, emails: string[]): string {
  let result = text;
  for (const email of emails) {
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "[EMAIL_ADDRESS]");
  }
  return result;
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "SCAN_FOR_EMAILS") {
      const { requestId, bodyText } = message;
      const emails = detectEmails(bodyText);
      sendResponse({ requestId, emails });
      return true;
    }

    if (message.type === "ANONYMIZE_EMAILS") {
      const { bodyText, emailsToAnonymize } = message;
      const anonymizedBody = anonymizeEmails(bodyText, emailsToAnonymize);
      sendResponse({ anonymizedBody });
      return true;
    }

    return false;
  });
});
