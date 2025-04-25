import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { searchParams } = new URL(req.url);

  const format = searchParams.get('format') || 'txt';
  const includeSource = searchParams.get('includeSource') === 'true';
  const includeComment = searchParams.get('includeComment') === 'true';

  if (isNaN(projectId)) {
    return new Response('Invalid project ID', { status: 400 });
  }

  const units = await prisma.translationUnit.findMany({
    where: { projectId },
    orderBy: { id: 'asc' },
  });

  if (format === 'csv') {
    const header = ['target'];
    if (includeSource) header.unshift('source');
    if (includeComment) header.push('comment');

    const rows = units.map((u) => {
      const row: string[] = [];
      if (includeSource) row.push(`"${u.source}"`);
      row.push(`"${u.target}"`);
      if (includeComment) row.push(`"${u.comment || ''}"`);
      return row.join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=project_${projectId}_translated.csv`,
      },
    });
  } else {
    const lines = units.map((u) => {
      let line = '';
      if (includeSource) line += u.source + '\t→\t';
      line += u.target;
      if (includeComment) line += '\t[' + (u.comment || '') + ']';
      return line;
    });

    const text = lines.join('\n');

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename=project_${projectId}_translated.txt`,
      },
    });
  }
}
