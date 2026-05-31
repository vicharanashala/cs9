import { Filter, MessageSquare } from 'lucide-react'

function QueriesManagementView({ dashboardData, searchQuery }) {
  const queries = dashboardData?.recent?.questions || []
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const visibleQueries = normalizedSearch
    ? queries.filter((query) =>
        `${query.title || ''} ${query.kind || ''} ${query.status || ''}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : queries

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8 text-foreground animate-fade-in-up">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Queries Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Review recent platform questions.</p>
        </div>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-xs font-semibold text-foreground transition hover:border-foreground active:scale-[0.98]"
        >
          <Filter className="h-4 w-4" strokeWidth={1.8} />
          Filter
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-fade-in-up">
        <div className="border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" strokeWidth={1.8} />
            Recent queries
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Kind</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Author</th>
              </tr>
            </thead>
            <tbody>
              {visibleQueries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No recent queries match this view.
                  </td>
                </tr>
              ) : (
                visibleQueries.map((query) => (
                  <tr key={query.question_id} className="border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">
                      #{query.question_id?.slice(0, 8)}
                    </td>
                    <td className="max-w-[420px] truncate px-5 py-4 font-medium text-foreground">
                      {query.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                        {query.kind || 'community'}
                      </span>
                    </td>
                    <td className="px-5 py-4 capitalize text-foreground/90">{query.status}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {query.author_id?.slice(0, 8) || 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default QueriesManagementView
