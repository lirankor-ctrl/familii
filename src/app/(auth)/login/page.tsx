"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👋</div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
        <p className="text-stone-500 text-sm mt-1">Sign in to your family space</p>
      </div>

      <div className="famli-card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="famli-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="famli-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="famli-label">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Your password"
                className="famli-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="famli-btn-primary flex items-center justify-center gap-2 w-full mt-1"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500 mt-6">
        New to Famli?{" "}
        <Link href="/signup" className="text-famli-600 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
