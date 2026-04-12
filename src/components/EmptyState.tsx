import Link from "next/link"

interface EmptyStateProps {
  emoji: string
  title: string
  description: string
  href?: string
  cta?: string
}

export function EmptyState({ emoji, title, description, href, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 animate-bounce-gentle">{emoji}</div>
      <h3 className="text-lg font-bold text-stone-700 mb-2">{title}</h3>
      <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      {href && cta && (
        <Link href={href} className="famli-btn-primary text-sm">
          {cta}
        </Link>
      )}
      {!href && cta && (
        <button className="famli-btn-primary text-sm">{cta}</button>
      )}
    </div>
  )
}
