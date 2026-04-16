import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const brief = await kv.get('morning-brief-latest')
    if (!brief) {
      return NextResponse.json({ error: 'No brief found' }, { status: 404 })
    }
    return NextResponse.json(brief)
  } catch (err) {
    console.error('[brief/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
