// /lib/types.ts
export interface TmEntry {
    id?: number;
    source: string;
    target: string;
    sourceLang: string;
    targetLang: string;
    status?: string;
    comment?: string;
    updatedAt?: Date;
  }