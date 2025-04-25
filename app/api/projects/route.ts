/**
 * 🔹 POST /api/projects
 * This API handles basic project creation with file upload.
 * It accepts a multipart/form-data POST request containing:
 * - name: string (project name)
 * - note: string (project memo)
 * - files: one or more files (uploaded Blobs)
 * Uploaded files are saved under /public/uploads,
 * and linked to the created project via the database.
 * The GET handler returns a list of all projects with basic metadata.
 */
export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany() // 프로젝트 목록 가져오기
    return NextResponse.json(projects)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.error('✅ POST /api/projects called');
  try {
    console.error('📥 content-type:', req.headers.get('content-type'));
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const note = formData.get('note') as string;

    // Optional: file handling
    const files = formData.getAll('files'); // Blob[]
    if (!files || files.length === 0) {
      console.error('🚫 No files received!');
    }
    console.log('📦 Received files:', files);

    // Save uploaded files to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFileData: { filename: string; content: string }[] = [];

    for (const file of files) {
      if (file instanceof File) {
        const fileObj = file as File;
        const arrayBuffer = await fileObj.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = path.extname(fileObj.name) || '.txt';
        const filename = `uploaded-${Date.now()}-${Math.random().toString(36).substring(2)}${extension}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        savedFileData.push({ filename, content: buffer.toString('utf-8') });
      } else {
        console.error('⚠️ Unexpected file type:', file);
      }
    }
    console.log('📝 savedFileData:', savedFileData);

    const newProject = await prisma.project.create({
      data: {
        name,
        note,
        files: {
          create: savedFileData.map(({ filename, content }) => ({
            filename,
            content,
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