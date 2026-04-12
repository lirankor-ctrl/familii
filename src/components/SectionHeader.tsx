import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  icon?: string
  href?: string
  cta?: string
}

export function SectionHeader({ title, icon, href, cta }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-stone-900">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-sm text-famli-500 font-semibold hover:text-famli-600 transition-colors"
        >
          {cta ?? "See all"}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
