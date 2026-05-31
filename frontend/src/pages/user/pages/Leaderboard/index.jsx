import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Trophy, Loader } from 'lucide-react'
import { fetchLeaderboard } from '../../service'

const TABS = [
  { key: 'spark',          label: 'Spark Points',     unit: 'pts' },
  { key: 'reputation',     label: 'Reputation',       unit: 'rep' },
  { key: 'acceptedAnswers', label: 'Accepted Answers', unit: 'answers' },
]

const MEDAL = {
  0: { ring: 'border-amber-500 shadow-amber-500/20', badge: 'bg-amber-500 text-white', size: 'h-22 w-22 text-[26px]' },
  1: { ring: 'border-slate-400 shadow-slate-400/20', badge: 'bg-slate-400 text-white', size: 'h-18 w-18 text-[20px]' },
  2: { ring: 'border-amber-700 shadow-amber-700/20', badge: 'bg-amber-700 text-white', size: 'h-18 w-18 text-[20px]' },
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function LeaderboardPage() {
  const { user } = useOutletContext()
  const [type, setType]       = useState('spark')
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await fetchLeaderboard({ type, limit: 20 }))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { load() }, [load])

  const unit = TABS.find(t => t.key === type)?.unit || 'pts'
  const podium = rows.slice(0, 3)
  const rest = rows.slice(3)
  // podium display order: 2nd, 1st, 3rd
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-[900px] px-8 py-8 text-foreground animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display flex items-center gap-2.5 text-xl font-bold text-foreground">
          <Trophy className="h-6 w-6 text-primary" strokeWidth={1.8} /> Leaderboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top contributors across the internship community.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex gap-7 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`mb-[-1px] pb-3.5 text-sm font-semibold transition focus:outline-none ${
              type === t.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted-foreground bg-card rounded-xl border border-border">
          <Loader className="h-5 w-5 animate-spin text-primary" /> Loading leaderboard…
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground bg-card rounded-xl border border-border">
          No ranked contributors yet.
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="mb-12 flex items-end justify-center gap-8 md:gap-14 pt-4">
            {podiumOrder.map(entry => {
              const rank = rows.indexOf(entry)
              const m = MEDAL[rank]
              const isSelf = entry.userId === user?.userId
              return (
                <div key={entry.userId} className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="relative">
                    <div className={`flex items-center justify-center rounded-full border-[3px] bg-secondary font-bold text-foreground shadow-lg transition-transform duration-300 hover:scale-105 ${m.ring} ${m.size}`}>
                      {initialsOf(entry.displayName)}
                    </div>
                    <div className={`absolute -bottom-2.5 left-1/2 flex h-6.5 w-6.5 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold shadow-sm ${m.badge}`}>
                      {rank + 1}
                    </div>
                  </div>
                  <p className={`mt-5 max-w-[130px] truncate text-center text-sm font-semibold ${isSelf ? 'text-primary' : 'text-foreground'}`}>
                    {isSelf ? 'You' : entry.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.score} {unit}</p>
                </div>
              )
            })}
          </div>

          {/* Ranked list (4th onward) */}
          {rest.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {rest.map((entry, i) => {
                const rank = i + 4
                const isSelf = entry.userId === user?.userId
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 border-b border-border/50 px-6 py-4 last:border-b-0 transition-colors ${
                      isSelf ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-secondary/40'
                    }`}
                  >
                    <span className="w-6 text-sm font-semibold text-muted-foreground">{rank}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground border border-border/40">
                      {initialsOf(entry.displayName)}
                    </div>
                    <span className={`flex-1 text-sm font-semibold ${isSelf ? 'text-primary' : 'text-foreground'}`}>
                      {isSelf ? 'You' : entry.displayName}
                    </span>
                    <span className="text-sm font-bold text-foreground">{entry.score}</span>
                    <span className="w-14 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{unit}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LeaderboardPage
