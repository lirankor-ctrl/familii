/**
 * Cloudinary upload helper.
 * Uploads a base64 or File/Blob to Cloudinary and returns the secure URL.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = "famli_unsigned" // create this as an unsigned preset in Cloudinary dashboard

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
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("folder", folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message ?? "Upload failed")
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
