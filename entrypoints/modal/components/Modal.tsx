import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import type { Issue } from "../types";
import { EmailItem } from "./EmailItem";

export type Props = {
  isOpen: boolean;
  emails: string[];
  onMask: () => void;
  onDismiss: (email: string) => void;
  history: Issue[];
};

export function Modal({ isOpen, emails, history, onMask, onDismiss }: Props) {
  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-[10000]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
          <div className="rounded-t-2xl border-b border-gray-200 bg-lasso-cream px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-lasso-brown">
              <span>🤠</span>
              PromptGuard Alert
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-600">Email addresses detected in your prompt</p>
          </div>

          <TabGroup>
            <TabList className="flex border-b border-gray-200">
              <Tab className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 transition-colors data-[selected]:border-b-2 data-[selected]:border-lasso-gold data-[selected]:text-lasso-brown">
                Issues Found ({emails.length})
              </Tab>
              <Tab className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 transition-colors data-[selected]:border-b-2 data-[selected]:border-lasso-gold data-[selected]:text-lasso-brown">
                History ({history.length})
              </Tab>
            </TabList>

            <TabPanels className="max-h-96 overflow-y-auto p-4">
              <TabPanel className="flex flex-col gap-2">
                {emails.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No issues found</p>
                ) : (
                  emails.map((email) => (
                    <EmailItem key={email} email={email} onDismiss={onDismiss} />
                  ))
                )}
              </TabPanel>

              <TabPanel className="flex flex-col gap-3">
                {history.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No history yet</p>
                ) : (
                  history.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(issue.timestamp).toLocaleString()}
                        </span>
                        {issue.masked && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Masked
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {issue.emails.map((e) => (
                          <span
                            key={e.email}
                            className={`rounded px-2 py-1 font-mono text-xs ${
                              e.dismissedUntil && e.dismissedUntil > Date.now()
                                ? "bg-lasso-cream text-lasso-brown"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {e.email}
                            {e.dismissedUntil && e.dismissedUntil > Date.now() && " (dismissed)"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <div className="rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              onClick={onMask}
              className="w-full rounded-lg bg-lasso-gold px-4 py-3 font-semibold text-lasso-brown transition-colors hover:bg-lasso-gold-hover"
            >
              Mask & Send
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Emails will be replaced with [EMAIL_ADDRESS]
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
