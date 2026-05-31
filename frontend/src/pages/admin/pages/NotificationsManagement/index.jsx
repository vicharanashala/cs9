import { useState, useEffect } from 'react'
import { Send, Users, User, Search, X } from 'lucide-react'
import Button from '../../../../components/Button/Button'
import { fetchUsersList, sendAdminNotification } from '../../service'
import { notifySuccess, notifyError } from '../../../../lib/notify'

function NotificationsManagementView() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [sending, setSending] = useState(false)

  // Fetch users when searching or on mount
  useEffect(() => {
    if (isBroadcast || !searchQuery.trim()) {
      setUsers([])
      return
    }

    setLoadingUsers(true)
    const delayDebounce = setTimeout(() => {
      fetchUsersList(searchQuery)
        .then((data) => {
          setUsers(data.users || [])
        })
        .catch(() => {
          setUsers([])
        })
        .finally(() => {
          setLoadingUsers(false)
        })
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, isBroadcast])

  const handleSend = async (e) => {
    e.preventDefault()

    if (!title.trim() || !body.trim()) {
      notifyError('Title and Body are required.')
      return
    }

    if (!isBroadcast && selectedUsers.length === 0) {
      notifyError('Please select at least one recipient student.')
      return
    }

    setSending(true)
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        is_broadcast: isBroadcast,
        recipient_ids: isBroadcast ? null : selectedUsers.map((u) => u.id),
      }

      await sendAdminNotification(payload)
      notifySuccess(
        isBroadcast
          ? 'Notification broadcasted successfully!'
          : `Notification sent successfully to ${selectedUsers.length} student(s)!`
      )

      // Reset form
      setTitle('')
      setBody('')
      setSelectedUsers([])
      setSearchQuery('')
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-8 animate-fade-in-up max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Announcements & Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send system-wide broadcasts to all students or target specific students with direct notifications.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm no-hover-lift">
        <form onSubmit={handleSend} className="space-y-6">
          {/* Target Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Notification Target
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBroadcast(true)
                  setSelectedUsers([])
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 px-4 border text-sm font-semibold transition cursor-pointer ${
                  isBroadcast
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Users className="h-4.5 w-4.5" strokeWidth={1.8} />
                <span>Broadcast to All Students</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBroadcast(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 px-4 border text-sm font-semibold transition cursor-pointer ${
                  !isBroadcast
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <User className="h-4.5 w-4.5" strokeWidth={1.8} />
                <span>Direct to Specific Student</span>
              </button>
            </div>
          </div>

          {/* Recipient Search Selection (Only if Direct notification) */}
          {!isBroadcast && (
            <div className="space-y-3 animate-fade-in-up">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Recipient Students
              </label>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-3 border border-border bg-secondary/10 p-3 rounded-lg max-h-36 overflow-y-auto">
                  {selectedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 pl-2 pr-3 py-1.5 text-xs transition-all duration-200"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground capitalize">
                        {u.name
                          ? u.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                          : 'U'}
                      </div>
                      <div className="max-w-[150px] truncate leading-tight">
                        <span className="font-semibold text-foreground capitalize block truncate">{u.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers((prev) => prev.filter((item) => item.id !== u.id))}
                        className="p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition cursor-pointer"
                        title="Remove student"
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Selector */}
              <div className="relative">
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.8}
                  />
                  <input
                    type="text"
                    className="h-11 w-full rounded-lg border border-border bg-secondary/30 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Type name or email to search and add student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Dropdown Results */}
                {searchQuery.trim() && (
                  <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none">
                    {loadingUsers && (
                      <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                        Searching...
                      </div>
                    )}
                    {!loadingUsers && users.length === 0 && (
                      <p className="p-4 text-center text-xs text-muted-foreground">
                        No student found
                      </p>
                    )}
                    {!loadingUsers &&
                      users.map((u) => {
                        const isAlreadySelected = selectedUsers.some((item) => item.id === u.id)
                        return (
                          <button
                            key={u.id}
                            type="button"
                            disabled={isAlreadySelected}
                            onClick={() => {
                              setSelectedUsers((prev) => [...prev, u])
                              setSearchQuery('')
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors ${
                              isAlreadySelected ? 'opacity-40 cursor-not-allowed bg-secondary/20' : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary capitalize">
                              {u.name ? u.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate capitalize">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                            {isAlreadySelected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Added</span>
                            )}
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <label
              htmlFor="notif-title"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Notification Title
            </label>
            <input
              id="notif-title"
              type="text"
              className="h-11 w-full rounded-lg border border-border bg-secondary/30 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Lab Timing Update, Mid-term Evaluation Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Body Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="notif-body"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Message Description
            </label>
            <textarea
              id="notif-body"
              rows={5}
              className="w-full rounded-lg border border-border bg-secondary/30 p-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Write the details of the notification or broadcast announcement here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={sending}
              variant="primary"
              className="gap-2 rounded-lg py-3 px-6 text-sm font-bold uppercase tracking-wider text-white"
            >
              {sending ? (
                <>
                  <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Sending Announcement...</span>
                </>
              ) : (
                <>
                  <Send className="h-4.5 w-4.5" strokeWidth={1.8} />
                  <span>Send Notification</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotificationsManagementView
