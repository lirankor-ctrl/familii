"use client"

import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"
import { nativeShare } from "@/lib/utils"

interface InviteCodeCardProps {
  code: string
  familyName: string
}

export function InviteCodeCard({ code, familyName }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    const shared = await nativeShare({
      title: `Join ${familyName} on Famli`,
      text: `Join our family space on Famli! Use invite code: ${code}`,
    })
    if (!shared) handleCopy()
  }

  return (
    <div className="famli-card p-5 bg-gradient-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔑</span>
        <h3 className="font-bold text-stone-900">Invite Family Members</h3>
      </div>
      <p className="text-sm text-stone-500 mb-4">
        Share this code with family members so they can join your space.
      </p>

      {/* Code display */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-orange-100 mb-4">
        <span className="font-mono text-lg font-bold text-famli-600 tracking-widest">{code}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm font-semibold text-famli-500 hover:text-famli-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <button
        onClick={handleShare}
        className="famli-btn-secondary w-full flex items-center justify-center gap-2 text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share invite link
      </button>
    </div>
  )
}
