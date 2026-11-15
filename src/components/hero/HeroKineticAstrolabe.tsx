import { useId, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import type { SiteLang } from '../../context/LanguageContext';
import {
  formatReadingTime,
  toBanglaNumerals,
  type CycleId,
  type PoemMeta,
} from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';
import { buildSeamlessWavePath } from './heroAtmosphereMath';
import {
  HERO_CYCLE_ORDER,
  HERO_CYCLE_VISUALS,
  getHeroPoemForCycle,
} from './heroData';

export interface HeroKineticAstrolabeProps {
  lang: SiteLang;
  activeCycle: CycleId;
  onSelectCycle: (cycleId: CycleId) => void;
  soundActive: boolean;
  reducedMotion: boolean;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
}

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

const DEGREE_TICKS = Array.from({ length: 36 }, (_, idx) => {
  const angleDeg = idx * 10;
  const rad = (angleDeg * Math.PI) / 180;
  const isMajor = idx % 3 === 0;
  const rInner = isMajor ? 200 : 208;
  const rOuter = 215;
  return {
    key: angleDeg,
    isMajor,
    x1: Math.sin(rad) * rInner,
    y1: -Math.cos(rad) * rInner,
    x2: Math.sin(rad) * rOuter,
    y2: -Math.cos(rad) * rOuter,
  };
});

const CELESTIAL_STARS = [
  { cx: 162, cy: 158, r: 1.3, delay: 0 },
  { cx: 196, cy: 132, r: 1.0, delay: 0.9 },
  { cx: 318, cy: 144, r: 1.4, delay: 1.6 },
  { cx: 344, cy: 204, r: 1.0, delay: 2.3 },
  { cx: 142, cy: 212, r: 1.1, delay: 1.2 },
] as const;

export function HeroKineticAstrolabe({
  lang,
  activeCycle,
  onSelectCycle,
  soundActive,
  reducedMotion,
  pointerX,
  pointerY,
  scrollProgress,
}: HeroKineticAstrolabeProps) {
  const uid = useId().replace(/:/g, '');
  const lensClipId = `astrolabe-lens-${uid}`;
  const crescentMaskId = `astrolabe-crescent-${uid}`;
  const skyGradId = `astrolabe-sky-${uid}`;
  const sunCoronaId = `astrolabe-corona-${uid}`;
  const waveBackGradId = `astrolabe-wave-back-${uid}`;
  const waveFrontGradId = `astrolabe-wave-front-${uid}`;

  const copy = getUiCopy(lang).hero;
  const cycleVisual = HERO_CYCLE_VISUALS[activeCycle];
  const featuredPoem: PoemMeta = getHeroPoemForCycle(activeCycle);

  // Damped 3D perspective tilt & specular glass glint driven by pointer MotionValues
  const tiltRotateY = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);
  const tiltRotateX = useTransform(pointerY, [-0.5, 0.5], [7, -7]);
  const glintX = useTransform(pointerX, [-0.5, 0.5], ['-16%', '16%']);
  const glintY = useTransform(pointerY, [-0.5, 0.5], ['-14%', '14%']);
  const scrollRingSpin = useTransform(scrollProgress, [0, 1], [0, 32]);

  // Pre-compute seamless periodic wave paths for GPU-composited continuous flow
  const wavePaths = useMemo(
    () => ({
      back: buildSeamlessWavePath(180, 4, 246, 9, 410),
      mid: buildSeamlessWavePath(160, 4, 266, 11, 410),
      front: buildSeamlessWavePath(140, 4, 288, 8, 410),
    }),
    []
  );

  const azimuthFormatted =
    lang === 'bn'
      ? `${toBanglaNumerals(String(cycleVisual.azimuthDeg).padStart(3, '0'))}°`
      : `${String(cycleVisual.azimuthDeg).padStart(3, '0')}°`;

  return (
    <div
      data-testid="hero-kinetic-astrolabe"
      data-active-cycle={activeCycle}
      className="relative mx-auto flex w-full max-w-[19.5rem] flex-col items-center sm:max-w-[23rem] lg:ml-auto lg:mr-6 lg:max-w-[25.5rem]"
    >
      {/* Interactive 3D-Tilted Celestial Instrument */}
      <motion.div
        style={
          reducedMotion
            ? undefined
            : {
                rotateX: tiltRotateX,
                rotateY: tiltRotateY,
                transformPerspective: 1000,
              }
        }
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, delay: 0.2, ease: CONTEMPLATIVE_EASE }}
        className="relative aspect-square w-full select-none will-change-transform"
      >
        {/* Dynamic Cycle Atmospheric Aura */}
        <motion.div
          aria-hidden="true"
          animate={
            reducedMotion
              ? { opacity: 0.55 }
              : {
                  scale: soundActive ? [1, 1.09, 1] : [1, 1.04, 1],
                  opacity: soundActive ? [0.6, 0.9, 0.6] : [0.44, 0.62, 0.44],
                }
          }
          transition={{
            duration: soundActive ? 3.8 : 7.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -inset-10 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 48%, ${cycleVisual.accentGlow}38 0%, rgba(178, 194, 212, 0.1) 46%, transparent 72%)`,
          }}
        />

        {/* Primary SVG Motion Graphics Canvas */}
        <motion.svg
          viewBox="0 0 480 480"
          fill="none"
          aria-hidden="true"
          style={reducedMotion ? undefined : { rotate: scrollRingSpin }}
          className="relative z-10 h-full w-full overflow-visible"
        >
          <defs>
            <clipPath id={lensClipId}>
              <circle cx="240" cy="240" r="144" />
            </clipPath>

            {/* True Crescent Moon Mask: subtracts offset shadow disc cleanly without grey overlap */}
            <mask id={crescentMaskId}>
              <rect x="0" y="0" width="480" height="480" fill="black" />
              <circle cx="264" cy="194" r="28" fill="white" />
              <motion.circle
                r="26.5"
                fill="black"
                initial={false}
                animate={{
                  cx: 264 + cycleVisual.eclipseShiftX,
                  cy: 194 + cycleVisual.eclipseShiftY,
                  opacity: cycleVisual.eclipseOpacity,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.95, ease: CONTEMPLATIVE_EASE }
                }
              />
            </mask>

            <linearGradient id={skyGradId} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor={cycleVisual.skyTop} />
              <stop offset="56%" stopColor={cycleVisual.skyMid} />
              <stop offset="100%" stopColor={cycleVisual.skyBottom} />
            </linearGradient>

            <radialGradient id={sunCoronaId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8F3EA" stopOpacity="0.92" />
              <stop offset="30%" stopColor={cycleVisual.accentGlow} stopOpacity="0.54" />
              <stop offset="68%" stopColor="#DFBC91" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#26303E" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={waveBackGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#354152" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#1D2430" stopOpacity="0.94" />
            </linearGradient>

            <linearGradient id={waveFrontGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#242D3B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#151A22" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* 1. Outer Calibrated Meridian Ring (Continuous clockwise rotation around exact 240,240 center) */}
          <g transform="translate(240, 240)">
            <motion.g
              style={{ originX: 0.5, originY: 0.5 }}
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                cx="0"
                cy="0"
                r="215"
                stroke="rgba(246, 244, 239, 0.18)"
                strokeWidth="0.9"
              />
              {DEGREE_TICKS.map((t) => (
                <line
                  key={t.key}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={
                    t.isMajor
                      ? 'rgba(223, 188, 145, 0.68)'
                      : 'rgba(246, 244, 239, 0.24)'
                  }
                  strokeWidth={t.isMajor ? '1.2' : '0.75'}
                  strokeLinecap="round"
                />
              ))}
            </motion.g>
          </g>

          {/* 2. Counter-Rotating Epicycle Orbit & Luminous Satellite Nodes */}
          <g transform="translate(240, 240)">
            <motion.g
              style={{ originX: 0.5, originY: 0.5 }}
              animate={reducedMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                cx="0"
                cy="0"
                r="184"
                stroke="rgba(223, 188, 145, 0.34)"
                strokeWidth="0.9"
                strokeDasharray="2 7"
              />
              <path
                d="M 0 -184 A 184 184 0 0 1 164 -84"
                stroke={cycleVisual.ringAccent}
                strokeOpacity="0.78"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M 0 184 A 184 184 0 0 1 -158 92"
                stroke="rgba(178, 194, 212, 0.55)"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              {/* Primary orbiting amber celestial bead */}
              <circle cx="164" cy="-84" r="4.4" fill="#DFBC91" />
              <circle cx="164" cy="-84" r="9" stroke="#DFBC91" strokeOpacity="0.38" strokeWidth="1" />
              {/* Counter-balancing pearl moon node */}
              <circle cx="-158" cy="92" r="3.2" fill="#F6F4EF" fillOpacity="0.92" />
            </motion.g>
          </g>

          {/* 3. Static 3-Cycle Waypoint Markers on Outer Azimuth (0°, 120°, 240°) */}
          {HERO_CYCLE_ORDER.map((cid) => {
            const cVis = HERO_CYCLE_VISUALS[cid];
            const rad = (cVis.azimuthDeg * Math.PI) / 180;
            const px = 240 + Math.sin(rad) * 198;
            const py = 240 - Math.cos(rad) * 198;
            const isActive = cid === activeCycle;

            return (
              <g key={cid} transform={`translate(${px}, ${py})`}>
                <circle
                  r={isActive ? 7.5 : 4.2}
                  fill={isActive ? '#DFBC91' : 'rgba(246, 244, 239, 0.25)'}
                  fillOpacity={isActive ? 0.3 : 0.18}
                  stroke={isActive ? '#DFBC91' : 'rgba(246, 244, 239, 0.48)'}
                  strokeWidth={isActive ? 1.25 : 0.8}
                />
                <circle
                  r={isActive ? 2.7 : 1.6}
                  fill={isActive ? '#F6F4EF' : 'rgba(246, 244, 239, 0.68)'}
                />
              </g>
            );
          })}

          {/* 4. Spring-Animated Active Azimuth Indicator Needle (exact 240,240 pivot via symmetrical bbox) */}
          <g transform="translate(240, 240)">
            <motion.g
              style={{ originX: 0.5, originY: 0.5 }}
              animate={{ rotate: cycleVisual.azimuthDeg }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 110, damping: 18, mass: 0.9 }
              }
            >
              <rect
                x="-210"
                y="-210"
                width="420"
                height="420"
                fill="transparent"
                pointerEvents="none"
              />
              <line
                x1="0"
                y1="-152"
                x2="0"
                y2="-198"
                stroke="#DFBC91"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <polygon
                points="0,-209 4.8,-199 0,-193 -4.8,-199"
                fill="#DFBC91"
              />
            </motion.g>
          </g>

          {/* 5. Inner Circular Horizon & Kinetic Water Aperture */}
          <g clipPath={`url(#${lensClipId})`}>
            {/* Sky & Atmosphere Backdrop */}
            <rect
              x="96"
              y="96"
              width="288"
              height="288"
              fill={`url(#${skyGradId})`}
              style={{ transition: 'fill 600ms ease' }}
            />

            {/* Subtle Twinkling Dusk Star Pinpoints */}
            {CELESTIAL_STARS.map((star, idx) => (
              <motion.circle
                key={idx}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="#F6F4EF"
                animate={
                  reducedMotion
                    ? { opacity: 0.45 }
                    : { opacity: [0.2, 0.82, 0.2] }
                }
                transition={{
                  duration: 3.4,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Breathing Celestial Sun/Moon Corona */}
            <motion.circle
              cx="264"
              cy="194"
              r="76"
              fill={`url(#${sunCoronaId})`}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      scale: soundActive ? [1, 1.14, 1] : [1, 1.06, 1],
                      opacity: [0.8, 1, 0.8],
                    }
              }
              transition={{
                duration: soundActive ? 3.2 : 5.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ originX: '264px', originY: '194px' }}
            />

            {/* Razor-Sharp Masked Crescent Moon / Twilight Orb */}
            <circle
              cx="264"
              cy="194"
              r="28"
              fill="#F8F3EA"
              mask={`url(#${crescentMaskId})`}
            />

            {/* Distant Drifting Cloud Band */}
            <motion.ellipse
              cx="210"
              cy="176"
              rx="88"
              ry="15"
              fill="#F6F4EF"
              fillOpacity="0.07"
              animate={reducedMotion ? undefined : { x: [-16, 18, -16] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Continuous GPU-Composited Flowing Liquid Horizon Waves */}
            <g transform="translate(80, 0)">
              {/* Back Wave */}
              <motion.path
                d={wavePaths.back}
                fill={`url(#${waveBackGradId})`}
                animate={reducedMotion ? undefined : { x: [0, -180] }}
                transition={{
                  duration: soundActive ? 6.5 : 9.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              {/* Mid Wave Crest Line */}
              <motion.path
                d={wavePaths.mid}
                fill="rgba(34, 42, 54, 0.72)"
                stroke="rgba(223, 188, 145, 0.42)"
                strokeWidth="0.95"
                animate={reducedMotion ? undefined : { x: [-160, 0] }}
                transition={{
                  duration: soundActive ? 8 : 11.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              {/* Front Deep Water Wave */}
              <motion.path
                d={wavePaths.front}
                fill={`url(#${waveFrontGradId})`}
                stroke="rgba(246, 244, 239, 0.24)"
                strokeWidth="0.8"
                animate={reducedMotion ? undefined : { x: [0, -140] }}
                transition={{
                  duration: soundActive ? 5.2 : 7.8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </g>

            {/* Pulsing Water Surface Ripples */}
            <g transform="translate(264, 296)">
              <motion.ellipse
                cx="0"
                cy="0"
                rx="34"
                ry="5.5"
                stroke="#DFBC91"
                strokeWidth="0.95"
                animate={
                  reducedMotion
                    ? { opacity: 0.4 }
                    : { scale: [0.55, 1.5], opacity: [0.72, 0] }
                }
                transition={{
                  duration: 3.0,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ originX: 0.5, originY: 0.5 }}
              />
              <motion.ellipse
                cx="0"
                cy="0"
                rx="34"
                ry="5.5"
                stroke="#F6F4EF"
                strokeWidth="0.75"
                animate={
                  reducedMotion
                    ? { opacity: 0.25 }
                    : { scale: [0.55, 1.5], opacity: [0.55, 0] }
                }
                transition={{
                  duration: 3.0,
                  delay: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ originX: 0.5, originY: 0.5 }}
              />
            </g>

            {/* Swaying Monsoon Reed & Kadam Dew Silhouette */}
            <g transform="translate(154, 384)">
              <motion.g
                style={{ originX: 0.3, originY: 0.96 }}
                animate={
                  reducedMotion
                    ? undefined
                    : { rotate: [-2.6, 2.4, -2.6] }
                }
                transition={{
                  duration: 6.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <path
                  d="M 0 8 C 6 -54 20 -116 44 -178 C 50 -194 58 -206 66 -218"
                  stroke="#12161D"
                  strokeOpacity="0.9"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
                <path
                  d="M 19 -96 C 0 -114 -16 -124 -30 -128"
                  stroke="#12161D"
                  strokeOpacity="0.8"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M 34 -142 C 54 -158 72 -166 88 -170"
                  stroke="#12161D"
                  strokeOpacity="0.75"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <circle cx="67" cy="-220" r="4.2" fill="#DFBC91" fillOpacity="0.92" />
                <circle cx="65.8" cy="-221.2" r="1.4" fill="#F6F4EF" />
              </motion.g>
            </g>

            {/* Fine Diagonal Glass Rain Glints */}
            <motion.g
              animate={
                reducedMotion
                  ? undefined
                  : { y: [-14, 20], opacity: [0.22, 0.78, 0.22] }
              }
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <line
                x1="184"
                y1="136"
                x2="174"
                y2="196"
                stroke="#F6F4EF"
                strokeOpacity="0.34"
                strokeWidth="0.85"
              />
              <line
                x1="312"
                y1="148"
                x2="300"
                y2="226"
                stroke="#DFBC91"
                strokeOpacity="0.44"
                strokeWidth="0.9"
              />
            </motion.g>

            {/* Pointer-Reactive Specular Sheen Inside Lens */}
            <motion.g
              style={reducedMotion ? undefined : { x: glintX, y: glintY }}
            >
              <circle
                cx="210"
                cy="185"
                r="105"
                fill="#F6F4EF"
                fillOpacity="0.06"
              />
            </motion.g>
          </g>

          {/* 6. Crisp Inner Aperture Glass Rim */}
          <circle
            cx="240"
            cy="240"
            r="144"
            stroke="rgba(246, 244, 239, 0.34)"
            strokeWidth="1.15"
          />
          <circle
            cx="240"
            cy="240"
            r="152"
            stroke="rgba(223, 188, 145, 0.24)"
            strokeWidth="0.75"
          />
        </motion.svg>
      </motion.div>

      {/* Interactive Cycle Segmented Switcher (Functional Tabs, Zero Static Pills) */}
      <div
        role="tablist"
        aria-label={copy.cycleDialLabel}
        className="relative z-20 mt-2 grid w-full max-w-[23.5rem] grid-cols-3 gap-1 rounded-xl border border-white/18 bg-[#202733]/58 p-1 backdrop-blur-[12px]"
      >
        {HERO_CYCLE_ORDER.map((cycleId) => {
          const isSelected = cycleId === activeCycle;
          const visual = HERO_CYCLE_VISUALS[cycleId];
          const num = lang === 'bn' ? visual.indexLabelBn : visual.indexLabelEn;
          const label = copy.cycles[cycleId];

          return (
            <button
              key={cycleId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`hero-cycle-tab-${cycleId}`}
              onClick={() => onSelectCycle(cycleId)}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-2 text-center text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                isSelected
                  ? 'bg-[#F5F2ED]/95 text-[#171A21] shadow-sm'
                  : 'text-[#F6F4EF]/82 hover:bg-white/10 hover:text-[#F6F4EF]'
              }`}
            >
              <span className="tabular-nums opacity-70">{num}</span>
              <span className="mx-1 opacity-45">·</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Cycle Featured Poem Entry */}
      <TransitionLink
        to={`/poems/${featuredPoem.slug}`}
        data-testid="hero-featured-poem-link"
        className="group relative z-20 mt-3.5 flex w-full max-w-[23.5rem] items-center justify-between gap-4 border-t border-white/18 pt-3.5 transition-colors duration-200 hover:border-[#DFBC91]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#DFBC91]">
            <span>{copy.featuredLabel}</span>
            <span aria-hidden="true" className="mx-1.5 opacity-60">
              ·
            </span>
            <span className="tabular-nums">
              {formatReadingTime(featuredPoem.readingSeconds, lang)}
            </span>
            <span aria-hidden="true" className="mx-1.5 opacity-60">
              ·
            </span>
            <span className="tabular-nums text-[#F6F4EF]/65">{azimuthFormatted}</span>
          </p>
          <p
            lang="bn"
            className="font-bn-display mt-0.5 truncate text-lg font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
          >
            {featuredPoem.title}
          </p>
          <p
            lang="bn"
            className="font-bn-verse truncate text-xs text-[#F6F4EF]/76"
          >
            “{featuredPoem.firstLine}”
          </p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-[#F6F4EF]/75 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#DFBC91]"
          aria-hidden="true"
        />
      </TransitionLink>
    </div>
  );
}
