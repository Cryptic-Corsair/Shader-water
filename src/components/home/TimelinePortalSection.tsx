import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Calendar, Check, Copy, Mail, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE, POET_TIMELINE_MILESTONES } from '../../data/authorProfile';
import { getUiCopy } from '../../data/uiCopy';
import { useMagnetic } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';

export function TimelinePortalSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const portalBtnRef = useRef<HTMLAnchorElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).timeline;

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(
    POET_TIMELINE_MILESTONES[0].id
  );
  const [copied, setCopied] = useState(false);

  useMagnetic(portalBtnRef, 0.22);
  useMagnetic(copyBtnRef, 0.18);

  const activeMilestone = useMemo(
    () =>
      POET_TIMELINE_MILESTONES.find((m) => m.id === activeMilestoneId) ??
      POET_TIMELINE_MILESTONES[0],
    [activeMilestoneId]
  );

  const handleCopyEmail = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);

    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard
          .writeText(AUTHOR_PROFILE.contactEmail)
          .catch(() => {});
        return;
      }
      const tmp = document.createElement('textarea');
      tmp.value = AUTHOR_PROFILE.contactEmail;
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    } catch {
      // Fallback
    }
  };

  return (
    <section
      id="chapter-timeline"
      ref={sectionRef}
      data-bg-stage="6"
      data-snap-station
      aria-label="Poem Chronological Ledger and Correspondence Portal"
      className="relative flex min-h-[120svh] w-full flex-col justify-center overflow-hidden py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
            <Calendar className="h-3 w-3" />
            <span>{copy.eyebrow}</span>
          </div>
          <h2
            className={`font-display display-luminous mt-3 text-3xl font-semibold md:text-5xl ${
              lang === 'bn' ? 'font-bn-display' : ''
            }`}
          >
            {copy.heading}
          </h2>
          <p className="mt-4 text-sm leading-[1.8] text-[#F6F4EF]/75 md:text-base">
            {copy.description}
          </p>
        </div>

        {/* Chronological Ledger & Interactive Inspection Deck */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column (6 cols): Milestone Chronological List */}
          <div className="flex flex-col gap-2.5 lg:col-span-6">
            {POET_TIMELINE_MILESTONES.map((item) => {
              const isActive = item.id === activeMilestoneId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMilestoneId(item.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-[#DFBC91]/60 bg-[#29323F]/90 shadow-[0_8px_24px_rgba(15,18,24,0.3)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-xs font-medium ${
                        isActive ? 'text-[#DFBC91]' : 'text-[#F6F4EF]/60'
                      }`}
                    >
                      {item.yearLabel[lang]}
                    </span>
                    <span
                      lang="bn"
                      className={`text-base font-semibold transition-colors ${
                        isActive ? 'text-[#F6F4EF]' : 'text-[#F6F4EF]/85'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xs text-[#DFBC91]/80">
                    {item.location[lang]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column (6 cols): Selected Milestone Preview Card & Correspondence */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            {/* Active Milestone Card */}
            <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#262E3B]/90 via-[#212732]/92 to-[#191F28]/95 p-8 shadow-[0_24px_64px_rgba(15,18,24,0.35)] backdrop-blur-xl md:p-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#DFBC91] font-semibold">
                  {activeMilestone.yearLabel[lang]}
                </span>
                <span className="text-[#F6F4EF]/60">
                  {activeMilestone.kindLabel[lang]}
                </span>
              </div>

              <h3
                lang="bn"
                className="font-bn-display mt-4 text-2xl font-semibold text-[#F6F4EF] md:text-3xl"
              >
                {activeMilestone.title}
              </h3>

              <p className="mt-4 text-sm leading-[1.85] text-[#F6F4EF]/80 md:text-base">
                {activeMilestone.citation[lang]}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#F6F4EF]/60">
                <span>{activeMilestone.location[lang]}</span>
                <TransitionLink
                  to="/poems"
                  className="inline-flex items-center gap-1.5 font-medium text-[#DFBC91] hover:underline"
                >
                  <span>{lang === 'bn' ? 'কবিতাগারে দেখুন' : 'View in Archive'}</span>
                  <ArrowRight className="h-3 w-3" />
                </TransitionLink>
              </div>
            </div>

            {/* Correspondence Desk & Portal Gateway */}
            <div className="rounded-3xl border border-white/16 bg-[#1D2430]/90 p-8 shadow-xl backdrop-blur-xl md:p-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
                <Mail className="h-3.5 w-3.5" />
                <span>{copy.correspondenceLabel}</span>
              </div>

              <h4
                className={`mt-2 text-xl font-semibold text-[#F6F4EF] md:text-2xl ${
                  lang === 'bn' ? 'font-bn-display' : 'font-display'
                }`}
              >
                {AUTHOR_PROFILE.contactEmail}
              </h4>

              <p className="mt-2 text-xs leading-[1.7] text-[#F6F4EF]/70 md:text-sm">
                {lang === 'bn'
                  ? 'কবিতা, সাহিত্য আলোচনা ও ব্যক্তিগত পাঠালোচনার জন্য সরাসরি যোগাযোগ করুন।'
                  : 'For literary inquiries, reading correspondence, and edition notes.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  ref={copyBtnRef}
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-medium text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{copy.copiedEmail}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copy.copyEmail}</span>
                    </>
                  )}
                </button>

                <TransitionLink
                  ref={portalBtnRef}
                  to="/poems"
                  className="glass-light inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold text-[#171A21] shadow-md transition-all duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{copy.exploreAll}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </TransitionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
