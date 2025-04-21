import { prisma } from '@/lib/prisma';
import stringSimilarity from 'string-similarity';
import type { TmEntry } from '@/lib/types';
import { TMStatus } from '@/lib/tmStatus';

export async function getBestTmMatch(text: string, sourceLang: string, targetLang: string) {
  const entries = await prisma.translationMemory.findMany({
    where: { sourceLang, targetLang },
    select: { source: true, target: true },
  });

  const candidates = entries.map(entry => entry.source);
  const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(text, candidates);
  const score = Math.round(bestMatch.rating * 100);

  if (score >= 70) {
    return {
      source: entries[bestMatchIndex].source,
      target: entries[bestMatchIndex].target,
      score,
    };
  } else {
    return {
      source: text,
      target: '',
      score: 0,
    };
  }
}

export async function upsertTmEntry(entry: TmEntry) {
  const normalizedSource = entry.source?.trim().toLowerCase() || '';
  const normalizedSourceLang = entry.sourceLang?.trim().toLowerCase() || '';
  const normalizedTargetLang = entry.targetLang?.trim().toLowerCase() || '';
  const target = entry.target || '';
  const comment = entry.comment || '';
  const status = entry.status || TMStatus.MT;
  const updatedAt = entry.updatedAt || new Date();

  console.log('🔍 찾는 조건:', {
    source: normalizedSource,
    sourceLang: normalizedSourceLang,
    targetLang: normalizedTargetLang,
  });

  const existing = await prisma.translationMemory.findFirst({
    where: {
      source: normalizedSource,
      sourceLang: normalizedSourceLang,
      targetLang: normalizedTargetLang,
    },
  });
  console.log('📦 existing TM found:', existing);

  if (existing) {
    console.log('🛠 updating TM entry:', {
      id: existing.id,
      newData: {
        target,
        comment,
        status,
        updatedAt,
      }
    });
    await prisma.translationMemory.update({
      where: {
        id: existing.id,
      },
      data: {
        target,
        comment,
        status,
        updatedAt,
      },
    });
  } else {
    console.log('➕ creating new TM entry:', {
      source: normalizedSource,
      target,
      sourceLang: normalizedSourceLang,
      targetLang: normalizedTargetLang,
      comment,
      status,
      updatedAt,
    });
    await prisma.translationMemory.create({
      data: {
        source: normalizedSource,
        target,
        sourceLang: normalizedSourceLang,
        targetLang: normalizedTargetLang,
        comment,
        status,
        updatedAt,
      },
    });
  }
}