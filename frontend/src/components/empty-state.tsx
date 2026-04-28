// import { NavLink } from 'react-router-dom'

// import type { AppRoute } from '../navigation/route'

// interface EmptyStateProps {
//   title: string
//   body: string
//   actionLabel?: string
//   actionHref?: AppRoute
// }

// export function EmptyState({ title, body, actionLabel, actionHref }: EmptyStateProps) {
//   return (
//     <div className="empty-state">
//       <h3 className="empty-state-title">{title}</h3>
//       <p className="empty-state-body">{body}</p>
//       {actionLabel && actionHref ? (
//         <div style={{ marginTop: '16px' }}>
//           <NavLink className="button button-primary" to={actionHref}>
//             {actionLabel}
//           </NavLink>
//         </div>
//       ) : null}
//     </div>
//   )
// }




import { NavLink } from 'react-router-dom'

import type { AppRoute } from '../navigation/route'

interface EmptyStateProps {
  title: string
  body: string
  actionLabel?: string
  actionHref?: AppRoute
}

export function EmptyState({ title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="
      flex flex-col items-center justify-center gap-3
      px-7 py-12 text-center rounded-xl
      bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)]
      transition-colors duration-300
    ">
      {/* Icon placeholder */}
      <div className="
        w-10 h-10 rounded-xl flex items-center justify-center
        bg-[var(--accent-soft)] text-[var(--accent)] text-lg mb-1
      ">
        ◌
      </div>

      <h3 className="m-0 text-[15px] font-bold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="m-0 text-[13px] text-[var(--text-muted)] max-w-[280px] leading-relaxed">
        {body}
      </p>

      {actionLabel && actionHref && (
        <div className="mt-2">
          <NavLink
            to={actionHref}
            className="
              inline-flex items-center gap-1.5
              px-4 py-2 rounded-md
              bg-[var(--accent)] text-white
              text-[13px] font-semibold no-underline
              shadow-[0_1px_3px_var(--accent-glow)]
              hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_14px_var(--accent-glow)]
              hover:-translate-y-px
              transition-all duration-150
            "
          >
            {actionLabel}
          </NavLink>
        </div>
      )}
    </div>
  )
}