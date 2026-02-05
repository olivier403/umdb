import { Link } from 'react-router-dom'
import TitleCard from './TitleCard'
import type { TitleSummary } from '../types'

interface SectionRowProps {
  title: string
  items: TitleSummary[]
  viewMoreTo?: string
  viewMoreLabel?: string
}

export default function SectionRow({ title, items, viewMoreTo, viewMoreLabel }: SectionRowProps) {
  const visibleItems = items.slice(0, 6)

  return (
    <section className="pt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl text-white">{title}</h2>
        {viewMoreTo && (
          <Link
            to={viewMoreTo}
            className="text-xs font-semibold text-accent2 transition hover:text-white"
          >
            {viewMoreLabel ?? 'View more'}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {visibleItems.map((item) => (
          <TitleCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
