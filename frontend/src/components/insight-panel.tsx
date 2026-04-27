interface InsightPanelProps {
  title: string
  items: string[]
  caption?: string
}

export function InsightPanel({ title, items, caption }: InsightPanelProps) {
  return (
    <section className="card section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {caption ? <div className="section-caption">{caption}</div> : null}
        </div>
      </div>

      <div className="insight-list">
        {items.map((item) => (
          <div className="insight-item" key={item}>
            <div className="insight-item-title">Insight</div>
            <div className="insight-item-body">{item}</div>
          </div>
        ))}
      </div>
    </section>
  )
}