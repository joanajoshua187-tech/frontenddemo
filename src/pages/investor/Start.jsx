import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { TextField, CheckboxField, ChoiceGroup } from '../../components/Fields'
import { DemoNotice } from '../../components/DemoNotice'
import { validateInvestor } from '../../utils/validators'
import { cleanText } from '../../utils/sanitize'
import { tsh } from '../../utils/format'
import { STARTING_BALANCE, RISK_PROFILES } from '../../data/listings'

const EXPERIENCE = [
  { value: 'new', label: 'I have never invested', note: 'We start with the basics' },
  { value: 'group', label: 'I save in a VICOBA or SACCO', note: 'You know group savings, not business investing' },
  { value: 'some', label: 'I have invested before', note: 'Shares, bonds or a business' },
]

const GOALS = [
  { value: 'lock-up', label: 'How long my money is tied up' },
  { value: 'spread', label: 'How to spread risk' },
  { value: 'risk', label: 'How to read the risks' },
]

const SUITABILITY = [
  {
    id: 'drop',
    legend: 'Your investment falls by a fifth in one month. What do you do?',
    options: [
      { value: '0', label: 'Take out what is left' },
      { value: '1', label: 'Wait and see' },
      { value: '2', label: 'Put in a little more' },
    ],
  },
  {
    id: 'horizon',
    legend: 'When might you need this money back?',
    options: [
      { value: '0', label: 'Within a year' },
      { value: '1', label: 'In 1 to 3 years' },
      { value: '2', label: 'After 3 years' },
    ],
  },
  {
    id: 'share',
    legend: 'How much of your savings would you invest?',
    options: [
      { value: '2', label: 'A small part' },
      { value: '1', label: 'About half' },
      { value: '0', label: 'Most of it' },
    ],
  },
]

function profileFor(answers) {
  const values = SUITABILITY.map((q) => answers[q.id])
  if (values.some((v) => v === undefined)) return null
  const total = values.reduce((s, v) => s + Number(v), 0)
  if (answers.share === '0' || total <= 2) return 'Cautious'
  if (total >= 5) return 'Growth'
  return 'Balanced'
}

export default function InvestorStart() {
  useDocumentTitle('Open a demo account')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', experience: '', goal: '', consent: false })
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})

  if (state.inv.investor) return <Navigate to="/investor/app" replace />

  const riskProfile = profileFor(answers)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function submit(event) {
    event.preventDefault()
    const found = validateInvestor(form)
    if (!riskProfile) found.suitability = 'Answer the three questions so we can set safe limits for you.'
    setErrors(found)
    if (Object.keys(found).length) return
    dispatch({
      type: 'inv/created',
      investor: { displayName: cleanText(form.displayName.trim()), experience: form.experience, goal: form.goal, riskProfile },
    })
    notify(`Demo account ready. You have ${tsh(STARTING_BALANCE)} to practise with.`)
    navigate('/investor/app')
  }

  return (
    <section className="page">
      <div className="flow">
        <div className="flow__main">
          <p className="eyebrow">Democratising trusted local investment</p>
          <h1 className="page__title">Open a demo investor account</h1>
          <p className="page__lede">You get {tsh(STARTING_BALANCE)} in demo money to explore verified local businesses, farms, infrastructure and approved digital assets. Nothing here touches real money.</p>
          <DemoNotice>Accounts live only in this browser tab and reset when you close it.</DemoNotice>
          <form className="form" onSubmit={submit} noValidate>
            <TextField id="displayName" label="What should we call you?" hint="A first name or nickname is enough" autoComplete="given-name" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} error={errors.displayName} maxLength={40} />
            <ChoiceGroup name="experience" legend="Your experience" options={EXPERIENCE} value={form.experience} onChange={(v) => set('experience', v)} error={errors.experience} />
            <ChoiceGroup name="goal" legend="What do you want to learn first?" options={GOALS} value={form.goal} onChange={(v) => set('goal', v)} error={errors.goal} />

            <fieldset className="suitability">
              <legend>Three questions to set safe limits</legend>
              {SUITABILITY.map((q) => (
                <ChoiceGroup
                  key={q.id}
                  name={`suit-${q.id}`}
                  legend={q.legend}
                  options={q.options}
                  value={answers[q.id]}
                  onChange={(v) => { setAnswers((a) => ({ ...a, [q.id]: v })); setErrors((e) => ({ ...e, suitability: undefined })) }}
                />
              ))}
              {riskProfile && (
                <p className="profile-result" aria-live="polite">
                  <strong>Your profile: {riskProfile}.</strong> {RISK_PROFILES[riskProfile].note}
                </p>
              )}
              {errors.suitability && <p className="field__error" role="alert">{errors.suitability}</p>}
            </fieldset>

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
            <div><dt>We ask</dt><dd>A name to greet you, your experience, your learning goal and three questions about risk.</dd></div>
            <div><dt>We never ask</dt><dd>Your NIDA number, bank details, mobile money PIN or card.</dd></div>
            <div><dt>Why the risk questions</dt><dd>They set how much of your wallet can go into one opportunity, so a single bad season cannot wipe you out.</dd></div>
          </dl>
          <p className="note">If anyone asks for your PIN in the name of Onekana, it is a scam.</p>
        </aside>
      </div>
    </section>
  )
}
