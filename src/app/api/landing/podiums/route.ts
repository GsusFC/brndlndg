import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SafeIndexerDsn =
  | {
      protocol: string
      hostname: string
      port: string | null
      database: string | null
      sslmode: string | null
    }
  | { invalidUrl: true }
  | null

const getSafeIndexerDsn = (): SafeIndexerDsn => {
  const raw = process.env.INDEXER_DATABASE_URL
  if (!raw) return null

  try {
    const url = new URL(raw)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || null,
      database: url.pathname.replace(/^\//, '') || null,
      sslmode: url.searchParams.get('sslmode'),
    }
  } catch {
    return { invalidUrl: true }
  }
}

export async function GET(request: Request) {
  const shouldIncludeDebug = new URL(request.url).searchParams.get('debug') === '1'

  try {
    const { getRecentPodiums } = await import('@/lib/landing/podiums')
    const podiums = await getRecentPodiums(10)
    return NextResponse.json(
      {
        podiums,
        ...(shouldIncludeDebug
          ? {
              debug: {
                commitRef: process.env.COMMIT_REF ?? null,
                context: process.env.CONTEXT ?? null,
                nodeEnv: process.env.NODE_ENV ?? null,
                hasIndexerDatabaseUrl: !!process.env.INDEXER_DATABASE_URL,
                hasNeynarApiKey: !!process.env.NEYNAR_API_KEY,
                indexerDsn: getSafeIndexerDsn(),
              },
            }
          : {}),
      },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json(
      {
        error: { message },
        ...(shouldIncludeDebug
          ? {
              debug: {
                commitRef: process.env.COMMIT_REF ?? null,
                context: process.env.CONTEXT ?? null,
                nodeEnv: process.env.NODE_ENV ?? null,
                hasIndexerDatabaseUrl: !!process.env.INDEXER_DATABASE_URL,
                hasNeynarApiKey: !!process.env.NEYNAR_API_KEY,
                indexerDsn: getSafeIndexerDsn(),
              },
            }
          : {}),
      },
      { status: 500 }
    )
  }
}
