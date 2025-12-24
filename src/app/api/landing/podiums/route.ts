import { NextResponse } from 'next/server'
import { getRecentPodiums } from '@/lib/landing/podiums'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const podiums = await getRecentPodiums(10)
  return NextResponse.json({ podiums })
}
