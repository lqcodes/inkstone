import { BookOpen, Cloud, Lock, RefreshCw, Shield, Smartphone } from 'lucide-react'
import { t } from '../../lib/i18n'

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-[#f5f7fa]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-4 sm:h-14 sm:px-5 md:px-8">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img src="/cloudnote-logo.webp" alt="" width={28} height={28} className="size-6 rounded-[5px] sm:size-7 sm:rounded-[6px]" />
            <span className="text-[14px] font-bold tracking-tight text-[#1a2332] sm:text-[16px]">
              {t("common.product_name")}
            </span>
          </div>
          <button
            onClick={onLogin}
            className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2563eb] sm:px-4 sm:text-[13px]"
          >
            {t("auth.sign_in")}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-10 text-center sm:px-5 sm:pt-20 sm:pb-16 md:px-8 md:pt-28 md:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-20%] size-[500px] -translate-x-1/2 rounded-full bg-[#3b82f6] opacity-[0.06] blur-[100px] sm:size-[700px] sm:blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[640px]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3b82f6] sm:mb-3 sm:text-[12px]">
            cloudnote.cc
          </p>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#1a2332] sm:text-[36px] md:text-[48px] md:leading-[1.15]">
            {t("landing.hero_title")}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#64748b] sm:mt-5 sm:text-[16px] md:text-[18px]">
            {t("landing.hero_description")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8">
            <button
              onClick={onLogin}
              className="rounded-lg bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all hover:bg-[#2563eb] hover:shadow-[0_4px_16px_rgba(59,130,246,0.35)] sm:px-6 sm:py-2.5 sm:text-[14px]"
            >
              {t("landing.get_started")}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-10 sm:px-5 sm:py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[960px]">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8] sm:text-[11px]">
            {t("landing.features_label")}
          </p>
          <h2 className="mb-8 text-center text-[22px] font-bold tracking-tight text-[#1a2332] sm:mb-12 sm:text-[26px] md:text-[30px]">
            {t("landing.features_title")}
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen size={22} />}
              title={t("landing.feature_markdown_title")}
              desc={t("landing.feature_markdown_desc")}
            />
            <FeatureCard
              icon={<RefreshCw size={22} />}
              title={t("landing.feature_sync_title")}
              desc={t("landing.feature_sync_desc")}
            />
            <FeatureCard
              icon={<Cloud size={22} />}
              title={t("landing.feature_backup_title")}
              desc={t("landing.feature_backup_desc")}
            />
            <FeatureCard
              icon={<Shield size={22} />}
              title={t("landing.feature_private_title")}
              desc={t("landing.feature_private_desc")}
            />
            <FeatureCard
              icon={<Smartphone size={22} />}
              title={t("landing.feature_mobile_title")}
              desc={t("landing.feature_mobile_desc")}
            />
            <FeatureCard
              icon={<Lock size={22} />}
              title={t("landing.feature_security_title")}
              desc={t("landing.feature_security_desc")}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white px-4 py-8 sm:px-5 sm:py-10 md:px-8">
        <div className="mx-auto flex max-w-[960px] flex-col items-center gap-3 text-center sm:gap-4">
          <div className="flex items-center gap-2">
            <img src="/cloudnote-logo.webp" alt="" width={24} height={24} className="size-5 rounded-[4px] sm:size-6 sm:rounded-[5px]" />
            <span className="text-[13px] font-bold text-[#1a2332] sm:text-[14px]">{t("common.product_name")}</span>
          </div>
          <p className="text-[11.5px] font-medium text-[#64748b] sm:text-[12.5px]">
            {t("auth.self_hosted_on_cloudflare_workers_your_data_is_yours")}
          </p>
          <p className="text-[11px] font-medium text-[#94a3b8] sm:text-[12px]">
            &copy; {new Date().getFullYear()} cloudnote.cc
          </p>
        </div>
      </footer>
    </div>
  )
}


function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="mb-2.5 inline-flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#3b82f6] sm:mb-3 sm:size-10">
        {icon}
      </div>
      <h3 className="mb-1 text-[13.5px] font-semibold text-[#1e293b] sm:mb-1.5 sm:text-[14.5px]">{title}</h3>
      <p className="text-[12px] leading-relaxed text-[#64748b] sm:text-[13px]">{desc}</p>
    </div>
  )
}
