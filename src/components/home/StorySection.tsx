import { useState } from 'react';
import { ArrowRight, Feather, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_BIO_BEATS } from '../../data/authorProfile';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';

export function StorySection() {
  const { lang } = useLanguage();
  const copy = getUiCopy(lang).story;
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  const activeBeat = AUTHOR_BIO_BEATS[activeBeatIndex] ?? AUTHOR_BIO_BEATS[0];

  return (
    <section
      id="chapter-story"
      data-bg-stage="4"
      data-snap-station
      aria-label="Notebook Genesis & Poet Story"
      className="relative flex min-h-[110svh] w-full items-center overflow-hidden py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
            <Feather className="h-3 w-3" />
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
            {lang === 'bn'
              ? '২০২৩ সালের শীত থেকে ২০২৪-এর বসন্ত অবধি ব্যক্তিগত অনুভবের খাতা থেকে জন্ম নেওয়া পঙ্‌ক্তিমালা।'
              : 'Manuscript notes spanning winter 2023 to spring 2024, preserved in unembellished verse.'}
          </p>
        </div>

        {/* Multi-Beat Narrative Interactive Layout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column (5 cols): Story Beats Selector */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            {AUTHOR_BIO_BEATS.map((beat, idx) => {
              const isActive = idx === activeBeatIndex;
              return (
                <button
                  key={beat.id}
                  type="button"
                  onClick={() => setActiveBeatIndex(idx)}
                  className={`text-left rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? 'border-[#DFBC91]/60 bg-[#2C3442]/90 shadow-[0_12px_32px_rgba(15,18,24,0.3)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isActive ? 'text-[#DFBC91]' : 'text-[#F6F4EF]/60'}>
                      {beat.label[lang]}
                    </span>
                    <span className="text-[11px] text-[#F6F4EF]/50">
                      {beat.motifTitle[lang]}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-[#F6F4EF]">
                    {beat.motifTitle[lang]}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-[#F6F4EF]/70">
                    {beat.paragraph[lang]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column (7 cols): Tactile Manuscript Ledger Detail */}
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-[#262E3B]/90 to-[#1B212B]/95 p-8 shadow-[0_24px_64px_rgba(15,18,24,0.35)] backdrop-blur-xl lg:col-span-7 md:p-12">
            {/* Subtle Ruled Manuscript Lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 31px, rgba(246,244,239,0.3) 31px, rgba(246,244,239,0.3) 32px)',
              }}
            />

            <div className="relative z-10">
              {/* Beat Index Marker */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#DFBC91] font-semibold">
                  {activeBeat.label[lang]}
                </span>
                <span className="text-[#F6F4EF]/60">
                  {lang === 'bn' ? 'পাণ্ডুলিপি খসড়া' : 'Archival Manuscript'}
                </span>
              </div>

              {/* Beat Heading */}
              <h3
                className={`mt-4 text-2xl font-semibold md:text-3xl text-[#F6F4EF] ${
                  lang === 'bn' ? 'font-bn-display' : 'font-display'
                }`}
              >
                {activeBeat.motifTitle[lang]}
              </h3>

              {/* Full Paragraph */}
              <p className="mt-5 text-base leading-[1.9] text-[#F6F4EF]/85 md:text-[1.05rem]">
                {activeBeat.paragraph[lang]}
              </p>

              {/* Authentic Callout / Quote */}
              <div className="my-8 rounded-2xl border border-white/12 bg-black/25 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-[#DFBC91]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'মূল উচ্চারণ' : 'Key Note'}</span>
                </div>
                <p
                  lang="bn"
                  className="font-bn-verse mt-3 text-lg leading-[1.8] text-[#F6F4EF] md:text-xl"
                >
                  {activeBeat.callout[lang]}
                </p>
              </div>

              {/* Bottom CTA to View All Poems */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#F6F4EF]/60">
                  {lang === 'bn'
                    ? 'অনন্যা হাসানের ১০টি কবিতা পড়তে প্রবেশ করুন'
                    : 'Read all 10 poems in the collection'}
                </span>

                <TransitionLink
                  to="/poems"
                  className="glass-light inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] transition-all duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.cta}</span>
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
