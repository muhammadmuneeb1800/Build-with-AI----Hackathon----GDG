// import type { ReactNode } from 'react'

// import { APP_NAME, APP_TAGLINE } from '../constants'
// import { SidebarNav } from './sidebar-nav'

// interface AppShellProps {
//   children: ReactNode
//   rightPanel?: ReactNode
// }

// export function AppShell({ children, rightPanel }: AppShellProps) {
//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="brand">
//           <div className="brand-mark" aria-hidden="true" />
//           <div>
//             <div className="brand-title">{APP_NAME}</div>
//             <div className="brand-subtitle">{APP_TAGLINE}</div>
//           </div>
//         </div>

//         <div className="sidebar-section">
//           <SidebarNav />
//         </div>

//         <div className="sidebar-footer">
//           <div className="eyebrow">Signal over noise</div>
//           <div className="section-caption">
//             The engine extracts commitments, flags risk, and keeps the founder focused on the next action.
//           </div>
//         </div>
//       </aside>

//       <main className="main-content">
//         <div className="page-shell">{children}</div>
//       </main>

//       <aside className="main-content insights-column">{rightPanel}</aside>
//     </div>
//   )
// }



import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

import { APP_NAME, APP_TAGLINE } from '../constants'
import { SidebarNav } from './sidebar-nav'

interface AppShellProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="min-h-screen flex bg-[var(--bg-base)] transition-colors duration-300">

      {/* ── Sidebar ── */}
      <aside className="
        hidden lg:flex flex-col w-[240px] shrink-0
        bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]
        sticky top-0 h-screen overflow-y-auto
        transition-colors duration-300
      ">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="
            w-8 h-8 rounded-lg bg-[var(--accent)] shrink-0
            flex items-center justify-center
            shadow-[0_0_12px_var(--accent-glow)]
          ">
            <span className="text-white text-xs font-black tracking-tight">FC</span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold tracking-[-0.02em] text-[var(--text-primary)] truncate">
              {APP_NAME}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate mt-px">
              {APP_TAGLINE}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 px-3">
          <SidebarNav />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
          <div className="
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-[var(--accent-soft)] text-[var(--accent)]
            text-[10px] font-semibold tracking-[0.08em] uppercase mb-2
          ">
            Signal over noise
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            The engine extracts commitments, flags risk, and keeps the founder focused on the next action.
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar (mobile brand + theme toggle) */}
        <header className="
          flex items-center justify-between
          px-5 h-14 lg:h-12
          bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]
          sticky top-0 z-50 backdrop-blur-md
          transition-colors duration-300
        ">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white text-[9px] font-black">FC</span>
            </div>
            <span className="text-[13px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              {APP_NAME}
            </span>
          </div>
          <div className="hidden lg:block" />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label="Toggle theme"
            className="
              w-8 h-8 rounded-md flex items-center justify-center
              border border-[var(--border-subtle)] bg-[var(--bg-elevated)]
              text-[var(--text-muted)] hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)]
              transition-all duration-200 cursor-pointer text-sm
            "
          >
            {isDark ? '☀' : '◑'}
          </button>
        </header>

        {/* Page body */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0 px-5 lg:px-8 py-7 flex flex-col gap-7">
            {children}
          </main>

          {/* Right panel */}
          {rightPanel && (
            <aside className="
              hidden xl:flex flex-col w-[300px] shrink-0
              px-5 py-7 gap-5
              border-l border-[var(--border-subtle)]
              bg-[var(--bg-base)]
              transition-colors duration-300
            ">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}