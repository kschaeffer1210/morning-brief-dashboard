import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('authorization') || ''
  const secret = process.env.BRIEF_API_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()

    // Basic shape validation
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await kv.set('morning-brief-latest', payload)

    return NextResponse.json({ ok: true, stored: 'morning-brief-latest' })
  } catch (err) {
    console.error('[ingest/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
