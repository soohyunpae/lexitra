
import { prisma } from '@/lib/prisma';



import { lookupFromTM, saveToTM } from '@/lib/tm';

type TranslationStatus = '100%' | 'Reviewed' | 'Fuzzy' | 'MT';

export async function translateSentenceWithTMOrGPT(
  source: string,
  sourceLang: string,
  targetLang: string,
  projectId: number,
  fileId: number
): Promise<{ target: string; status: TranslationStatus }> {
  const tmMatch = await lookupFromTM(source, sourceLang, targetLang);

  if (tmMatch?.score === 100 && tmMatch.target) {
    return { target: tmMatch.target, status: '100%' };
  } else if (tmMatch?.score && tmMatch.score >= 70 && tmMatch.target) {
    return { target: tmMatch.target, status: 'Fuzzy' };
  } else {
    const res = await fetch(`${process.env.BASE_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: source, sourceLang, targetLang }),
    });

    const data = await res.json();
    const target = data.translatedText;
    const status: TranslationStatus = 'MT';

    await saveToTM({ source, target, sourceLang, targetLang, status, comment: '' });
    await prisma.translationUnit.create({
      data: {
        source,
        target,
        sourceLang,
        targetLang,
        status,
        comment: '',
        projectId,
        fileId,
      }
    });
    return { target, status };
  }
}