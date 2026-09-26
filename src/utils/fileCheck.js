export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_FILES = 12

const SIGNATURES = [
  { type: 'image/png', ext: 'png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/webp',
    ext: 'webp',
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
]

export async function inspectImage(file) {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: `${file.name} is larger than 5 MB. Take the photo again at a lower resolution.` }
  }
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const match = SIGNATURES.find((signature) => signature.test(head))
  if (!match) {
    return { ok: false, reason: `${file.name} is not a PNG, JPEG or WebP image.` }
  }
  return { ok: true, type: match.type, ext: match.ext }
}

export function safeFileName(index, ext) {
  return `record-${String(index).padStart(3, '0')}.${ext}`
}
