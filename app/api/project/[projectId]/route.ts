import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: { projectId: string } }
) {
  const { projectId } = context.params;
  const id = parseInt(projectId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch file:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}