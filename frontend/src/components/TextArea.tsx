import { type TextareaHTMLAttributes } from 'react'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-ink/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted2/80 focus:border-accent/60 focus:ring-4 focus:ring-accent/20'

interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'className'> {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function TextArea({ label, value, onChange, ...props }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-2 text-xs font-medium text-muted2">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        {...props}
      />
    </label>
  )
}
