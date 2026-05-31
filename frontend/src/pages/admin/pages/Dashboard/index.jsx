import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Filter,
  MessageSquare,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Button from '../../../../components/Button/Button'

// Placeholder until GET /api/admin/dashboard returns metrics.charts.categories.
// Expected shape: [{ category: string, new: number, resolved: number }]
const PLACEHOLDER_CATEGORIES = [
  { category: 'Academic', new: 66, resolved: 42 },
  { category: 'NOC', new: 48, resolved: 72 },
  { category: 'VIBE', new: 82, resolved: 54 },
  { category: 'Stipend', new: 40, resolved: 62 },
  { category: 'Offer', new: 76, resolved: 88 },
  { category: 'Other', new: 58, resolved: 36 },
]

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0)
}

function MetricCard({ title, value, Icon, iconClassName, trend, trendType = 'up', badge }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {badge ? (
          <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
            {badge}
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 text-xs font-bold ${
              trendType === 'down' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {trendType === 'down' ? (
              <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
    </div>
  )
}

function ActivityItem({ icon: Icon, title, meta, tone = 'neutral' }) {
  const toneClass =
    tone === 'blue'
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
      : tone === 'amber'
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        : tone === 'red'
          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          : 'bg-secondary text-muted-foreground border border-border/40'

  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  )
}

function DashboardView({ dashboardData, isLoading, onRefresh }) {
  const metrics = dashboardData?.metrics || {}
  const recent = dashboardData?.recent || {}
  const questionMetrics = metrics.questions || {}
  const usersMetrics = metrics.users || {}
  const flagsMetrics = metrics.flags || {}
  const recentQuestions = recent.questions || []
  const recentUsers = recent.users || []
  const recentFlags = recent.flags || []
  // Real data once the backend aggregation exists; placeholder until then.
  const categoryData = dashboardData?.charts?.categories?.length
    ? dashboardData.charts.categories
    : PLACEHOLDER_CATEGORIES
  const attentionRows = recentFlags.slice(0, 5)
  const activityItems = [
    ...recentQuestions.slice(0, 2).map((question) => ({
      id: `question-${question.question_id}`,
      icon: MessageSquare,
      title: `Question ${question.question_id?.slice(0, 8) || ''} needs review`,
      meta: `${question.kind || 'community'} | ${question.status || 'open'}`,
      tone: question.status === 'removed' ? 'red' : 'blue',
    })),
    ...recentUsers.slice(0, 2).map((user) => ({
      id: `user-${user.user_id}`,
      icon: UserPlus,
      title: `${user.name || 'New user'} joined`,
      meta: user.email || 'Recently created account',
      tone: 'amber',
    })),
    ...recentFlags.slice(0, 2).map((flag) => ({
      id: `flag-${flag.flag_id}`,
      icon: AlertCircle,
      title: `Flag opened for ${flag.target_type || 'content'}`,
      meta: flag.reason || flag.status || 'Pending moderation',
      tone: 'red',
    })),
  ]

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8 animate-fade-in-up text-foreground">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-foreground">
            Main Dashboard
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Real-time platform metrics for the lab internship hub.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="gap-2 text-xs"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            Refresh
          </Button>
          <Button variant="secondary" className="gap-2 text-xs">
            <Download className="h-4 w-4" strokeWidth={1.8} />
            Export
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Community Queries"
          value={formatNumber(questionMetrics.community)}
          Icon={ClipboardList}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          trend={`${formatNumber(questionMetrics.total)} total`}
        />
        <MetricCard
          title="FAQ Entries"
          value={formatNumber(questionMetrics.faq)}
          Icon={CheckCircle}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          trend="Published"
        />
        <MetricCard
          title="Answers"
          value={formatNumber(metrics.answers?.total)}
          Icon={Clock}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
          trendType="down"
          trend="Live"
        />
        <MetricCard
          title="Open Flags"
          value={formatNumber(flagsMetrics.open)}
          Icon={AlertCircle}
          iconClassName="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          badge={flagsMetrics.open > 0 ? 'URGENT' : 'CLEAR'}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-foreground">Query Volume by Category</h2>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> New
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" opacity={0.5} /> Resolved
              </span>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                barGap={4}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--secondary)' }}
                  contentStyle={{ borderRadius: 12, background: 'var(--popover)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--popover-foreground)' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--foreground)' }}
                />
                <Bar dataKey="new" name="New" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="resolved" name="Resolved" fill="var(--muted-foreground)" opacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-6 text-base font-bold text-foreground">Resolver Activity</h2>
          <div className="flex flex-col gap-5">
            {activityItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent platform activity.</p>
            ) : (
              activityItems.map((item) => <ActivityItem key={item.id} {...item} />)
            )}
          </div>
          <button
            type="button"
            className="mt-6 w-full border-t border-border pt-4 text-center text-sm font-semibold text-primary transition hover:underline"
          >
            View all activity
          </button>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Needs Attention</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing {attentionRows.length} open moderation items
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <Filter className="h-4 w-4" strokeWidth={1.8} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {attentionRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-muted-foreground" colSpan={5}>
                    No escalated items need attention.
                  </td>
                </tr>
              ) : (
                attentionRows.map((flag) => (
                  <tr key={flag.flag_id} className="border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">
                      #{flag.flag_id?.slice(0, 8) || 'FLAG'}
                    </td>
                    <td className="px-5 py-4 capitalize text-foreground/90">
                      {flag.target_type || 'content'} {flag.target_id?.slice(0, 8) || ''}
                    </td>
                    <td className="max-w-[320px] truncate px-5 py-4 text-muted-foreground">
                      {flag.reason || 'Pending review'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                        {flag.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground/90">
                      {flag.reviewed_by || 'Admin queue'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Users</p>
          <p className="mt-2 text-xl font-bold text-foreground">
            {formatNumber(usersMetrics.total)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            New this week
          </p>
          <p className="mt-2 text-xl font-bold text-foreground">
            {formatNumber(usersMetrics.thisWeek)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Spark Ledger
          </p>
          <p className="mt-2 text-xl font-bold text-foreground">
            {formatNumber(metrics.sparks?.total)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
