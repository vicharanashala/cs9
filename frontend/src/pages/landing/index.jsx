/* global __PROJECT_NAME__, __PROJECT_TAGLINE__ */
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import {
  Award,
  BriefcaseBusiness,
  CalendarClock,
  ChevronsDownUp,
  ChevronsUpDown,
  ClipboardCheck,
  FileText,
  Info,
  Laptop,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Search,
  ShieldCheck,
  Tag,
  Terminal,
  Users,
  Sun,
  Moon,
} from 'lucide-react'
import Footer from '../../components/Footer/Footer'
import Button from '../../components/Button/Button'
import labSupportImage from '../../assets/lab-support.png'
import LoginModal from './LoginModal'
import FaqCard from './components/FaqCard'
import { getCurrentUser, getFaqSections } from './service'

const iconComponents = {
  award: Award,
  'briefcase-business': BriefcaseBusiness,
  'calendar-clock': CalendarClock,
  'clipboard-check': ClipboardCheck,
  'file-text': FileText,
  info: Info,
  laptop: Laptop,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  newspaper: Newspaper,
  'shield-check': ShieldCheck,
  tag: Tag,
  terminal: Terminal,
  users: Users,
}

const emptySections = []

function TagIcon({ name, className }) {
  const IconComponent = iconComponents[name] || Tag

  return <IconComponent aria-hidden="true" className={className} strokeWidth={1.8} />
}

