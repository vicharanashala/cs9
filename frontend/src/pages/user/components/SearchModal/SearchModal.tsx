import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Search, Tag, X } from 'lucide-react'
import { styleForTag } from '../../constants'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryTag {
  tag: string
  count: number
}

interface SearchModalProps {
  open: boolean
  categories?: CategoryTag[]
  initialSearch?: string
  initialTags?: string[]
  onApply?: (search: string, tags: string[]) => void
  onClose?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Search modal — keyword input + multi-select category (tag) chips.
 * Manages its own draft state, seeded from the committed values each
 * time it opens. Enter (or a category + Enter) applies; X closes without applying.
 */
const SearchModal: FC<SearchModalProps> = ({
  open,
  categories = [],
  initialSearch = '',
  initialTags = [],
  onApply,
  onClose,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [pendingTags, setPendingTags] = useState(initialTags)
  const inputRef = useRef<HTMLInputElement>(null)

  // Seed draft state when the modal opens
  useEffect(() => {
    if (open) {
      setSearchInput(initialSearch)
      setPendingTags(initialTags)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTag(tag: string) {
    setPendingTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    )
  }

  function apply() {
    onApply?.(searchInput.trim(), pendingTags)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      apply()
    }
  }

  return (
    <Dialog open={open} onClose={onClose ?? (() => {})} className="relative z-[2000]">
      <div className="fixed inset-0 flex items-start justify-center bg-black/50 pt-[120px] backdrop-blur-sm transition-opacity duration-300">
        <DialogPanel className="flex w-full max-w-[1040px] flex-col rounded-2xl border border-border bg-card p-8 shadow-2xl text-foreground transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95">
          {/* Search input */}
          <div className="mb-8 flex items-center gap-3 rounded-xl border-2 border-primary bg-card px-5 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
            <Search className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Search FAQs, categories, or status…"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Selected-tag count indicator */}
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                pendingTags.length > 0 ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
              }`}
              title={`${pendingTags.length} categor${pendingTags.length === 1 ? 'y' : 'ies'} selected`}
            >
              <Tag className="h-4 w-4" strokeWidth={1.8} />
              {pendingTags.length}
            </div>

            <span className="h-5 w-px shrink-0 bg-border" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 text-muted-foreground transition hover:text-foreground p-1 rounded-full hover:bg-secondary focus:outline-none"
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Categories (tags from DB) */}
          <div className="mb-2 flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
            <div className="h-px flex-1 bg-border" />
            {pendingTags.length > 0 && (
              <button
                type="button"
                onClick={() => setPendingTags([])}
                className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          {categories.length === 0 ? (
            <p className="py-4 text-[12px] text-muted-foreground">No categories available yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-3">
              {categories.map(({ tag, count }) => {
                const { Icon, color, bg } = styleForTag(tag)
                const isSelected = pendingTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-border bg-secondary/35 hover:border-primary/50'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/10 shadow-sm"
                      style={{ background: bg, color }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[12px] font-semibold capitalize text-foreground">{tag}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default SearchModal
