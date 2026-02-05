export type PosterVariant = 'card' | 'detail' | 'search'
export type ProfileVariant = 'profile' | 'small'

const POSTER_SIZES: Record<PosterVariant, string> = {
  card: 'w342',
  detail: 'w500',
  search: 'w92'
}

const PROFILE_SIZES: Record<ProfileVariant, string> = {
  profile: 'w185',
  small: 'w92'
}

function setTmdbSize(rawUrl: string, size: string): string {
  const url = new URL(rawUrl)
  const parts = url.pathname.split('/').filter((p) => p !== '')
  const sizeIndex = parts.findIndex((p) => p === 'original' || p.startsWith('w'))
  if (sizeIndex >= 0) parts[sizeIndex] = size
  url.pathname = `/${parts.join('/')}`
  return url.toString()
}

export function getPosterUrl(rawUrl?: string | null, variant: PosterVariant = 'card'): string | null {
  if (!rawUrl) return null
  return setTmdbSize(rawUrl, POSTER_SIZES[variant])
}

export function getProfileUrl(rawUrl?: string | null, variant: ProfileVariant = 'profile'): string | null {
  if (!rawUrl) return null
  return setTmdbSize(rawUrl, PROFILE_SIZES[variant])
}
