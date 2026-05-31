import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import DashboardHeader from './components/Header/DashboardHeader'
import LeftPane from './components/LeftPane/LeftPane'
import Footer from '../../components/Footer/Footer'
import SearchModal from './components/SearchModal/SearchModal'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import { queryClient } from '../../lib/queryClient'
import { fetchNotifications, markAllNotifRead, logoutUser, fetchQuestionTags } from './service'

function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearUser } = useAuthStore()
  const isDark = useThemeStore(s => s.isDark)
  const toggleDark = useThemeStore(s => s.toggleDark)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentView, setCurrentView]     = useState('dashboard')
  const [sidebarNav, setSidebarNav]        = useState('Dashboard')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery]         = useState('')
  const [activeTags, setActiveTags]           = useState([])
  const [categories, setCategories]           = useState([])

  useEffect(() => {
    fetchQuestionTags()
      .then(tags => setCategories(tags))
      .catch(() => setCategories([]))
  }, [])

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  useEffect(() => {
    fetchNotifications()
      .then(data => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try {
      await logoutUser()
    } catch {
      // Clear locally even if API call fails
    }
    clearUser()
    navigate('/')
  }

  async function handleNotifOpen() {
    if (unreadCount > 0) {
      try {
        await markAllNotifRead()
        setUnreadCount(0)
        setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
      } catch { /* silent */ }
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Mobile drawer backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main row: LeftPane + content */}
      <div className="flex flex-1 relative">
        <LeftPane
          isCollapsed={isLeftPaneCollapsed}
          onToggleCollapse={() => setIsLeftPaneCollapsed(v => !v)}
          sidebarNav={location.pathname === '/leaderboard' ? 'Leaderboard' : sidebarNav}
          currentView={currentView}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          onNavigate={label => {
            setIsMobileMenuOpen(false)
            if (label === 'Leaderboard') {
              navigate('/leaderboard')
              return
            }
            setSidebarNav(label)
            setCurrentView('dashboard')
            // Clear cached questions so the dashboard refetches and Similar Queries resets
            queryClient.removeQueries({ queryKey: ['dashboardQuestions'] })
            navigate('/dashboard')
          }}
        />

        <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          <DashboardHeader
            user={user}
            initials={initials}
            currentView={currentView}
            showRaiseQuery={location.pathname !== '/raise-query'}
            notifications={notifications}
            unreadCount={unreadCount}
            isDark={isDark}
            onSearchOpen={() => setSearchModalOpen(true)}
            onRaiseQuery={() => navigate('/raise-query')}
            onNotifOpen={handleNotifOpen}
            onDarkToggle={toggleDark}
            onProfileSettings={() => navigate('/profile')}
            onLogout={handleLogout}
            onMenuToggle={() => setIsMobileMenuOpen(v => !v)}
          />

          <div className="flex-1">
            <Outlet
              context={{
                user,
                sidebarNav,
                setSidebarNav,
                currentView,
                setCurrentView,
                initials,
                searchModalOpen,
                setSearchModalOpen,
                searchQuery,
                setSearchQuery,
                activeTags,
                setActiveTags,
                openSearchModal: () => setSearchModalOpen(true),
              }}
            />
          </div>

          <Footer />
        </div>
      </div>

      {/* ── Global Search modal ─────────────────────────────────────────── */}
      <SearchModal
        open={searchModalOpen}
        categories={categories}
        initialSearch={searchQuery}
        initialTags={activeTags}
        onApply={(search, tags) => {
          setSearchQuery(search)
          setActiveTags(tags)
          setSearchModalOpen(false)
          if (location.pathname !== '/dashboard') {
            setSidebarNav('Dashboard')
            navigate('/dashboard')
          }
        }}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  )
}

export default UserLayout
