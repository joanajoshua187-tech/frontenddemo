export function LogoMark({ size = 32 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" className="logo-mark__tile" />
      <path d="M14 20h36M32 16v32M22 48h20" className="logo-mark__line" strokeWidth="4" />
      <path d="M10 34l6-14 6 14zM42 34l6-14 6 14z" className="logo-mark__pan" strokeWidth="3" />
      <path d="M9 34h14M41 34h14" className="logo-mark__line" strokeWidth="3" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__word">Mizani</span>
    </span>
  )
}
