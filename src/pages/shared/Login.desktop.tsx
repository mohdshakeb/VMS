// ─────────────────────────────────────────────────────────────────────────────
// Login — Desktop
// Two-column layout: centred form left, hero image right.
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

export default function LoginDesktop() {
  const [step,      setStep]      = useState<'credentials' | 'apps'>('credentials')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate  = useNavigate()

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
        setStep('apps')
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
    <div className="hidden md:flex min-h-screen bg-white">

      {/* ── Left panel — form centred ───────────────────────────────────── */}
      <div className="relative flex flex-1 min-h-screen items-center justify-center max-w-[580px]">

        {/* Logo — pinned top-left */}
        <div className="absolute top-10 left-14 flex items-center gap-2">
          <img src={logoBlackUrl} alt="GMMCO" className="h-9 w-auto" />
          <span className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase">
            Manage
          </span>
        </div>

        {/* Footer — pinned bottom-left */}
        <p className="absolute bottom-10 left-14 text-xs text-text-tertiary">
          By proceeding you agree to the{' '}
          <a href="#" className="text-brand hover:underline">Terms of use</a>
          {' '}and{' '}
          <a href="#" className="text-brand hover:underline">Privacy Policy</a>
        </p>

        {/* Form */}
        <div className="w-full px-14">
          <div className="max-w-xs mx-auto">

            {step === 'credentials' && (
              <div className="vms-stagger-item">
                <h1 className="text-2xl font-semibold text-text-primary mb-1">Welcome to Gmmco</h1>
                <p className="text-sm text-text-secondary mb-8">Login with your work email to continue.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      placeholder="Enter your work email"
                      className="form-input"
                      autoComplete="email"
                      autoFocus
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

                <p className="mt-5 text-xs text-text-secondary">
                  Don't have an Email?{' '}
                  <a href="#" className="text-brand font-medium hover:underline">Contact Admin</a>
                </p>
              </div>
            )}

            {step === 'apps' && (
              <div className="vms-stagger-item">
                <h1 className="text-2xl font-semibold text-text-primary mb-1">
                  Welcome back, {displayName}
                </h1>
                <p className="text-sm text-text-secondary mb-8">Choose your workspace to continue.</p>

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
                          ? 'border-border hover:border-brand hover:bg-brand-light cursor-pointer group'
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
                        <i className="ri-arrow-right-line text-base text-text-tertiary group-hover:text-brand shrink-0 transition-colors duration-150" />
                      ) : (
                        <span className="shrink-0 text-[10px] font-medium text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setStep('credentials'); setPassword('') }}
                  className="mt-6 text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150 flex items-center gap-1"
                >
                  <i className="ri-arrow-left-line text-xs" />
                  Sign in with a different account
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Right panel — image ─────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden bg-zinc-100 m-3 rounded-2xl">
        <img
          src={manInHelmetUrl}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-5 right-5">
          <img
            src={logoSecondaryUrl}
            alt="CKA Birla Group — GMMCO"
            className="h-7 w-auto drop-shadow-sm"
          />
        </div>
      </div>

    </div>
  )
}
