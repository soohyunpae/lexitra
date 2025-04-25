export type TMStatus = 'MT' | 'Fuzzy' | 'Reviewed' | '100%';

// /lib/types.ts
export interface TmEntry {
    id?: number;
    source: string;
    target: string;
    sourceLang: string;
    targetLang: string;
    status?: TMStatus;
    comment?: string;
    updatedAt?: string;
  }