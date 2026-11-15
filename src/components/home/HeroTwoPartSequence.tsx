import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useAmbientSound } from '../../context/AmbientSoundContext';
import { useLanguage } from '../../context/LanguageContext';
import type { CycleId } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  isTouchDevice,
  prefersReducedMotion,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { HeroKineticAstrolabe } from '../hero/HeroKineticAstrolabe';
import {
  HeroMonsoonCanvas,
  type RippleImpulse,
} from '../hero/HeroMonsoonCanvas';
import { splitHeadlineLines } from '../hero/heroAtmosphereMath';
import { HERO_STANZA } from '../hero/heroData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroTwoPartSequence() {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const scrollPromptRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const { isPlaying: soundActive } = useAmbientSound();
  const copy = getUiCopy(lang);
  const { scrollToElement } = useSmoothScroll();

  const [activeCycle, setActiveCycle] = useState<CycleId>('twilight-sky');
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useMagnetic(primaryCtaRef, 0.2);
  useMagnetic(scrollPromptRef, 0.18);

  // Damped cursor physics across separate depth planes
  const rawPointerX = useMotionValue(0);
  const rawPointerY = useMotionValue(0);
  const pointerX = useSpring(rawPointerX, { stiffness: 80, damping: 24 });
  const pointerY = useSpring(rawPointerY, { stiffness: 80, damping: 24 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const rippleImpulseRef = useRef<RippleImpulse | null>(null);
  const rippleCounterRef = useRef(0);

  const poetryParallaxX = useTransform(pointerX, [-0.5, 0.5], [5, -5]);
  const poetryParallaxY = useTransform(pointerY, [-0.5, 0.5], [4, -4]);

  // Scrollytelling: bind hero scroll progress [0..1] to gentle upward drift & atmosphere dissolve
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const poemScrollY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const poemScrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    [1, 0.28, 0.14]
  );
  const mistScrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    [1, 0.18, 0]
  );
  const astrolabeScrollY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const astrolabeScrollScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1.05]
  );

  const handleHeroPointerMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || isTouchDevice()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const normX = (event.clientX - rect.left) / rect.width - 0.5;
    const normY = (event.clientY - rect.top) / rect.height - 0.5;
    rawPointerX.set(normX);
    rawPointerY.set(normY);
    pointerTargetRef.current = { x: normX, y: normY };
  };

  const handleHeroPointerLeave = () => {
    rawPointerX.set(0);
    rawPointerY.set(0);
    pointerTargetRef.current = { x: 0, y: 0 };
  };

  const handleHeroClick = (event: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('a, button')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rippleCounterRef.current += 1;
    rippleImpulseRef.current = {
      id: rippleCounterRef.current,
      xRatio: Math.max(0.05, Math.min(0.95, (event.clientX - rect.left) / rect.width)),
      yRatio: Math.max(0.55, Math.min(0.96, (event.clientY - rect.top) / rect.height)),
    };
  };

  const headlineLines = splitHeadlineLines(copy.hero.headline, lang);

  return (
    <div ref={sequenceRef} className="relative w-full">
      <section
        id="chapter-1"
        ref={heroSectionRef}
        data-bg-stage="0"
        data-snap-station
        data-sound-active={soundActive ? 'true' : 'false'}
        aria-label="Opening verse"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
        onClick={handleHeroClick}
        className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden px-6 pt-21 pb-8 text-[#F6F4EF] md:px-10 md:pt-28 md:pb-10"
      >
        {/* Layer 1: Archival Tactile Paper & Dusk Grain */}
        <div
          data-testid="hero-paper-grain"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperFiber'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperFiber)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
          }}
        />

        {/* Layer 2: Ambient Motion Graphics Canvas (Mist, Horizon Waves, Ripples & Monsoon Rain) */}
        <motion.div
          aria-hidden="true"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75, ease: CONTEMPLATIVE_EASE }}
          style={reducedMotion ? undefined : { opacity: mistScrollOpacity }}
          className="pointer-events-none absolute inset-0 z-[2]"
        >
          <HeroMonsoonCanvas
            soundActive={soundActive}
            pointerTargetRef={pointerTargetRef}
            rippleImpulseRef={rippleImpulseRef}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(58% 54% at 76% 44%, rgba(223, 188, 145, 0.11) 0%, rgba(178, 194, 212, 0.05) 48%, transparent 74%)',
            }}
          />
        </motion.div>

        {/* Main 12-Col Editorial Composition (Foreground Poetry Left + Kinetic Astrolabe Right) */}
        <div className="relative z-10 mx-auto grid w-full max-w-[82rem] flex-1 items-center gap-7 py-2 md:gap-10 md:py-4 lg:grid-cols-12">
          {/* Left 7 Cols: Choreographed Editorial Typography & Verbatim Bengali Couplet */}
          <motion.div
            style={
              reducedMotion
                ? undefined
                : {
                    y: poemScrollY,
                    opacity: poemScrollOpacity,
                    x: poetryParallaxX,
                  }
            }
            className="relative z-20 will-change-transform lg:col-span-7"
          >
            <motion.div
              style={reducedMotion ? undefined : { y: poetryParallaxY }}
            >
              {/* Clean unboxed eyebrow metadata */}
              <motion.p
                key={`hero-sub-${lang}`}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: CONTEMPLATIVE_EASE,
                }}
                className="mb-4 text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase"
              >
                {copy.collectedSubtitle}
              </motion.p>

              {/* Main Display Headline with Bengali Conjunct-Safe Line Mask Reveal */}
              <h1
                key={`hero-h1-${lang}`}
                lang={lang}
                className={`font-display display-luminous max-w-4xl font-semibold ${
                  lang === 'bn'
                    ? 'font-bn-display text-[clamp(2.15rem,4.7vw,4.25rem)] leading-[1.36]'
                    : 'text-[clamp(2.25rem,4.65vw,4.25rem)] leading-[1.1] tracking-[-0.03em]'
                }`}
              >
                {headlineLines.map((line, index) => (
                  <span
                    key={`${lang}-line-${index}`}
                    className="block overflow-hidden py-[0.22em] -my-[0.22em]"
                  >
                    <motion.span
                      className="block will-change-transform"
                      initial={
                        reducedMotion
                          ? false
                          : {
                              y: '100%',
                              opacity: 0,
                              filter: 'blur(6px)',
                            }
                      }
                      animate={{
                        y: '0%',
                        opacity: 1,
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        duration: 0.78,
                        delay: 0.16 + index * 0.13,
                        ease: CONTEMPLATIVE_EASE,
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              {/* Animated Meridian Horizon Rule with Traveling Light Pulse & Crosshair */}
              <div
                aria-hidden="true"
                data-testid="hero-horizon-divider"
                className="relative my-5 flex w-full max-w-2xl items-center justify-center md:my-7"
              >
                <motion.div
                  initial={reducedMotion ? false : { scaleX: 0, opacity: 0.35 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.12,
                    ease: CONTEMPLATIVE_EASE,
                  }}
                  style={{ originX: 0 }}
                  className="relative h-px w-full overflow-hidden bg-gradient-to-r from-[#DFBC91]/75 via-[#F6F4EF]/35 to-transparent"
                >
                  {!reducedMotion ? (
                    <motion.span
                      animate={{ x: ['-20%', '120%'] }}
                      transition={{
                        duration: 4.6,
                        repeat: Infinity,
                        repeatDelay: 2.2,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-[#F6F4EF] to-transparent"
                    />
                  ) : null}
                </motion.div>

                <motion.span
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.28,
                    ease: CONTEMPLATIVE_EASE,
                  }}
                  className="absolute left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center text-[#F6F4EF]/80"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <line
                      x1="8"
                      y1="1.5"
                      x2="8"
                      y2="14.5"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line
                      x1="1.5"
                      y1="8"
                      x2="14.5"
                      y2="8"
                      stroke="rgba(223, 188, 145, 0.9)"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.span>
              </div>

              {/* Verbatim Bengali Couplet (always preserved in Bengali script) */}
              <p
                key={`hero-couplet-${lang}`}
                lang="bn"
                className="font-bn-verse max-w-2xl text-[clamp(1.22rem,1.95vw,1.72rem)] leading-[1.82] text-[#F6F4EF]/95"
              >
                {HERO_STANZA.map((line, idx) => (
                  <motion.span
                    key={`stanza-line-${idx}`}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 10, filter: 'blur(4px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.68,
                      delay: 0.44 + idx * 0.16,
                      ease: CONTEMPLATIVE_EASE,
                    }}
                    className="block py-[0.06em]"
                  >
                    {line}
                  </motion.span>
                ))}
              </p>

              {/* Editorial Context Note */}
              <motion.p
                key={`hero-summary-${lang}`}
                lang={lang}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.64,
                  ease: CONTEMPLATIVE_EASE,
                }}
                className={`mt-4 max-w-xl text-[0.94rem] leading-[1.8] text-[#F6F4EF]/76 ${
                  lang === 'bn' ? 'font-bn-ui' : ''
                }`}
              >
                {copy.hero.leadSummary}
              </motion.p>

              {/* Clear Action Row: Single Dominant Primary CTA + Secondary Scroll Trigger */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.76,
                  ease: CONTEMPLATIVE_EASE,
                }}
                className="mt-7 flex flex-wrap items-center gap-5"
              >
                <TransitionLink
                  ref={primaryCtaRef}
                  to="/poems"
                  data-testid="hero-primary-cta"
                  className="glass-light inline-flex items-center gap-3 whitespace-nowrap shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-[#171A21] shadow-[0_14px_34px_rgba(18,22,30,0.22)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.hero.primaryCta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TransitionLink>

                <button
                  ref={scrollPromptRef}
                  type="button"
                  onClick={() => scrollToElement('chapter-presence', -40)}
                  className="group inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap shrink-0 border-b border-white/42 py-2 text-sm font-medium text-[#F6F4EF]/92 transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.hero.scrollPrompt}</span>
                  <motion.span
                    aria-hidden="true"
                    animate={reducedMotion ? undefined : { y: [0, 3, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </motion.span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right 5 Cols: Interactive Kinetic Astrolabe & Monsoon Horizon Stage */}
          <motion.div
            style={
              reducedMotion
                ? undefined
                : {
                    y: astrolabeScrollY,
                    scale: astrolabeScrollScale,
                  }
            }
            className="relative z-20 will-change-transform lg:col-span-5"
          >
            <HeroKineticAstrolabe
              lang={lang}
              activeCycle={activeCycle}
              onSelectCycle={setActiveCycle}
              soundActive={soundActive}
              reducedMotion={reducedMotion}
              pointerX={pointerX}
              pointerY={pointerY}
              scrollProgress={scrollYProgress}
            />
          </motion.div>
        </div>

        {/* Bottom Exhibition Ledger Strip (Quiet Unboxed Metadata, Zero Pills) */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.88,
            ease: CONTEMPLATIVE_EASE,
          }}
          className="relative z-20 mx-auto flex w-full max-w-[82rem] flex-wrap items-center justify-between gap-3 border-t border-white/14 pt-4 text-xs text-[#F6F4EF]/70"
        >
          <span className="tabular-nums">{copy.hero.statsLine}</span>
          <span className="hidden sm:inline">{copy.hero.subtitleRight}</span>
        </motion.div>
      </section>
    </div>
  );
}
