import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { TextField, SelectField, CheckboxField } from '../../components/Fields'
import { DemoNotice } from '../../components/DemoNotice'
import { Icon } from '../../components/Icon'
import { validateBusiness } from '../../utils/validators'
import { maskTail } from '../../utils/format'
import { verifyBusiness } from '../../services/verification'
import { SECTORS, REGIONS, sampleBusiness } from '../../data/sampleBusiness'
import { demoBusiness } from '../../data/demoBusiness'

const EMPTY = { businessName: '', tin: '', nida: '', licence: '', sector: '', region: '', consent: false }

export default function Verify() {
  useDocumentTitle('Verify your business')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')

  if (state.ent.business) return <Navigate to="/entrepreneur/app" replace />

  function update(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setForm((f) => ({ ...f, [field]: value }))
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
    }
  }

  async function run(values, demo) {
    setBusy(true)
    setFailure('')
    try {
      const verification = await verifyBusiness(values)
      const business = demo
        ? demoBusiness
        : {
            businessName: values.businessName.trim(),
            owner: '',
            tinMasked: maskTail(values.tin, 3),
            licence: values.licence.trim(),
            sector: values.sector,
            region: values.region,
          }
      dispatch({ type: 'ent/verified', business, verification, demo })
      notify(demo ? 'Demo business loaded with six months of records.' : `${business.businessName} is verified.`)
      navigate('/entrepreneur/app')
    } catch (error) {
      setFailure(error.message)
      setBusy(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    const found = validateBusiness(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    run(form, false)
  }

  return (
    <section className="page">
      <p className="eyebrow">For entrepreneurs</p>
      <h1 className="page__title">Turning invisible businesses into bankable businesses</h1>
      <p className="page__lede">
        Verify your registered business once. Then connect your mobile money and bank accounts, upload your ledger, and watch an
        explainable financial profile build up week by week.
      </p>

      <div className="demo-banner">
        <div>
          <h2>Just exploring?</h2>
          <p>Open Amina Tailoring, a demo business with six months of verified transactions, weekly uploads and two flagged lines to review.</p>
        </div>
        <button type="button" className="btn btn--primary" disabled={busy} onClick={() => run(sampleBusiness, true)}>
          Explore with demo data <Icon name="arrow" />
        </button>
      </div>

      <div className="flow">
        <div className="flow__main">
          <h2 className="section-sub">Verify your own business</h2>
          <DemoNotice>Registry checks are simulated. Any details in the right format will pass.</DemoNotice>
          <form className="form" onSubmit={submit} noValidate>
            <TextField id="businessName" label="Business name" hint="Exactly as on your BRELA certificate" autoComplete="organization" value={form.businessName} onChange={update('businessName')} error={errors.businessName} maxLength={80} />
            <div className="form__row form__row--two">
              <TextField id="tin" label="TIN" hint="9 digits" inputMode="numeric" value={form.tin} onChange={update('tin')} error={errors.tin} maxLength={11} />
              <TextField id="licence" label="Business licence number" hint="From your current licence" value={form.licence} onChange={update('licence')} error={errors.licence} maxLength={30} />
            </div>
            <TextField id="nida" label="Owner’s NIDA number" hint="20 digits. Used once to confirm you own the business, then deleted." inputMode="numeric" autoComplete="off" value={form.nida} onChange={update('nida')} error={errors.nida} maxLength={23} />
            <div className="form__row form__row--two">
              <SelectField id="sector" label="Sector" placeholder="Choose a sector" options={SECTORS} value={form.sector} onChange={update('sector')} error={errors.sector} />
              <SelectField id="region" label="Region" placeholder="Choose a region" options={REGIONS} value={form.region} onChange={update('region')} error={errors.region} />
            </div>
            <CheckboxField id="consent" checked={form.consent} onChange={update('consent')} error={errors.consent}>
              I agree that Onekana may check these details with BRELA, TRA, NIDA and the licensing authority. I have read the <Link to="/privacy">privacy policy</Link>.
            </CheckboxField>
            {failure && <p className="form__failure" role="alert">{failure}</p>}
            <div className="actions">
              <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Checking registries…' : 'Verify my business'}</button>
            </div>
          </form>
        </div>
        <aside className="flow__aside">
          <h2>What happens next</h2>
          <ol className="plain-steps">
            <li>Four registry checks: BRELA, TRA, NIDA and your licence.</li>
            <li>Connect M-Pesa, Airtel Money, Mixx by Yas, HaloPesa or your bank. Their records count as verified.</li>
            <li>Upload ledger photos every week. Regular uploads build your trust level.</li>
            <li>See your profile, plan a loan and get savings advice.</li>
          </ol>
          <p className="note">Your NIDA number is deleted after the ownership check. Nothing is shared until you press Share.</p>
        </aside>
      </div>
    </section>
  )
}
