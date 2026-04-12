import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <header className="flex items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="text-xl font-bold text-famli-600">Famli</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
