import { Link } from 'react-router-dom'
import type { TitleSummary } from '../types'
import { getPosterUrl } from '../utils/images'
import StarIcon from './StarIcon'
import HighlightedText from './HighlightedText'

interface TitleCardProps {
  item: TitleSummary
  highlightQuery?: string
}

export default function TitleCard({ item, highlightQuery = '' }: TitleCardProps) {
  const posterUrl = getPosterUrl(item.posterUrl, 'card')
  const releaseYear = item.releaseDate ? item.releaseDate.slice(0, 4) : null
  const trailerType = item.type === 'MOVIE' ? 'movie trailer' : 'tv show trailer'
  const trailerQuery = [item.title, releaseYear, trailerType]
    .filter(Boolean)
    .join(' ')
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trailerQuery)}`

  const hasRating =
    typeof item.ratingCount === 'number' && item.ratingCount > 0 &&
    item.rating !== null && item.rating !== undefined

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface transition-transform duration-150 hover:scale-[1.02] hover:border-white/20">
      <Link to={`/titles/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0f14]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#2a2f38] to-[#0b0c10]" />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 bg-white/[0.04] px-3 py-3">
        <Link to={`/titles/${item.id}`} className="flex flex-col gap-2">
          <div className="text-[0.95rem] font-semibold leading-snug text-white">
            <HighlightedText text={item.title} query={highlightQuery} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted2 leading-none">
            <span>{item.releaseDate ? item.releaseDate.slice(0, 4) : '—'}</span>
            {hasRating ? (
              <span className="inline-flex items-center gap-1 text-amber-200">
                <StarIcon className="h-3 w-3 -translate-y-[0.5px]" />
                <span className="font-semibold text-[0.75rem] leading-none">{item.rating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted2">
                <StarIcon className="h-3 w-3 -translate-y-[0.5px]" />
                <span className="font-semibold text-[0.75rem] leading-none">—</span>
              </span>
            )}
          </div>
        </Link>
        <a
          href={trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/[0.12]"
          aria-label={`Open trailer search for ${item.title}`}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.2 3.6A1 1 0 0 0 3 4.5v7a1 1 0 0 0 1.6.8l6-3.5a1 1 0 0 0 0-1.6l-6-3.5a1 1 0 0 0-.4-.1z" />
          </svg>
          Trailer
        </a>
      </div>
    </div>
  )
}
