interface StarIconProps {
  className?: string
}

export default function StarIcon({ className }: StarIconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 0 0 .95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 0 0-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.373-2.451a1 1 0 0 0-1.176 0l-3.374 2.45c-.784.57-1.838-.196-1.539-1.117l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.392c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 0 0 .95-.69l1.287-3.965Z" />
    </svg>
  )
}
