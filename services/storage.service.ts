import type { Issue, DetectedEmail } from "../entrypoints/modal/types";

const STORAGE_KEYS = {
  HISTORY: "promptguard_history",
  DISMISSED_EMAILS: "promptguard_dismissed",
} as const;

export type PersistedState = {
  history: Issue[];
  dismissedEmails: DetectedEmail[];
};

/**
 * Storage service - must be called from contexts with browser API access
 * (service worker or ISOLATED world content script, NOT React components)
 */
export const storageService = {
  async load(): Promise<PersistedState> {
    const result = await browser.storage.local.get([
      STORAGE_KEYS.HISTORY,
      STORAGE_KEYS.DISMISSED_EMAILS,
    ]);

    return {
      history: (result[STORAGE_KEYS.HISTORY] as Issue[]) || [],
      dismissedEmails: (result[STORAGE_KEYS.DISMISSED_EMAILS] as DetectedEmail[]) || [],
    };
  },

  async saveHistory(history: Issue[]): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
  },

  async saveDismissedEmails(dismissedEmails: DetectedEmail[]): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEYS.DISMISSED_EMAILS]: dismissedEmails });
  },

  async save(state: PersistedState): Promise<void> {
    await browser.storage.local.set({
      [STORAGE_KEYS.HISTORY]: state.history,
      [STORAGE_KEYS.DISMISSED_EMAILS]: state.dismissedEmails,
    });
  },

  async clear(): Promise<void> {
    await browser.storage.local.remove([STORAGE_KEYS.HISTORY, STORAGE_KEYS.DISMISSED_EMAILS]);
  },
};
