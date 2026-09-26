export function TextField({ id, label, hint, error, ...inputProps }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      <input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}

export function SelectField({ id, label, error, options, placeholder, ...selectProps }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...selectProps}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}

export function CheckboxField({ id, children, error, ...inputProps }) {
  return (
    <div className={`field field--check ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="check">
        <input id={id} name={id} type="checkbox" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
        <span>{children}</span>
      </label>
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}

export function ChoiceGroup({ name, legend, options, value, onChange, error }) {
  return (
    <fieldset className={`choice-group ${error ? 'has-error' : ''}`}>
      <legend>{legend}</legend>
      <div className="choice-group__options">
        {options.map((o) => (
          <label key={o.value} className={`choice ${value === o.value ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="choice__title">{o.label}</span>
            {o.note && <span className="choice__note">{o.note}</span>}
          </label>
        ))}
      </div>
      {error && <p className="field__error" role="alert">{error}</p>}
    </fieldset>
  )
}
