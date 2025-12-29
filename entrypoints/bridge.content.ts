/**
 * Content script - ISOLATED world
 * Bridge between MAIN world and service worker
 * Mounts React modal UI
 */
import { mountModal } from "./modal/mount";

export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
  runAt: "document_start",
  main() {
    let unmountModal: (() => void) | null = null;

    window.addEventListener("message", async (event) => {
      if (event.source !== window) return;

      const { type, requestId, bodyText, url } = event.data || {};

      if (type === "PROMPT_GUARD_SCAN_REQUEST") {
        try {
          const response = await browser.runtime.sendMessage({
            type: "SCAN_FOR_EMAILS",
            requestId,
            bodyText,
            url,
          });

          if (response.emails.length > 0) {
            // Show modal and wait for user decision
            unmountModal = mountModal(response.emails, () => {
              // User clicked "Mask & Send"
              window.postMessage(
                {
                  type: "PROMPT_GUARD_SCAN_RESULT",
                  requestId,
                  emails: response.emails,
                  anonymizedBody: response.anonymizedBody,
                  action: "mask",
                },
                "*"
              );
              unmountModal?.();
              unmountModal = null;
            });
          } else {
            window.postMessage(
              {
                type: "PROMPT_GUARD_SCAN_RESULT",
                requestId,
                emails: [],
                anonymizedBody: bodyText,
              },
              "*"
            );
          }
        } catch (error) {
          console.error("[PromptGuard] Bridge error:", error);
          window.postMessage(
            {
              type: "PROMPT_GUARD_SCAN_RESULT",
              requestId,
              emails: [],
              anonymizedBody: bodyText,
            },
            "*"
          );
        }
      }
    });
  },
});
