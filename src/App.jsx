import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { env } from './config/env'
import { AppStateProvider } from './context/AppStateProvider'
import { ToastProvider } from './context/ToastProvider'
import { SiteLayout } from './layouts/SiteLayout'
import { EntrepreneurLayout } from './layouts/EntrepreneurLayout'
import { InvestorLayout } from './layouts/InvestorLayout'
import Welcome from './pages/Welcome'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Verify from './pages/entrepreneur/Verify'
import Overview from './pages/entrepreneur/Overview'
import Records from './pages/entrepreneur/Records'
import Credit from './pages/entrepreneur/Credit'
import LoanPlanner from './pages/entrepreneur/LoanPlanner'
import Savings from './pages/entrepreneur/Savings'
import EntrepreneurActivity from './pages/entrepreneur/Activity'
import InvestorStart from './pages/investor/Start'
import Marketplace from './pages/investor/Marketplace'
import ListingDetail from './pages/investor/ListingDetail'
import Portfolio from './pages/investor/Portfolio'
import Learn from './pages/investor/Learn'
import InvestorActivity from './pages/investor/Activity'
import LegalPage from './pages/LegalPage'
import NotFound from './pages/NotFound'
import { privacyPolicy, termsOfUse, cookiePolicy } from './data/legal'

const Router = env.routerMode === 'hash' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <AppStateProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Welcome />} />
              <Route path="about" element={<About />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="start" element={<Navigate to="/" replace />} />

              <Route path="entrepreneur" element={<Verify />} />
              <Route path="entrepreneur/app" element={<EntrepreneurLayout />}>
                <Route index element={<Overview />} />
                <Route path="records" element={<Records />} />
                <Route path="credit" element={<Credit />} />
                <Route path="loan" element={<LoanPlanner />} />
                <Route path="savings" element={<Savings />} />
                <Route path="activity" element={<EntrepreneurActivity />} />
              </Route>

              <Route path="investor" element={<InvestorStart />} />
              <Route path="investor/app" element={<InvestorLayout />}>
                <Route index element={<Marketplace />} />
                <Route path="listing/:id" element={<ListingDetail />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="learn" element={<Learn />} />
                <Route path="activity" element={<InvestorActivity />} />
              </Route>

              <Route path="privacy" element={<LegalPage document={privacyPolicy} />} />
              <Route path="terms" element={<LegalPage document={termsOfUse} />} />
              <Route path="cookies" element={<LegalPage document={cookiePolicy} />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AppStateProvider>
  )
}
