import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { getRecentPodiums } = await import('@/lib/landing/podiums')
    const podiums = await getRecentPodiums(10)
    return NextResponse.json({ podiums })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
