import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { brand } from '../config/brand'

export default function LegalPage({ document: doc }) {
  useDocumentTitle(doc.title)
  return (
    <article className="page page--narrow legal">
      <h1 className="page__title">{doc.title}</h1>
      <p className="legal__updated">Last updated {brand.lastUpdated}</p>
      <p className="page__lede">{doc.intro}</p>
      {doc.sections.map((s) => (
        <section key={s.heading} className="legal__section">
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          {s.list && (
            <ul>
              {s.list.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}
