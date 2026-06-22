import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { readFile } from 'fs/promises';
import path from 'path';

// Streams the database file as a download. ADMIN ONLY — it contains customer
// data, so it must never be reachable by a normal visitor.
export async function GET() {
  if (!(await requireAdmin())) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  try {
    const buf = await readFile(dbPath);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="soapfactory-backup-${stamp}.db"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse('Backup unavailable', { status: 500 });
  }
}
