import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { TextField, CheckboxField, ChoiceGroup } from '../components/Fields'
import { DemoNotice } from '../components/DemoNotice'
import { validateInvestor } from '../utils/validators'
import { cleanText } from '../utils/sanitize'
import { tsh } from '../utils/format'
import { STARTING_BALANCE } from '../data/listings'

const EXPERIENCE = [
  { value: 'new', label: 'I have never invested', note: 'We start with the basics' },
  { value: 'group', label: 'I save in a VICOBA or SACCO', note: 'You know group savings, not business investing' },
  { value: 'some', label: 'I have invested before', note: 'Shares, bonds or a business' },
]

const GOALS = [
  { value: 'lock-up', label: 'How long my money is tied up' },
  { value: 'spread', label: 'How to spread risk' },
  { value: 'risk', label: 'How to read a business’s risks' },
]

export default function InvestorStart() {
  useDocumentTitle('Open a demo account')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', experience: '', goal: '', consent: false })
  const [errors, setErrors] = useState({})

  if (state.investor) return <Navigate to="/investor/dashboard" replace />

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function submit(event) {
    event.preventDefault()
    const found = validateInvestor(form)
    setErrors(found)
    if (Object.keys(found).length) return
    dispatch({
      type: 'investor/created',
      investor: { displayName: cleanText(form.displayName.trim()), experience: form.experience, goal: form.goal },
    })
    notify('Demo account ready. You have TSh 1,000,000 to practise with.')
    navigate('/investor/dashboard')
  }

  return (
    <section className="page">
      <div className="flow">
        <div className="flow__main">
          <h1 className="page__title">Open a demo investor account</h1>
          <p className="page__lede">You get {tsh(STARTING_BALANCE)} in practice money to invest in verified local businesses. Nothing you do here touches real money.</p>
          <DemoNotice>Accounts live only in this browser tab and reset when you close it.</DemoNotice>
          <form className="form" onSubmit={submit} noValidate>
            <TextField id="displayName" label="What should we call you?" hint="A first name or nickname is enough" autoComplete="given-name" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} error={errors.displayName} maxLength={40} />
            <ChoiceGroup name="experience" legend="Your experience" options={EXPERIENCE} value={form.experience} onChange={(v) => set('experience', v)} error={errors.experience} />
            <ChoiceGroup name="goal" legend="What do you want to learn first?" options={GOALS} value={form.goal} onChange={(v) => set('goal', v)} error={errors.goal} />
            <CheckboxField id="investor-consent" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} error={errors.consent}>
              I understand this account uses demo money with no cash value, and that nothing here is financial advice. I have read the <Link to="/terms">terms</Link>.
            </CheckboxField>
            <div className="actions">
              <button type="submit" className="btn btn--primary">Create my demo account</button>
            </div>
          </form>
        </div>
        <aside className="flow__aside">
          <h2>What we ask for, and what we do not</h2>
          <dl className="why-list">
            <div><dt>We ask</dt><dd>A name to greet you, your experience and your first learning goal.</dd></div>
            <div><dt>We never ask</dt><dd>Your NIDA number, bank details, mobile money PIN or card.</dd></div>
          </dl>
          <p className="note">If anyone asks for your PIN in the name of Africa Credit OS, it is a scam.</p>
        </aside>
      </div>
    </section>
  )
}
