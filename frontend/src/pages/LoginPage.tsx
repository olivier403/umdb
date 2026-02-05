import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TextField from '../components/TextField'
import Alert from '../components/Alert'
import type { ApiError } from '../types'
import type { FormEvent } from 'react'

export default function LoginPage() {
  const { user, isLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter an email to continue.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await signIn({ email: trimmedEmail, password })
      navigate('/')
    } catch (err: unknown) {
      const error = err as ApiError
      if (error?.status === 401) {
        setError('Invalid email or password.')
      } else {
        setError(error?.message || 'We could not sign you in. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-surfaceStrong p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-white">Sign in</h1>
          <Link to="/signup" className="text-sm font-semibold text-accent2 transition hover:text-white">
            Create account
          </Link>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Your email"
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {error && <Alert variant="error">{error}</Alert>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[46px] rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in now'}
          </button>

          <p className="text-xs text-muted2">
            New here?{' '}
            <Link to="/signup" className="text-accent2 hover:text-white">
              Create an account
            </Link>.
          </p>
        </form>
      </section>
    </div>
  )
}
