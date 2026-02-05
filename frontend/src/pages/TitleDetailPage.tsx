import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {addReview, getSimilarTitles, getTitle} from '../api'
import SectionRow from '../components/SectionRow'
import {getPosterUrl, getProfileUrl} from '../utils/images'
import StarIcon from '../components/StarIcon'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import Alert from '../components/Alert'
import {useAuth} from '../hooks/useAuth'
import type {ApiError, Review, TitleDetail, TitleSummary} from '../types'
import type {FormEvent} from 'react'

export default function TitleDetailPage() {
  const {id} = useParams()
  if (!id) {
    return <div className="py-8 text-sm text-muted2">Title not found.</div>
  }

  return <TitleDetailContent key={id} id={id}/>
}

function TitleDetailContent({id}: { id: string }) {
  const {user} = useAuth()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(8)
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<number, boolean>>({})
  const [isCastExpanded, setIsCastExpanded] = useState(false)

  const {data: title, isLoading} = useQuery<TitleDetail>({
    queryKey: ['title', id],
    queryFn: () => getTitle(id),
    enabled: Boolean(id)
  })

  const {
    data: similar,
    isLoading: isSimilarLoading,
    isError: isSimilarError
  } = useQuery<TitleSummary[]>({
    queryKey: ['title', id, 'similar'],
    queryFn: () => getSimilarTitles(id),
    enabled: Boolean(id)
  })

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; review: string }) => addReview(id, payload),
    onSuccess: () => {
      setReviewText('')
      setReviewSuccess('Review saved. Thanks for sharing!')
      setReviewError('')
      setIsReviewFormOpen(false)
      void queryClient.invalidateQueries({queryKey: ['title', id]})
    },
    onError: (error: ApiError) => {
      setReviewSuccess('')
      if (error?.status === 401) {
        setReviewError('Please sign in to post a review.')
      } else if (error?.status === 403) {
        setReviewError(error?.message && error.message !== 'Forbidden' ? error.message : 'Reviews are currently disabled.')
      } else {
        setReviewError(error?.message || 'Unable to submit your review. Please try again.')
      }
    }
  })

  if (isLoading) {
    return <div className="py-8 text-sm text-muted2">Loading title…</div>
  }

  if (!title) {
    return <div className="py-8 text-sm text-muted2">Title not found.</div>
  }

  const typeLabel = title.type === 'TV' ? 'TV Show' : 'Movie'
  const similarLabel = title.type === 'TV' ? 'Similar Series' : 'Similar Movies'
  const posterUrl = getPosterUrl(title.posterUrl, 'detail')
  const recentReviews = (title.recentReviews ?? []).slice(0, 2)
  const isReviewPending = reviewMutation.isPending
  const hasRating =
    typeof title.ratingCount === 'number' && title.ratingCount > 0 &&
    title.rating !== null && title.rating !== undefined
  const ratingCountLabel = hasRating
    ? `${title.ratingCount.toLocaleString()} rating${title.ratingCount === 1 ? '' : 's'}`
    : null
  const expandedReviews = new Set(
    Object.entries(expandedReviewIds)
      .filter(([, value]) => value)
      .map(([key]) => Number(key))
  )

  const maxCast = 8
  const castMembers = title.cast ?? []
  const hasMoreCast = castMembers.length > maxCast
  const visibleCast = isCastExpanded ? castMembers : castMembers.slice(0, maxCast)

  function formatReviewDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Recently'
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function getInitials(name?: string | null) {
    if (!name) return 'U'
    const parts = name.split(' ').filter(Boolean)
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '')
    return initials.join('') || 'U'
  }

  function getReviewPreview(text: string) {
    const normalized = text.trimEnd()
    const paragraphs = normalized.split(/\n{2,}/)
    let preview = normalized

    if (paragraphs.length > 2) {
      preview = paragraphs.slice(0, 2).join('\n\n')
    }

    const maxChars = 520
    if (preview.length > maxChars) {
      const clipped = preview.slice(0, maxChars)
      const lastSpace = clipped.lastIndexOf(' ')
      preview = (lastSpace > 200 ? clipped.slice(0, lastSpace) : clipped).trimEnd()
    }

    const isTruncated = preview.length < normalized.length
    return {preview, isTruncated}
  }

  function toggleReviewExpansion(reviewId: number) {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) {
      setReviewError('Sign in to leave a review.')
      setReviewSuccess('')
      return
    }

    const trimmedReview = reviewText.trim()
    if (!trimmedReview) {
      setReviewError('Please add a few words about your take.')
      setReviewSuccess('')
      return
    }

    setReviewError('')
    setReviewSuccess('')
    reviewMutation.mutate({rating, review: trimmedReview})
  }

  function clearReviewMessages() {
    setReviewError('')
    setReviewSuccess('')
  }

  return (
    <div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(160px,220px)_1fr]">
        <div
          className="mx-auto w-full max-w-[220px] aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 sm:max-w-[260px] lg:mx-0 lg:max-w-none">
          {posterUrl ? (
            <img src={posterUrl} alt={title.title} className="h-full w-full object-cover"/>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#2a2f38] to-[#0b0c10]"/>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-muted2">{typeLabel}</div>
          <h1 className="mt-4 font-display text-4xl text-white">{title.title}</h1>
          <p
            className="mt-4 max-w-2xl text-muted">{title.overview || 'No description available.'}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div>
              <span className="block text-xs font-medium text-muted2">Release</span>
              <strong
                className="mt-2 block font-display text-lg text-white">{title.releaseDate || '—'}</strong>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted2">Rating</span>
              {hasRating ? (
                <div className="mt-2 inline-flex items-center gap-2 group relative">
                  <StarIcon className="h-4 w-4 text-amber-300"/>
                  <strong
                    className="font-display text-lg text-white">{title.rating.toFixed(1)}</strong>
                  {ratingCountLabel && (
                    <span
                      className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-2.5 py-1 text-[0.65rem] font-semibold text-white opacity-0 shadow-lg backdrop-blur transition-opacity duration-150 group-hover:opacity-100">
                      {ratingCountLabel}
                    </span>
                  )}
                </div>
              ) : (
                <strong className="mt-2 block font-display text-lg text-white">—</strong>
              )}
            </div>
            <div>
              <span className="block text-xs font-medium text-muted2">
                {title.type === 'TV' ? 'Seasons' : 'Runtime'}
              </span>
              <strong className="mt-2 block font-display text-lg text-white">
                {title.type === 'TV'
                  ? title.seasonCount || '—'
                  : title.runtimeMinutes
                    ? `${title.runtimeMinutes} min`
                    : '—'}
              </strong>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted2">Genres</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {title.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-white">Cast</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCast.map((member) => {
            const profileUrl = getProfileUrl(member.profileUrl, 'small')
            return (
              <div
                key={`${member.id}-${member.characterName}`}
                className="rounded-2xl border border-white/10 bg-surfaceStrong p-4 text-center"
              >
                <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full">
                  {profileUrl ? (
                    <img src={profileUrl} alt={member.name} className="h-full w-full object-cover"/>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#2a2f38] to-[#0b0c10]"/>
                  )}
                </div>
                <div className="text-sm font-semibold text-white">{member.name}</div>
                <div className="text-xs text-muted2">{member.characterName}</div>
              </div>
            )
          })}
        </div>
        {hasMoreCast && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsCastExpanded((prev) => !prev)}
              className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              {isCastExpanded ? 'Show less' : `Show more (${castMembers.length - maxCast})`}
            </button>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl text-white">Recent Reviews</h2>
        </div>
        <div className="mt-4">
          {recentReviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentReviews.map((review: Review) => {
                const {preview, isTruncated} = getReviewPreview(review.review)
                const isExpanded = expandedReviews.has(review.id)
                return (
                  <div key={review.id}
                       className="rounded-2xl border border-white/10 bg-surfaceStrong p-5">
                    <div className="flex gap-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        {getInitials(review.userName)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-sm font-semibold text-white">{review.userName || 'Anonymous'}</span>
                          <span
                            className="text-xs text-muted2">{formatReviewDate(review.updatedAt)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                          <StarIcon className="h-4 w-4 text-amber-300"/>
                          <span className="text-white">{review.rating}/10</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted whitespace-pre-line">
                      {isExpanded ? review.review : preview}
                      {!isExpanded && isTruncated && (
                        <>
                          {' '}
                          <button
                            type="button"
                            onClick={() => toggleReviewExpansion(review.id)}
                            className="font-semibold text-accent2 transition hover:text-white"
                          >
                            Read more
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-surface p-5 text-sm text-muted2">
              No reviews yet. Be the first to share your take.
            </div>
          )}
        </div>

        <div className="mt-4">
          {user ? (
            <>
              {!isReviewFormOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    clearReviewMessages()
                    setIsReviewFormOpen(true)
                  }}
                  className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Write a review
                </button>
              ) : (
                <form className="mt-3 grid max-w-xl gap-4" onSubmit={handleReviewSubmit}>
                  <Select
                    label="Rating"
                    value={rating}
                    onChange={(value) => {
                      setRating(Number(value))
                      clearReviewMessages()
                    }}
                    options={Array.from({length: 10}, (_, index) => ({
                      value: String(10 - index),
                      label: String(10 - index)
                    }))}
                  />

                  <TextArea
                    label="Review"
                    value={reviewText}
                    onChange={(value) => {
                      setReviewText(value)
                      clearReviewMessages()
                    }}
                    maxLength={1000}
                    rows={4}
                    placeholder="What stood out? Keep it short and sharp."
                  />

                  {reviewError && <Alert variant="error">{reviewError}</Alert>}
                  {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isReviewPending}
                      className="h-9 rounded-full bg-accent px-4 text-xs font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isReviewPending ? 'Saving review…' : 'Post review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewFormOpen(false)
                        clearReviewMessages()
                      }}
                      className="h-9 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Sign in to review
            </Link>
          )}
        </div>
      </section>

      {isSimilarLoading && <div className="py-8 text-sm text-muted2">Loading similar titles…</div>}
      {isSimilarError && !isSimilarLoading && (
        <div className="py-8 text-sm text-muted2">Unable to load similar titles.</div>
      )}
      {!isSimilarLoading && !isSimilarError && similar && similar.length > 0 && (
        <SectionRow title={similarLabel} items={similar}/>
      )}
      {!isSimilarLoading && !isSimilarError && (!similar || similar.length === 0) && (
        <div className="py-8 text-sm text-muted2">No similar titles yet.</div>
      )}
    </div>
  )
}
