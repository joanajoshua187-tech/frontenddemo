import { Outlet } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { CookieNotice } from '../components/CookieNotice'
import { ScrollToTop } from '../components/ScrollToTop'
import { AssistantProvider } from '../components/AssistantProvider'

export function SiteLayout() {
  return (
    <AssistantProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <CookieNotice />
    </AssistantProvider>
  )
}
