import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Generate unique filename with timestamp
 */
export function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Save base64 image to uploads directory
 * @param base64Data - Base64 encoded image data (with or without data URL prefix)
 * @param filename - Filename to save as
 * @returns Public URL path
 */
export async function saveBase64Image(
  base64Data: string,
  filename: string
): Promise<string> {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // Convert base64 to buffer
  const buffer = Buffer.from(base64, 'base64');

  // Save to public/uploads directory
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadsDir, filename);

  await writeFile(filePath, buffer);

  // Return public URL
  return `/uploads/${filename}`;
}

/**
 * Validate image file size
 * @param base64Data - Base64 encoded image
 * @param maxSizeMB - Maximum size in megabytes
 */
export function validateImageSize(
  base64Data: string,
  maxSizeMB: number = 5
): boolean {
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= maxSizeMB;
}
