export const TMStatus = {
  MT: "MT", // Machine Translation
  Approved: "Approved", // Reviewed and approved
  Fuzzy: "Fuzzy", // Partial match
  Exact: "Exact", // Exact match
};

// Utility functions for TM status
export function isApproved(status: string): boolean {
  return status === TMStatus.Approved;
}

export function isFuzzy(status: string): boolean {
  return status === TMStatus.Fuzzy;
}

// Add more utility functions as needed
