/**
 * 🔹 POST /api/projects/new
 * This API handles advanced project creation.
 * It receives a text file and a project name,
 * splits the file into sentences,
 * looks up each sentence in Translation Memory (TM),
 * uses GPT to translate unmatched sentences,
 * stores results as Translation Units (TUs),
 * and links them to the created project.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lookupFromTM, saveToTM, TMMatch } from '@/lib/tm'; // 가정: TM 검색 및 저장 유틸

function parseTextFile(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const projectName = formData.get('projectName')?.toString();

  if (!file || !projectName) {
    return NextResponse.json({ status: 'error', message: '파일 또는 프로젝트 이름 없음' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString('utf-8');

  // 문장 분할
  const sentences = parseTextFile(content); // ex: ["문장1", "문장2"]

  // 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      name: projectName,
    },
  });

  const translationUnits = [];

  const sourceLang = 'ko';
  const targetLang = 'en';

  for (const source of sentences) {
    // TM 검색
    const tmMatch: TMMatch | null = await lookupFromTM(source, sourceLang, targetLang);
    let target = '';
    let status: 'Reviewed' | 'Fuzzy' | 'MT' | '100%' = 'MT';

    if (tmMatch?.score === 100 && tmMatch?.target) {
      target = tmMatch.target;
      status = '100%';
    } else if (typeof tmMatch?.score === 'number' && tmMatch.score >= 70 && tmMatch.target) {
      target = tmMatch.target;
      status = 'Fuzzy';
    } else {
      // GPT 번역 처리 부분을 fetch로 대체
      const res = await fetch(`${process.env.BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: source,
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();
      target = data.translatedText;
      status = 'MT';
    }

    const unit = await prisma.translationUnit.create({
      data: {
        source,
        target,
        status,
        sourceLang,
        targetLang,
        projectId: project.id,
      },
    });

    translationUnits.push(unit);
  }

  return NextResponse.json({ status: 'ok', projectId: project.id });
}