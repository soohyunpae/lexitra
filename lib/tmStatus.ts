export const TMStatus = {
  MT: "MT", // Machine Translation
  Reviewed: "Reviewed", // Human-reviewed and approved
  Fuzzy: "Fuzzy", // Partial match
  "100%": "100%", // Exact match
};

// Utility functions for TM status
export function isReviewed(status: string): boolean {
  return status === TMStatus.Reviewed;
}

export function isFuzzy(status: string): boolean {
  return status === TMStatus.Fuzzy;
}

// Add more utility functions as needed
