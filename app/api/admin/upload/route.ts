import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB input — gets compressed down on save
const MAX_WIDTH = 1600;             // resize anything wider than this

// Saves an uploaded image to /public/uploads, automatically resized & compressed
// to a web-friendly WebP. ADMIN ONLY. Self-hosted (sharp runs on your server).
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Няма избран файл.' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Разрешени са само снимки (JPG, PNG, WEBP, GIF).' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файлът е твърде голям (макс. 15 MB).' }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  try {
    const animated = file.type === 'image/gif';
    output = await sharp(input, { animated })
      .rotate() // respect EXIF orientation from phone photos
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'Невалиден файл със снимка.' }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), output);

  return NextResponse.json({ url: `/uploads/${filename}`, bytes: output.length });
}
