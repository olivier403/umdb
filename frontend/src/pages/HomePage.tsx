import { useQuery } from '@tanstack/react-query'
import { getHome } from '../api'
import SectionRow from '../components/SectionRow'
import type { HomeResponse, SearchSort } from '../types'

export default function HomePage() {
  const { data, isLoading } = useQuery<HomeResponse>({
    queryKey: ['home'],
    queryFn: getHome
  })

  const sortBySection: Record<string, SearchSort> = {
    'Trending Now': 'POPULAR',
    'New Releases': 'NEWEST',
    'Top Rated': 'RATING'
  }

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-surface px-6 py-7 sm:px-8 sm:py-9">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted2">UMDB</div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          The Micro Movie Database
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted sm:text-base">
          {data?.totalCountEstimate > 0
            ? `Discover ${data.totalCountEstimate.toLocaleString()} movies and TV shows, powered by Postgres`
            : 'Discover new movies and shows, powered by Postgres'}
        </p>
      </section>
      {isLoading && <div className="py-8 text-sm text-muted2">Loading recommendations…</div>}
      {!isLoading && data?.sections?.map((section) => {
        const sort = sortBySection[section.title]
        const viewMoreTo = sort ? `/browse?sort=${sort}` : undefined
        return (
          <SectionRow
            key={section.title}
            title={section.title}
            items={section.items}
            viewMoreTo={viewMoreTo}
          />
        )
      })}
    </div>
  )
}
