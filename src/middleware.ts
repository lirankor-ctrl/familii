import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Routes that anyone may visit with no session.
 * Exact match only — /login is public, /login/something would also match
 * because we use .has() for the set and startsWith for prefixes below.
 */
const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"])

/**
 * Prefixes that always bypass middleware entirely.
 * NextAuth API, Next.js internals, and static files.
 */
const BYPASS_PREFIXES = [
  "/api/auth",   // NextAuth route handlers — never intercept
  "/_next",      // Next.js runtime chunks
  "/favicon",
  "/manifest",
  "/apple-icon",
  "/robots",
  "/sitemap",
]

function shouldBypass(pathname: string): boolean {
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Step 0: Bypass auth API and static assets completely ────────────────────
  if (shouldBypass(pathname)) {
    return NextResponse.next()
  }

  // ── Decode JWT from cookie (no DB call, no extra redirect hop) ─────────────
  const token = await getToken({ req })
  const isAuthenticated = !!token
  const onboardingDone = !!(token?.onboardingDone)

  // ── Rule 1: Unauthenticated user on a protected route ──────────────────────
  // Redirect directly to /login — NOT through /api/auth/signin.
  // This eliminates the double-redirect that withAuth creates.
  if (!isAuthenticated && !PUBLIC_ROUTES.has(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?callbackUrl=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  // ── Rule 2: Authenticated user who hasn't completed onboarding ─────────────
  // Force them to /onboarding for every route except /onboarding itself.
  // Also allow /login and /signup through so they're not looped.
  if (isAuthenticated && !onboardingDone) {
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.next() // they're already going there
    }
    // Don't redirect from login/signup — let those pages render
    // (they will be immediately replaced by the onboarding layout anyway)
    if (PUBLIC_ROUTES.has(pathname)) {
      const url = req.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
    // Protected route + not onboarded → send to onboarding
    const url = req.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  // ── Rule 3: Authenticated + onboarding done, visiting auth/landing pages ───
  // Logged-in users should never see /login, /signup, or the landing page.
  // Send them straight to the app.
  if (isAuthenticated && onboardingDone) {
    if (
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/onboarding")
    ) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  // ── All other cases: pass through ──────────────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (Next.js build output)
     * - _next/image   (Next.js image optimisation)
     * - favicon.ico, manifest.json, apple-icon.png (public static files)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|apple-icon.png).*)",
  ],
}
