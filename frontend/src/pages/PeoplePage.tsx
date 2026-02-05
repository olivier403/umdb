import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPeople } from '../api'
import { getProfileUrl } from '../utils/images'
import type { PeopleResponse, Person } from '../types'

const PAGE_SIZE = 24

export default function PeoplePage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery<PeopleResponse | Person[]>({
    queryKey: ['people', page],
    queryFn: () => getPeople({ page: page - 1, size: PAGE_SIZE }),
    placeholderData: (previous) => previous
  })

  const totalPages = useMemo(() => {
    if (Array.isArray(data)) {
      return Math.max(1, Math.ceil(data.length / PAGE_SIZE))
    }
    const totalCount = data?.total ?? 0
    const size = data?.size ?? PAGE_SIZE
    return Math.max(1, Math.ceil(totalCount / size))
  }, [data])

  const effectivePage = Math.min(page, totalPages)

  const people = useMemo(() => {
    if (Array.isArray(data)) {
      const start = (effectivePage - 1) * PAGE_SIZE
      const end = start + PAGE_SIZE
      return data.slice(start, end)
    }
    return data?.items ?? []
  }, [data, effectivePage])

  const pageItems = useMemo(() => {
    const items: Array<number | 'ellipsis'> = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) items.push(i)
      return items
    }
    items.push(1)
    if (effectivePage > 3) items.push('ellipsis')
    const start = Math.max(2, effectivePage - 1)
    const end = Math.min(totalPages - 1, effectivePage + 1)
    for (let i = start; i <= end; i += 1) items.push(i)
    if (effectivePage < totalPages - 2) items.push('ellipsis')
    items.push(totalPages)
    return items
  }, [effectivePage, totalPages])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">People</h1>
        <p className="mt-2 text-muted">Browse cast members and creators.</p>
      </div>

      {isLoading && people.length === 0 && <div className="py-8 text-sm text-muted2">Loading people…</div>}
      {isError && (
        <div className="py-8 text-sm text-muted2">
          We couldn’t load people right now. Check that the API is running and try again.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {people.length === 0 ? (
            <div className="py-8 text-sm text-muted2">No people found.</div>
          ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {people.map((person) => {
              const profileUrl = getProfileUrl(person.profileUrl, 'small')
              return (
                <div key={person.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surfaceStrong p-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-[#0f1116]">
                    {profileUrl ? (
                      <img src={profileUrl} alt={person.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#2a2f38] to-[#0b0c10]" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{person.name}</div>
                    <div className="text-xs text-muted2">Cast & crew</div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted2">
                Page {effectivePage} of {totalPages}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={effectivePage === 1}
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
                        item === effectivePage
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
                  disabled={effectivePage === totalPages}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted2 transition hover:border-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
