/* global __PROJECT_NAME__, __PROJECT_TAGLINE__ */
import { LayoutGrid, MessageSquare, Trophy, PanelLeftClose, PanelLeft } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', Icon: LayoutGrid },
  { label: 'My Queries', Icon: MessageSquare },
  { label: 'Leaderboard', Icon: Trophy },
]

function LeftPane({ isCollapsed, onToggleCollapse, sidebarNav, currentView, onNavigate, isMobileOpen, onMobileClose }) {
  return (
    <aside
      className={`fixed bottom-0 top-0 z-50 flex shrink-0 flex-col border-r border-border bg-card pt-6 transition-all duration-300 md:sticky md:top-0 md:h-screen ${
        isCollapsed ? 'md:w-16' : 'md:w-64'
      } ${
        isMobileOpen ? 'left-0 w-64' : '-left-64 md:left-0'
      }`}
    >
      {/* Brand & Toggle Header */}
      <div className={`flex pb-6 ${isCollapsed ? 'px-2 justify-center' : 'items-center justify-between px-6'}`}>
        {!isCollapsed && (
          <button
            type="button"
            className="flex flex-col text-left focus:outline-none cursor-pointer"
            onClick={() => onNavigate('Dashboard')}
          >
            <h2 className="font-display text-[22px] font-bold leading-tight text-foreground transition-colors">
              {__PROJECT_NAME__ || 'Rogāre'}
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {__PROJECT_TAGLINE__ || 'Lab Internship Hub'}
            </p>
          </button>
        )}

        <button
          type="button"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => {
            if (window.innerWidth < 768) {
              onMobileClose?.()
            } else {
              onToggleCollapse()
            }
          }}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus:visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          {isCollapsed
            ? <PanelLeft className="h-4.5 w-4.5" strokeWidth={1.8} />
            : <PanelLeftClose className="h-4.5 w-4.5" strokeWidth={1.8} />
          }
        </button>
      </div>

      {/* Section label — hidden when collapsed */}
      {!isCollapsed && (
        <div className="mb-4 px-6">
          <p className="font-display text-sm font-semibold leading-snug text-foreground/80">
            Student portal
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className={`relative flex flex-col gap-2 ${isCollapsed ? 'items-center px-1' : 'pl-6 pr-3'}`}>
        {!isCollapsed && <span className="absolute bottom-2 left-5 top-2 w-px bg-border" aria-hidden="true" />}

        {NAV_ITEMS.map(({ label, Icon }) => {
          const isActive = sidebarNav === label && currentView === 'dashboard'

          return (
            <button
              key={label}
              type="button"
              title={isCollapsed ? label : undefined}
              onClick={() => onNavigate(label)}
              className={`flex min-h-11 items-center gap-3 rounded-lg py-2.5 text-left transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
                isCollapsed ? 'w-10 justify-center px-0' : 'w-full px-4'
              } ${
                isActive
                  ? 'border-r-2 border-primary bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
              {!isCollapsed && <span className="text-sm font-semibold">{label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default LeftPane
