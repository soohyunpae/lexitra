import { NextResponse } from 'next/server';
import { getBestTmMatch, upsertTmEntry } from '@/lib/tmUtils';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('[translate] 입력:', { text, sourceLang, targetLang });

    // TM 조회
    const tmResult = await getBestTmMatch(text, sourceLang, targetLang);
    if (tmResult.score >= 70 && tmResult.target) {
      console.log('[translate] TM 매치 결과:', tmResult);
      return NextResponse.json({ translatedText: tmResult.target, fromTM: true });
    }

    // GPT 번역
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    });

    const gptTranslation = completion.choices[0].message.content?.trim() || '';

    console.log('[translate] GPT 번역 결과:', gptTranslation);

    // TM 저장
    await upsertTmEntry({
      source: text,
      target: gptTranslation,
      sourceLang,
      targetLang,
      status: 'MT',
    });

    return NextResponse.json({ translatedText: gptTranslation, fromTM: false });
  } catch (error) {
    console.error('[translate] 에러 발생:', error);
    return NextResponse.json({ error: 'Translation error' }, { status: 500 });
  }
}