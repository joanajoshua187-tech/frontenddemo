const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  arrow: 'M5 12h13M13 6l6 6-6 6',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  alert: 'M12 8v5M12 16.5v.5M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  send: 'M4 12l16-8-6 16-2-7-8-1z',
  speaker: 'M4 10v4h4l5 4V6L8 10H4zM16 9a4 4 0 0 1 0 6',
  stop: 'M7 7h10v10H7z',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  records: 'M7 3h10v18H7zM10 8h4M10 12h4M10 16h2',
  gauge: 'M4 16a8 8 0 1 1 16 0M12 16l4-5',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9 9.5c0-1 1.3-1.5 3-1.5s3 .7 3 1.8-1.3 1.5-3 1.7-3 .7-3 1.8 1.3 1.7 3 1.7 3-.5 3-1.5',
  piggy: 'M5 12a7 5 0 0 1 12-3l3-1v4l-1 1a7 5 0 0 1-4 4v2h-3v-1.5h-2V19H7v-2.5A5 5 0 0 1 5 12zM15 11h.01',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  store: 'M4 9l1.5-5h13L20 9M4 9h16M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5 11v9h14v-9M10 20v-5h4v5',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-4 2 4M16 13.5h.01',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7',
  bank: 'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  logout: 'M15 4h4v16h-4M10 16l-4-4 4-4M6 12h10',
}

export function Icon({ name, size = 18, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
    >
      <path d={PATHS[name]} fill="none" />
    </svg>
  )
}
