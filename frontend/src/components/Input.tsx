import { type InputHTMLAttributes } from 'react'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-ink/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted2/80 focus:border-accent/60 focus:ring-4 focus:ring-accent/20'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className'> {
  value: string
  onChange: (value: string) => void
}

export default function Input({ value, onChange, ...props }: InputProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
      {...props}
    />
  )
}
