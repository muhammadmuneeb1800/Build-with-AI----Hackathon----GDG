// import { NavLink } from 'react-router-dom'

// import { NAV_ITEMS } from '../constants'

// const ICONS: Record<string, string> = {
//   dashboard: '◌',
//   add: '+',
// }

// export function SidebarNav() {
//   return (
//     <nav className="sidebar-section" aria-label="Primary navigation">
//       {NAV_ITEMS.map((item) => (
//         <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
//           <span className="nav-link-icon" aria-hidden="true">
//             {ICONS[item.icon]}
//           </span>
//           <span>
//             <strong>{item.label}</strong>
//             <div className="section-caption">{item.description}</div>
//           </span>
//         </NavLink>
//       ))}
//     </nav>
//   )
// }





import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '../constants'

const ICONS: Record<string, string> = {
  dashboard: '◌',
  add: '+',
  integrations: '⊞',
  profile: '◍',
}

export function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            [
              'flex items-start gap-3 px-3 py-2.5 rounded-lg',
              'text-[13px] transition-all duration-150 no-underline group',
              isActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={[
                  'w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-sm mt-px',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_8px_var(--accent-glow)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] group-hover:bg-[var(--border-subtle)]',
                ].join(' ')}
                aria-hidden="true"
              >
                {ICONS[item.icon]}
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <strong className="font-semibold leading-none">{item.label}</strong>
                <span className="text-[11px] text-[var(--text-muted)] leading-snug">{item.description}</span>
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}