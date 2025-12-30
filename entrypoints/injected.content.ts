/**
 * Content script - MAIN world
 * Intercepts fetch requests, sends to ISOLATED world for processing
 */
export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
  runAt: "document_start",
  world: "MAIN",
  main() {
    function showToast(message: string) {
      const toast = document.createElement("div");
      toast.textContent = "🤠 " + message;
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #fff8f0;
        color: #8b1e3f;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: 1px solid #f5b800;
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    const CHATGPT_API_PATTERNS = [
      /chat\.openai\.com\/backend-api\/conversation/,
      /chatgpt\.com\/backend-api\/conversation/,
      /chatgpt\.com\/backend-api\/f\/conversation/,
      /chatgpt\.com\/backend-anon\/.*conversation$/,
    ];

    const originalFetch = window.fetch;
    const pendingRequests = new Map<
      string,
      {
        resolve: (response: Response) => void;
        reject: (error: Error) => void;
        url: string;
        init?: RequestInit;
        bodyText: string;
      }
    >();

    window.addEventListener("message", async (event) => {
      if (event.source !== window) return;

      const { type, requestId, emails, anonymizedBody, originalBody } = event.data || {};

      if (type === "PROMPT_GUARD_SCAN_CANCEL") {
        const pending = pendingRequests.get(requestId);
        if (!pending) return;

        // Copy original text to clipboard and notify user
        let text = "";
        try {
          const parsed = JSON.parse(originalBody);
          // ChatGPT uses author.role not role directly
          const userMessage = parsed?.messages?.find(
            (m: { author?: { role: string }; role?: string }) =>
              m.author?.role === "user" || m.role === "user"
          );
          text = userMessage?.content?.parts?.[0] || "";
        } catch {
          // Ignore parse errors
        }

        if (text) {
          navigator.clipboard.writeText(text).then(
            () => showToast("Request cancelled. Prompt copied to clipboard."),
            () => showToast("Request cancelled.")
          );
        } else {
          showToast("Request cancelled.");
        }

        pending.reject(new DOMException("Request cancelled by PromptGuard", "AbortError"));
        pendingRequests.delete(requestId);
        return;
      }

      if (type === "PROMPT_GUARD_SCAN_RESULT") {
        const pending = pendingRequests.get(requestId);
        if (!pending) return;

        if (emails.length === 0) {
          const response = await originalFetch.call(window, pending.url, pending.init);
          pending.resolve(response);
        } else {
          const response = await originalFetch.call(window, pending.url, {
            ...pending.init,
            body: anonymizedBody,
          });
          pending.resolve(response);
        }

        pendingRequests.delete(requestId);
      }
    });

    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method || "GET";
      const isTargetRequest = method === "POST" && CHATGPT_API_PATTERNS.some((p) => p.test(url));

      if (!isTargetRequest) {
        return originalFetch.call(window, input, init);
      }

      const body = init?.body;
      if (!body) {
        return originalFetch.call(window, input, init);
      }

      let bodyText: string;
      if (typeof body === "string") {
        bodyText = body;
      } else if (body instanceof Blob) {
        bodyText = await body.text();
      } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
        bodyText = await new Blob([body]).text();
      } else if (body instanceof FormData || body instanceof URLSearchParams) {
        bodyText = body.toString();
      } else {
        // ReadableStream - skip scanning
        return originalFetch.call(window, input, init);
      }

      const requestId = crypto.randomUUID();

      window.postMessage(
        {
          type: "PROMPT_GUARD_SCAN_REQUEST",
          requestId,
          bodyText,
          url,
        },
        "*"
      );

      return new Promise((resolve, reject) => {
        pendingRequests.set(requestId, {
          resolve,
          reject,
          url,
          init,
          bodyText,
        });
      });
    };
  },
});
