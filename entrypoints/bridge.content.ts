/**
 * Content script - ISOLATED world
 * Bridge between MAIN world and service worker, mounts React modal UI
 */
import { mountModal } from "./modal/mount";
import { storageService } from "../services/storage.service";

export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
  runAt: "document_start",
  main() {
    window.addEventListener("message", async (event) => {
      if (event.source !== window) return;

      const { type, requestId, bodyText } = event.data || {};

      if (type === "PROMPT_GUARD_SCAN_REQUEST") {
        try {
          const response = await browser.runtime.sendMessage({
            type: "SCAN_FOR_EMAILS",
            requestId,
            bodyText,
          });

          if (response.emails.length > 0) {
            const persisted = await storageService.load();

            const now = Date.now();
            const activeDismissals = persisted.dismissedEmails.filter(
              (d) => d.dismissedUntil && d.dismissedUntil > now
            );
            const dismissedSet = new Set(activeDismissals.map((d) => d.email.toLowerCase()));
            const activeEmails = response.emails.filter(
              (email: string) => !dismissedSet.has(email.toLowerCase())
            );

            if (activeEmails.length === 0) {
              window.postMessage(
                {
                  type: "PROMPT_GUARD_SCAN_RESULT",
                  requestId,
                  emails: [],
                  anonymizedBody: bodyText,
                },
                "*"
              );
              return;
            }

            mountModal({
              emails: activeEmails,
              persistedHistory: persisted.history,
              persistedDismissedEmails: persisted.dismissedEmails,
              onMask: async (newIssue, emailsToMask) => {
                const currentState = await storageService.load();
                await storageService.saveHistory([newIssue, ...currentState.history]);

                const { anonymizedBody } = await browser.runtime.sendMessage({
                  type: "ANONYMIZE_EMAILS",
                  bodyText,
                  emailsToAnonymize: emailsToMask,
                });

                window.postMessage(
                  {
                    type: "PROMPT_GUARD_SCAN_RESULT",
                    requestId,
                    emails: emailsToMask,
                    anonymizedBody,
                  },
                  "*"
                );
              },
              onDismiss: async (dismissedEmails) => {
                await storageService.saveDismissedEmails(dismissedEmails);
              },
              onClose: () => {
                window.postMessage(
                  {
                    type: "PROMPT_GUARD_SCAN_RESULT",
                    requestId,
                    emails: [],
                    anonymizedBody: bodyText,
                  },
                  "*"
                );
              },
            });
          } else {
            window.postMessage(
              { type: "PROMPT_GUARD_SCAN_RESULT", requestId, emails: [], anonymizedBody: bodyText },
              "*"
            );
          }
        } catch (error) {
          console.error("[PromptGuard] Bridge error:", error);
          window.postMessage(
            { type: "PROMPT_GUARD_SCAN_RESULT", requestId, emails: [], anonymizedBody: bodyText },
            "*"
          );
        }
      }
    });
  },
});
