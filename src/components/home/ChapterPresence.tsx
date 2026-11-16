import { Fragment, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowDown, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE } from '../../data/authorProfile';
import { getCycleLabel, getCollections } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  DrawSVGPlugin,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';

export function ChapterPresence() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitFrameRef = useRef<HTMLDivElement>(null);
  const astrolabeOuterRef = useRef<SVGPathElement>(null);
  const astrolabeInnerRef = useRef<SVGPathElement>(null);
  const astrolabeAxisRef = useRef<SVGLineElement>(null);
  const archiveCtaRef = useRef<HTMLAnchorElement>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const { scrollToElement } = useSmoothScroll();

  useMagnetic(archiveCtaRef, 0.2);
  useMagnetic(continueBtnRef, 0.18);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const outerArc = astrolabeOuterRef.current;
      const innerArc = astrolabeInnerRef.current;
      const axis = astrolabeAxisRef.current;

      if (!section) return;
      const reduced = prefersReducedMotion();

      void DrawSVGPlugin;

      if (!reduced) {
        const paths = [outerArc, innerArc, axis].filter(
          (el): el is SVGPathElement | SVGLineElement => el !== null
        );

        if (paths.length > 0) {
          gsap.fromTo(
            paths,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                end: 'center 45%',
                scrub: 0.8,
              },
            }
          );
        }

        ScrollTrigger.refresh();
      }
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || !portraitFrameRef.current) return;
    const rect = portraitFrameRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((ny * -8).toFixed(2)),
      y: Number((nx * 8).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const cycleIds = getCollections();

  return (
    <section
      id="chapter-presence"
      ref={sectionRef}
      data-bg-stage="1"
      data-snap-station
      aria-label={`Presence — ${AUTHOR_PROFILE.name[lang]}`}
      className="relative flex min-h-[115svh] w-full items-center overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column (5 cols): Sculptural Monograph Portrait with Astrolabe Meridian */}
          <div className="relative mx-auto w-full max-w-[27rem] lg:col-span-5 lg:max-w-none">
            {/* Precision Astrolabe Rings & Coordinate Guides */}
            <svg
              aria-hidden="true"
              viewBox="0 0 540 640"
              fill="none"
              className="pointer-events-none absolute -inset-10 h-[calc(100%+5rem)] w-[calc(100%+5rem)] overflow-visible opacity-75"
            >
              {/* Primary Arc */}
              <path
                ref={astrolabeOuterRef}
                d="M 24 210 A 250 250 0 0 1 480 60"
                stroke="rgba(223, 188, 145, 0.75)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Secondary Harmonic Arc */}
              <path
                ref={astrolabeInnerRef}
                d="M 510 420 A 250 250 0 0 1 80 580"
                stroke="rgba(246, 244, 239, 0.45)"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeDasharray="4 8"
              />
              {/* Horizontal Meridian Line */}
              <line
                ref={astrolabeAxisRef}
                x1="-10"
                y1="320"
                x2="550"
                y2="320"
                stroke="rgba(223, 188, 145, 0.3)"
                strokeWidth="0.8"
              />
              <circle cx="480" cy="60" r="3.5" fill="#DFBC91" />
              <circle cx="80" cy="580" r="2.5" fill="#F6F4EF" fillOpacity="0.6" />
            </svg>

            {/* Tactile Living Monograph Card */}
            <div
              ref={portraitFrameRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-[32px] border border-white/25 bg-gradient-to-br from-[#363E4B]/80 via-[#2A313D]/90 to-[#1D2430] p-6 shadow-[0_24px_64px_rgba(15,18,24,0.36)] backdrop-blur-[16px]"
            >
              {/* Atmospheric Canvas Backing */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(223,188,145,0.22)_0%,rgba(178,194,212,0.12)_45%,transparent_75%)]"
              />

              {/* Silhouette & Painterly Light Mesh */}
              <div className="relative flex h-full flex-col justify-between">
                {/* Top Corner Markings */}
                <div className="flex items-center justify-between text-xs font-medium text-[#DFBC91]/90">
                  <span className="flex items-center gap-1.5 font-mono tracking-wider">
                    <Compass className="h-3.5 w-3.5" />
                    <span>23.8103° N · 90.4125° E</span>
                  </span>
                  <span className="text-[#F6F4EF]/60">
                    {lang === 'bn' ? 'ব্যক্তিগত পাণ্ডুলিপি' : 'Private Notebook'}
                  </span>
                </div>

                {/* Central Silhouette Study */}
                <div className="relative my-auto flex items-center justify-center py-6">
                  <div className="relative h-48 w-48 rounded-full bg-gradient-to-tr from-[#3D4756] to-[#606C7E] p-1 shadow-inner md:h-56 md:w-56">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#202733]">
                      {/* Stylized Poetic Face Profile Contour in Bengali Ink */}
                      <svg
                        viewBox="0 0 200 200"
                        className="h-full w-full opacity-90 transition-transform duration-700 group-hover:scale-105"
                      >
                        <defs>
                          <radialGradient id="authorGlow" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" stopColor="#DFBC91" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#5A6475" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#202733" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="88" fill="url(#authorGlow)" />
                        {/* Poetic Ink Silhouette */}
                        <path
                          d="M96 45 C 80 45, 68 56, 62 70 C 58 78, 56 88, 58 98 C 55 102, 52 108, 56 112 C 58 114, 62 115, 65 118 C 68 126, 75 132, 85 135 C 70 144, 52 155, 42 175 L 158 175 C 148 155, 130 144, 115 135 C 122 130, 128 122, 126 110 C 132 100, 135 88, 132 75 C 128 55, 115 45, 96 45 Z"
                          fill="#3E4756"
                        />
                        <path
                          d="M68 76 C 74 65, 84 58, 98 58 C 92 68, 88 80, 89 92 C 84 98, 82 106, 85 114 C 91 122, 98 126, 106 128 C 95 132, 84 130, 76 122 C 70 115, 68 102, 70 90 Z"
                          fill="#F6F4EF"
                          fillOpacity="0.75"
                        />
                        <circle cx="120" cy="74" r="2.5" fill="#DFBC91" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Frame Stamp */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F6F4EF]/90">
                      {AUTHOR_PROFILE.portraitCaption[lang]}
                    </span>
                    <span className="text-[#DFBC91]">
                      {AUTHOR_PROFILE.portraitSubcaption[lang]}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#F6F4EF]/60">
                    {lang === 'bn'
                      ? '১০টি কবিতা · ৩টি সংকলন · ২০২৩–২০২৪'
                      : '10 Poems · 3 Volumes · 2023–2024'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Editorial Typography & Poetic Manifesto */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
              <Sparkles className="h-3 w-3" />
              <span>{copy.presence.eyebrow}</span>
            </div>

            <h2
              className={`font-display display-luminous mt-4 font-semibold ${
                lang === 'bn'
                  ? 'font-bn-display text-[clamp(2.5rem,4.8vw,4.25rem)] leading-[1.2]'
                  : 'text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.06] tracking-[-0.025em]'
              }`}
            >
              {AUTHOR_PROFILE.name[lang]}
            </h2>

            <p className="font-editorial-serif mt-4 text-[clamp(1.4rem,2.2vw,2.1rem)] font-light leading-[1.4] text-[#F6F4EF]/95">
              {AUTHOR_PROFILE.headline[lang]}
            </p>

            <p className="mt-6 max-w-2xl text-base leading-[1.85] text-[#F6F4EF]/82 md:text-[1.05rem]">
              {AUTHOR_PROFILE.statement[lang]}
            </p>

            {/* Hand-Pressed Letterpress Pull-Quote */}
            <div className="my-8 rounded-2xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm">
              <p
                lang="bn"
                className="font-bn-verse text-[clamp(1.05rem,1.35vw,1.35rem)] italic leading-[1.75] text-[#DFBC91]"
              >
                “{AUTHOR_PROFILE.pullQuote[lang]}”
              </p>
              <p className="mt-2 text-xs font-medium text-[#F6F4EF]/65">
                — {AUTHOR_PROFILE.pullQuoteAttribution[lang]}
              </p>
            </div>

            {/* Unboxed Collections Summary */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#F6F4EF]/75">
              {cycleIds.map((id, idx) => (
                <Fragment key={id}>
                  {idx > 0 && <span className="text-[#DFBC91]">·</span>}
                  <span className="hover:text-[#F6F4EF] transition-colors">
                    {getCycleLabel(id, lang)}
                  </span>
                </Fragment>
              ))}
            </div>

            {/* Magnetic Action Cluster */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <TransitionLink
                ref={archiveCtaRef}
                to="/poems"
                className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_12px_32px_rgba(24,28,36,0.18)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.presence.ctaArchive}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>

              <button
                ref={continueBtnRef}
                type="button"
                onClick={() => scrollToElement('chapter-4', -40)}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-xs font-medium text-[#F6F4EF] backdrop-blur-[16px] transition-colors duration-200 hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.presence.ctaContinue}</span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
