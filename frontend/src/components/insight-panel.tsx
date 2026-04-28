// interface InsightPanelProps {
//   title: string
//   items: string[]
//   caption?: string
// }

// export function InsightPanel({ title, items, caption }: InsightPanelProps) {
//   return (
//     <section className="card section-card">
//       <div className="section-header">
//         <div>
//           <h2 className="section-title">{title}</h2>
//           {caption ? <div className="section-caption">{caption}</div> : null}
//         </div>
//       </div>

//       <div className="insight-list">
//         {items.map((item) => (
//           <div className="insight-item" key={item}>
//             <div className="insight-item-title">Insight</div>
//             <div className="insight-item-body">{item}</div>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }





interface InsightPanelProps {
  title: string
  items: string[]
  caption?: string
}

export function InsightPanel({ title, items, caption }: InsightPanelProps) {
  return (
    <section className="
      flex flex-col gap-4 p-5 rounded-xl
      bg-[var(--bg-surface)] border border-[var(--border-subtle)]
      shadow-[var(--shadow-card)]
      transition-colors duration-300
    ">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-[13px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
          {title}
        </h2>
        {caption && (
          <p className="m-0 text-[11px] text-[var(--text-muted)] leading-relaxed">
            {caption}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="
              flex items-start gap-2.5
              px-3 py-2.5 rounded-lg
              bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
              hover:border-[var(--border-strong)]
              transition-colors duration-150 group
            "
          >
            {/* Dot */}
            <span className="
              shrink-0 w-1.5 h-1.5 rounded-full
              bg-[var(--accent)] mt-[5px]
              group-hover:shadow-[0_0_6px_var(--accent-glow)]
              transition-shadow duration-150
            " />
            <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              {item}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}