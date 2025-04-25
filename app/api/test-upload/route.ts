export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  console.error("👀 GET handler for test-upload called (via error log)");
  return new Response("GET 요청 도착 확인됨", { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    console.error('📥 POST handler called');
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const note = formData.get('note') as string;

    // Optional: file handling
    const files = formData.getAll('files'); // Blob[]
    console.log('📦 Received files:', files);

    // Save uploaded files to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFileNames: string[] = [];

    for (const file of files) {
      if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = file.type.split('/').pop() || 'bin';
        const filename = `uploaded-${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        savedFileNames.push(filename);
      }
    }
    console.log('📝 savedFileNames:', savedFileNames);

    const newProject = await prisma.project.create({
      data: {
        name,
        note,
        files: {
          create: savedFileNames.map((filename) => ({
            filename,
            content: "",
          })),
        },
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json({
      id: newProject.id,
      files: newProject.files.map((file) => `/uploads/${file.filename}`),
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}