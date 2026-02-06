export default function Footer() {
  const year = new Date().getFullYear()
  const repoUrl = 'https://github.com/olivier403/umdb'

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
          <span className="inline-flex flex-wrap items-center gap-2 text-muted2">
            © {year} UMDB
            <span className="text-white/20">·</span>
            <a
              className="inline-flex items-center gap-2 text-muted2 transition hover:text-white"
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.033 1.531 1.033.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.481A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
              </svg>
              <span>GitHub</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
