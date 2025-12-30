import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  setCurrentEmails,
  dismissEmail,
  addToHistory,
  clearCurrentEmails,
  loadPersistedState,
} from "./store/issuesSlice";
import { Modal } from "./components/Modal";
import type { Issue, DetectedEmail } from "./types";
import "./index.css";

type Props = {
  initialEmails: string[];
  persistedHistory: Issue[];
  persistedDismissedEmails: DetectedEmail[];
  onMask: (newIssue: Issue, emailsToMask: string[]) => void;
  onDismiss: (dismissedEmails: DetectedEmail[]) => void;
  onClose: () => void;
};

function AppContent(props: Props) {
  const { initialEmails, persistedHistory, persistedDismissedEmails, onMask, onDismiss, onClose } =
    props;

  const dispatch = useAppDispatch();
  const currentEmails = useAppSelector((state) => state.issues.currentEmails);
  const history = useAppSelector((state) => state.issues.history);
  const dismissedEmails = useAppSelector((state) => state.issues.dismissedEmails);
  const initialized = useRef(false);
  const hadEmails = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(
        loadPersistedState({ history: persistedHistory, dismissedEmails: persistedDismissedEmails })
      );
      dispatch(setCurrentEmails(initialEmails));
    }
  }, [dispatch, initialEmails, persistedHistory, persistedDismissedEmails]);

  // Track when emails were shown to distinguish initial empty from all-dismissed
  useEffect(() => {
    if (currentEmails.length > 0) {
      hadEmails.current = true;
    }
  }, [currentEmails]);

  useEffect(() => {
    if (hadEmails.current && currentEmails.length === 0) {
      onClose();
    }
  }, [currentEmails, onClose]);

  const handleDismiss = (email: string) => {
    dispatch(dismissEmail(email));
    const state = store.getState().issues;
    onDismiss(state.dismissedEmails);
  };

  const handleMask = () => {
    const emailsToMask = [...currentEmails];

    const newIssue: Issue = {
      id: crypto.randomUUID(),
      emails: currentEmails.map((email) => {
        const dismissed = dismissedEmails.find(
          (d) => d.email.toLowerCase() === email.toLowerCase()
        );
        return {
          email,
          detectedAt: Date.now(),
          dismissedUntil: dismissed?.dismissedUntil,
        };
      }),
      prompt: "",
      timestamp: Date.now(),
      masked: true,
    };

    dispatch(addToHistory(newIssue));
    dispatch(clearCurrentEmails());
    onMask(newIssue, emailsToMask);
  };

  return (
    <Modal
      isOpen={currentEmails.length > 0}
      emails={currentEmails}
      history={history}
      onMask={handleMask}
      onDismiss={handleDismiss}
    />
  );
}

export function App(props: Props) {
  return (
    <Provider store={store}>
      <AppContent {...props} />
    </Provider>
  );
}
