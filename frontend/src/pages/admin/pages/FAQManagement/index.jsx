import { FileText, Settings } from 'lucide-react'

function FAQManagementView({ dashboardData }) {
  const questions = dashboardData?.recent?.questions || []
  const faqQuestions = questions.filter((question) => question.kind === 'faq')
  const faqTotal = dashboardData?.metrics?.questions?.faq || 0

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8 text-foreground animate-fade-in-up">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">FAQ Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Published FAQ content and queue health.</p>
        </div>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
        >
          <Settings className="h-4 w-4" strokeWidth={1.8} />
          New FAQ
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FAQ Entries</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{faqTotal}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent FAQ</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{faqQuestions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-3 inline-flex rounded bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-bold uppercase text-green-600 dark:text-green-400">
            Synced
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm animate-fade-in-up">
        <div className="border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileText className="h-4 w-4 text-primary" strokeWidth={1.8} />
            Recent FAQ records
          </h2>
        </div>
        <div className="divide-y divide-border/60">
          {faqQuestions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No recent FAQ records in the admin feed.
            </p>
          ) : (
            faqQuestions.map((question) => (
              <div key={question.question_id} className="px-5 py-4 hover:bg-secondary/20 transition-colors">
                <p className="text-sm font-semibold text-foreground">{question.title}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">{question.status}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default FAQManagementView
