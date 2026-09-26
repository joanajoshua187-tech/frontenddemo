import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { Stepper } from '../components/Stepper'
import { TextField, SelectField, CheckboxField } from '../components/Fields'
import { DemoNotice } from '../components/DemoNotice'
import { Icon } from '../components/Icon'
import { validateBusiness } from '../utils/validators'
import { maskTail } from '../utils/format'
import { verifyBusiness } from '../services/verification'
import { SECTORS, REGIONS, sampleBusiness } from '../data/sampleBusiness'
import { FLOW_STEPS } from '../data/flow'

const EMPTY = { businessName: '', tin: '', nida: '', licence: '', sector: '', region: '', consent: false }

export default function EntrepreneurVerify() {
  useDocumentTitle('Verify your business')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')

  const verified = state.verification?.status === 'verified'

  function update(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setForm((f) => ({ ...f, [field]: value }))
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
    }
  }

  async function submit(event) {
    event.preventDefault()
    const found = validateBusiness(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    setBusy(true)
    setFailure('')
    try {
      const verification = await verifyBusiness(form)
      const business = {
        businessName: form.businessName.trim(),
        tinMasked: maskTail(form.tin, 3),
        licence: form.licence.trim(),
        sector: form.sector,
        region: form.region,
      }
      dispatch({ type: 'business/verified', business, verification })
      notify(`${business.businessName} is verified.`)
      setForm(EMPTY)
    } catch (error) {
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <Stepper steps={FLOW_STEPS} current={0} />
      <div className="flow">
        <div className="flow__main">
          <h1 className="page__title">Verify your business</h1>
          <p className="page__lede">We check four details against the official registries before we read any records. This takes under a minute.</p>
          <DemoNotice>Checks are simulated. Any details in the right format will pass.</DemoNotice>

          {verified ? (
            <div className="panel">
              <h2 className="panel__title">{state.business.businessName} is verified</h2>
              <ul className="check-list">
                {state.verification.checks.map((c) => (
                  <li key={c.id}>
                    <span className="check-list__icon"><Icon name="check" label="Passed" /></span>
                    <span>{c.label}{c.note && <small>{c.note}</small>}</span>
                  </li>
                ))}
              </ul>
              <dl className="mini-facts">
                <div><dt>TIN</dt><dd className="num">{state.business.tinMasked}</dd></div>
                <div><dt>Sector</dt><dd>{state.business.sector}</dd></div>
                <div><dt>Region</dt><dd>{state.business.region}</dd></div>
              </dl>
              <div className="actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate('/entrepreneur/records')}>
                  Continue to records <Icon name="arrow" />
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'business/reset' })}>Verify a different business</button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate>
              <div className="form__row">
                <TextField id="businessName" label="Business name" hint="Exactly as on your BRELA certificate" autoComplete="organization" value={form.businessName} onChange={update('businessName')} error={errors.businessName} maxLength={80} />
              </div>
              <div className="form__row form__row--two">
                <TextField id="tin" label="TIN" hint="9 digits" inputMode="numeric" value={form.tin} onChange={update('tin')} error={errors.tin} maxLength={11} />
                <TextField id="licence" label="Business licence number" hint="From your current licence" value={form.licence} onChange={update('licence')} error={errors.licence} maxLength={30} />
              </div>
              <div className="form__row">
                <TextField id="nida" label="Owner’s NIDA number" hint="20 digits. Used once to confirm you own the business, then deleted." inputMode="numeric" autoComplete="off" value={form.nida} onChange={update('nida')} error={errors.nida} maxLength={23} />
              </div>
              <div className="form__row form__row--two">
                <SelectField id="sector" label="Sector" placeholder="Choose a sector" options={SECTORS} value={form.sector} onChange={update('sector')} error={errors.sector} />
                <SelectField id="region" label="Region" placeholder="Choose a region" options={REGIONS} value={form.region} onChange={update('region')} error={errors.region} />
              </div>
              <CheckboxField id="consent" checked={form.consent} onChange={update('consent')} error={errors.consent}>
                I agree that Africa Credit OS may check these details with BRELA, TRA, NIDA and the licensing authority. I have read the <Link to="/privacy">privacy policy</Link>.
              </CheckboxField>
              {failure && <p className="form__failure" role="alert">{failure}</p>}
              <div className="actions">
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  {busy ? 'Checking registries…' : 'Verify my business'}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => { setForm(sampleBusiness); setErrors({}) }} disabled={busy}>
                  Fill with a sample business
                </button>
              </div>
            </form>
          )}
        </div>
        <aside className="flow__aside">
          <h2>Why we ask for each detail</h2>
          <dl className="why-list">
            <div><dt>Business name and TIN</dt><dd>Prove the business is registered and known to TRA.</dd></div>
            <div><dt>Business licence</dt><dd>Shows the business may trade in its sector.</dd></div>
            <div><dt>NIDA number</dt><dd>Links you to the business. We keep only the result of the check.</dd></div>
          </dl>
          <p className="note">Not registered yet? Register your business name with BRELA and apply for a TIN at TRA first.</p>
        </aside>
      </div>
    </section>
  )
}
