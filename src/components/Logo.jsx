export function LogoMark({ size = 34 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="60" height="60" rx="16" className="logo-mark__tile" />
      <circle cx="32" cy="32" r="17" className="logo-mark__ring" />
      <rect x="23" y="33" width="5" height="9" rx="1.5" className="logo-mark__bar logo-mark__bar--soft" />
      <rect x="29.5" y="28" width="5" height="14" rx="1.5" className="logo-mark__bar logo-mark__bar--mid" />
      <rect x="36" y="22" width="5" height="20" rx="1.5" className="logo-mark__bar" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__text">
        <span className="logo__word">ONEKANA</span>
        <span className="logo__sub" lang="sw">be seen</span>
      </span>
    </span>
  )
}
