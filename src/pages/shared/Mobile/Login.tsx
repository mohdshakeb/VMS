// ─────────────────────────────────────────────────────────────────────────────
// Login — Mobile
// Hero image (8px inset, rounded) + branding + single CTA button.
// Tapping "Login with SSO" opens a bottom sheet with the email/password form.
// After a successful login the sheet closes and app-selector cards replace the CTA.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import logoBlackUrl from '@/assets/logoBlack.svg'
import manInHelmetUrl from '@/assets/ManinHalmet.png'
import logoSecondaryUrl from '@/assets/LogoSecondary.png'

const APPS = [
  { id: 'shield',   name: 'Shield',   tagline: 'Security & Access Control',   icon: 'ri-shield-keyhole-line', iconBg: 'bg-zinc-800',  available: false },
  { id: 'visitor',  name: 'Visitor',  tagline: 'Visitor Management System',   icon: 'ri-user-follow-line',    iconBg: 'bg-brand',     available: true  },
  { id: 'facility', name: 'Facility', tagline: 'Facility & Asset Management', icon: 'ri-building-2-line',     iconBg: 'bg-amber-500', available: false },
]

const ROLE_ROUTES: Record<string, string> = {
  employee:       '/employee/visits',
  'front-desk':   '/front-desk/dashboard',
  'branch-admin': '/manager/dashboard',
}

export default function LoginMobile() {
  const [sheetMounted,  setSheetMounted]  = useState(false)
  const [sheetVisible,  setSheetVisible]  = useState(false)
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [error,         setError]         = useState('')
  const [isLoading,     setIsLoading]     = useState(false)

  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  function openSheet() {
    setSheetMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetVisible(true)))
  }

  function closeSheet() {
    setSheetVisible(false)
    setTimeout(() => setSheetMounted(false), 260)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const success = login(email.trim(), password)
      if (success) {
        closeSheet()
      } else {
        setError('Invalid credentials. Please try again.')
        setIsLoading(false)
      }
    }, 500)
  }

  function handleAppSelect(appId: string) {
    if (appId !== 'visitor') return
    const role = useAuthStore.getState().currentRole
    navigate(ROLE_ROUTES[role] ?? '/front-desk/dashboard')
  }

  const rawName     = email.split('@')[0].split('.')[0]
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  return (
    <div className="md:hidden flex flex-col h-screen bg-white">

      {/* Hero image — 8px inset from top and sides, fills all remaining height */}
      <div className="relative flex-1 min-h-0 mt-2 mx-2 rounded-2xl overflow-hidden">
        <img
          src={manInHelmetUrl}
          alt=""
          className="w-full h-full object-cover object-top"
        />
        {/* Secondary logo — top-left over image */}
        <div className="absolute top-4 left-4">
          <img
            src={logoSecondaryUrl}
            alt="CKA Birla Group — GMMCO"
            className="h-6 w-auto drop-shadow"
          />
        </div>
      </div>

      {/* Bottom content — anchored to bottom, shrinks to fit content */}
      <div className="shrink-0 px-6 pt-6 pb-10 overflow-y-auto">

        {/* Branding */}
        <div className="mb-5">
          <img src={logoBlackUrl} alt="GMMCO" className="h-11 w-auto" />
        </div>

        {!isAuthenticated ? (

          /* ── Pre-login ──────────────────────────────────────────────── */
          <div className="vms-stagger-item">
            <h1 className="text-xl font-semibold text-text-primary mb-1">
              Welcome to Gmmco
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              Login with your work email to continue.
            </p>

            <button
              onClick={openSheet}
              className="w-full bg-brand hover:bg-brand-hover active:bg-brand-hover text-white rounded-lg py-3 text-sm font-medium transition-colors duration-150"
            >
              Login with SSO
            </button>

            <button className="w-full mt-3 py-2 text-sm font-medium text-text-secondary">
              Use Passkey
            </button>
          </div>

        ) : (

          /* ── Post-login: app selector ───────────────────────────────── */
          <div className="vms-stagger-item">
            <h1 className="text-xl font-semibold text-text-primary mb-1">
              Welcome back{displayName ? `, ${displayName}` : ''}
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              Choose your workspace to continue.
            </p>

            <div className="space-y-3">
              {APPS.map((app, i) => (
                <button
                  key={app.id}
                  onClick={() => handleAppSelect(app.id)}
                  disabled={!app.available}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={[
                    'vms-stagger-item w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150',
                    app.available
                      ? 'border-border active:bg-brand-light cursor-pointer group'
                      : 'border-border bg-surface opacity-50 cursor-not-allowed',
                  ].join(' ')}
                >
                  <div className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${app.iconBg}`}>
                    <i className={`${app.icon} text-xl text-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{app.name}</p>
                    <p className="text-xs text-text-tertiary">{app.tagline}</p>
                  </div>
                  {app.available ? (
                    <i className="ri-arrow-right-line text-base text-text-tertiary shrink-0" />
                  ) : (
                    <span className="shrink-0 text-[10px] font-medium text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        )}
      </div>

      {/* ── Credentials bottom sheet ──────────────────────────────────────── */}
      {sheetMounted && (
        <>
          <div
            onClick={closeSheet}
            className="fixed inset-0 z-40 bg-black/40"
            style={{
              opacity: sheetVisible ? 1 : 0,
              transition: sheetVisible ? 'opacity 240ms ease-out' : 'opacity 220ms ease-in',
            }}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl"
            style={{
              transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: sheetVisible
                ? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)'
                : 'transform 240ms cubic-bezier(0.4, 0, 1, 1)',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-border" />
            </div>

            <div className="px-5 pt-2 pb-4 border-b border-border-light">
              <p className="text-sm font-semibold text-text-primary">Sign in to Gmmco</p>
              <p className="text-xs text-text-tertiary mt-0.5">Enter your work email and password</p>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pt-5 pb-8 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="Enter your work email"
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-xs text-brand font-medium">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium transition-colors duration-150"
              >
                {isLoading ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  )
}
