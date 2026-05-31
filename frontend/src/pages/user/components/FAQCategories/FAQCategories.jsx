import { TrendingUp, X } from 'lucide-react'

/**
 * Top FAQ categories widget — shows the top 5 tags (from the DB)
 * as a numbered list. Multi-select: clicking toggles a tag in the filter.
 */
function FAQCategories({ categories = [], selected = [], onToggle, onClear }) {
  const top = categories.slice(0, 5)

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-md bg-primary p-1.5 text-primary-foreground shadow-sm">
          <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <span className="font-display text-base font-bold text-foreground">Top FAQ Categories</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selected categories"
            className="ml-auto flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary hover:text-primary-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          {top.map(({ tag, count }, i) => {
            const isSelected = selected.includes(tag)
            return (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onToggle?.(tag)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <span className={`font-display text-xl leading-none ${isSelected ? 'text-primary font-bold animate-pulse' : 'text-muted-foreground/80'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h5 className={`flex-1 text-sm font-bold capitalize ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {tag}
                  </h5>
                  <span className="shrink-0 rounded bg-secondary/80 border border-border/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {count} {count === 1 ? 'query' : 'queries'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FAQCategories
