import { createRoot } from "react-dom/client";
import { App } from "./App";

export function mountModal(emails: string[], onMask: () => void): () => void {
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

  const root = createRoot(container);
  root.render(<App emails={emails} onMask={onMask} />);

  return () => {
    root.unmount();
    shadowHost.remove();
  };
}
