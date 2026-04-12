"use client"

import { useState } from "react"
import { Share2, MessageCircle, Facebook, Copy, Check } from "lucide-react"
import { shareToWhatsApp, shareToFacebook, copyForInstagram, nativeShare } from "@/lib/utils"

interface ShareButtonProps {
  text: string
  /** If omitted, the current page URL is used at share time (resolved client-side). */
  url?: string
}

export function ShareButton({ text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Resolve the URL on the client side to avoid SSR window access
  function getUrl(): string {
    if (url) return url
    if (typeof window !== "undefined") return window.location.href
    return ""
  }

  async function handleNativeShare() {
    const resolvedUrl = getUrl()
    const shared = await nativeShare({ title: "Famli", text, url: resolvedUrl || undefined })
    if (shared) setOpen(false)
  }

  async function handleInstagram() {
    const resolvedUrl = getUrl()
    await copyForInstagram(resolvedUrl ? `${text} ${resolvedUrl}` : text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors py-1 px-2 rounded-lg hover:bg-stone-50"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-card-hover border border-orange-50 p-2 z-20 min-w-[180px] animate-slide-up">
            {/* Native share — only shown when available */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-famli-50 text-sm text-stone-700 font-medium"
              >
                <Share2 className="w-4 h-4 text-famli-500" />
                Share via&hellip;
              </button>
            )}

            {/* WhatsApp */}
            <button
              onClick={() => {
                shareToWhatsApp(text, getUrl())
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-sm text-stone-700 font-medium"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </button>

            {/* Facebook — requires a URL to work */}
            {getUrl() && (
              <button
                onClick={() => {
                  shareToFacebook(getUrl())
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-sm text-stone-700 font-medium"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </button>
            )}

            {/* Instagram — copy to clipboard flow */}
            <button
              onClick={handleInstagram}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 text-sm text-stone-700 font-medium"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-pink-500" />
              )}
              {copied ? "Copied for Instagram!" : "Copy for Instagram"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
