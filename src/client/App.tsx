import { lazy, Suspense, useEffect, useState } from 'react'
import { ConfirmHost } from './components/overlay'
import { Toaster } from './components/feedback'
import { Spinner } from './components/primitives'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoginForm } from './features/auth/LoginPage'
import { LandingPage } from './features/auth/LandingPage'
import { dismissBootScreen } from './lib/boot'
import { t, useLocale } from './lib/i18n'
import { initializePwa, requestOfflineWarmup } from './store/pwa'
import { useSession, watchSystemTheme } from './store/session'

const AppShell = lazy(() =>
  import('./features/shell/AppShell').then((module) => ({ default: module.AppShell })),
)
const SharePage = lazy(() =>
  import('./features/share/SharePage').then((module) => ({ default: module.SharePage })),
)

export function App() {

  useLocale()
  const status = useSession((s) => s.status)
  const load = useSession((s) => s.load)
  const [loginOpen, setLoginOpen] = useState(false)
  const [shareSlug] = useState(() => {
    const match = /^\/s\/([A-Za-z0-9_-]+)/.exec(location.pathname)
    return match?.[1] ?? null
  })

  useEffect(() => {
    if (shareSlug) return
    void load()
  }, [load, shareSlug])

  useEffect(() => watchSystemTheme(), [])

  useEffect(() => {
    initializePwa()
  }, [])

  useEffect(() => {
    if (!shareSlug && status !== 'loading') requestOfflineWarmup()
  }, [shareSlug, status])

  useEffect(() => {
    if (shareSlug || status !== 'loading') dismissBootScreen()
  }, [status, shareSlug])

  useEffect(() => {
    if (shareSlug) return
    const timer = window.setTimeout(() => dismissBootScreen(), 8000)
    return () => window.clearTimeout(timer)
  }, [shareSlug])

  // Close login modal when authenticated
  useEffect(() => {
    if (status === 'authed') {
      setLoginOpen(false)
    }
  }, [status])

  if (shareSlug) {
    return (
      <>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <SharePage slug={shareSlug} />
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <ErrorBoundary>
        {status === 'loading' && <div className="h-full" />}
        {status === 'anonymous' && (
          <>
            <LandingPage onLogin={() => setLoginOpen(true)} />
            {loginOpen && (
              <LoginModal onClose={() => setLoginOpen(false)} />
            )}
          </>
        )}
        {status === 'authed' && (
          <Suspense fallback={<PageFallback />}>
            <AppShell />
          </Suspense>
        )}
      </ErrorBoundary>
      <Toaster />
      <ConfirmHost />
    </>
  )
}


function LoginModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="anim-fade absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("auth.sign_in")}
        className="anim-pop relative w-full max-w-[420px] rounded-t-2xl border-t border-[#e2e8f0] bg-white p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] sm:rounded-2xl sm:border sm:border-[#e2e8f0] sm:p-6 sm:shadow-[0_8px_40px_rgba(0,0,0,0.12)] md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569] sm:top-4 sm:right-4"
          aria-label={t("common.close")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <LoginForm />
      </div>
    </div>
  )
}


function PageFallback() {
  return (
    <div
      role="status"
      aria-label={t("common.loading")}
      className="flex h-full items-center justify-center bg-[var(--bg-base)] text-[var(--text-tertiary)]"
    >
      <Spinner size={18} />
    </div>
  )
}
