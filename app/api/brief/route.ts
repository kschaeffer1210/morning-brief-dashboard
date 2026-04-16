import Redis from 'ioredis'
import { NextResponse } from 'next/server'

const redis = new Redis(process.env.REDIS_URL!)

export async function GET() {
  try {
    const raw = await redis.get('morning-brief-latest')
    if (!raw) {
      return NextResponse.json({ error: 'No brief found' }, { status: 404 })
    }
    const brief = typeof raw === 'string' ? JSON.parse(raw) : raw
    return NextResponse.json(brief)
  } catch (err) {
    console.error('[brief/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
