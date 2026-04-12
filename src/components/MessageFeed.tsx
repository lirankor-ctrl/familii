"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { createMessageAction } from "@/actions/messages"
import type { MessageWithAuthor } from "@/types"
import { timeAgo, familyRoleEmoji } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Send, Pin } from "lucide-react"

interface MessageFeedProps {
  initialMessages: MessageWithAuthor[]
  currentUserId: string
}

export function MessageFeed({ initialMessages, currentUserId }: MessageFeedProps) {
  const [messages, setMessages] = useState<MessageWithAuthor[]>(initialMessages)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sort: pinned first, then newest first
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed) return
    setError("")
    setSending(true)

    const fd = new FormData()
    fd.append("content", trimmed)

    const result = await createMessageAction(fd)
    setSending(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setMessages((prev) => [result.data, ...prev])
    setContent("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div>
      {/* Empty state */}
      {sortedMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4 animate-bounce-gentle">💬</div>
          <h3 className="text-lg font-bold text-stone-700 mb-2">Start the conversation</h3>
          <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
            Send the first message to your family below!
          </p>
        </div>
      )}

      {/* Message list */}
      {sortedMessages.length > 0 && (
        <div className="feed-gap mb-28">
          {sortedMessages.map((msg) => {
            const isOwn = msg.authorId === currentUserId
            return (
              <div
                key={msg.id}
                className={cn(
                  "famli-card p-4",
                  msg.isPinned && "ring-2 ring-famli-200 bg-famli-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm shrink-0">
                    {msg.author.profileImage ? (
                      <Image
                        src={msg.author.profileImage}
                        alt={msg.author.firstName}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-sm">
                        {msg.author.firstName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm text-stone-900">
                        {msg.author.firstName}
                      </span>
                      {msg.author.familyRole && (
                        <span className="text-xs text-stone-400">
                          {familyRoleEmoji(msg.author.familyRole)}
                        </span>
                      )}
                      {isOwn && (
                        <span className="text-xs bg-famli-100 text-famli-600 font-semibold px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {msg.isPinned && (
                        <span className="text-xs text-famli-500 flex items-center gap-0.5 ml-auto">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      {!msg.isPinned && (
                        <span className="text-xs text-stone-400 ml-auto">
                          {timeAgo(msg.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed break-words">
                      {msg.content}
                    </p>
                    {msg.isPinned && (
                      <p className="text-xs text-stone-400 mt-1">{timeAgo(msg.createdAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Composer — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-100 px-4 py-3 z-40">
        <div className="max-w-md mx-auto">
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Write something to your family... 💛"
              rows={1}
              className="famli-input resize-none flex-1 min-h-[44px] max-h-[120px] py-3"
            />
            <button
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="famli-btn-primary p-3 rounded-2xl shrink-0 self-end"
              aria-label="Send message"
            >
              {sending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
