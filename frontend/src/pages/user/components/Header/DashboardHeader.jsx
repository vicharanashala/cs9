import {
  Popover, PopoverButton, PopoverPanel,
  Menu, MenuButton, MenuItems, MenuItem,
} from '@headlessui/react'
import { Settings, Search, SlidersHorizontal, PlusCircle, Bell, LogOut, Moon, Sun } from 'lucide-react'
import { timeAgo } from '../../service'
import Button from '../../../../components/Button/Button'

function DashboardHeader({
  user,
  initials,
  currentView,
  showRaiseQuery = true,
  notifications,
  unreadCount,
  isDark,
  onSearchOpen,
  onRaiseQuery,
  onNotifOpen,        // bell click — opens the small dropdown preview
  onNotifViewAll,    // "View All" click — opens the full NotificationModal
  onDarkToggle,
  onProfileSettings,
  onLogout,
}) {
  return (
    <header className="relative flex items-center justify-between border-b border-[#c4c7c7] bg-white px-8 py-4">
      {/* Search trigger */}
      <button
        type="button"
        className="flex w-[420px] items-center gap-2 rounded-lg bg-[#edeeef] px-3 py-2 text-left text-[12px] text-[#747878] transition hover:text-[#191c1d]"
        onClick={() => onSearchOpen?.()}
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.8} />
        <span className="flex-1">Search FAQs, categories, or status…</span>
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#9ca3af]" strokeWidth={1.8} />
      </button>

      {/* Right-side action group */}
      <div className="flex items-center gap-6">
        {showRaiseQuery && (
          <Button
            variant="secondary"
            className="gap-2 rounded-lg border-transparent bg-[#8c6a40]/80 px-4 text-[11px] font-bold uppercase tracking-wide text-white hover:border-transparent hover:bg-[#7a5c35]"
            onClick={onRaiseQuery}
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.8} /> Raise New Query
          </Button>
        )}

        {/* Bell */}
        <Popover className="relative">
          <PopoverButton
            onClick={() => onNotifOpen?.()}
            className="relative p-1 text-[#444748] transition hover:text-black focus:outline-none"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </PopoverButton>

          <PopoverPanel className="absolute right-0 top-9 z-50 w-80 overflow-hidden rounded-lg border border-[#c4c7c7] bg-white shadow-lg focus:outline-none">
            <p className="border-b border-[#c4c7c7] px-4 py-3 text-[13px] font-semibold text-[#191c1d]">
              Notifications
            </p>
            {notifications.length === 0 ? (
              <p className="px-4 py-5 text-center text-[12px] text-[#747878]">No notifications yet</p>
            ) : (
              notifications.slice(0, 3).map(n => (
                <div
                  key={n.notification_id || n.id}
                  className={`border-b border-[#f3f4f6] px-4 py-3 ${n.is_read ? 'bg-white' : 'bg-[#f0f9ff]'}`}
                >
                  <p className="mb-1 text-[12px] leading-snug text-[#444748]">{n.body || n.title}</p>
                  <span className="text-[10px] font-medium text-[#9ca3af]">
                    {n.created_at ? timeAgo(n.created_at) : ''}
                  </span>
                </div>
              ))
            )}
            <button
              type="button"
              onClick={onNotifViewAll}
              className="w-full cursor-pointer bg-[#f8f9fa] py-2.5 text-center text-[11px] font-semibold text-[#8c6a40] transition hover:bg-[#edeeef]"
            >
              View All
            </button>
          </PopoverPanel>
        </Popover>

        {/* Dark mode */}
        <button
          type="button"
          className="p-1 text-[#444748] transition hover:text-black"
          onClick={() => onDarkToggle()}
        >
          {isDark
            ? <Sun  className="h-[18px] w-[18px]" strokeWidth={1.8} />
            : <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        </button>

        {/* Divider */}
        <span className="h-8 w-px bg-[#c4c7c7]" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-3 focus:outline-none">
            <div className="text-right leading-tight">
              <p className="text-[13px] font-medium capitalize text-[#191c1d]">{user?.name || 'Student'}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#747878]">{user?.role || 'USER'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8c6a40] text-[12px] font-bold text-white">
              {initials}
            </div>
          </MenuButton>

          <MenuItems className="absolute right-0 top-12 z-50 min-w-[160px] overflow-hidden rounded-lg border border-[#c4c7c7] bg-white shadow-lg focus:outline-none">
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-[#444748] transition data-focus:bg-[#f8f9fa]"
                onClick={onProfileSettings}
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="text-[13px] font-medium capitalize">Profile Settings</span>
              </button>
            </MenuItem>
            <div className="h-px bg-[#c4c7c7]" />
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-600 transition data-focus:bg-[#f8f9fa]"
                onClick={onLogout}
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="text-[13px] font-medium">Logout</span>
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}

export default DashboardHeader