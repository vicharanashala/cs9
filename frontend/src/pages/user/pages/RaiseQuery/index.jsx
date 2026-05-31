import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field, Label, Textarea, Switch } from '@headlessui/react'
import { CheckCircle2, Lightbulb, EyeOff, Image as ImageIcon, ExternalLink, Sparkles, Send } from 'lucide-react'
import Button from '../../../../components/Button/Button'
import Input from '../../../../components/Input/Input'
import Select from '../../../../components/Select/Select'
import { createQuestion, fetchQuestionTags } from '../../service'
import { queryClient } from '../../../../lib/queryClient'
import { notifyError } from '../../../../lib/notify'

const STATUS_BADGE = {
  Resolved:      'bg-green-500/10 text-green-500 border border-green-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  Active:        'bg-primary/10 text-primary border border-primary/20',
}

function stripHtml(s = '') {
  return s.replace(/<[^>]*>/g, '').trim()
}

function RaiseQueryPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([]) // { value, label }
  const [category, setCategory]     = useState('')
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  // Similar queries come from the cached dashboard questions
  const cachedQuestions = queryClient.getQueryData(['dashboardQuestions']) || []
  const pool = category
    ? cachedQuestions.filter(q => q.tags?.some(t => t.label.toLowerCase() === category.toLowerCase()))
    : cachedQuestions
  const similar = (pool.length ? pool : cachedQuestions).slice(0, 3)

  // Category options come from the DB tags
  useEffect(() => {
    fetchQuestionTags()
      .then(tags =>
        setCategories(
          (tags || []).map(t => ({
            value: t.tag,
            label: t.tag.charAt(0).toUpperCase() + t.tag.slice(1),
          })),
        ),
      )
      .catch(() => setCategories([]))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!category)                return notifyError('Please choose a category.')
    if (title.trim().length < 10) return notifyError('Title must be at least 10 characters.')
    if (!description.trim())      return notifyError('Please add a description.')

    setSubmitting(true)
    try {
      await createQuestion({ title: title.trim(), body: description.trim(), tags: [category], isAnonymous: anonymous })
      setSubmitted(true)
      setTimeout(() => navigate('/dashboard'), 2500)
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not submit your query.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 py-16 text-foreground">
        <div className="flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-12 text-center shadow-lg animate-fade-in-up">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500 shadow-inner">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h2 className="font-display mb-2 text-xl font-bold text-foreground">Thank you!</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We have noted your concern and will look into it.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/60">Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-8 text-foreground animate-fade-in-up">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Form card ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Field className="flex flex-col">
            <Label className="mb-2 text-sm font-semibold text-foreground">Query Category</Label>
            <Select
              options={categories}
              value={category}
              onChange={setCategory}
              placeholder="Select category…"
            />
          </Field>

          <Field className="flex flex-col">
            <Label className="mb-2 text-sm font-semibold text-foreground">Query Title</Label>
            <Input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Briefly state your concern (e.g., Delay in Grade Upload)"
            />
          </Field>

          <Field className="flex flex-col">
            <Label className="mb-2 text-sm font-semibold text-foreground">Detailed Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Provide as much detail as possible to help us resolve this quickly…"
              className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          {/* Attachments (not supported yet) */}
          <Field className="flex flex-col">
            <Label className="mb-2 text-sm font-semibold text-foreground">Attachments (Optional)</Label>
            <button
              type="button"
              onClick={() => notifyError('Attachments are not supported yet.')}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/20 px-4 py-10 text-center transition hover:border-primary hover:bg-primary/5 active:scale-[0.99]"
            >
              <ImageIcon className="h-7 w-7 text-muted-foreground" strokeWidth={1.6} />
              <span className="text-sm font-semibold text-foreground">Click or drag and drop files here</span>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
            </button>
          </Field>

          {/* Raise anonymously */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 border border-border/40 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-primary" strokeWidth={1.8} />
                <span className="text-sm font-semibold text-foreground">Raise Anonymously</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Admins won't see your profile details, but resolution may take longer.
              </p>
            </div>
            <Switch
              checked={anonymous}
              onChange={setAnonymous}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 border-2 border-transparent ${
                anonymous ? 'bg-primary' : 'bg-muted-foreground/35'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  anonymous ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </Switch>
          </div>

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-end gap-5">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground active:scale-95"
            >
              Discard Draft
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 px-6"
            >
              <Send className="h-4 w-4" strokeWidth={1.8} />
              {submitting ? 'Submitting…' : 'Submit Query'}
            </Button>
          </div>
        </form>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Similar Queries */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.8} /> Similar Queries
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              We found some queries similar to yours. Checking these might give you an instant answer.
            </p>

            {similar.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No similar queries yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {similar.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigate(`/query/${q.id}`)}
                    className="rounded-xl border border-border bg-secondary/35 p-4 text-left transition hover:border-primary/50 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[q.status] || STATUS_BADGE.Active}`}>
                        {q.status}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground leading-snug line-clamp-2">{q.title}</h4>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground mt-1">
                      "{stripHtml(q.desc)}"
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pro Tip — styled flat card */}
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 text-foreground shadow-sm relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-15px] opacity-10 text-primary">
              <Lightbulb className="h-28 w-28" />
            </div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-primary">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500 animate-pulse" strokeWidth={1.8} /> Pro Tip
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground font-medium relative z-10">
              Adding screenshots or PDF receipts usually speeds up the resolution process by up to 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RaiseQueryPage
