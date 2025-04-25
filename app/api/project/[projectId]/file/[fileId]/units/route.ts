import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { splitIntoSentences } from '@/lib/sentenceSplitter';
import { translateSentenceWithTMOrGPT } from '@/lib/translateUtils';

export async function GET(
  _: Request,
  context: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await context.params;
  const id = Number(fileId);

  console.log('📂 fileId received:', id);

  // Check if the file is already initialized
  const file = await prisma.projectFile.findUnique({
    where: { id },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  if (!file.isInitialized) {
    console.log('📂 File content:', file.content);
    console.log('✅ Initializing file...');

    const sentences = splitIntoSentences(file.content || '');

    const translationUnits = await Promise.all(
      sentences.map(async (sentence: string) => {
        const result = await translateSentenceWithTMOrGPT(
          sentence,
          'ko', // sourceLang
          'en', // targetLang
          file.projectId, // projectId
          file.id // fileId
        );
        return {
          source: sentence,
          target: result.target,
          sourceLang: 'ko',
          targetLang: 'en',
          status: result.status,
          projectId: file.projectId,
          fileId: file.id,
        };
      })
    );

    if (translationUnits.length > 0) {
      const existingUnits = await prisma.translationUnit.findMany({
        where: {
          fileId: file.id,
          projectId: file.projectId,
        },
        select: {
          source: true,
        },
      });

      const existingSources = new Set(existingUnits.map((u) => u.source));
      const filteredUnits = translationUnits.filter((unit) => !existingSources.has(unit.source));

      if (filteredUnits.length > 0) {
        await prisma.translationUnit.createMany({
          data: filteredUnits,
        });

        console.log(`✅ Inserted ${filteredUnits.length} new units.`);
      } else {
        console.log('ℹ️ No new translation units to insert.');
      }

      await prisma.projectFile.update({
        where: { id },
        data: { isInitialized: true },
      });

      console.log('✅ Initialization complete.');
    }
  }

  const units = await prisma.translationUnit.findMany({
    where: {
      fileId: id,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json(units);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await context.params;
  const id = Number(fileId);

  const body = await req.json();

  const updated = await prisma.translationUnit.update({
    where: { id: body.id },
    data: {
      target: body.target,
      status: body.status || 'Reviewed',
    },
  });

  return NextResponse.json(updated);
}