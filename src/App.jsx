import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { env } from './config/env'
import { AppStateProvider } from './context/AppStateProvider'
import { ToastProvider } from './context/ToastProvider'
import { SiteLayout } from './layouts/SiteLayout'
import { RequireInvestor, RequireReport, RequireVerified } from './components/Guards'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import LoanPlanner from './pages/LoanPlanner'
import HowItWorks from './pages/HowItWorks'
import EntrepreneurVerify from './pages/EntrepreneurVerify'
import EntrepreneurRecords from './pages/EntrepreneurRecords'
import EntrepreneurReport from './pages/EntrepreneurReport'
import InvestorStart from './pages/InvestorStart'
import InvestorDashboard from './pages/InvestorDashboard'
import InvestorListing from './pages/InvestorListing'
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
            <Route path="about" element={<Home />} />
            <Route path="start" element={<Navigate to="/" replace />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="entrepreneur" element={<EntrepreneurVerify />} />
            <Route path="entrepreneur/records" element={<RequireVerified><EntrepreneurRecords /></RequireVerified>} />
            <Route path="entrepreneur/report" element={<RequireReport><EntrepreneurReport /></RequireReport>} />
            <Route path="entrepreneur/loan-plan" element={<RequireReport><LoanPlanner /></RequireReport>} />
            <Route path="investor" element={<InvestorStart />} />
            <Route path="investor/dashboard" element={<RequireInvestor><InvestorDashboard /></RequireInvestor>} />
            <Route path="investor/listings/:id" element={<RequireInvestor><InvestorListing /></RequireInvestor>} />
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
