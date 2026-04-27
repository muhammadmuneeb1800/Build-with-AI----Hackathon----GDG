import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '../constants'

const ICONS: Record<string, string> = {
  dashboard: '◌',
  add: '+',
}

export function SidebarNav() {
  return (
    <nav className="sidebar-section" aria-label="Primary navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-link-icon" aria-hidden="true">
            {ICONS[item.icon]}
          </span>
          <span>
            <strong>{item.label}</strong>
            <div className="section-caption">{item.description}</div>
          </span>
        </NavLink>
      ))}
    </nav>
  )
}