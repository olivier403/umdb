import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import BrowseMoviesPage from './pages/BrowseMoviesPage'
import BrowseTvPage from './pages/BrowseTvPage'
import TitleDetailPage from './pages/TitleDetailPage'
import PeoplePage from './pages/PeoplePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <TopNav />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-5 py-8 pb-14 md:px-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/movies" element={<BrowseMoviesPage />} />
          <Route path="/browse/tv" element={<BrowseTvPage />} />
          <Route path="/titles/:id" element={<TitleDetailPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
