interface HighlightedTextProps {
  text: string
  query: string
  highlightClassName?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokenize(query: string) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length <= 1) return tokens
  return Array.from(new Set(tokens))
}

export default function HighlightedText({
  text,
  query,
  highlightClassName = 'text-amber-200 font-semibold'
}: HighlightedTextProps) {
  const tokens = tokenize(query)
  if (tokens.length === 0) return <>{text}</>

  const escapedTokens = tokens
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length)
  const regex = new RegExp(`\\b(${escapedTokens.join('|')})`, 'ig')
  const parts = text.split(regex)
  if (parts.length === 1) return <>{text}</>

  const normalizedTokens = new Set(tokens.map((token) => token.toLowerCase()))

  return (
    <>
      {parts.map((part, index) => {
        if (normalizedTokens.has(part.toLowerCase())) {
          return (
            <span key={`${part}-${index}`} className={highlightClassName}>
              {part}
            </span>
          )
        }
        return part
      })}
    </>
  )
}
