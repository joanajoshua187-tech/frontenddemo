import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { lessons } from '../../data/lessons'
import { listings } from '../../data/listings'
import { requiredLessons } from '../../utils/risk'
import { Icon } from '../../components/Icon'

function Lesson({ lesson, done, onDone, index }) {
  const [picked, setPicked] = useState(null)
  const correct = picked === lesson.answer
  return (
    <li className={`lesson ${done ? 'is-done' : ''}`}>
      <div className="lesson__head">
        <span className="lesson__num num">{index + 1}</span>
        <h3>{lesson.title}</h3>
        {done && <span className="tag tag--good"><Icon name="check" size={14} /> Done</span>}
      </div>
      <p>{lesson.body}</p>
      <fieldset className="choice-group">
        <legend>{lesson.question}</legend>
        <div className="choice-group__options">
          {lesson.options.map((o, i) => (
            <label key={o} className={`choice ${picked === i ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={`lesson-${lesson.id}`}
                checked={picked === i}
                onChange={() => {
                  setPicked(i)
                  if (i === lesson.answer && !done) onDone()
                }}
              />
              <span className="choice__title">{o}</span>
            </label>
          ))}
        </div>
        {picked !== null && (correct ? <p className="field__ok">Correct.</p> : <p className="field__error">Not quite. Read the lesson again and try the other answer.</p>)}
      </fieldset>
    </li>
  )
}

export default function Learn() {
  useDocumentTitle('Learn')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const done = state.inv.lessonsDone
  const pct = Math.round((done.length / lessons.length) * 100)
  const locked = listings.filter((l) => requiredLessons(l).some((g) => !done.includes(g)))

  return (
    <div className="stack">
      <section className="card-block">
        <h2 className="h-section">Five short lessons before real money</h2>
        <p className="muted">Each takes about a minute. Some opportunities stay locked until you have finished the lessons that explain their risks.</p>
        <div className="goal__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        <p className="num">{done.length} of {lessons.length} done</p>
        {locked.length > 0 ? (
          <p className="note">Still locked: {locked.map((l) => l.name).join(', ')}.</p>
        ) : (
          <p className="ok-box"><Icon name="check" /> Every opportunity is unlocked.</p>
        )}
      </section>
      <ol className="lesson-list-full">
        {lessons.map((l, i) => (
          <Lesson
            key={l.id}
            lesson={l}
            index={i}
            done={done.includes(l.id)}
            onDone={() => { dispatch({ type: 'inv/lesson', id: l.id, title: l.title }); notify(`Lesson done: ${l.title}.`) }}
          />
        ))}
      </ol>
    </div>
  )
}
