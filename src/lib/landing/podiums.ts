import { Pool } from 'pg'

type BrandsSnapshot = Record<string, { name: string; imageUrl: string | null; channel: string | null }>

import rawBrandsSnapshot from '@/../public/data/brands.json'

const brandsSnapshot = rawBrandsSnapshot as unknown as BrandsSnapshot

export interface PodiumBrand {
  id: number
  name: string
  imageUrl: string | null
}

export interface PodiumUser {
  fid: number
  username: string
  userPhoto: string | null
}

export interface Podium {
  id: string
  date: string
  username: string
  userPhoto: string | null
  brand1: PodiumBrand | null
  brand2: PodiumBrand | null
  brand3: PodiumBrand | null
}

const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const getIndexerDbUrl = (): string => {
  const url = process.env.INDEXER_DATABASE_URL
  assert(url, 'INDEXER_DATABASE_URL is required')
  return url
}

const getPgSslConfig = (connectionString: string): { rejectUnauthorized: false } | undefined => {
  try {
    const parsed = new URL(connectionString)
    const host = parsed.hostname
    if (host === 'localhost' || host === '127.0.0.1') return undefined
  } catch {
    // If we can't parse it, err on the side of supporting Railway/proxy TLS.
    return { rejectUnauthorized: false }
  }

  return { rejectUnauthorized: false }
}

const getSchemaName = (connectionString: string): string => {
  try {
    const parsed = new URL(connectionString)
    const schema = parsed.searchParams.get('schema')
    if (schema && schema.length > 0) return schema
  } catch {
    // ignore
  }
  return 'production-4'
}

const quoteIdent = (identifier: string): string => {
  assert(identifier.length > 0, 'quoteIdent: identifier must not be empty')
  assert(!identifier.includes('"'), 'quoteIdent: identifier must not contain double quotes')
  return `"${identifier}"`
}

const globalForPg = globalThis as unknown as { __brndLandingPgPool?: Pool }

const getPool = (): Pool => {
  const connectionString = getIndexerDbUrl()

  const existing = globalForPg.__brndLandingPgPool
  if (existing) return existing

  const pool = new Pool({
    connectionString,
    ssl: getPgSslConfig(connectionString),
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  })

  globalForPg.__brndLandingPgPool = pool
  return pool
}

type NeynarBulkUser = {
  fid: number
  username: string
  pfp_url?: string
}

const fetchUsersFromNeynar = async (fids: number[]): Promise<Map<number, PodiumUser>> => {
  const apiKey = process.env.NEYNAR_API_KEY
  assert(apiKey, 'NEYNAR_API_KEY is required')

  const uniqueFids = Array.from(new Set(fids.filter((fid) => Number.isInteger(fid) && fid > 0)))
  if (uniqueFids.length === 0) return new Map()

  const url = new URL('https://api.neynar.com/v2/farcaster/user/bulk')
  url.searchParams.set('fids', uniqueFids.join(','))

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    // Cache server-side to reduce Neynar calls
    next: { revalidate: 60 },
  })

  assert(res.ok, `Neynar bulk error: ${res.status}`)

  const data: unknown = await res.json()
  assert(typeof data === 'object' && data !== null, 'Neynar bulk: invalid response')

  const users = (data as { users?: unknown }).users
  assert(Array.isArray(users), 'Neynar bulk: response.users must be an array')

  const out = new Map<number, PodiumUser>()

  for (const u of users as NeynarBulkUser[]) {
    if (!u || typeof u !== 'object') continue
    if (!Number.isInteger(u.fid) || u.fid <= 0) continue
    if (typeof u.username !== 'string' || u.username.length === 0) continue

    out.set(u.fid, {
      fid: u.fid,
      username: u.username,
      userPhoto: typeof u.pfp_url === 'string' && u.pfp_url.length > 0 ? u.pfp_url : null,
    })
  }

  return out
}

const resolveBrand = (brandId: number): PodiumBrand => {
  assert(Number.isInteger(brandId) && brandId > 0, `Invalid brandId: ${String(brandId)}`)

  const meta = brandsSnapshot[String(brandId)]
  if (!meta) {
    return { id: brandId, name: `Brand #${brandId}`, imageUrl: null }
  }

  return {
    id: brandId,
    name: meta.name,
    imageUrl: meta.imageUrl,
  }
}

type VoteRow = {
  id: string
  fid: number
  brand_ids: string
  timestamp: string | number
}

export async function getRecentPodiums(limit = 10): Promise<Podium[]> {
  assert(Number.isInteger(limit) && limit > 0 && limit <= 50, 'limit must be 1..50')

  const connectionString = getIndexerDbUrl()
  const schemaName = getSchemaName(connectionString)
  const schemaIdent = quoteIdent(schemaName)

  const pool = getPool()

  const result = await pool.query<VoteRow>(
    `SELECT id, fid, brand_ids, timestamp FROM ${schemaIdent}.votes ORDER BY timestamp DESC LIMIT $1`,
    [limit]
  )

  const rows = result.rows

  const fids = rows.map((row) => row.fid)
  const usersByFid = await fetchUsersFromNeynar(fids)

  return rows.map((row) => {
    assert(typeof row.id === 'string' && row.id.length > 0, 'votes.id must be a string')
    assert(Number.isInteger(row.fid) && row.fid > 0, 'votes.fid must be a positive int')
    assert(typeof row.brand_ids === 'string' && row.brand_ids.length > 0, 'votes.brand_ids must be a JSON string')

    let brandIds: number[] = []
    try {
      const parsed = JSON.parse(row.brand_ids) as unknown
      assert(Array.isArray(parsed), 'votes.brand_ids must be a JSON array')
      brandIds = parsed.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0)
      assert(brandIds.length >= 3, 'votes.brand_ids must contain at least 3 brand IDs')
    } catch {
      throw new Error(`Failed to parse votes.brand_ids for vote ${row.id}`)
    }

    const ts = typeof row.timestamp === 'number' ? row.timestamp : Number(row.timestamp)
    assert(Number.isFinite(ts) && ts > 0, 'votes.timestamp must be a positive number')

    const user = usersByFid.get(row.fid)
    assert(user, `Missing user metadata for fid ${row.fid}`)

    const [b1, b2, b3] = brandIds

    return {
      id: row.id,
      date: new Date(ts * 1000).toISOString(),
      username: user.username,
      userPhoto: user.userPhoto,
      brand1: resolveBrand(b1),
      brand2: resolveBrand(b2),
      brand3: resolveBrand(b3),
    }
  })
}
