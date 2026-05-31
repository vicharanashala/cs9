import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, CheckCircle2, Clock, HelpCircle, ChevronUp } from 'lucide-react'
import QuestionCard from '../../components/QuestionCard/QuestionCard'
import { fetchUserContributions, fetchQuestions, normalizeQuestion } from '../../service'
import { notifyError } from '../../../../lib/notify'
import useAuthStore from '../../../../store/useAuthStore'

// ─── Types ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  question: { icon: HelpCircle,   label: 'Question', bgClass: 'bg-primary/10', textClass: 'text-primary' },
  answer:   { icon: CheckCircle2, label: 'Answer',   bgClass: 'bg-green-500/10', textClass: 'text-green-600 dark:text-green-400' },
  comment:  { icon: MessageSquare, label: 'Comment',  bgClass: 'bg-blue-500/10', textClass: 'text-blue-600 dark:text-blue-400' },
}

// ─── Component ─────────────────────────────────────────────────────────────

function MyContributionsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [contributions, setContributions] = useState([])
  const [normalizedQuestions, setNormalizedQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'questions' | 'answers' | 'comments'
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)

  const tabs = [
    { key: 'all',      label: 'All' },
    { key: 'questions', label: 'Questions' },
    { key: 'answers',  label: 'Answers' },
    { key: 'comments', label: 'Comments' },
  ]

  // Load all contributions on mount
  useEffect(() => {
    if (!user?.userId) return
    setLoading(true)
    fetchUserContributions(user.userId, 50)
      .then(data => setContributions(data.contributions || []))
      .catch(() => notifyError('Could not load your contributions.'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  // When a question-type contribution is clicked, fetch its full detail
  useEffect(() => {
    if (!selectedId) return
    setLoadingDetail(true)
    fetchQuestions({ questionId: selectedId })
      .then(data => {
        const q = Array.isArray(data.questions) ? data.questions[0] : data
        setDetail(q ? normalizeQuestion(q, user?.userId) : null)
      })
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }, [selectedId, user?.userId])

  const filtered = contributions.filter(c => {
    if (activeTab === 'all')       return true
    if (activeTab === 'questions') return c.type === 'question'
    if (activeTab === 'answers')   return c.type === 'answer'
    if (activeTab === 'comments')  return c.type === 'comment'
    return true
  })

  function handleCardClick(id) {
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setSelectedId(null)
    setDetail(null)
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  if (selectedId && detail) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-8 py-6 animate-fade-in-up">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to all contributions
        </button>
        <QuestionCard
          query={detail}
          onUpvote={() => {}}
          onClick={() => {}}
        />
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 animate-fade-in-up">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (contributions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center text-foreground animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <MessageSquare className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-foreground">No contributions yet</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Raise a query or answer a question to see your activity here.
        </p>
        <Button
          type="button"
          onClick={() => navigate('/raise-query')}
          className="px-6"
        >
          Raise a Query
        </Button>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[900px] px-8 py-6 text-foreground animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Contributions</h2>
        <span className="text-xs text-muted-foreground">{contributions.length} total</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-secondary p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {activeTab} to show.
          </p>
        ) : (
          filtered.map(item => {
            const { icon: Icon, label, bgClass, textClass } = TYPE_META[item.type] ?? TYPE_META.question
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-5 transition hover-card"
                onClick={() => item.type === 'question' && handleCardClick(item.id)}
              >
                {/* Type badge */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass} ${textClass}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${bgClass} ${textClass}`}>
                      {label}
                    </span>
                    {item.type === 'answer' && item.isAccepted && (
                      <span className="flex items-center gap-1 rounded bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Accepted
                      </span>
                    )}
                    {item.type === 'question' && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" strokeWidth={1.8} />
                        {new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {item.type === 'question' ? (
                    <h4 className="mb-1 text-base font-semibold text-foreground">{item.title}</h4>
                  ) : null}

                  <p
                    className="line-clamp-2 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.body || '' }}
                  />

                  {/* Footer meta */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {item.score > 0 && (
                      <span className="flex items-center gap-1">
                        <ChevronUp className="h-3 w-3" strokeWidth={2} />
                        {item.score}
                      </span>
                    )}
                    {item.type === 'answer' && item.questionId && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleCardClick(item.questionId) }}
                        className="text-primary hover:text-primary/80 underline-offset-2 transition hover:underline"
                      >
                        View question →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MyContributionsPage
