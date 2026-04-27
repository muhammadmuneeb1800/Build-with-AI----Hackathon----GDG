import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { addCommitment } from '../api'
import { AppShell, EmptyState } from '../components'
import { SAMPLE_INPUT } from '../constants'
import { appRoutes } from '../navigation/route'

export function AddCommitmentPage() {
  const [text, setText] = useState(SAMPLE_INPUT)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const navigate = useNavigate()

  const canSubmit = text.trim().length >= 3 && !isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    setError(null)

    try {
      await addCommitment({ text: text.trim() })
      setFeedback('Commitment saved and structured by the engine.')
      startTransition(() => {
        navigate(appRoutes.dashboard)
      })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to save commitment.'
      setError(message)
    }
  }

  return (
    <AppShell
      rightPanel={
        <EmptyState
          title="How it works"
          body="Paste raw founder text, and the backend extracts the task, deadline, and priority before storing it in the database."
          actionHref={appRoutes.dashboard}
          actionLabel="View dashboard"
        />
      }
    >
      <section className="page-hero">
        <div className="hero-copy">
          <div className="eyebrow">Capture input</div>
          <h1 className="page-title">Turn a messy founder note into a tracked commitment.</h1>
          <p className="page-description">
            The engine will parse the text, infer urgency, and persist a structured record for dashboard tracking.
          </p>
        </div>
        <div className="hero-actions">
          <NavLink className="button button-ghost" to={appRoutes.dashboard}>
            Back to dashboard
          </NavLink>
        </div>
      </section>

      <section className="card form-card">
        <form onSubmit={handleSubmit}>
          <label className="input-label" htmlFor="commitment-text">
            Founder input
          </label>
          <textarea
            id="commitment-text"
            className="text-area"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Example: Follow up with investor tomorrow and send the updated MRR summary by noon."
          />
          <div className="helper-copy">
            Keep it natural. The system extracts task, deadline, priority, and a default action suggestion.
          </div>
          <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="button button-primary" type="submit" disabled={!canSubmit}>
              {isPending ? 'Saving commitment...' : 'Save commitment'}
            </button>
            <button className="button button-ghost" type="button" onClick={() => setText(SAMPLE_INPUT)}>
              Load sample
            </button>
          </div>
          {feedback ? <div className="feedback">{feedback}</div> : null}
          {error ? <div className="feedback">{error}</div> : null}
        </form>
      </section>
    </AppShell>
  )
}