export type TitleType = 'MOVIE' | 'TV'

export interface TitleSummary {
  id: number
  title: string
  posterUrl?: string | null
  releaseDate?: string | null
  rating?: number | null
  ratingCount?: number | null
  type: TitleType
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  characterName?: string | null
  profileUrl?: string | null
}

export interface TitleDetail extends TitleSummary {
  overview?: string | null
  runtimeMinutes?: number | null
  seasonCount?: number | null
  ratingCount?: number | null
  genres?: Genre[]
  cast?: CastMember[]
  recentReviews?: Review[]
}

export interface HomeSection {
  title: string
  items: TitleSummary[]
}

export interface HomeResponse {
  sections: HomeSection[]
  totalCountEstimate: number
}

export type SearchSort = 'NEWEST' | 'POPULAR' | 'RATING'

export interface SearchPayload {
  query?: string | null
  type?: TitleType | null
  yearFrom?: number | null
  yearTo?: number | null
  genreIds?: number[] | null
  minRating?: number | null
  maxRating?: number | null
  sort?: SearchSort | null
  limit?: number
  offset?: number
}

export interface SearchResponse {
  items: TitleSummary[]
  total?: number
  totalCapped?: boolean
}

export interface SuggestionItem {
  id: number
  title: string
  posterUrl?: string | null
  releaseDate?: string | null
  type: TitleType
}

export interface Person {
  id: number
  name: string
  profileUrl?: string | null
}

export interface PeopleResponse {
  items: Person[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface User {
  id?: number
  name?: string | null
  email?: string | null
}

export interface AuthResponse {
  user?: User | null
}

export interface Review {
  id: number
  rating: number
  review: string
  createdAt: string
  updatedAt: string
  userId?: number | null
  userName?: string | null
}

export interface ReviewPayload {
  rating: number
  review: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload extends LoginPayload {
  name: string
}

export type ApiError = Error & { status?: number }
