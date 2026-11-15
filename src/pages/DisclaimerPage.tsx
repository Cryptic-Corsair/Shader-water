import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Scale } from 'lucide-react';
import { TransitionLink } from '../components/PageTransition';
import { useLanguage } from '../context/LanguageContext';
import { AUTHOR_PROFILE } from '../data/authorProfile';
import { LEGAL_COPY } from '../data/legalCopy';
import { getUiCopy } from '../data/uiCopy';

export function DisclaimerPage() {
  const { lang } = useLanguage();
  const ui = getUiCopy(lang);
  const copy = LEGAL_COPY[lang];
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    document.title = `${copy.title} — ${ui.brand}`;
  }, [copy.title, ui.brand]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(AUTHOR_PROFILE.contactEmail);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <div
      data-bg-stage="4"
      data-testid="disclaimer-page"
      className="relative z-10 min-h-screen overflow-x-clip px-6 pt-28 pb-24 text-[#F6F4EF] md:px-10 md:pt-32"
    >
      <div className="mx-auto max-w-[82rem]">
        {/* Editorial Page Header */}
        <header className="border-b border-white/16 pb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#DFBC91]">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{copy.eyebrow}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#B2C2D4]">{copy.effectiveDate}</span>
          </div>

          <h1
            lang={lang}
            className="font-display display-luminous mt-4 max-w-4xl text-[clamp(2.2rem,4.5vw,3.75rem)] leading-[1.2] font-semibold"
          >
            {copy.title}
          </h1>

          <p
            lang={lang}
            className="mt-5 max-w-3xl text-base leading-[1.85] text-[#F6F4EF]/84 md:text-[1.08rem]"
          >
            {copy.lead}
          </p>
        </header>

        {/* Two-Column Literary Monograph Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10">
          {/* Primary Legal & Disclaimer Sections */}
          <div className="space-y-6">
            {copy.sections.map((section) => (
              <section
                key={section.id}
                id={`legal-${section.id}`}
                data-testid={`legal-section-${section.id}`}
                className="glass-dusk rounded-[26px] p-7 md:p-9"
              >
                <p className="text-xs font-semibold text-[#DFBC91]">
                  {section.eyebrow}
                </p>
                <h2
                  lang={lang}
                  className="font-editorial-serif mt-2.5 text-2xl font-medium text-[#FAF0E8] md:text-[1.75rem]"
                >
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3.5 border-t border-white/14 pt-4">
                  {section.paragraphs.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      lang={lang}
                      className="text-[15px] leading-[1.88] text-[#F6F4EF]/88"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Correspondence & Navigation Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="glass-dusk rounded-[26px] p-6 md:p-7">
              <p className="text-xs font-semibold text-[#DFBC91]">
                {copy.effectiveLabel}
              </p>
              <h2
                lang={lang}
                className="font-editorial-serif mt-2 text-xl font-medium text-[#FAF0E8]"
              >
                {copy.correspondenceHeading}
              </h2>
              <p
                lang={lang}
                className="mt-3 text-sm leading-[1.8] text-[#F6F4EF]/82"
              >
                {copy.correspondenceBody}
              </p>

              <div className="mt-5 border-t border-white/14 pt-4">
                <a
                  href={`mailto:${AUTHOR_PROFILE.contactEmail}`}
                  className="block break-all text-sm font-medium text-[#FAF0E8] underline decoration-[#DFBC91]/55 underline-offset-4 transition-colors hover:text-[#DFBC91]"
                >
                  {AUTHOR_PROFILE.contactEmail}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  data-testid="legal-copy-email"
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/24 bg-white/10 px-4 py-2 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  {copiedEmail ? (
                    <Check className="h-3.5 w-3.5 text-[#DFBC91]" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#DFBC91]" aria-hidden="true" />
                  )}
                  <span>
                    {copiedEmail ? copy.copiedEmailLabel : copy.copyEmailLabel}
                  </span>
                </button>
              </div>
            </div>

            <div className="glass-dusk rounded-[26px] p-6 md:p-7">
              <div className="flex flex-col gap-3">
                <TransitionLink
                  to="/poems"
                  className="glass-light inline-flex items-center justify-between rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.openArchiveLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </TransitionLink>

                <TransitionLink
                  to="/"
                  className="inline-flex items-center justify-between rounded-full border border-white/24 bg-white/[0.06] px-5 py-2.5 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.backHomeLabel}</span>
                  </span>
                </TransitionLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
