import { useState } from 'react'
import { CornerDownRight, MessageSquare } from 'lucide-react'

function initialsOf(name = '') {
  return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
}

/**
 * Threaded comments under a single answer.
 *  - comments: all Comment docs for this answer (depth 0 = top-level, depth 1 = reply)
 *  - onSubmit(answerId, body, parentId)
 *
 * NOTE: render helpers below are plain functions returning JSX (not nested
 * components) so the reply <textarea> keeps focus across keystrokes.
 */
function AnswerComments({ answerId, comments = [], currentUserId, locked = false, onSubmit }) {
  const [replyTo, setReplyTo] = useState(null)   // parentId being replied to, or 'root'
  const [value, setValue]     = useState('')
  const [busy, setBusy]       = useState(false)

  const topLevel = comments.filter(c => !c.parent_id)
  const repliesOf = id => comments.filter(c => c.parent_id === id)

  // Nothing to show: resolved question with no existing comments on this answer
  if (locked && comments.length === 0) return null

  function openReply(parentKey) {
    setReplyTo(parentKey)
    setValue('')
  }

  async function submit(parentId) {
    if (!value.trim()) return
    setBusy(true)
    try {
      await onSubmit(answerId, value.trim(), parentId)
      setValue('')
      setReplyTo(null)
    } finally {
      setBusy(false)
    }
  }

  const replyBox = (parentId) => (
    <div className="mt-3.5 flex items-start gap-3">
      <textarea
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Write a reply…"
        className="min-h-[48px] w-full resize-y rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => submit(parentId)}
          disabled={busy}
          className="rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm transition hover:bg-primary/95 disabled:opacity-60 active:scale-95 cursor-pointer"
        >
          {busy ? '…' : 'Reply'}
        </button>
        <button
          type="button"
          onClick={() => setReplyTo(null)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  const commentRow = (c, isReply) => {
    const isSelf = c.author_id === currentUserId
    const state = c.moderation_state || 'visible'
    const hidden = state !== 'visible'
    const tombstone = state === 'deleted'
      ? `This comment from ${c.author_name} was deleted.`
      : `This comment from ${c.author_name} is under review.`

    return (
      <div className={`flex gap-3 ${isReply ? 'ml-8' : ''}`}>
        <div className={`mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full text-xs font-bold border border-border/40 shadow-sm ${
          hidden ? 'bg-muted text-muted-foreground' : 'bg-secondary text-foreground'
        }`}>
          {initialsOf(c.author_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-foreground">
              {c.author_name}{isSelf && ' (You)'}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">{fmtDate(c.created_at)}</span>
          </div>
          {hidden ? (
            <p className="text-sm italic leading-relaxed text-muted-foreground mt-1">{tombstone}</p>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90 mt-1" dangerouslySetInnerHTML={{ __html: c.body }} />
          )}
          {/* Only visible top-level comments can receive a (one-level) reply */}
          {!isReply && !hidden && !locked && (
            <button
              type="button"
              onClick={() => openReply(c.comment_id)}
              className="mt-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 transition hover:text-primary active:scale-95 cursor-pointer"
            >
              <CornerDownRight className="h-3.5 w-3.5" strokeWidth={2} /> Reply
            </button>
          )}
          {replyTo === c.comment_id && replyBox(c.comment_id)}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-card/45 px-5 py-4.5 rounded-b-xl">
      {topLevel.length > 0 && (
        <div className="mb-4 flex flex-col gap-4">
          {topLevel.map(c => (
            <div key={c.comment_id} className="flex flex-col gap-4">
              {commentRow(c, false)}
              {repliesOf(c.comment_id).map(r => (
                <div key={r.comment_id}>{commentRow(r, true)}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add a comment to the answer — hidden once the question is resolved */}
      {!locked && (
        replyTo === 'root' ? (
          replyBox(null)
        ) : (
          <button
            type="button"
            onClick={() => openReply('root')}
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground/80 transition hover:text-primary active:scale-95 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
            {topLevel.length > 0 ? 'ADD COMMENT' : 'COMMENT'}
          </button>
        )
      )}
    </div>
  )
}

export default AnswerComments