function Tooltip({ label, children }) {
  return (
    <div className="group/tip relative">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover border border-border px-3 py-1.5 text-xs font-bold text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover/tip:opacity-100 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

function Landing() {
  const [explicitOpenKeys, setExplicitOpenKeys] = useState(new Set())
  const [closedKeys, setClosedKeys] = useState(new Set())
  const [query, setQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('')
  const [pageProgress, setPageProgress] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const navigate = useNavigate()
  const { user: currentUser, setUser } = useAuthStore()
  const { isDark, toggleDark } = useThemeStore()

  function handleLogin(user) {
    setUser(user)
    navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')
  }

  function toggleFaq(accordionKey) {
    const isOpen = openKeys.has(accordionKey)

    setExplicitOpenKeys((prev) => {
      const next = new Set(prev)
      if (isOpen) next.delete(accordionKey)
      else next.add(accordionKey)
      return next
    })

    setClosedKeys((prev) => {
      const next = new Set(prev)
      if (isOpen) next.add(accordionKey)
      else next.delete(accordionKey)
      return next
    })
  }

  function toggleSection(section) {
    const keys = section.faqs.map((faq) => `${section.id}:${faq.id}`)
    const allOpen = keys.length > 0 && keys.every((k) => openKeys.has(k))

    setExplicitOpenKeys((prev) => {
      const next = new Set(prev)
      if (allOpen) keys.forEach((k) => next.delete(k))
      else keys.forEach((k) => next.add(k))
      return next
    })

    setClosedKeys((prev) => {
      const next = new Set(prev)
      if (allOpen) keys.forEach((k) => next.add(k))
      else keys.forEach((k) => next.delete(k))
      return next
    })
  }

  function handleHeaderButtonClick() {
    if (currentUser) {
      navigate(currentUser.role === 'ADMIN' ? '/admin' : '/dashboard')
    } else {
      setIsLoginModalOpen((prev) => !prev)
    }
  }

  // TanStack Query — FAQs (cached, staleTime=Infinity)
  const { data: faqSections = emptySections, isLoading, isError, error } = useQuery({
    queryKey: ['landing-faqs'],
    queryFn: () => getFaqSections(),
    staleTime: Infinity,
  })

  const sections = isError ? emptySections : faqSections
  const openKeys = new Set()
  closedKeys.forEach((key) => openKeys.delete(key))
  explicitOpenKeys.forEach((key) => openKeys.add(key))

  useEffect(() => {
    if (currentUser) {
      return undefined
    }

    const controller = new AbortController()

    async function hydrateCurrentUser() {
      try {
        const user = await getCurrentUser(controller.signal)
        setUser(user)
      } catch (error) {
        if (
          error.name === 'AbortError' ||
          error.name === 'CanceledError' ||
          error.code === 'ERR_CANCELED'
        ) {
          return
        }
      }
    }

    hydrateCurrentUser()

    return () => controller.abort()
  }, [currentUser, setUser])

  useEffect(() => {
    if (sections.length === 0) {
      return undefined
    }

    let animationFrame = 0

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 180
      let nextActiveSection = sections[0].id

      for (const section of sections) {
        const sectionElement = document.getElementById(section.id)

        if (sectionElement && sectionElement.offsetTop <= scrollPosition) {
          nextActiveSection = section.id
        }
      }

      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress =
        scrollableHeight > 0 ? Math.min((window.scrollY / scrollableHeight) * 100, 100) : 0

      setActiveSectionId(nextActiveSection)
      setPageProgress(nextProgress)
    }

    const onScroll = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sections])

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return sections
    }

    return sections
      .map((section) => {
        const sectionMatches = section.label.toLowerCase().includes(normalizedQuery)
        const matchingFaqs = section.faqs.filter((faq) => {
          const searchableText = `${faq.question} ${faq.answer} ${faq.category} ${faq.tags.join(
            ' ',
          )}`.toLowerCase()
          return searchableText.includes(normalizedQuery)
        })

        return {
          ...section,
          faqs: sectionMatches ? section.faqs : matchingFaqs,
        }
      })
      .filter((section) => section.faqs.length > 0)
  }, [query, sections])

  const hasSections = sections.length > 0
  const currentActiveSectionId = activeSectionId || sections[0]?.id || ''
  const visiblePageProgress = hasSections ? pageProgress : 0

  return (
    <div className="min-h-svh bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            className="flex flex-col"
          >
            <span className="font-display text-[22px] font-bold leading-tight text-foreground sm:text-[26px]">
              {__PROJECT_NAME__ || 'Rogāre'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
              {__PROJECT_TAGLINE__ || 'Lab Internship Hub'}
            </span>
          </a>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-5 w-5" strokeWidth={1.8} /> : <Moon className="h-5 w-5" strokeWidth={1.8} />}
            </button>
            <Button variant="primary" className="text-xs font-bold tracking-wider px-5 py-2.5" onClick={handleHeaderButtonClick}>
              {currentUser ? 'Dashboard' : 'Login'}
            </Button>
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto flex w-full max-w-7xl px-6">
        <aside className="sticky top-24 hidden w-64 shrink-0 flex-col self-start border-r border-border pr-6 py-8 md:flex">
          <div className="mb-6">
            <h2 className="font-display text-base font-bold leading-snug text-foreground">
              FAQ Sections
            </h2>
            <p className="mt-1.5 text-xs font-semibold text-muted-foreground">Internship Guide</p>
          </div>

          <nav aria-label="FAQ sections" className="relative flex flex-col gap-1.5 pl-2">
            <span className="absolute bottom-2 left-0 top-2 w-px bg-border" aria-hidden="true" />
            <span
              className="absolute left-0 top-2 w-px bg-primary transition-[height] duration-200"
              style={{ height: `calc((100% - 16px) * ${visiblePageProgress / 100})` }}
              aria-hidden="true"
            />
            {sections.map((section) => {
              const isActive = currentActiveSectionId === section.id

              return (
                <a
                  href={`#${section.id}`}
                  key={section.id}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold leading-normal transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <TagIcon className="h-4.5 w-4.5 shrink-0" name={section.icon} />
                  <span>{section.label}</span>
                </a>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pl-6 py-8">
          {/* Mobile navigation indicator */}
          <div className="mb-8 md:hidden">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="font-display text-sm font-bold leading-snug text-foreground">
                FAQ Sections
              </p>
              <p className="text-xs font-bold text-muted-foreground">
                {Math.round(visiblePageProgress)}%
              </p>
            </div>
            <div className="mb-4 h-[2px] overflow-hidden bg-border rounded-full">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${visiblePageProgress}%` }}
              />
            </div>
            <nav
              aria-label="FAQ tags"
              className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2"
            >
              {sections.map((section) => {
                const isActive = currentActiveSectionId === section.id

                return (
                  <a
                    href={`#${section.id}`}
                    key={section.id}
                    className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <TagIcon className="h-3.5 w-3.5 shrink-0" name={section.icon} />
                    <span>{section.label}</span>
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="relative mb-8 block w-full">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.8}
            />
            <input
              id="faq-search"
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none transition duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
              placeholder="Search for questions (e.g., 'stipend', 'selection')..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {isLoading && (
            <section className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary mb-3" />
              <p className="text-sm leading-7 text-muted-foreground">Loading FAQ data...</p>
            </section>
          )}

          {isError && (
            <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h1 className="mb-2 font-display text-[20px] font-bold leading-snug text-destructive">
                FAQ data is unavailable
              </h1>
              <p className="text-sm leading-7 text-muted-foreground">
                {error?.message || 'Unable to load FAQs'}. Make sure the backend is running.
              </p>
            </section>
          )}

          {!isLoading && !isError && hasSections && (
            <div className="flex flex-col gap-10">
              {visibleSections.map((section) => (
                <section
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24 animate-fade-in-up"
                  key={section.id}
                >
                  <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-3">
                    <h1
                      id={`${section.id}-heading`}
                      className="font-display text-xl sm:text-2xl font-bold leading-snug text-foreground"
                    >
                      {section.label}
                    </h1>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-[11px] font-bold tracking-wider text-muted-foreground">
                        {section.faqs.length} QUESTIONS
                      </p>
                      <Tooltip
                        label={
                          section.faqs.length > 0 &&
                          section.faqs.every((faq) => openKeys.has(`${section.id}:${faq.id}`))
                            ? 'Collapse all'
                            : 'Expand all'
                        }
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section)}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
                        >
                          {section.faqs.length > 0 &&
                          section.faqs.every((faq) => openKeys.has(`${section.id}:${faq.id}`)) ? (
                            <ChevronsDownUp className="h-4 w-4" strokeWidth={2} />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4" strokeWidth={2} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.faqs.map((faq) => {
                      const accordionKey = `${section.id}:${faq.id}`
                      const isOpen = openKeys.has(accordionKey)

                      return (
                        <FaqCard
                          key={accordionKey}
                          faq={faq}
                          sectionId={section.id}
                          isOpen={isOpen}
                          onToggle={() => toggleFaq(accordionKey)}
                        />
                      )
                    })}
                  </div>
                </section>
              ))}

              {visibleSections.length === 0 && (
                <section className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
                  <h1 className="mb-2 font-display text-[18px] font-bold leading-snug text-foreground">
                    No questions found
                  </h1>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Try a different keyword or clear the search field to return to the full FAQ.
                  </p>
                </section>
              )}
            </div>
          )}

          {!isLoading && !isError && !hasSections && (
            <section className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
              <h1 className="mb-2 font-display text-[18px] font-bold leading-snug text-foreground">
                No FAQs published
              </h1>
              <p className="text-sm leading-7 text-muted-foreground">
                Published FAQ questions will appear here automatically once they have tags.
              </p>
            </section>
          )}

        </main>
      </div>

      <section className="border-t border-border/60 px-6 py-10 mt-10">
        <div className="relative mx-auto flex min-h-48 max-w-7xl items-center overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm animate-fade-in-up">
          <img
            alt="Academic research environment"
            className="absolute inset-0 h-full w-full object-cover opacity-5 dark:opacity-2 grayscale pointer-events-none"
            src={labSupportImage}
          />
          <div className="relative z-10 max-w-lg">
            <h2 className="mb-2 font-display text-[18px] font-semibold leading-snug text-foreground">
              Need direct assistance?
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              Our support team is available during lab hours to help with specific onboarding or
              platform issues.
            </p>
            <Button
              variant="primary"
              className="text-xs font-bold tracking-wider px-6 py-3"
              onClick={() => currentUser ? navigate('/raise-query') : setIsLoginModalOpen(true)}
            >
              Contact Crowd for Solution
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default Landing
