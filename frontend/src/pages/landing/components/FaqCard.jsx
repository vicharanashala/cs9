import { ChevronDown } from 'lucide-react'

function getQuestionLabel(faq) {
  const category = String(faq.category || '').trim()
  const hasReadableCategory = /^\d+(\.\d+)?$/.test(category)
  return hasReadableCategory ? `${category} ${faq.question}` : faq.question
}

function FaqCard({ faq, sectionId, isOpen, onToggle }) {
  const answerId = `faq-answer-${sectionId}-${faq.id}`

  return (
    <article className={`overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:scale-[1.002] ${
      isOpen ? 'border-primary/60 shadow-md ring-1 ring-primary/10' : 'border-border hover:border-primary/40 hover:shadow-sm'
    }`}>
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-4 p-5 text-left transition-colors duration-250 hover:bg-secondary/40 cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
      >
        <span className="text-sm sm:text-base font-bold leading-relaxed text-foreground">
          {getQuestionLabel(faq)}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
          strokeWidth={1.8}
        />
      </button>
      <div
        id={answerId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden border-t border-border/50 bg-secondary/10">
          <p className="p-5 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: faq.answer }} />
        </div>
      </div>
    </article>
  )
}

export default FaqCard
