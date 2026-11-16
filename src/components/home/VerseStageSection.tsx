import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  formatReadingTime,
  getCycleLabel,
  toBanglaNumerals,
} from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { usePoemNarration } from '../../hooks/usePoemNarration';
import { buildExcerptNarrationQueue } from '../../lib/poemSpeech';
import { TransitionLink } from '../PageTransition';
import { getRibbonFragments } from './versesLogic';
import {
  getFeaturedStanzaLines,
  getStageFeaturedPoems,
} from './verseStageData';

export function VerseStageSection() {
  const { lang } = useLanguage();
  const ui = getUiCopy(lang);
  const copy = ui.verseStage;
  const narrationCopy = ui.narration;

  const featuredPoems = useMemo(() => getStageFeaturedPoems(4), []);
  const ribbonFragments = useMemo(() => getRibbonFragments(), []);
  const bottomFragments = useMemo(
    () => [...ribbonFragments.slice(4), ...ribbonFragments.slice(0, 4)],
    [ribbonFragments]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeaturedPoem = featuredPoems[activeIndex];

  const activeExcerptLines = useMemo(
    () =>
      activeFeaturedPoem
        ? getFeaturedStanzaLines(activeFeaturedPoem.slug, 3)
        : [],
    [activeFeaturedPoem]
  );

  const excerptQueue = useMemo(
    () => buildExcerptNarrationQueue(activeExcerptLines),
    [activeExcerptLines]
  );

  const narration = usePoemNarration({
    queue: excerptQueue,
    resetKey: activeFeaturedPoem?.slug ?? '',
  });

  const total = featuredPoems.length;

  const handlePrev = useCallback(() => {
    narration.stop();
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [narration, total]);

  const handleNext = useCallback(() => {
    narration.stop();
    setActiveIndex((prev) => (prev + 1) % total);
  }, [narration, total]);

  const handleToggleNarration = () => {
    if (narration.isSpeaking) {
      if (narration.isPaused) {
        narration.resume();
      } else {
        narration.pause();
      }
    } else {
      narration.speak();
    }
  };

  const handleStopNarration = () => {
    narration.stop();
  };

  return (
    <section
      id="chapter-verse-stage"
      data-bg-stage="5"
      data-snap-station
      aria-label="Kinetic Verse Stage and Audio Narration"
      className="relative flex min-h-[125svh] w-full flex-col justify-center overflow-hidden py-24 text-[#F6F4EF] md:py-36"
    >
      {/* Top Kinetic Drifting Ribbon */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative mb-10 w-full overflow-hidden opacity-35 select-none"
      >
        <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-8">
          {[...ribbonFragments, ...ribbonFragments].map((frag, idx) => (
            <span
              key={idx}
              lang="bn"
              className="font-bn-verse text-lg tracking-wide text-[#DFBC91] whitespace-nowrap"
            >
              {frag} ·
            </span>
          ))}
        </div>
      </div>

      {/* Main Amphitheater Stage */}
      <div className="relative z-10 mx-auto w-full max-w-[76rem] px-6 md:px-10">
        {/* Stage Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
              <Sparkles className="h-3 w-3" />
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

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={copy.prevAria}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <span className="font-mono text-xs text-[#DFBC91]">
              {lang === 'bn'
                ? `${toBanglaNumerals(activeIndex + 1)} / ${toBanglaNumerals(total)}`
                : `0${activeIndex + 1} / 0${total}`}
            </span>

            <button
              type="button"
              onClick={handleNext}
              aria-label={copy.nextAria}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Featured Poem Card with Audio Narration Deck */}
        {activeFeaturedPoem && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#29323F]/90 via-[#212833]/92 to-[#191F28]/95 p-8 shadow-[0_24px_64px_rgba(15,18,24,0.35)] backdrop-blur-xl md:p-12">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-medium text-[#DFBC91]">
                {getCycleLabel(activeFeaturedPoem.collection, lang)}
              </span>
              <div className="flex items-center gap-2 text-[#F6F4EF]/65">
                <span>{activeFeaturedPoem.dateDisplay}</span>
                <span>·</span>
                <span>{formatReadingTime(activeFeaturedPoem.readingSeconds, lang)}</span>
              </div>
            </div>

            {/* Poem Title */}
            <h3
              lang="bn"
              className="font-bn-display mt-4 text-3xl font-semibold text-[#F6F4EF] md:text-4xl"
            >
              {activeFeaturedPoem.title}
            </h3>

            {/* Verbatim Bengali Stanza Excerpt with Karaoke/Line Focus */}
            <div className="my-8 rounded-2xl border border-white/10 bg-black/25 p-6 md:p-8">
              <div className="space-y-3 font-bn-verse text-[clamp(1.25rem,2.1vw,1.85rem)] leading-[1.8]">
                {activeExcerptLines.map((line, lineIdx) => {
                  const isCurrentSpokenLine =
                    narration.isSpeaking &&
                    narration.activeCoordinate?.lineIndex === lineIdx;

                  return (
                    <p
                      key={lineIdx}
                      lang="bn"
                      className={`transition-colors duration-300 ${
                        isCurrentSpokenLine
                          ? 'text-[#DFBC91] font-medium drop-shadow-[0_0_12px_rgba(223,188,145,0.4)]'
                          : 'text-[#F6F4EF]/90'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Audio Narration Engine Deck */}
            <div className="flex flex-col gap-6 rounded-2xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-md md:flex-row md:items-center md:justify-between">
              {/* Playback Controls & Waveform */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleNarration}
                  aria-label={
                    narration.isSpeaking
                      ? narration.isPaused
                        ? narrationCopy.resumeAria
                        : narrationCopy.pauseAria
                      : narrationCopy.listenAria
                  }
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#DFBC91] px-5 py-2.5 text-xs font-semibold text-[#171A21] shadow-md transition-all duration-200 hover:bg-[#ebd0ad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {narration.isSpeaking && !narration.isPaused ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>{narrationCopy.pause}</span>
                    </>
                  ) : narration.isSpeaking && narration.isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{narrationCopy.resume}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{narrationCopy.listen}</span>
                    </>
                  )}
                </button>

                {narration.isSpeaking && (
                  <button
                    type="button"
                    onClick={handleStopNarration}
                    aria-label={narrationCopy.stopAria}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#F6F4EF] hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{narrationCopy.stop}</span>
                  </button>
                )}

                {/* Animated Speech Waveform Indicator */}
                <div className="flex items-center gap-1 px-2" aria-hidden="true">
                  {[12, 20, 16, 24, 14, 22, 10].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        height: narration.isSpeaking && !narration.isPaused ? `${h}px` : '4px',
                        transition: 'height 250ms ease-in-out',
                      }}
                      className="w-1 rounded-full bg-[#DFBC91]/80"
                    />
                  ))}
                </div>

                {/* Voice Status Text */}
                <div className="flex items-center gap-1.5 text-xs text-[#F6F4EF]/75">
                  <Headphones className="h-3.5 w-3.5 text-[#DFBC91]" />
                  <span>
                    {narration.hasBengaliVoice
                      ? lang === 'bn' ? 'বাংলা কণ্ঠস্বর প্রস্তুত' : 'Bengali Voice Ready'
                      : lang === 'bn' ? 'ছন্দোময় পঙ্‌ক্তি পাঠ' : 'Paced Verse Guide'}
                  </span>
                </div>
              </div>

              {/* Speed Rate Control */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#F6F4EF]/60">
                  {lang === 'bn' ? 'গতি:' : 'Rate:'}
                </span>
                <div className="flex items-center gap-1">
                  {([0.75, 0.85, 1, 1.15] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => narration.setRate(r)}
                      aria-pressed={narration.rate === r}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                        narration.rate === r
                          ? 'bg-[#DFBC91] text-[#171A21]'
                          : 'text-[#F6F4EF]/70 hover:bg-white/10 hover:text-[#F6F4EF]'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-[#F6F4EF]/60">
                {copy.hint}
              </span>

              <TransitionLink
                to={`/poems/${activeFeaturedPoem.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-xs font-semibold text-[#F6F4EF] backdrop-blur-md transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.readFull}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </TransitionLink>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Kinetic Drifting Ribbon */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative mt-10 w-full overflow-hidden opacity-35 select-none"
      >
        <div className="flex w-max animate-[marquee-reverse_45s_linear_infinite] gap-8">
          {[...bottomFragments, ...bottomFragments].map((frag, idx) => (
            <span
              key={idx}
              lang="bn"
              className="font-bn-verse text-lg tracking-wide text-[#F6F4EF] whitespace-nowrap"
            >
              {frag} ·
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
