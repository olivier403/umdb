import type {
  ApiError,
  AuthResponse,
  HomeResponse,
  LoginPayload,
  SearchPayload,
  SearchResponse,
  SignupPayload,
  SuggestionItem,
  TitleDetail,
  TitleSummary,
  Genre,
  Person,
  PeopleResponse,
  Review,
  ReviewPayload
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: optionHeaders, ...rest } = options
  const headers = new Headers(optionHeaders)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...rest
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || ''
    let message = ''
    if (contentType.includes('application/json')) {
      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
      message = data?.message || data?.error || ''
    } else {
      message = await res.text()
    }
    const error = new Error(message || `Request failed: ${res.status}`) as ApiError
    error.status = res.status
    throw error
  }

  if (res.status === 204) return null as T
  return (await res.json()) as T
}

export function getHome() {
  return request<HomeResponse>('/home')
}

export function getGenres() {
  return request<Genre[]>('/genres')
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

export function getTitle(id: string) {
  return request<TitleDetail>(`/titles/${id}`)
}

export function getSimilarTitles(id: string, limit = 12) {
  return request<TitleSummary[]>(`/titles/${id}/similar?limit=${limit}`)
}

export function addReview(titleId: string, payload: ReviewPayload) {
  return request<Review>(`/titles/${titleId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function searchTitles(body: SearchPayload) {
  return request<SearchResponse | TitleSummary[]>('/search', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function suggestTitles(query: string) {
  return request<SuggestionItem[]>(`/search/suggest?q=${encodeURIComponent(query)}`)
}

export function getPeople(params: QueryParams = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  const query = new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()
  return request<PeopleResponse | Person[]>(`/people${query ? `?${query}` : ''}`)
}

export function getCurrentUser() {
  return request<AuthResponse>('/auth/me')
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function signup(payload: SignupPayload) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function logout() {
  return request<null>('/auth/logout', {
    method: 'POST'
  })
}

export { API_BASE }
