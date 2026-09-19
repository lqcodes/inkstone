import { useRef, useState } from 'react'
import { ArrowLeft, KeyRound, Loader2, TriangleAlert } from 'lucide-react'
import { LIMITS } from '@shared/constants'
import type { TotpLoginChallenge } from '@shared/types'
import { cn } from '../../lib/cn'
import { ApiError } from '../../lib/api'
import { t } from '../../lib/i18n'
import { initialLoginCredentials } from '../../lib/runtime'
import { useSession } from '../../store/session'

export function LoginForm() {
  const initialCredentials = initialLoginCredentials()
  const site = useSession((state) => state.site)
  const authError = useSession((state) => state.authError)
  const passwordLogin = useSession((state) => state.passwordLogin)
  const totpLogin = useSession((state) => state.totpLogin)
  const passwordRegister = useSession((state) => state.passwordRegister)
  const firstRun = Boolean(site && !site.initialized)
  const [mode, setMode] = useState<'login' | 'register'>(firstRun ? 'register' : 'login')
  const [username, setUsername] = useState(initialCredentials.username)
  const [password, setPassword] = useState(initialCredentials.password)
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<TotpLoginChallenge | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(false)
  const busyRef = useRef(false)
  const registerMode = mode === 'register' || firstRun
  const showModeSwitch = !firstRun && site?.registrationOpen

  const submit = async () => {
    if (busyRef.current) return
    setError(null)
    if (challenge) {
      if (!verificationCode.trim()) {
        setError(recoveryMode ? t('auth.enter_recovery_code') : t('auth.enter_authenticator_code'))
        return
      }
      busyRef.current = true
      setBusy(true)
      try {
        await totpLogin(challenge.challengeToken, verificationCode)
      } catch (caught) {
        busyRef.current = false
        setBusy(false)
        if (caught instanceof ApiError && caught.code === 'two_factor_challenge_expired') {
          setChallenge(null)
          setVerificationCode('')
          setRecoveryMode(false)
        }
        setError(caught instanceof ApiError ? caught.message : t('auth.network_error_try_again'))
      }
      return
    }
    if (!username.trim() || !password) {
      setError(t("auth.enter_a_username_and_password"))
      return
    }
    if (registerMode && password !== confirmation) {
      setError(t("common.the_passwords_do_not_match"))
      return
    }

    busyRef.current = true
    setBusy(true)
    try {
      if (registerMode) await passwordRegister(username.trim(), password)
      else {
        const nextChallenge = await passwordLogin(username.trim(), password)
        if (nextChallenge) {
          setChallenge(nextChallenge)
          setPassword('')
          setConfirmation('')
          setVerificationCode('')
          setRecoveryMode(false)
          busyRef.current = false
          setBusy(false)
        }
      }
    } catch (caught) {
      busyRef.current = false
      setBusy(false)
      setError(caught instanceof ApiError ? caught.message : t("auth.network_error_try_again"))
    }
  }

  return (
    <div className="w-full max-w-[380px]">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <img
          src="/cloudnote-logo.webp"
          alt=""
          width={48}
          height={48}
          className="mb-3 size-12 rounded-[10px]"
        />
        <h2 className="text-[20px] font-bold tracking-tight text-[#1a2332]">
          {challenge
            ? t('auth.two_step_verification_description')
            : firstRun
              ? t("auth.create_owner_account")
              : registerMode
                ? t("auth.sign_up")
                : t("auth.sign_in")}
        </h2>
        {!challenge && (
          <p className="mt-1 text-[13px] text-[#6b7a8d]">
            {firstRun
              ? t("auth.create_the_owner_account_this_step_appears_only_once")
              : t("auth.between_the_paper_and_ink_the_pen_comes_to_life_an_inkstone_is_used_to_p")}
          </p>
        )}
      </div>

      {/* Form */}
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {challenge ? (
          <>
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-[#475569]">
              <KeyRound size={14} className="shrink-0 text-[#3b82f6]" />
              <span className="min-w-0 truncate">@{username.trim()}</span>
            </div>
            <FieldLabel label={recoveryMode ? t('auth.recovery_code') : t('auth.authenticator_code')} />
            <FormField
              value={verificationCode}
              maxLength={recoveryMode ? 24 : 8}
              onChange={(event) => setVerificationCode(
                recoveryMode
                  ? event.target.value.toUpperCase()
                  : event.target.value.replace(/\D/g, '').slice(0, 6),
              )}
              disabled={busy}
              placeholder={recoveryMode ? 'XXXX-XXXX-XXXX-XXXX' : '000000'}
              autoComplete={recoveryMode ? 'off' : 'one-time-code'}
              autoCapitalize={recoveryMode ? 'characters' : 'none'}
              inputMode={recoveryMode ? 'text' : 'numeric'}
              spellCheck={false}
              autoFocus
            />
          </>
        ) : (
          <>
            <div>
              <FieldLabel label={t("common.username")} required />
              <FormField
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={busy}
                placeholder={t("common.username")}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
              />
            </div>
            <div>
              <FieldLabel label={t("common.password")} required />
              <FormField
                type="password"
                value={password}
                maxLength={LIMITS.passwordMaxLength}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
                placeholder={registerMode ? t("auth.password_minimum_8_characters") : t("common.password")}
                autoComplete={registerMode ? 'new-password' : 'current-password'}
              />
            </div>
          </>
        )}
        {!challenge && registerMode && (
          <div>
            <FieldLabel label={t("auth.confirm_password")} required />
            <FormField
              type="password"
              value={confirmation}
              maxLength={LIMITS.passwordMaxLength}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={busy}
              placeholder={t("auth.confirm_password")}
              autoComplete="new-password"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className={cn(
            'mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg',
            'bg-[#3b82f6] text-[14px] font-semibold text-white',
            'transition-all duration-200 ease-out',
            'hover:bg-[#2563eb] active:translate-y-px disabled:opacity-50',
          )}
        >
          {busy && <Loader2 size={16} className="animate-[ink-spin_.7s_linear_infinite]" />}
          {challenge
            ? t('auth.verify_and_sign_in')
            : registerMode
              ? (firstRun ? t("auth.create_owner_account") : t("auth.sign_up"))
              : t("auth.sign_in")}
        </button>

        {challenge && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setChallenge(null)
                setVerificationCode('')
                setRecoveryMode(false)
                setError(null)
              }}
              className="inline-flex items-center gap-1 text-[12.5px] text-[#6b7a8d] transition-colors hover:text-[#3b82f6]"
            >
              <ArrowLeft size={12} />
              {t('auth.back_to_password')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setRecoveryMode((value) => !value)
                setVerificationCode('')
                setError(null)
              }}
              className="text-[12.5px] text-[#6b7a8d] transition-colors hover:text-[#3b82f6]"
            >
              {recoveryMode ? t('auth.use_authenticator_code') : t('auth.use_recovery_code')}
            </button>
          </div>
        )}
        {!challenge && showModeSwitch && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(registerMode ? 'login' : 'register')
              setError(null)
            }}
            className="mx-auto block text-[12.5px] text-[#6b7a8d] transition-colors hover:text-[#3b82f6]"
          >
            {registerMode ? t("auth.already_have_an_account_sign_in") : t("auth.no_account_create_one")}
          </button>
        )}
      </form>

      {(error || authError) && (
        <div role="alert" className="anim-rise mt-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5">
          <TriangleAlert size={14} className="mt-[1px] shrink-0 text-[#dc2626]" />
          <span className="text-[12.5px] leading-relaxed text-[#991b1b]">
            {error || authError}
          </span>
        </div>
      )}

      {site?.initialized && !site.registrationOpen && (
        <p className="mt-5 text-center text-[12px] leading-relaxed text-[#94a3b8]">
          {t("auth.this_is_a_private_instance_registration_is_closed_so_only_existing_accou")}
        </p>
      )}
    </div>
  )
}


function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[13px] font-medium text-[#334155]">
      {label}
      {required && <span className="ml-0.5 text-[#ef4444]">*</span>}
    </label>
  )
}


function FormField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'block h-10 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[14px] text-[#1e293b] outline-none',
        'placeholder:text-[#94a3b8]',
        'focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20',
        'transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
    />
  )
}
