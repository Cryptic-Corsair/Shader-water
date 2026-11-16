import { useRef, useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';

const THESIS_NUMERALS_BN = ['০১', '০২', '০৩'] as const;
const THESIS_NUMERALS_EN = ['01', '02', '03'] as const;

interface StanzaDetail {
  slug: string;
  themeBn: string;
  themeEn: string;
}

const STANZA_DETAILS: StanzaDetail[] = [
  {
    slug: 'mukhosher-antarale',
    themeBn: 'মুখোশ · বাস্তবতা · নির্মোহ সত্য',
    themeEn: 'Masks · Reality · Plain Truth',
  },
  {
    slug: 'tomar-tumi-hobo',
    themeBn: 'গোধূলি · পূর্ণিমা · ভালোবাসা',
    themeEn: 'Twilight · Full Moon · Devotion',
  },
  {
    slug: 'bhalo-thaka',
    themeBn: 'শিশির · আত্মজিজ্ঞাসা · নিভৃত উচ্চারণ',
    themeEn: 'Morning Dew · Honest Question · Stillness',
  },
];

export function DepthDriftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const backPlaneRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const [activeThesis, setActiveThesis] = useState(0);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).depthDrift;
  const numerals = lang === 'bn' ? THESIS_NUMERALS_BN : THESIS_NUMERALS_EN;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const backPlane = backPlaneRef.current;
      const constellation = constellationRef.current;
      if (!section) return;

      const theses = Array.from(
        section.querySelectorAll<HTMLElement>('[data-drift-thesis]')
      );

      theses.forEach((el, idx) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => setActiveThesis(idx),
          onEnterBack: () => setActiveThesis(idx),
        });
      });

      const reduced = prefersReducedMotion();
      if (reduced) return;

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        if (backPlane) {
          gsap.fromTo(
            backPlane,
            { yPercent: -6 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          );
        }

        if (constellation) {
          gsap.fromTo(
            constellation,
            { yPercent: 6 },
            {
              yPercent: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.9,
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section
      id="chapter-4"
      ref={sectionRef}
      data-bg-stage="2"
      data-snap-station
      aria-label="Celestial Drift and Stanza Atmosphere"
      className="relative flex min-h-[140svh] w-full items-center overflow-hidden py-28 text-[#F6F4EF] md:py-40"
    >
      {/* Background Celestial Parallax Plane */}
      <div
        ref={backPlaneRef}
        aria-hidden="true"
        data-testid="drift-back-plane"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
      >
        <svg
          viewBox="0 0 1440 1200"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full opacity-25"
        >
          <path
            d="M -40 240 C 280 140, 540 360, 900 250 C 1200 170, 1340 280, 1520 200"
            stroke="rgba(223, 188, 145, 0.35)"
            strokeWidth="1"
          />
          <path
            d="M -60 620 C 260 720, 640 500, 980 640 C 1240 740, 1380 600, 1540 660"
            stroke="rgba(246, 244, 239, 0.25)"
            strokeWidth="0.9"
            strokeDasharray="5 9"
          />
          <path
            d="M -20 980 C 330 870, 700 1060, 1060 940 C 1280 860, 1400 960, 1520 910"
            stroke="rgba(178, 194, 212, 0.3)"
            strokeWidth="1"
          />
        </svg>

        {/* Quiet Ambient Vignettes */}
        <div className="mx-auto flex h-full max-w-[84rem] flex-col justify-between px-6 py-28 md:px-12">
          <div className="flex justify-between items-center opacity-30">
            <span className="font-mono text-xs tracking-widest text-[#DFBC91]">
              01 // ECLIPSE
            </span>
            <span className="font-mono text-xs tracking-widest text-[#F6F4EF]">
              2023.12.13
            </span>
          </div>
          <div className="flex justify-between items-center opacity-30">
            <span className="font-mono text-xs tracking-widest text-[#DFBC91]">
              02 // FULL MOON
            </span>
            <span className="font-mono text-xs tracking-widest text-[#F6F4EF]">
              2024.01.27
            </span>
          </div>
          <div className="flex justify-between items-center opacity-30">
            <span className="font-mono text-xs tracking-widest text-[#DFBC91]">
              03 // DAWN DEW
            </span>
            <span className="font-mono text-xs tracking-widest text-[#F6F4EF]">
              2024.02.02
            </span>
          </div>
        </div>
      </div>

      {/* Floating Constellation Sketches (Middle-Foreground) */}
      <div
        ref={constellationRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden will-change-transform md:block opacity-40"
      >
        <div className="mx-auto flex h-full max-w-[82rem] flex-col justify-around px-8">
          <div className="self-end pr-12">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle cx="50" cy="50" r="38" stroke="#DFBC91" strokeWidth="0.8" strokeDasharray="3 5" />
              <circle cx="50" cy="50" r="4" fill="#DFBC91" />
              <line x1="12" y1="50" x2="88" y2="50" stroke="#F6F4EF" strokeWidth="0.6" />
            </svg>
          </div>
          <div className="self-start pl-8">
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <polygon points="60,15 105,90 15,90" stroke="#B2C2D4" strokeWidth="0.8" fill="none" />
              <circle cx="60" cy="15" r="3" fill="#DFBC91" />
              <circle cx="105" cy="90" r="3" fill="#F6F4EF" />
              <circle cx="15" cy="90" r="3" fill="#F6F4EF" />
            </svg>
          </div>
        </div>
      </div>

      {/* Primary Content: 3 Animated Luminous Theses */}
      <div className="relative z-20 mx-auto w-full max-w-[78rem] px-6 md:px-10">
        <div className="mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBC91]">
            <Sparkles className="h-3 w-3" />
            <span>{copy.eyebrow}</span>
          </div>
          <h2
            className={`font-display display-luminous mt-3 text-3xl font-semibold md:text-5xl ${
              lang === 'bn' ? 'font-bn-display' : ''
            }`}
          >
            {lang === 'bn'
              ? 'কবিতার তিন পর্ব ও নিভৃত উচ্চারণ'
              : 'Three Movements of Inner Verse'}
          </h2>
        </div>

        <div className="space-y-16 md:space-y-24">
          {copy.phrases.map((phrase, idx) => {
            const isLit = activeThesis === idx;
            const detail = STANZA_DETAILS[idx];

            return (
              <div
                key={idx}
                data-drift-thesis
                data-lit={isLit ? 'true' : 'false'}
                className={`group relative rounded-3xl border transition-all duration-500 ease-out p-7 md:p-10 ${
                  isLit
                    ? 'border-[#DFBC91]/40 bg-[#28303C]/80 shadow-[0_20px_50px_rgba(15,18,24,0.35)] backdrop-blur-md'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div className="flex-1">
                    {/* Index & Theme Kicker */}
                    <div className="flex items-center gap-3 text-xs font-medium text-[#DFBC91]">
                      <span className="font-mono text-sm tracking-wider">
                        {numerals[idx]}
                      </span>
                      <span>·</span>
                      <span>{phrase.label}</span>
                      {detail && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden text-[#F6F4EF]/60 sm:inline">
                            {lang === 'bn' ? detail.themeBn : detail.themeEn}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Verbatim Poetic Verse Lines */}
                    <div
                      lang="bn"
                      className="font-bn-verse mt-4 text-[clamp(1.5rem,2.8vw,2.5rem)] font-normal leading-[1.65] text-[#F6F4EF]"
                    >
                      <p className="block">{phrase.lead}</p>
                      <p className="block text-[#DFBC91]">{phrase.accent}</p>
                    </div>

                    {/* Resonating Notebook Annotation */}
                    <p className="mt-4 max-w-2xl text-sm leading-[1.85] text-[#F6F4EF]/80 md:text-base">
                      {phrase.note}
                    </p>
                  </div>

                  {/* Direct Link to Reading Room */}
                  {detail && (
                    <div className="mt-2 shrink-0 md:mt-0">
                      <TransitionLink
                        to={`/poems/${detail.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#F6F4EF] backdrop-blur-sm transition-all duration-200 hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                      >
                        <span>
                          {lang === 'bn' ? 'সম্পূর্ণ পাঠ' : 'Open Poem'}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </TransitionLink>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
