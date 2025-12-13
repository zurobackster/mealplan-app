import { NextResponse } from 'next/server';
import { access, readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');

  try {
    await access(uploadsDir);
    const files = await readdir(uploadsDir);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    return NextResponse.json({
      status: 'ok',
      uploadsDir,
      directoryExists: true,
      imageCount: imageFiles.length,
      sampleFiles: imageFiles.slice(0, 3)
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      uploadsDir,
      directoryExists: false,
      error: 'Uploads directory not accessible'
    }, { status: 500 });
  }
}
