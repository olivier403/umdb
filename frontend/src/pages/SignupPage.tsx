import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TextField from '../components/TextField'
import Alert from '../components/Alert'
import type { ApiError } from '../types'
import type { FormEvent } from 'react'

export default function SignupPage() {
  const { user, isLoading, signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
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
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail) {
      setError('Please add your name and email to get started.')
      return
    }

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setError('Name must be between 2 and 120 characters.')
      return
    }

    if (password.trim().length < 8) {
      setError('Please choose a password with at least 8 characters.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await signUp({ name: trimmedName, email: trimmedEmail, password })
      navigate('/')
    } catch (err: unknown) {
      const error = err as ApiError
      if (error?.status === 409) {
        setError('That email is already registered. Try signing in instead.')
      } else {
        setError(error?.message || 'We could not create your account. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-surfaceStrong p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-white">Create account</h1>
          <Link to="/login" className="text-sm font-semibold text-accent2 transition hover:text-white">
            Sign in
          </Link>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <TextField
            label="Full name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Your name"
            minLength={2}
            maxLength={120}
            required
          />

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
            placeholder="Create a password"
            minLength={8}
            required
          />

          {error && <Alert variant="error">{error}</Alert>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[46px] rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-xs text-muted2">
            Already have an account?{' '}
            <Link to="/login" className="text-accent2 hover:text-white">
              Sign in here
            </Link>.
          </p>
        </form>
      </section>
    </div>
  )
}
