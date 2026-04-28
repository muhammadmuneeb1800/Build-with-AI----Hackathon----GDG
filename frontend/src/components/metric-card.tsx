// interface MetricCardProps {
//   label: string
//   value: string
//   note: string
// }

// export function MetricCard({ label, value, note }: MetricCardProps) {
//   return (
//     <article className="card metric-card">
//       <div className="metric-label">{label}</div>
//       <div className="metric-value">{value}</div>
//       <div className="metric-note">{note}</div>
//     </article>
//   )
// }


interface MetricCardProps {
  label: string
  value: string
  note: string
}

export function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <article className="
      flex flex-col gap-1.5 px-5 py-5 rounded-xl
      bg-[var(--bg-surface)] border border-[var(--border-subtle)]
      shadow-[var(--shadow-card)]
      hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-md)]
      hover:-translate-y-0.5
      transition-all duration-200 cursor-default
    ">
      <div className="
        text-[10px] font-semibold tracking-[0.07em] uppercase
        text-[var(--text-muted)]
      ">
        {label}
      </div>

      <div className="
        text-[28px] font-extrabold tracking-[-0.04em] leading-none
        text-[var(--text-primary)]
      ">
        {value}
      </div>

      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
        {note}
      </div>
    </article>
  )
}