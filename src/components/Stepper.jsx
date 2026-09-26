export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={step} className={`stepper__item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="stepper__num">{i + 1}</span>
            <span className="stepper__label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
