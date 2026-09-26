import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { brand } from '../config/brand'

export default function About() {
  useDocumentTitle('About')
  return (
    <article className="page page--narrow about">
      <p className="eyebrow">About</p>
      <h1 className="page__title">Onekana means “be seen”</h1>
      <p className="page__lede">
        We help economically active small businesses become financially visible, and help ordinary people learn to invest in them safely.
      </p>
      <dl className="about__list">
        <div><dt>For entrepreneurs</dt><dd>Turning invisible businesses into bankable businesses.</dd></div>
        <div><dt>For investors</dt><dd>Democratising trusted local investment.</dd></div>
        <div><dt>For banks</dt><dd>Verified, consented evidence to lend on.</dd></div>
        <div><dt>Our rules</dt><dd>Consent first, every number explained, a person makes every decision, and nothing is shared or sold by default.</dd></div>
      </dl>
      <p className="muted">
        Built for GirlCode Hackathon Tanzania 2026. Questions: <span className="selectable">{brand.contactEmail}</span>. Read the <Link to="/how-it-works">rules behind the score</Link>.
      </p>
    </article>
  )
}
