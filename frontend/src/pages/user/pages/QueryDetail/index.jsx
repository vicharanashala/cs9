import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, Check, CheckCircle, RotateCcw, ChevronUp, ChevronDown,
  AlertTriangle, MessageCircle, Loader,
} from 'lucide-react'
import ReportModal from '../../components/ReportModal/ReportModal'
import AnswerComments from '../../components/AnswerComments/AnswerComments'
import Button from '../../../../components/Button/Button'
import {
  fetchQuestionDetail, fetchQuestions, postAnswer, voteAnswer, reportContent, postComment,
  resolveQuestion, acceptAnswer,
} from '../../service'
import { notifySuccess, notifyError } from '../../../../lib/notify'

const STATUS_LABEL = {
  unanswered: 'Active',
  answered: 'In Progress',
  closed: 'Resolved',
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
}

function QueryDetailPage() {
  const { queryId } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()

  const [data, setData]         = useState(null)   // { question, answers, comments }
  const [loading, setLoading]   = useState(true)
  const [reply, setReply]       = useState('')
  const [posting, setPosting]   = useState(false)
  const [reportTarget, setReportTarget] = useState(null) // { type, id }
  const [reporting, setReporting] = useState(false)
  const [related, setRelated]   = useState([])     // latest queries sharing tags

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchQuestionDetail(queryId))
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [queryId])

  useEffect(() => { load() }, [load])

  // ── Related recent queries sharing the same tags ────────────────────────────
  const tags = data?.question?.tags || []
  const tagKey = tags.join(',')
  useEffect(() => {
    if (!tagKey) { setRelated([]); return }
    fetchQuestions({ tag: tagKey, sort: 'latest', limit: 6 })
      .then(res => setRelated(
        (res.questions || [])
          .filter(q => q.question_id !== queryId)
          .slice(0, 5),
      ))
      .catch(() => setRelated([]))
  }, [tagKey, queryId])

  async function handleVote(answerId, vote) {
    try {
      await voteAnswer(answerId, vote)
      await load()
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not register your vote.')
    }
  }

  async function handleComment(answerId, body, parentId) {
    try {
      await postComment(answerId, body, parentId)
      await load()
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not post comment.')
    }
  }

  async function handleResolveToggle(resolved) {
    try {
      await resolveQuestion(queryId, resolved)
      notifySuccess(resolved ? 'Question marked as solved.' : 'Question reopened.')
      await load()
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not update the question.')
    }
  }

  async function handleAcceptAnswer(answerId) {
    try {
      await acceptAnswer(queryId, answerId)
      notifySuccess('Marked as the resolution. Question resolved.')
      await load()
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not mark resolution.')
    }
  }

  async function handlePostReply() {
    if (!reply.trim()) {
      notifyError('Write something before posting.')
      return
    }
    if (reply.trim().length < 15) {
      notifyError('Your reply must be at least 15 characters.')
      return
    }
    setPosting(true)
    try {
      await postAnswer(queryId, reply.trim())
      setReply('')
      notifySuccess('Your reply has been posted.')
      await load()
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not post your reply.')
    } finally {
      setPosting(false)
    }
  }

  async function handleReportSubmit({ reason, description }) {
    if (!reason) {
      notifyError('Please select a reason for reporting.')
      return
    }
    setReporting(true)
    try {
      await reportContent({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reason,
        description,
      })
      notifySuccess('Report submitted. Thank you.')
      setReportTarget(null)
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not submit report.')
    } finally {
      setReporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-16 text-sm text-muted-foreground bg-background animate-fade-in-up">
        <Loader className="mr-2.5 h-5 w-5 animate-spin text-primary" /> Loading thread details…
      </div>
    )
  }

  if (!data?.question) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-foreground bg-background animate-fade-in-up">
        <p className="text-sm text-muted-foreground">This query could not be found.</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Back to dashboard
        </button>
      </div>
    )
  }

  const { question, answers, comments = [] } = data
  const statusLabel = STATUS_LABEL[question.status] || 'Active'
  const isResolved = statusLabel === 'Resolved'
  const isOwner = question.author_id === user?.userId
  const hasAcceptedAnswer = answers.some(a => a.is_accepted)

  // Group comments by their parent answer
  const commentsByAnswer = {}
  for (const c of comments) {
    (commentsByAnswer[c.answer_id] ||= []).push(c)
  }

  const steps = [
    { label: 'Submitted', meta: fmtDate(question.created_at), done: true },
    { label: 'In Discussion', meta: `${answers.length} ${answers.length === 1 ? 'reply' : 'replies'}`, done: answers.length > 0 },
    { label: 'Resolved', meta: isResolved ? `Closed ${fmtDate(question.updated_at)}` : 'Pending', done: isResolved, green: true },
  ]

  return (
    <div className="relative mx-auto w-full max-w-[1100px] px-8 py-8 text-foreground animate-fade-in-up">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground focus:outline-none"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex items-start justify-between gap-6">
              <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {question.title}
              </h1>
              {/* Owner: mark solved / reopen */}
              {isOwner && (
                isResolved ? (
                  <Button
                    variant="secondary"
                    className="shrink-0 gap-2 text-xs py-1.5"
                    onClick={() => handleResolveToggle(false)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} /> Reopen
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="shrink-0 gap-2 border-primary/40 text-xs text-primary hover:border-primary hover:bg-primary/5 py-1.5"
                    onClick={() => handleResolveToggle(true)}
                  >
                    <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.8} /> Mark as Solved
                  </Button>
                )
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                isResolved ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} /> {statusLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <strong className="font-semibold text-foreground">{question.author_name}</strong>
                opened this on {fmtDate(question.created_at)}
              </span>
            </div>
          </div>

          {/* Thread */}
          <div className="relative pl-[54px] sm:pl-[60px]">
            <div className="absolute bottom-0 left-6 top-6 w-px bg-border" aria-hidden="true" />

            {/* Original post */}
            <ThreadItem
              authorName={question.author_name}
              isSelf={question.author_id === user?.userId}
              date={fmtDate(question.created_at)}
              body={question.body}
              isOriginal
            />

            {/* Answers Divider */}
            {answers.length > 0 && (
              <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {answers.length} {answers.length === 1 ? 'Reply' : 'Replies'}
                </span>
              </div>
            )}

            {answers.length === 0 && (
              <div className="mb-8 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground animate-pulse">
                No replies yet — be the first to respond.
              </div>
            )}

            {answers.map(ans => {
              const moderationState = ans.moderation_state || 'visible'
              const hidden = moderationState !== 'visible'
              return (
                <ThreadItem
                  key={ans.answer_id}
                  authorName={ans.author_name}
                  isSelf={ans.author_id === user?.userId}
                  date={fmtDate(ans.created_at)}
                  body={ans.body}
                  moderationState={moderationState}
                  accepted={ans.is_accepted}
                  score={(ans.upvotes ?? 0) - (ans.downvotes ?? 0)}
                  myVote={ans.my_vote ?? 0}
                  canAccept={isOwner && !hasAcceptedAnswer && !hidden && ans.author_id !== user?.userId}
                  onAccept={() => handleAcceptAnswer(ans.answer_id)}
                  onVoteUp={() => handleVote(ans.answer_id, 'up')}
                  onVoteDown={() => handleVote(ans.answer_id, 'down')}
                  onReport={() => setReportTarget({ type: 'answer', id: ans.answer_id })}
                >
                  {!hidden && (
                    <AnswerComments
                      answerId={ans.answer_id}
                      comments={commentsByAnswer[ans.answer_id] || []}
                      currentUserId={user?.userId}
                      locked={isResolved}
                      onSubmit={handleComment}
                    />
                  )}
                </ThreadItem>
              )
            })}

            {/* Reply box — closed once the question is resolved */}
            {isResolved ? (
              <div className="relative mt-8">
                <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-5 py-4 text-center text-sm text-muted-foreground font-semibold">
                  This question is resolved — new replies are closed.
                </div>
              </div>
            ) : (
              <div className="relative mt-8">
                <div className="absolute -left-[54px] sm:-left-[60px] top-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-foreground border border-border ring-4 ring-background">
                  {initialsOf(user?.name)}
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Drop your resolution, comment, or suggestions here…"
                    className="min-h-[100px] w-full resize-y text-sm leading-relaxed text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                  <div className="mt-2 flex justify-end border-t border-border/40 pt-4">
                    <Button
                      type="button"
                      onClick={handlePostReply}
                      disabled={posting}
                      className="px-6"
                    >
                      {posting ? 'Posting…' : 'Submit Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Side column ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
          {/* Tags */}
          {(question.tags || []).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {question.tags.map(t => (
                  <span
                    key={t}
                    className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold capitalize text-primary shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Query Status */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Query Status</h4>
            <div className="relative pl-5">
              <div className="absolute bottom-2.5 left-2.5 top-2.5 w-px bg-border" />
              {steps.map((s, i) => (
                <div key={i} className={`relative ${i < steps.length - 1 ? 'mb-6' : ''}`}>
                  <div
                    className={`absolute -left-5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ${
                      s.done ? (s.green ? 'bg-green-600' : 'bg-primary') : 'bg-muted-foreground/35'
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <div className="pl-3.5">
                    <h5 className={`text-sm font-semibold ${s.green && s.done ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>{s.label}</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Recent Queries */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Related Queries</h4>
            {related.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">No related queries found.</p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {related.map(q => (
                  <li key={q.question_id} className="overflow-hidden">
                    <button
                      type="button"
                      title={q.title}
                      onClick={() => navigate(`/query/${q.question_id}`)}
                      className="flex w-full items-start gap-2.5 text-left text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground/60 mt-0.5" strokeWidth={1.8} />
                      <span className="truncate text-sm font-semibold text-foreground">{q.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        open={!!reportTarget}
        submitting={reporting}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportSubmit}
      />
    </div>
  )
}

// ── Thread item (OP or answer) ──────────────────────────────────────────────
function ThreadItem({
  authorName, isSelf, date, body, isOriginal, accepted, score, myVote = 0,
  moderationState = 'visible', canAccept = false, onAccept, onVoteUp, onVoteDown, onReport, children,
}) {
  const initials = initialsOf(authorName)
  const hidden = moderationState !== 'visible'
  const tombstone = moderationState === 'deleted'
    ? `This reply from ${authorName} was deleted.`
    : `This reply from ${authorName} is under review.`

  return (
    <div className="relative mb-8">
      {/* Avatar bubble */}
      <div className={`absolute -left-[54px] sm:-left-[60px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-sm font-semibold border border-border/40 ring-4 ring-background shadow-sm ${
        hidden ? 'bg-muted text-muted-foreground' : 'bg-secondary text-foreground'
      }`}>
        {initials}
      </div>

      <div className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 ${
        hidden ? 'border-dashed border-border' : 'border-border'
      } ${accepted ? 'ring-1 ring-green-500/30 border-green-500/40' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-secondary/15 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">
              {authorName}{isSelf && ' (You)'}
            </span>
            <span className="text-xs text-muted-foreground">
              {isOriginal ? 'opened this' : 'commented'} {date}
            </span>
          </div>
          {accepted && !hidden && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
              <Check className="h-3 w-3" strokeWidth={3} /> SOLUTION
            </span>
          )}
          {hidden && (
            <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${
              moderationState === 'deleted' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
            }`}>
              <AlertTriangle className="h-3 w-3" strokeWidth={1.8} />
              {moderationState === 'deleted' ? 'DELETED' : 'UNDER REVIEW'}
            </span>
          )}
        </div>

        {/* Body — tombstone when hidden */}
        {hidden ? (
          <p className="px-5 py-5 text-sm italic leading-relaxed text-muted-foreground">{tombstone}</p>
        ) : (
          <div
            className="px-5 py-5 text-sm leading-relaxed text-foreground/90 font-normal"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {/* Footer (visible answers only) */}
        {!isOriginal && !hidden && (
          <div className="flex items-center justify-between border-t border-border/50 bg-secondary/25 px-5 py-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
              <button
                type="button"
                onClick={onVoteUp}
                title={myVote === 1 ? 'Remove upvote' : 'Upvote'}
                className={`transition-colors rounded-full hover:bg-secondary p-1 focus:outline-none ${myVote === 1 ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <ChevronUp className="h-4.5 w-4.5" strokeWidth={myVote === 1 ? 3 : 2} />
              </button>
              <span className={`min-w-4 text-center ${myVote === 1 ? 'text-primary' : myVote === -1 ? 'text-red-500' : 'text-muted-foreground'}`}>{score}</span>
              <button
                type="button"
                onClick={onVoteDown}
                title={myVote === -1 ? 'Remove downvote' : 'Downvote'}
                className={`transition-colors rounded-full hover:bg-secondary p-1 focus:outline-none ${myVote === -1 ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              >
                <ChevronDown className="h-4.5 w-4.5" strokeWidth={myVote === -1 ? 3 : 2} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Owner: accept this answer as the resolution */}
              {canAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 transition hover:text-green-700 active:scale-95 focus:outline-none"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> MARK AS RESOLUTION
                </button>
              )}
              {isSelf ? (
                <span className="text-xs italic text-muted-foreground/60">Cannot report own reply</span>
              ) : (
                <button
                  type="button"
                  onClick={onReport}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-red-500 active:scale-95 focus:outline-none"
                >
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} /> REPORT
                </button>
              )}
            </div>
          </div>
        )}

        {/* Comments / replies under this answer */}
        {!isOriginal && children}
      </div>
    </div>
  )
}

export default QueryDetailPage
