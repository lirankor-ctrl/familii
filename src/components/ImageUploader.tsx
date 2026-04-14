"use client"

import { useState, useRef } from "react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Camera, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  currentImage?: string
  onUpload: (url: string) => void
  folder?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ImageUploader({
  currentImage,
  onUpload,
  folder = "famli",
  className,
  size = "md",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB")
      return
    }

    setError("")
    setUploading(true)

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const result = await uploadToCloudinary(file, folder)
      setPreview(result.url)
      onUpload(result.url)
    } catch (err) {
      setError("Upload failed. Please try again.")
      setPreview(currentImage)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(undefined)
    onUpload("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "relative rounded-full overflow-hidden bg-famli-100 border-2 border-dashed border-famli-300",
            "hover:border-famli-500 hover:bg-famli-50 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-famli-400 focus:ring-offset-2",
            sizeClasses[size]
          )}
        >
          {preview ? (
  <img
    src={preview}
    alt="Profile"
    className="w-full h-full object-cover"
  />
) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <Camera className="w-6 h-6 text-famli-400" />
              <span className="text-xs text-famli-400 font-medium">Add photo</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </button>

        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
            aria-label="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-stone-400">Tap to {preview ? "change" : "add"} photo</p>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
