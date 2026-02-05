export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-white/10 bg-ink/90">
      <div
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10">
        <div className="space-y-2">
          <div className="font-brand text-lg font-semibold text-white">UMDB</div>
          <p className="text-sm text-muted2">
            Discover new movies and TV shows, powered by Postgres
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm md:items-end">
          <span className="text-muted2">Movie data taken from themoviedb.org</span>
          <span className="text-muted2">© {year} UMDB</span>
        </div>
      </div>
    </footer>
  )
}
