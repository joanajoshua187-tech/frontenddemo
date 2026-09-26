export function seededRandom(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function fingerprint(text, seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
}

export const GENESIS = '0000000000000000'

export function appendEntry(log, entry) {
  const prev = log.length ? log[log.length - 1].hash : GENESIS
  const record = { n: log.length + 1, at: entry.at ?? new Date().toISOString(), ...entry, prev }
  const hash = fingerprint(`${prev}|${record.at}|${record.action}|${record.detail}`)
  return [...log, { ...record, hash }]
}

export function verifyChain(log) {
  let prev = GENESIS
  for (const r of log) {
    if (r.prev !== prev) return false
    if (fingerprint(`${prev}|${r.at}|${r.action}|${r.detail}`) !== r.hash) return false
    prev = r.hash
  }
  return true
}
