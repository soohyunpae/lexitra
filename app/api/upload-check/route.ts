import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.error("✅ upload-check POST handler called");
    return NextResponse.json({ message: 'POST 요청 수신 완료' });
  }