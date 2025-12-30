import { createRoot } from "react-dom/client";
import { App } from "./App";
import type { Issue, DetectedEmail } from "./types";

type MountOptions = {
  emails: string[];
  persistedHistory: Issue[];
  persistedDismissedEmails: DetectedEmail[];
  onMask: (newIssue: Issue, emailsToMask: string[]) => void;
  onDismiss: (dismissedEmails: DetectedEmail[]) => void;
  onClose: () => void;
};

export function mountModal(options: MountOptions): () => void {
  const { emails, persistedHistory, persistedDismissedEmails, onMask, onDismiss, onClose } =
    options;

  const shadowHost = document.createElement("div");
  shadowHost.id = "prompt-guard-modal";
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  const container = document.createElement("div");
  shadowRoot.appendChild(container);

  const style = document.createElement("style");
  const cssUrl = browser.runtime.getURL("/assets/modal.css" as never);
  style.textContent = `@import "${cssUrl}";`;
  shadowRoot.appendChild(style);

  const unmount = () => {
    root.unmount();
    shadowHost.remove();
  };

  const root = createRoot(container);
  root.render(
    <App
      initialEmails={emails}
      persistedHistory={persistedHistory}
      persistedDismissedEmails={persistedDismissedEmails}
      onMask={(newIssue, emailsToMask) => {
        onMask(newIssue, emailsToMask);
        unmount();
      }}
      onDismiss={onDismiss}
      onClose={() => {
        onClose();
        unmount();
      }}
    />
  );

  return unmount;
}
