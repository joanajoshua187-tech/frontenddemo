import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { SCORE_LEVELS } from '../utils/scoring'
import { tsh } from '../utils/format'

const FACTORS = [
  ['Starting point', 'Every business', '25'],
  ['Sales steadiness', 'How much monthly sales move up and down', 'up to 20'],
  ['Margin', 'How much of each sale you keep after costs', 'up to 15'],
  ['History', 'Months of records: 3 months or 6 months and more', 'up to 10'],
  ['Evidence', 'Share of figures confirmed by mobile money records', 'up to 10'],
  ['Registration', 'BRELA registration and TIN verified', '10'],
  ['Mixed money', 'Business and household money in the same account', 'minus 5'],
  ['No savings', 'No regular saving found in the records', 'minus 5'],
]

export default function HowItWorks() {
  useDocumentTitle('How it works')
  return (
    <article className="page">
      <h1 className="page__title">How Mizani works</h1>
      <p className="page__lede">Nothing in a Mizani report is a black box. This page shows every rule we use, so you can check your own report by hand.</p>

      <section className="prose-block">
        <h2>For business owners</h2>
        <ol className="plain-steps">
          <li><strong>Verification.</strong> Business name against BRELA, TIN against TRA, licence against the issuing council, and your NIDA number to prove you own the business. The NIDA number is deleted after the check.</li>
          <li><strong>Reading records.</strong> The AI reads each photo and screenshot and turns it into dated lines of money in and money out. Lines found in both your ledger and your mobile money records count as confirmed.</li>
          <li><strong>Your check.</strong> You see every line. Unclear amounts and possible duplicates are flagged, and you fix them before anything is calculated.</li>
          <li><strong>Report.</strong> We calculate the score, loan level and savings plan with the rules below.</li>
        </ol>
      </section>

      <section className="prose-block">
        <h2>How the score is built</h2>
        <p>The score runs from 0 to 100. It is the sum of these parts.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">Part</th><th scope="col">What it measures</th><th scope="col" className="num-col">Points</th></tr></thead>
            <tbody>
              {FACTORS.map(([part, what, pts]) => (
                <tr key={part}><th scope="row">{part}</th><td>{what}</td><td className="num-col num">{pts}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">The AI never produces the score. It only reads your records. The score comes from the fixed rules above.</p>
      </section>

      <section className="prose-block">
        <h2>How the loan level is set</h2>
        <p>We assume a loan repayment should use no more than 35% of what your business keeps each month. Twelve months of that repayment gives the indicative amount, capped by your level.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">Level</th><th scope="col">Score</th><th scope="col" className="num-col">Upper limit</th><th scope="col">Usually suits</th></tr></thead>
            <tbody>
              {SCORE_LEVELS.map((l, i) => (
                <tr key={l.id}>
                  <th scope="row">{l.name}, {l.label}</th>
                  <td className="num">{l.min} to {SCORE_LEVELS[i + 1] ? SCORE_LEVELS[i + 1].min - 1 : 100}</td>
                  <td className="num-col num">{l.cap ? tsh(l.cap) : 'No loan yet'}</td>
                  <td>{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="prose-block">
        <h2>How savings advice is worked out</h2>
        <p>We suggest saving 20% of what your business keeps each month, split into a weekly amount. The first goal is an emergency fund equal to two months of your costs.</p>
      </section>

      <section className="prose-block">
        <h2>For investors</h2>
        <ol className="plain-steps">
          <li><strong>Demo account.</strong> Your name, your experience and what you want to learn. No ID and no bank details.</li>
          <li><strong>Demo wallet.</strong> TSh 1,000,000 in practice money with no cash value.</li>
          <li><strong>Listings.</strong> Only businesses that passed verification appear. Each shows its purpose, lock-up, minimum, risks and a return range that is not a promise.</li>
          <li><strong>Practice.</strong> Invest, then move time forward six months to see how each business did, including losses.</li>
        </ol>
      </section>

      <div className="page__actions">
        <Link to="/entrepreneur" className="btn btn--primary">Verify my business</Link>
        <Link to="/investor" className="btn btn--ghost">Open a demo account</Link>
      </div>
    </article>
  )
}
