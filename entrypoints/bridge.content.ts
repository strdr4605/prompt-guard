/**
 * Content script - ISOLATED world
 * Bridge between MAIN world and service worker
 */
export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
  runAt: "document_start",
  main() {
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

          window.postMessage(
            {
              type: "PROMPT_GUARD_SCAN_RESULT",
              requestId,
              emails: response.emails,
              anonymizedBody: response.anonymizedBody,
            },
            "*"
          );
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
