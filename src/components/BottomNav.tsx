"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, Cake, Utensils, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/moments", icon: Heart, label: "Moments" },
  { href: "/birthdays", icon: Cake, label: "Birthdays" },
  { href: "/meals", icon: Utensils, label: "Meals" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-100 safe-bottom z-50">
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-150 min-w-[52px]",
                isActive
                  ? "text-famli-500"
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150",
                  isActive && "bg-famli-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-150",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold transition-all duration-150",
                  isActive ? "text-famli-500" : "text-stone-400"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
