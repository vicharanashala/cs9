import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Link as LinkIcon } from 'lucide-react'
import QuestionCard from '../../components/QuestionCard/QuestionCard'
import FAQCategories from '../../components/FAQCategories/FAQCategories'

import Button from '../../../../components/Button/Button'
import { fetchQuestions, fetchQuestionTags, fetchUserContributions, voteQuestion, normalizeQuestion } from '../../service'
import { queryClient } from '../../../../lib/queryClient'
import { notifyError } from '../../../../lib/notify'

function DashboardPage() {
  const navigate = useNavigate()
  const {
    user,
    sidebarNav,
    searchModalOpen,
    setSearchModalOpen,
    searchQuery,
    setSearchQuery,
    activeTags,
    setActiveTags,
  } = useOutletContext()

  const [queries, setQueries]                 = useState([])
  const [loadingQueries, setLoadingQueries]   = useState(true)
  const [activeTab, setActiveTab]             = useState('All Queries')
  const [categories, setCategories]           = useState([])   // tags from DB
  const [contributions, setContributions]     = useState([])
  const [loadingContributions, setLoadingContributions] = useState(true)

  function handleCardClick(id) {
    navigate(`/query/${id}`)
  }

  // ── Load contributions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.userId) return
    setLoadingContributions(true)
    fetchUserContributions(user.userId, 3)
      .then(data => setContributions(data.contributions || []))
      .catch(() => setContributions([]))
      .finally(() => setLoadingContributions(false))
  }, [user?.userId])

  // ── Load distinct tags from DB (for category cards) ──────────────────────────
  useEffect(() => {
    fetchQuestionTags()
      .then(tags => setCategories(tags))
      .catch(() => setCategories([]))
  }, [])

  // ── Load questions ─────────────────────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoadingQueries(true)
    try {
      const sort         = activeTab === 'Trending' ? 'trending' : 'latest'
      const status       = activeTab === 'Unanswered' ? 'unanswered'
                         : activeTab === 'Resolved' ? 'resolved'
                         : ''
      const createdAfter = activeTab === 'Recent'
        ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        : ''
      const my = sidebarNav === 'My Queries'

      const data = await fetchQuestions({
        search: searchQuery,
        tag: activeTags.join(','),
        sort, status, createdAfter, my,
      })
      const normalized = (data.questions || []).map(q => normalizeQuestion(q, user?.userId))
      setQueries(normalized)
      // Cache the loaded questions so Similar Queries (Raise Query page) can reuse them
      queryClient.setQueryData(['dashboardQuestions'], normalized)
    } catch {
      setQueries([])
    } finally {
      setLoadingQueries(false)
    }
  }, [activeTab, sidebarNav, searchQuery, activeTags, user?.userId])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // ── Upvote ─────────────────────────────────────────────────────────────────
  async function handleUpvote(id) {
    setQueries(qs =>
      qs.map(q =>
        q.id === id
          ? { ...q, hasUpvoted: !q.hasUpvoted, upvotes: q.hasUpvoted ? q.upvotes - 1 : q.upvotes + 1 }
          : q,
      ),
    )
    try {
      const result = await voteQuestion(id)
      setQueries(qs => qs.map(q => q.id === id ? { ...q, upvotes: result.upvotes, hasUpvoted: result.hasVoted } : q))
    } catch (err) {
      // Roll back the optimistic update and surface the reason
      setQueries(qs =>
        qs.map(q =>
          q.id === id
            ? { ...q, hasUpvoted: !q.hasUpvoted, upvotes: q.hasUpvoted ? q.upvotes - 1 : q.upvotes + 1 }
            : q,
        ),
      )
      notifyError(err.response?.data?.message || 'Could not register your vote.')
    }
  }



  // ── Filtered + counts ────────────────────────────────────────────────────────
  const filtered = queries.filter(q => {
    if (activeTab === 'Resolved'    && q.status !== 'Resolved')                      return false
    if (activeTab === 'Unanswered'  && !['Active', 'In Progress'].includes(q.status)) return false
    return true
  })

  const tabCounts = {
    'All Queries': queries.length,
    'Trending':   queries.filter(q => q.upvotes > 0).length,
    'Recent':      queries.length,
    'Unanswered':  queries.filter(q => ['Active', 'In Progress'].includes(q.status)).length,
    'Resolved':    queries.filter(q => q.status === 'Resolved').length,
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto w-full text-foreground transition-all duration-300">
        {/* ── Left column ────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {sidebarNav === 'My Queries' && (
            <h2 className="font-display mb-6 text-[22px] font-bold text-foreground">My Queries</h2>
          )}

          {/* Tabs — hidden in My Queries */}
          {sidebarNav !== 'My Queries' && (
            <div className="mb-6 flex items-center border-b border-border pb-4 overflow-x-auto">
              <div className="flex gap-7 shrink-0">
                {['All Queries', 'Trending', 'Recent', 'Unanswered', 'Resolved'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`mb-[-17px] flex items-center gap-2 pb-4 text-sm font-bold transition-all duration-250 focus:outline-none cursor-pointer hover:text-foreground ${
                      activeTab === tab
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {tab}
                    {tabCounts[tab] > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold transition-all ${
                        activeTab === tab ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {tabCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loadingQueries && (
            <div className="flex items-center gap-2.5 py-12 text-sm text-muted-foreground justify-center bg-card rounded-xl border border-border">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
              Searching queries…
            </div>
          )}

          {/* Empty */}
          {!loadingQueries && filtered.length === 0 && (
            <p className="mt-5 text-sm text-muted-foreground bg-card rounded-xl border border-border p-8 text-center shadow-sm">
              {searchQuery || activeTags.length > 0
                ? `No results found${searchQuery ? ` for "${searchQuery}"` : ''}${activeTags.length ? ` in ${activeTags.join(', ')}` : ''}`
                : 'No queries yet. Ask your first question!'}
            </p>
          )}

          {/* Cards */}
          {!loadingQueries && (
            <div className="space-y-4">
              {filtered.map(query => (
                <QuestionCard key={query.id} query={query} onUpvote={handleUpvote} onClick={() => handleCardClick(query.id)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row lg:flex-col w-full lg:w-[300px] shrink-0 gap-6">

          {/* Top FAQ Categories */}
          <div className="w-full sm:flex-1 lg:flex-none">
            <FAQCategories
              categories={categories}
              selected={activeTags}
              onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              onClear={() => setActiveTags([])}
            />
          </div>

          {/* Your Contribution */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm w-full sm:flex-1 lg:flex-none animate-fade-in-up">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-md bg-primary p-1.5 text-primary-foreground shadow-sm">
                <LinkIcon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <span className="font-display text-base font-bold text-foreground">Your Contribution</span>
            </div>

            {loadingContributions ? (
              <div className="flex items-center gap-2.5 py-4 text-sm text-muted-foreground">
                <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-border border-t-primary" />
                Loading…
              </div>
            ) : contributions.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground text-center">No contributions yet.</p>
            ) : (
              <>
                <div className="relative pl-5">
                  <div className="absolute bottom-2.5 left-1 top-2.5 w-px bg-border" />
                  {[...contributions].reverse().map((item, i) => {
                    const color =
                      item.type === 'question' ? '#b89047'
                      : item.type === 'answer'  ? '#16a34a'
                      : '#3b82f6'
                    const label =
                      item.type === 'question' ? `Asked: ${item.title}`
                      : item.type === 'answer'  ? `Answered: ${item.body || '…'}`
                      : `Commented: ${item.body || '…'}`
                    return (
                      <div
                        key={i}
                        className="relative mb-4 cursor-pointer transition hover:opacity-75"
                        onClick={() => item.questionId && handleCardClick(item.questionId)}
                      >
                        <div
                          className="absolute -left-5 top-1.5 h-2 w-2 rounded-full shadow-sm"
                          style={{ background: color }}
                        />
                        <h5
                          className="text-sm font-bold text-foreground leading-normal"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={label}
                        >
                          {label}
                        </h5>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {new Date(item.time).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }).toUpperCase()}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <Button
                  variant="secondary"
                  className="mt-2 w-full text-xs font-bold py-2.5"
                  onClick={() => navigate('/profile')}
                >
                  See all contributions
                </Button>
              </>
            )}
          </div>
        </div>
      </div>


    </>
  )
}

export default DashboardPage
