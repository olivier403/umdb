import { type ReactNode } from 'react'

interface FieldLabelProps {
  label: string
  children: ReactNode
}

export default function FieldLabel({ label, children }: FieldLabelProps) {
  return (
    <label className="flex flex-col gap-2 text-xs font-medium text-muted2">
      {label}
      {children}
    </label>
  )
}
