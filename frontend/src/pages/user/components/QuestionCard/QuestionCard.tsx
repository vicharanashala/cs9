import type { FC } from 'react'
import { ChevronUp, MessageCircle, Reply, CheckCircle, Clock, Flag } from 'lucide-react'
import { STATUS_CONFIG } from '../../constants'
import { notifyError } from '../../../../lib/notify'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuestionTag {
  label: string
  type: 'dark'
}

export interface NormalizedQuestion {
  id: string
  upvotes: number
  hasUpvoted: boolean
  author: 'self' | 'other'
  authorName: string
  timestamp: number
  tags: QuestionTag[]
  meta: string
  title: string
  desc: string
  comments: number
  status: 'Active' | 'In Progress' | 'Resolved' | 'Closed'
}

interface QuestionCardProps {
  query: NormalizedQuestion
  onUpvote: (id: string) => void
  onClick?: (id: string) => void
}

// ─── Component ─────────────────────────────────────────────────────────────

const QuestionCard: FC<QuestionCardProps> = ({ query, onUpvote, onClick }) => {
  const { color: statusColor } = STATUS_CONFIG[query.status] ?? STATUS_CONFIG.Active
  const StatusIcon =
    query.status === 'Active' ? CheckCircle
    : query.status === 'In Progress' ? Clock
    : CheckCircle
  const isResolved = query.status === 'Resolved'

  return (
    <div className={`mb-4 flex rounded-xl border bg-card p-5 shadow-sm cursor-pointer hover-card transition-all duration-300 animate-fade-in-up ${
      query.status === 'Resolved' ? 'border-border/60 opacity-90' : 'border-border'
    }`}>
      {/* Upvote */}
      <button
        type="button"
        onClick={() => onUpvote(query.id)}
        className={`mr-5 flex h-[62px] min-w-[62px] flex-col items-center justify-center rounded-lg text-sm font-extrabold transition-all duration-200 border border-transparent active:scale-95 cursor-pointer ${
          query.hasUpvoted
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-secondary hover:bg-secondary/70 text-foreground border-border hover:border-primary/30'
        }`}
      >
        <ChevronUp
          className={`h-5 w-5 transition-transform duration-200 ${query.hasUpvoted ? 'translate-y-[-1px]' : 'group-hover:-translate-y-0.5'}`}
          strokeWidth={2.5}
        />
        <span>{query.upvotes}</span>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-3.5 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {query.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-secondary border border-border px-3 py-0.5 text-[11px] font-bold capitalize text-foreground/90 shadow-sm"
              >
                {tag.label}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground font-bold">{query.authorName}</span> · {query.meta}
          </span>
        </div>

        <h3 className="font-display mb-2 text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug" onClick={() => onClick?.(query.id)}>{query.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: query.desc }} />

        <div className="flex items-center gap-5 text-sm font-bold text-muted-foreground">
          {/* Comments count — display only */}
          <span className="flex items-center gap-1.5 text-muted-foreground/90">
            <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
            {query.comments} {query.comments === 1 ? 'comment' : 'comments'}
          </span>

          {/* Reply / View — opens the replies view */}
          <button
            type="button"
            className="flex items-center gap-1.5 transition hover:text-primary active:scale-95 cursor-pointer"
            onClick={() => onClick?.(query.id)}
          >
            <Reply className="h-4 w-4" strokeWidth={1.8} />
            {isResolved ? 'View' : 'Reply'}
          </button>

          {/* Report — not yet supported */}
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] transition hover:text-red-500 active:scale-95 cursor-pointer"
            onClick={() => notifyError("Report isn't supported yet.")}
          >
            <Flag className="h-3.5 w-3.5" strokeWidth={1.8} />
            Report
          </button>

          <span className="flex items-center gap-1.5 ml-auto text-xs font-extrabold uppercase tracking-wider bg-secondary/80 border border-border/40 px-2.5 py-0.5 rounded-full" style={{ color: statusColor }}>
            <StatusIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {query.status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
