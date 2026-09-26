export async function fileFingerprint(file) {
  const buffer = await file.arrayBuffer()
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  const bytes = new Uint8Array(buffer)
  let h = 2166136261
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619)
  return `fnv-${(h >>> 0).toString(16)}-${bytes.length}`
}
