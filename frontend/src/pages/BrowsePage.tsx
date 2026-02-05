import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getGenres, searchTitles } from '../api'
import TitleCard from '../components/TitleCard'
import TextField from '../components/TextField'
import Select from '../components/Select'
import FieldLabel from '../components/FieldLabel'
import Input from '../components/Input'
import type { Genre, SearchPayload, SearchResponse, SearchSort, TitleSummary, TitleType } from '../types'
import type { FormEvent } from 'react'

interface BrowsePageProps {
  fixedType?: TitleType
}

const PAGE_SIZE = 20

export default function BrowsePage({ fixedType }: BrowsePageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const urlSort = useMemo<SearchSort>(() => {
    const value = searchParams.get('sort')
    if (value === 'POPULAR' || value === 'RATING' || value === 'NEWEST') return value
    return 'NEWEST'
  }, [searchParams])
  const urlType = useMemo<TitleType | ''>(() => {
    const value = searchParams.get('type')
    return value === 'MOVIE' || value === 'TV' ? value : ''
  }, [searchParams])
  const resolvedType = fixedType ?? urlType

  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState<SearchSort>(urlSort)
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [genreId, setGenreId] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxRating, setMaxRating] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    setSort(urlSort)
  }, [urlSort])

  useEffect(() => {
    setPage(1)
  }, [query, resolvedType, yearFrom, yearTo, genreId, minRating, maxRating, sort])

  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: getGenres
  })

  const searchPayload = useMemo<SearchPayload>(() => {
    const trimmedQuery = query.trim()
    return {
      query: trimmedQuery,
      type: resolvedType || null,
      yearFrom: yearFrom ? Number(yearFrom) : null,
      yearTo: yearTo ? Number(yearTo) : null,
      genreIds: genreId ? [Number(genreId)] : null,
      minRating: minRating ? Number(minRating) : null,
      maxRating: maxRating ? Number(maxRating) : null,
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    }
  }, [query, resolvedType, yearFrom, yearTo, genreId, minRating, maxRating, sort, page])

  const { data: searchData, isLoading } = useQuery<SearchResponse | TitleSummary[]>({
    queryKey: ['search', searchPayload],
    queryFn: async () => {
      return searchTitles(searchPayload)
    },
    placeholderData: (previous) => previous ?? { items: [] }
  })

  const results = useMemo(() => {
    if (Array.isArray(searchData)) return searchData
    return searchData?.items || []
  }, [searchData])

  const total = useMemo(() => {
    if (Array.isArray(searchData)) return undefined
    return searchData?.total
  }, [searchData])

  const totalCapped = useMemo(() => {
    if (Array.isArray(searchData)) return false
    return searchData?.totalCapped ?? false
  }, [searchData])

  const totalPages = useMemo(() => {
    if (typeof total !== 'number') return 1
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [total])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const queryLabel = useMemo(() => {
    if (query.trim()) return `Results for "${query.trim()}"`
    if (resolvedType === 'MOVIE') return 'Browse Movies'
    if (resolvedType === 'TV') return 'Browse TV Shows'
    return 'Browse Movies and TV Shows'
  }, [query, resolvedType])

  const pageItems = useMemo(() => {
    const items: Array<number | 'ellipsis'> = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) items.push(i)
      return items
    }
    items.push(1)
    if (page > 3) items.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i += 1) items.push(i)
    if (page < totalPages - 2) items.push('ellipsis')
    items.push(totalPages)
    return items
  }, [page, totalPages])

  const formatCount = useMemo(() => new Intl.NumberFormat(), [])
  const resultsLabel = useMemo(() => {
    if (isLoading) return 'Loading…'
    if (typeof total === 'number') {
      const formatted = formatCount.format(total)
      return totalCapped ? `${formatted}+ results` : `${formatted} results`
    }
    return `${results.length} results`
  }, [formatCount, isLoading, results.length, total, totalCapped])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextParams: Record<string, string> = {}
    if (query.trim()) nextParams.q = query.trim()
    if (!fixedType && urlType) nextParams.type = urlType
    if (sort) nextParams.sort = sort
    setSearchParams(nextParams)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">{queryLabel}</h1>
        <p className="mt-2 text-muted">Filter by year, rating, or genre to refine the results.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="self-start rounded-2xl border border-white/10 bg-surfaceStrong p-5 lg:sticky lg:top-28">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted2">Filters</h2>
            <span className="text-xs text-muted2">{resultsLabel}</span>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Select
              label="Sort"
              value={sort}
              onChange={(value) => setSort(value as SearchSort)}
              options={[
                { value: 'NEWEST', label: 'Newest' },
                { value: 'POPULAR', label: 'Popular' },
                { value: 'RATING', label: 'Rating' }
              ]}
            />

            <TextField
              label="Search"
              type="text"
              value={query}
              onChange={setQuery}
              placeholder="Title"
            />

            <FieldLabel label="Year">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={yearFrom}
                  onChange={setYearFrom}
                  placeholder="From"
                  min="1950"
                  max="2030"
                />
                <Input
                  type="number"
                  value={yearTo}
                  onChange={setYearTo}
                  placeholder="To"
                  min="1950"
                  max="2030"
                />
              </div>
            </FieldLabel>

            <Select
              label="Genre"
              value={genreId || '__any__'}
              onChange={(value) => setGenreId(value === '__any__' ? '' : value)}
              options={[
                { value: '__any__', label: 'Any' },
                ...genres.map((genre) => ({
                  value: String(genre.id),
                  label: genre.name
                }))
              ]}
            />

            <FieldLabel label="Rating">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={minRating}
                  onChange={setMinRating}
                  placeholder="Min"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <Input
                  type="number"
                  value={maxRating}
                  onChange={setMaxRating}
                  placeholder="Max"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </FieldLabel>

          </form>
        </aside>

        <section>
          {isLoading && <div className="py-8 text-sm text-muted2">Loading results…</div>}

          {!isLoading && (
            <>
              {results.length === 0 ? (
                <div className="py-10 text-sm text-muted2">
                  No results found. Try a different search or clear some filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {results.map((item) => (
                    <TitleCard key={item.id} item={item} />
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted2">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted2 transition hover:border-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {pageItems.map((item, index) =>
                      item === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-xs text-muted2">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPage(item)}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            item === page
                              ? 'border-accent/60 bg-accent/20 text-white'
                              : 'border-white/10 text-muted2 hover:border-accent/50 hover:text-white'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page === totalPages}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted2 transition hover:border-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
