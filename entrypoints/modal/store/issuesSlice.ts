import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Issue, DetectedEmail } from "../types";

type IssuesState = {
  currentEmails: string[];
  history: Issue[];
  dismissedEmails: DetectedEmail[];
};

const initialState: IssuesState = {
  currentEmails: [],
  history: [],
  dismissedEmails: [],
};

export const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    setCurrentEmails: (state, action: PayloadAction<string[]>) => {
      const now = Date.now();
      const activeDismissals = state.dismissedEmails.filter(
        (d) => d.dismissedUntil && d.dismissedUntil > now
      );
      const dismissedSet = new Set(activeDismissals.map((d) => d.email.toLowerCase()));
      state.currentEmails = action.payload.filter(
        (email) => !dismissedSet.has(email.toLowerCase())
      );
    },

    dismissEmail: (state, action: PayloadAction<string>) => {
      const email = action.payload;
      const dismissedUntil = Date.now() + 24 * 60 * 60 * 1000;

      const existing = state.dismissedEmails.find(
        (d) => d.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        existing.dismissedUntil = dismissedUntil;
      } else {
        state.dismissedEmails.push({
          email,
          detectedAt: Date.now(),
          dismissedUntil,
        });
      }

      state.currentEmails = state.currentEmails.filter(
        (e) => e.toLowerCase() !== email.toLowerCase()
      );
    },

    addToHistory: (state, action: PayloadAction<Issue>) => {
      state.history.unshift(action.payload);
    },

    clearCurrentEmails: (state) => {
      state.currentEmails = [];
    },

    loadPersistedState: (
      state,
      action: PayloadAction<{ history: Issue[]; dismissedEmails: DetectedEmail[] }>
    ) => {
      state.history = action.payload.history;
      state.dismissedEmails = action.payload.dismissedEmails;
    },
  },
});

export const {
  setCurrentEmails,
  dismissEmail,
  addToHistory,
  clearCurrentEmails,
  loadPersistedState,
} = issuesSlice.actions;

export default issuesSlice.reducer;
