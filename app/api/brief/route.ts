import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    const brief = await redis.get('morning-brief-latest')
    if (!brief) {
      return NextResponse.json({ error: 'No brief found' }, { status: 404 })
    }
    return NextResponse.json(brief)
  } catch (err) {
    console.error('[brief/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
