/**
 * Service Worker (background script)
 * Handles email detection and anonymization
 */
import { detectEmails, anonymizeEmails } from "../services/emailService";

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
