import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Security: prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    const buffer = await readFile(filePath);

    // Detect content type from extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' :
                       ext === 'gif' ? 'image/gif' :
                       ext === 'webp' ? 'image/webp' :
                       'image/jpeg'; // default to jpeg

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Not Found', { status: 404 });
  }
}
