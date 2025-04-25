/**
 * 🔹 POST /api/projects/save
 * This API saves finalized translation results.
 * It receives a project name, a project note, and a list of translation units (TUs),
 * then creates a new project entry and stores each TU in the database.
 * This is typically used after post-editing machine translation or human review.
 */
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { projectName, results, note } = await req.json();

  // Save the project with note
  const project = await prisma.project.create({
    data: { 
      name: projectName,
      note: note,  // Save the project note
    },
  });

  // Revert back the creation of translation units
  await prisma.translationUnit.createMany({
    data: results.map((s: { source: string; target: string; status: string }) => ({
      source: s.source,
      target: s.target,
      sourceLang: 'ko',
      targetLang: 'en',
      status: s.status || 'MT',  // Default to 'MT' if no status provided
      projectId: project.id,
    })),
    // skipDuplicates: true, // ✅ 중복 삽입 방지 추가 (unsupported in current Prisma version)
  });

  return NextResponse.json({ projectId: project.id, note: project.note });
}