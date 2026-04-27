interface MetricCardProps {
  label: string
  value: string
  note: string
}

export function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <article className="card metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </article>
  )
}