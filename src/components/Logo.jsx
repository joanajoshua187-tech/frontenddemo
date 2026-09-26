export function LogoMark({ size = 34 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="60" height="60" rx="14" className="logo-mark__tile" />
      <rect x="15" y="34" width="8" height="16" rx="2" className="logo-mark__bar logo-mark__bar--soft" />
      <rect x="28" y="25" width="8" height="25" rx="2" className="logo-mark__bar logo-mark__bar--mid" />
      <rect x="41" y="14" width="8" height="36" rx="2" className="logo-mark__bar" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__word">
        Africa Credit <span className="logo__os">OS</span>
      </span>
    </span>
  )
}
