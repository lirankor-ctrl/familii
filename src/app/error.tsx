"use client"

import { useEffect } from "react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-4">😬</div>
      <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Something went wrong</h1>
      <p className="text-stone-500 text-sm mb-8 max-w-xs">
        We hit an unexpected error. You can try again or head home.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="famli-btn-secondary">
          Try again
        </button>
        <Link href="/dashboard" className="famli-btn-primary">
          Go home
        </Link>
      </div>
    </div>
  )
}
