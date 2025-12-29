import { useState, useEffect } from "react";
import { Modal } from "./components/Modal";
import type { Issue } from "./types";
import "./index.css";

type AppProps = {
  emails: string[];
  onMask: () => void;
};

export function App({ emails, onMask }: AppProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [history, setHistory] = useState<Issue[]>([]);

  useEffect(() => {
    // TODO: Load history from storage
  }, []);

  const handleDismiss = (email: string) => {
    // TODO: Implement 24h dismiss logic
    console.log("Dismiss email for 24h:", email);
  };

  const handleMask = () => {
    const newIssue: Issue = {
      id: crypto.randomUUID(),
      emails: emails.map((email) => ({ email, detectedAt: Date.now() })),
      prompt: "", // TODO: Pass prompt from interceptor
      timestamp: Date.now(),
      masked: true,
    };
    setHistory((prev) => [newIssue, ...prev]);

    // TODO: Persist to storage

    setIsOpen(false);
    onMask();
  };

  return (
    <Modal
      isOpen={isOpen}
      emails={emails}
      history={history}
      onMask={handleMask}
      onDismiss={handleDismiss}
    />
  );
}
