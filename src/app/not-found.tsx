import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-4">🏡</div>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Page not found</h1>
      <p className="text-stone-500 text-base mb-8 max-w-xs">
        Looks like this page wandered off. Let&apos;s get you back home.
      </p>
      <Link href="/dashboard" className="famli-btn-primary">
        Back to Famli
      </Link>
    </div>
  )
}
