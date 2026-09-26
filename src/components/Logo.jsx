export function LogoMark({ size = 36 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path className="logo-mark__eye" d="M5 32C11 20 21 13 32 13s21 7 27 19c-6 12-16 19-27 19S11 44 5 32z" />
      <circle className="logo-mark__iris" cx="32" cy="32" r="12.5" />
      <rect className="logo-mark__bar logo-mark__bar--soft" x="25.5" y="32.5" width="3.6" height="6" rx="1.2" />
      <rect className="logo-mark__bar logo-mark__bar--mid" x="30.2" y="29" width="3.6" height="9.5" rx="1.2" />
      <rect className="logo-mark__bar" x="34.9" y="25" width="3.6" height="13.5" rx="1.2" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__text">
        <span className="logo__word">Onekana</span>
        <span className="logo__sub">be seen</span>
      </span>
    </span>
  )
}
