import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'competitors.json');

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    // return empty array if file missing
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic validation
    if (!Array.isArray(body)) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
