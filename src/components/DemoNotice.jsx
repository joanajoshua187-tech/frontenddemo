import { env } from '../config/env'

export function DemoNotice({ children }) {
  if (!env.demoMode) return null
  return (
    <p className="demo-notice">
      <strong>Demo mode.</strong> {children}
    </p>
  )
}
