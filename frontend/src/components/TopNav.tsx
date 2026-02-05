import { Link, useLocation, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import { useAuth } from '../hooks/useAuth'
import type { TitleType } from '../types'

interface NavItem {
  label: string
  to: string
  match?: { type?: TitleType; paths?: string[] }
}

const navItems: NavItem[] = [
  { label: 'Movies', to: '/browse/movies', match: { type: 'MOVIE', paths: ['/browse/movies'] } },
  { label: 'TV\u00A0Shows', to: '/browse/tv', match: { type: 'TV', paths: ['/browse/tv'] } },
  { label: 'People', to: '/people' }
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoading, signOut } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const activeType = searchParams.get('type')

  function isActive(item: NavItem) {
    if (item.match?.paths?.includes(location.pathname)) {
      return true
    }
    if (item.match?.type) {
      return location.pathname === '/browse' && activeType === item.match.type
    }
    return location.pathname === item.to
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/15 bg-ink/90 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-stretch gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10">
        <div className="flex items-center justify-center gap-6 md:justify-start md:gap-8">
          <div
            className="cursor-pointer font-brand text-lg font-semibold text-white sm:text-xl"
            onClick={() => navigate('/')}
          >
            UMDB
          </div>
          <nav className="flex justify-center gap-4 text-xs text-muted2 sm:gap-6 sm:text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item) ? 'text-white' : 'transition hover:text-white'}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-4">
          <div className="w-full max-w-full lg:w-[420px] lg:max-w-none">
            <SearchBar />
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-muted">
            {isLoading ? (
              <div className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-muted2">
                Loading session…
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-ink/70 px-3 py-1.5 normal-case text-sm text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                    {(user.name || user.email || 'U')
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="flex min-w-0 max-w-[160px] flex-col leading-tight sm:max-w-[220px]">
                    <span className="text-[0.7rem] text-muted2">Signed in</span>
                    <span className="truncate text-sm">{user.name || user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted transition hover:border-white/30 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted transition hover:border-white/30 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
