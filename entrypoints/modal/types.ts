export type DetectedEmail = {
  email: string;
  detectedAt: number;
  dismissedUntil?: number;
};

export type Issue = {
  id: string;
  emails: DetectedEmail[];
  prompt: string;
  timestamp: number;
  masked: boolean;
};
