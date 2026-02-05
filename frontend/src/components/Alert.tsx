import { type ReactNode } from 'react'

interface AlertProps {
  variant: 'error' | 'success'
  children: ReactNode
}

export default function Alert({ variant, children }: AlertProps) {
  const className =
    variant === 'error'
      ? 'rounded-xl border border-[#f2a6a6]/30 bg-[#f2a6a6]/10 px-4 py-3 text-sm text-[#f2c1c1]'
      : 'rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200'

  return <div className={className}>{children}</div>
}
