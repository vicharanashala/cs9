import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Camera, Save, Lock, Mail, User, Shield, Loader } from 'lucide-react'
import useAuthStore from '../../../../store/useAuthStore'
import { fetchProfile, updateProfile, changePassword } from '../../service'
import { notifySuccess, notifyError } from '../../../../lib/notify'
import Button from '../../../../components/Button/Button'

function ProfileSettingsPage() {
  const { user, initials } = useOutletContext()
  const setUser = useAuthStore(s => s.setUser)

  const [name, setName]                       = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)

  const email = user?.email || ''

  // ── Load profile from /profile ──────────────────────────────────────────
  useEffect(() => {
    fetchProfile()
      .then(p => setName(p.displayName || user?.name || ''))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!name.trim()) {
      notifyError('Name cannot be empty.')
      return
    }
    const wantsPasswordChange = currentPassword || newPassword
    if (wantsPasswordChange && (!currentPassword || !newPassword)) {
      notifyError('Enter both your current and new password.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ displayName: name.trim() })
      const fresh = await fetchProfile()
      const current = useAuthStore.getState().user
      setUser({ ...current, name: fresh.displayName || current?.name || name })

      if (wantsPasswordChange) {
        await changePassword(currentPassword, newPassword)
        setCurrentPassword('')
        setNewPassword('')
      }

      notifySuccess(
        wantsPasswordChange
          ? 'Profile and password updated successfully.'
          : 'Profile updated successfully.',
      )
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-border bg-secondary/30 pl-10 pr-3 text-sm text-foreground outline-none transition duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20'

  return (
    <div className="mx-auto w-full max-w-[800px] px-8 py-8 text-foreground animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-foreground">Profile Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences, security, and personal information.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center">
            <Loader className="h-5 w-5 animate-spin text-primary" /> Loading profile…
          </div>
        ) : (
          <>
            {/* Photo section */}
            <div className="mb-8 flex items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-md">
                  {initials}
                </div>
                <button
                  type="button"
                  title="Upload new photo"
                  onClick={() => notifyError('Photo upload is not supported.')}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition hover:scale-110 hover:bg-primary hover:text-primary-foreground focus:outline-none"
                >
                  <Camera className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
              <div>
                  <h3 className="text-base font-semibold text-foreground">Profile Photo</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update your dashboard avatar. Recommended size: 256×256px.
                  </p>
              </div>
            </div>

            {/* Name + email */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-2 text-xs font-semibold text-foreground/80">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 flex items-center justify-between text-xs font-semibold text-foreground/80">
                  Email Address
                  <span className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-500 dark:text-red-400">
                    READ-ONLY
                  </span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <input
                    type="email"
                    value={email}
                    disabled
                      className="h-11 w-full cursor-not-allowed rounded-lg border border-border bg-muted/40 pl-10 pr-3 text-sm text-muted-foreground"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground/60">
                  Your email is tied to your institutional ID and cannot be changed.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-border/60" />

            {/* Password & Security */}
            <div className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
              <Shield className="h-[18px] w-[18px] text-primary" strokeWidth={1.8} />
              Password &amp; Security
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-2 text-xs font-semibold text-foreground/80">Current Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-xs font-semibold text-foreground/80">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="gap-2 px-6 py-2.5"
              >
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={1.8} />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileSettingsPage
