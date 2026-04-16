import Redis from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis(process.env.REDIS_URL!)

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('authorization') || ''
  const secret = process.env.BRIEF_API_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    await redis.set('morning-brief-latest', JSON.stringify(payload))
    return NextResponse.json({ ok: true, stored: 'morning-brief-latest' })
  } catch (err) {
    console.error('[ingest/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
