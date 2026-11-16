import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  POEM_CYCLES,
  getCollections,
  getCycleLabel,
  toBanglaNumerals,
  type CycleId,
} from '../../data/poemsCatalog';
import { usePageTransition } from '../PageTransition';
import { useMagnetic } from '../../lib/motion';

interface VolumeArtworkProps {
  cycleId: CycleId;
}

function VolumeArtwork({ cycleId }: VolumeArtworkProps) {
  const meta = POEM_CYCLES[cycleId];
  const [c0, c1, c2] = meta.horizonColors;

  return (
    <div
      aria-hidden="true"
      className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/20 sm:h-52 md:h-60"
      style={{
        background: `radial-gradient(90% 80% at 20% 25%, ${c2}50 0%, transparent 65%), linear-gradient(145deg, ${c0} 0%, ${c1} 60%, ${c2}90 100%)`,
      }}
    >
      {/* Luminous Sun/Moon Orb */}
      <div
        className="pointer-events-none absolute right-[15%] top-[15%] h-16 w-16 rounded-full blur-[1px] md:h-20 md:w-20"
        style={{
          background: `radial-gradient(circle, ${c2} 0%, rgba(255,255,255,0.4) 60%, transparent 100%)`,
          opacity: 0.55,
        }}
      />
      {/* Decorative Wave Horizon SVG */}
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        <line
          x1="0"
          y1="90"
          x2="600"
          y2="90"
          stroke="rgba(246, 244, 239, 0.2)"
          strokeWidth="0.75"
        />
        <path
          d="M 0 110 Q 150 85, 300 110 T 600 110"
          stroke="rgba(246, 244, 239, 0.65)"
          strokeWidth="1.25"
        />
        <path
          d="M 0 135 Q 150 160, 300 135 T 600 135"
          stroke={c2}
          strokeOpacity="0.8"
          strokeWidth="1.1"
        />
        <path
          d="M 0 160 Q 150 140, 300 160 T 600 160"
          stroke="rgba(246, 244, 239, 0.3)"
          strokeWidth="0.8"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

export function CollectionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).carousel;
  const cycleIds = getCollections();
  const [activeCycle, setActiveCycle] = useState<CycleId>(cycleIds[0]);

  const { navigateWithTransition } = usePageTransition();

  useMagnetic(prevBtnRef, 0.2);
  useMagnetic(nextBtnRef, 0.2);

  const currentIndex = cycleIds.indexOf(activeCycle);

  const handlePrev = useCallback(() => {
    const nextIdx = (currentIndex - 1 + cycleIds.length) % cycleIds.length;
    setActiveCycle(cycleIds[nextIdx]);
  }, [currentIndex, cycleIds]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % cycleIds.length;
    setActiveCycle(cycleIds[nextIdx]);
  }, [currentIndex, cycleIds]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const currentMeta = POEM_CYCLES[activeCycle];

  const handleOpenCycle = (cycleId: CycleId) => {
    navigateWithTransition(
      `/poems?cycle=${cycleId}`,
      getCycleLabel(cycleId, lang)
    );
  };

  return (
    <section
      id="chapter-cycles"
      ref={sectionRef}
      data-bg-stage="3"
      data-snap-station
      aria-label="Published Poetry Cycles Showcase"
      className="relative flex min-h-[115svh] w-full items-center overflow-hidden py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        {/* Section Header with Segmented Tab Controls */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
              <Layers className="h-3 w-3" />
              <span>{copy.eyebrow}</span>
            </div>
            <h2
              className={`font-display display-luminous mt-3 text-3xl font-semibold md:text-5xl ${
                lang === 'bn' ? 'font-bn-display' : ''
              }`}
            >
              {copy.heading}
            </h2>
          </div>

          {/* Interactive Navigation Cluster */}
          <div className="flex items-center gap-3">
            <button
              ref={prevBtnRef}
              type="button"
              onClick={handlePrev}
              aria-label={copy.prevAria}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              ref={nextBtnRef}
              type="button"
              onClick={handleNext}
              aria-label={copy.nextAria}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Volume Selector Tabs */}
        <div
          role="tablist"
          aria-label="Poetic volumes"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md"
        >
          {cycleIds.map((id, idx) => {
            const isActive = id === activeCycle;
            const volNum = lang === 'bn' ? toBanglaNumerals(idx + 1) : `0${idx + 1}`;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveCycle(id)}
                className={`flex-1 min-w-[140px] cursor-pointer rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#DFBC91] text-[#171A21] shadow-[0_4px_16px_rgba(223,188,145,0.25)]'
                    : 'text-[#F6F4EF]/75 hover:bg-white/[0.06] hover:text-[#F6F4EF]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono opacity-70">{volNum}</span>
                  <span className="font-semibold">{getCycleLabel(id, lang)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hero Volume Display Card */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Volume Horizon Artwork (5 cols) */}
          <div className="lg:col-span-5">
            <VolumeArtwork cycleId={activeCycle} />
          </div>

          {/* Right: Volume Details & Key Couplet (7 cols) */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/18 bg-[#252C38]/85 p-8 shadow-[0_24px_64px_rgba(15,18,24,0.3)] backdrop-blur-xl lg:col-span-7 md:p-10">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#DFBC91] font-medium tracking-wide">
                  {lang === 'bn' ? currentMeta.yearsBn : currentMeta.yearsEn}
                </span>
                <span className="text-[#F6F4EF]/60">
                  {activeCycle === 'twilight-sky'
                    ? lang === 'bn' ? '৪টি কবিতা' : '4 Poems'
                    : activeCycle === 'masks-reality'
                      ? lang === 'bn' ? '২টি কবিতা' : '2 Poems'
                      : lang === 'bn' ? '৪টি কবিতা' : '4 Poems'}
                </span>
              </div>

              <h3
                className={`mt-3 text-2xl font-semibold md:text-3xl text-[#F6F4EF] ${
                  lang === 'bn' ? 'font-bn-display' : 'font-display'
                }`}
              >
                {getCycleLabel(activeCycle, lang)}
              </h3>

              <p className="mt-2 text-sm leading-[1.7] text-[#F6F4EF]/75 md:text-base">
                {lang === 'bn' ? currentMeta.taglineBn : currentMeta.taglineEn}
              </p>

              {/* Signature Couplet in Bengali */}
              <div className="my-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p
                  lang="bn"
                  className="font-bn-verse text-[clamp(1.15rem,1.7vw,1.55rem)] leading-[1.8] text-[#DFBC91]"
                >
                  <span className="block">{currentMeta.couplet[0]}</span>
                  <span className="block">{currentMeta.couplet[1]}</span>
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-[#F6F4EF]/60">
                {copy.hint}
              </span>

              <button
                type="button"
                onClick={() => handleOpenCycle(activeCycle)}
                className="inline-flex items-center gap-2 rounded-full bg-[#DFBC91] px-6 py-3 text-xs font-semibold text-[#171A21] shadow-md transition-all duration-200 hover:bg-[#ecd0ad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{copy.openCycle}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
