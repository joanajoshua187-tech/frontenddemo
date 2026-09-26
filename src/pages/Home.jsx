import { Link } from 'react-router-dom'
import { LedgerPage } from '../components/LedgerPage'
import { ScoreDial } from '../components/ScoreDial'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const STEPS = [
  { title: 'Prove the business is yours', body: 'Enter your business name, TIN, NIDA number and business licence. We check them against the registries.' },
  { title: 'Photograph your records', body: 'Upload pages from your ledger book and screenshots of your mobile money statements. Three months or more works best.' },
  { title: 'Check what the AI read', body: 'Every line appears in a table. Anything smudged or possibly counted twice is flagged for you to fix.' },
  { title: 'Get your report', body: 'A cash flow summary, a score from 0 to 100 with every reason shown, an indicative loan level and a weekly savings amount.' },
]

const CHECKS = [
  { what: 'Business name', against: 'BRELA register', why: 'Confirms the business legally exists.' },
  { what: 'TIN', against: 'TRA', why: 'Confirms the business is known to the tax authority.' },
  { what: 'Business licence', against: 'Issuing council', why: 'Confirms the licence is current for this trade.' },
  { what: 'NIDA number', against: 'NIDA', why: 'Confirms you are the owner. Deleted after the check.' },
]

const FAQ = [
  { q: 'Is the Mizani score the same as a credit bureau score?', a: 'No. It is a readiness score built only from the records you upload. A lender may look at it alongside a credit reference bureau report and its own checks.' },
  { q: 'My business is not registered yet. Can I still use Mizani?', a: 'You need a registered business to get a report. Register your business name with BRELA and get a TIN from TRA, then come back with those numbers.' },
  { q: 'Which records give the best result?', a: 'Clear photos of every ledger page, one page per photo, and mobile money statement screenshots for the same months. More months give a steadier score.' },
  { q: 'Is the investor money real?', a: 'No. Every investor account gets TSh 1,000,000 in demo money. It has no cash value and cannot be withdrawn. It exists so you can practise before risking your own savings.' },
  { q: 'Who sees my records?', a: 'Only you. A lender sees your report only after you press Share, and never your NIDA number.' },
]

export default function Home() {
  useDocumentTitle('')
  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <h1 className="hero__title">Your ledger book already proves your business works.</h1>
          <p className="hero__lede">
            Mizani checks that your business is registered, reads photos of your ledger and your mobile money screenshots,
            and gives you a report with a credit score, a loan level and a savings plan you can keep to.
          </p>
          <div className="hero__actions">
            <Link to="/entrepreneur" className="btn btn--primary btn--large">
              Get my business report <Icon name="arrow" />
            </Link>
            <Link to="/investor" className="btn btn--ghost btn--large">Practise investing with demo money</Link>
          </div>
          <p className="hero__fine">For registered businesses in Tanzania. Investor practice never uses real money.</p>
        </div>
        <div className="hero__visual">
          <LedgerPage />
        </div>
      </section>

      <section className="section doors" aria-labelledby="doors-title">
        <h2 id="doors-title" className="section__title">Two ways in</h2>
        <div className="doors__grid">
          <article className="door door--business">
            <p className="door__who">I run a business</p>
            <h3 className="door__title">Turn a notebook of sales into a report a lender can read.</h3>
            <div className="door__cols">
              <div>
                <h4>You bring</h4>
                <ul>
                  <li>Business name and TIN</li>
                  <li>NIDA number, to prove ownership</li>
                  <li>Business licence number</li>
                  <li>Ledger photos or mobile money screenshots</li>
                </ul>
              </div>
              <div>
                <h4>You leave with</h4>
                <ul>
                  <li>Money in and out, month by month</li>
                  <li>A score from 0 to 100 with every reason</li>
                  <li>An indicative loan level</li>
                  <li>A weekly amount to save</li>
                </ul>
              </div>
            </div>
            <Link to="/entrepreneur" className="btn btn--primary">Start with verification</Link>
          </article>
          <article className="door door--investor">
            <p className="door__who">I want to learn to invest</p>
            <h3 className="door__title">Practise on real kinds of businesses before you use real savings.</h3>
            <div className="door__cols">
              <div>
                <h4>You get</h4>
                <ul>
                  <li>TSh 1,000,000 in demo money</li>
                  <li>Verified businesses to compare</li>
                  <li>Risks explained in plain words</li>
                  <li>A suggestion after every move</li>
                </ul>
              </div>
              <div>
                <h4>You learn</h4>
                <ul>
                  <li>What a lock-up period means</li>
                  <li>Why one business should not hold everything</li>
                  <li>How a bad season looks in numbers</li>
                </ul>
              </div>
            </div>
            <Link to="/investor" className="btn btn--light">Open a demo account</Link>
          </article>
        </div>
      </section>

      <section className="section steps" aria-labelledby="steps-title">
        <h2 id="steps-title" className="section__title">From notebook to report in four steps</h2>
        <ol className="steps__list">
          {STEPS.map((s, i) => (
            <li key={s.title} className="steps__item">
              <span className="steps__num num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section checks" aria-labelledby="checks-title">
        <div className="checks__intro">
          <h2 id="checks-title" className="section__title">What we check before we read a single page</h2>
          <p>A report is only useful if the business behind it is real. These four checks run first. If one fails, we tell you which one and how to fix it.</p>
        </div>
        <div className="table-wrap">
          <table className="checks__table">
            <thead>
              <tr><th scope="col">Detail</th><th scope="col">Checked against</th><th scope="col">Why</th></tr>
            </thead>
            <tbody>
              {CHECKS.map((c) => (
                <tr key={c.what}><th scope="row">{c.what}</th><td>{c.against}</td><td>{c.why}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section sample" aria-labelledby="sample-title">
        <div className="sample__copy">
          <h2 id="sample-title" className="section__title">What a report looks like</h2>
          <p>This is the report for Amina Tailoring, a demo business with six months of records. Every point in the score has a reason you can read, and you can see exactly how the loan level was worked out.</p>
          <Link to="/how-it-works" className="text-link">See how the score is calculated <Icon name="arrow" size={16} /></Link>
        </div>
        <div className="sample__card">
          <ScoreDial score={74} caption="Mizani score for Amina Tailoring" />
          <dl className="sample__facts">
            <div><dt>Loan level</dt><dd>Level 3, Growth</dd></div>
            <div><dt>Indicative amount</dt><dd className="num">TSh 1,800,000</dd></div>
            <div><dt>Save each week</dt><dd className="num">TSh 19,500</dd></div>
            <div><dt>Records trust</dt><dd>High, 68% matched</dd></div>
          </dl>
        </div>
      </section>

      <section className="section lines" aria-labelledby="lines-title">
        <h2 id="lines-title" className="section__title">Where we draw the line</h2>
        <ul className="lines__list">
          <li><strong>We do not approve loans.</strong> A lender makes that decision with its own checks.</li>
          <li><strong>We do not keep your NIDA number.</strong> It is used for the ownership check and then deleted.</li>
          <li><strong>We do not share your records by default.</strong> Nothing leaves your account until you press Share.</li>
          <li><strong>We do not move real money</strong> in investor practice, ever.</li>
        </ul>
      </section>

      <section className="section faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section__title">Questions people ask first</h2>
        <div className="faq__list">
          {FAQ.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="closing">
        <h2>Bring this month’s ledger. Leave with a report.</h2>
        <div className="closing__actions">
          <Link to="/entrepreneur" className="btn btn--light btn--large">Get my business report</Link>
          <Link to="/investor" className="btn btn--outline-light btn--large">Practise investing</Link>
        </div>
      </section>
    </>
  )
}
