import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { suggestTitles } from '../api'
import { getPosterUrl } from '../utils/images'
import HighlightedText from './HighlightedText'
import type { SuggestionItem } from '../types'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trimmedQuery = query.trim()

  const { data: results = [] } = useQuery<SuggestionItem[]>({
    queryKey: ['suggest', trimmedQuery],
    queryFn: () => suggestTitles(trimmedQuery),
    enabled: trimmedQuery.length > 0,
    placeholderData: (previous) => previous ?? [],
    staleTime: 10_000
  })
  const suggestions = results.slice(0, 6)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function goToTitle(id: number) {
    setOpen(false)
    setQuery('')
    navigate(`/titles/${id}`)
  }

  function formatType(type: SuggestionItem['type']) {
    return type === 'TV' ? 'TV series' : 'Movie'
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted2/80">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7.5" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Search movies or shows..."
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setOpen(nextQuery.trim().length > 0)
        }}
        onFocus={() => trimmedQuery.length > 0 && setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && trimmedQuery.length > 0) {
            event.preventDefault()
            if (results[0]) goToTitle(results[0].id)
          }
        }}
        className="w-full rounded-full border border-white/20 bg-ink/80 py-3 pl-11 pr-5 text-sm text-white shadow-sm outline-none transition placeholder:text-muted2/80 focus:border-accent/70 focus:ring-4 focus:ring-accent/25"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surfaceStrong">
          {suggestions.map((item) => {
            const posterUrl = getPosterUrl(item.posterUrl, 'search')
            return (
              <button
                key={item.id}
                type="button"
                className="grid w-full grid-cols-[48px_1fr] gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                onClick={() => goToTitle(item.id)}
              >
                <span className="h-16 w-12 overflow-hidden rounded-lg bg-[#11141a]">
                  {posterUrl ? (
                    <img src={posterUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="block h-full w-full bg-gradient-to-br from-[#2a2f38] to-[#0b0c10]" />
                  )}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">
                    <HighlightedText text={item.title} query={trimmedQuery} />
                  </span>
                  <span className="text-xs text-muted2">
                    {formatType(item.type)} {item.releaseDate ? `• ${item.releaseDate.slice(0, 4)}` : ''}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
