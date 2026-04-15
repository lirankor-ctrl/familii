/**
 * Cloudinary upload helper.
 *
 * Requires in environment:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  — your Cloudinary cloud name
 *
 * Requires in Cloudinary dashboard:
 *   An unsigned upload preset named exactly: famli_unsigned
 *   (Settings → Upload → Upload presets → Add unsigned preset)
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = "famli_unsigned"

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

/**
 * Client-side unsigned upload (for use in browser components).
 * Requires an unsigned upload preset named "famli_unsigned" in Cloudinary.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "famli"
): Promise<UploadResult> {
  if (!CLOUD_NAME) {
    throw new Error(
      "Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable. " +
        "Set it in .env and in your Netlify environment settings."
    )
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("folder", folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body.error?.message ??
        `Cloudinary upload failed (HTTP ${res.status}). ` +
          "Check that the upload preset 'famli_unsigned' exists and is set to Unsigned."
    )
  }

  const data = await res.json()
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  }
}

/**
 * Returns an optimized Cloudinary URL with resizing.
 */
export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  if (!CLOUD_NAME) return ""
  const { width = 800, height, crop = "fill" } = options
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : "",
    `c_${crop}`,
    "q_auto",
    "f_auto",
  ]
    .filter(Boolean)
    .join(",")

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}
