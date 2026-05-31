/* global __PROJECT_NAME__, __PROJECT_TAGLINE__ */
import { Zap, LayoutGrid, MessageSquare, PanelLeftClose, Settings, Bell } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { id: 'queriesManagement', label: 'Queries', Icon: MessageSquare },
  { id: 'sparkLeaderboard', label: 'Spark', Icon: Zap },
  { id: 'faqManagement', label: 'FAQ', Icon: Settings },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
]

function AdminLeftPane({ currentView, onNavigate }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card pt-6 md:flex text-foreground transition-all duration-300">
      <button
        type="button"
        className="flex flex-col px-6 pb-6 text-left focus:outline-none"
        onClick={() => onNavigate('dashboard')}
      >
        <h2 className="font-display text-lg font-bold leading-tight text-foreground transition-colors">
          {__PROJECT_NAME__ || 'Rogāre'}
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
          {__PROJECT_TAGLINE__ || 'Lab Internship Hub'}
        </p>
      </button>

      <div className="mb-3 px-6">
        <p className="font-display text-sm font-semibold leading-snug text-foreground/80">
          Control room
        </p>
      </div>

      <nav className="relative flex flex-col gap-1.5 pl-6 pr-3">
        <span className="absolute bottom-2 left-5 top-2 w-px bg-border" aria-hidden="true" />
        {navItems.map(({ id, label, Icon }) => {
          const isActive = currentView === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
                  ? 'border-r-2 border-primary bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-6 pb-5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground font-semibold">
          <PanelLeftClose className="h-4 w-4" strokeWidth={1.8} />
          Admin workspace
        </div>
      </div>
    </aside>
  )
}

export default AdminLeftPane
