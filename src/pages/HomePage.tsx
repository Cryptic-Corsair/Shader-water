import { useEffect, useRef } from 'react';
import { useSmoothScroll } from '../components/SmoothScrollProvider';
import { ChapterPresence } from '../components/home/ChapterPresence';
import { CollectionsCarousel } from '../components/home/CollectionsCarousel';
import { DepthDriftSection } from '../components/home/DepthDriftSection';
import { HeroTwoPartSequence } from '../components/home/HeroTwoPartSequence';
import { ScrollTraceSpine } from '../components/home/ScrollTraceSpine';
import { StorySection } from '../components/home/StorySection';
import { TimelinePortalSection } from '../components/home/TimelinePortalSection';
import { VerseStageSection } from '../components/home/VerseStageSection';
import { useMagneticSnap } from '../hooks/useMagneticSnap';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { ScrollTrigger } from '../lib/motion';

export function HomePage() {
  const homeRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();
  const { lang } = useLanguage();
  const copy = getUiCopy(lang);

  useEffect(() => {
    document.title = copy.brandFull;
    ScrollTrigger.refresh();
  }, [copy.brandFull]);

  useMagneticSnap(lenis, homeRef, '[data-snap-station]');

  return (
    <div
      id="exhibition-root"
      ref={homeRef}
      className="relative min-h-screen overflow-x-clip text-[#F6F4EF]"
    >
      <ScrollTraceSpine scopeSelector="#exhibition-root" />

      {/* Chapters 1 & 2 — Two-Part Hero & Frosted Optical Aperture */}
      <HeroTwoPartSequence />

      {/* Chapter 3 — The Presence (Kept <Water> Portrait + Open Borderless Bio) */}
      <ChapterPresence />

      {/* Chapter 4 — Multi-Plane Poetic Drift (3-Plane Differential Parallax) */}
      <DepthDriftSection />

      {/* Chapter 5 — Published Cycles Interactive Zoom Carousel */}
      <CollectionsCarousel />

      {/* Chapter 6 — Practice & Place (Merged Biography + Sticky Wave Contour) */}
      <StorySection />

      {/* Chapter 7 — Dual Kinetic Verse Ribbon & Featured Reading Stage */}
      <VerseStageSection />

      {/* Chapter 8 — Traced Meridian Milestones, Correspondence & Archive Portal */}
      <TimelinePortalSection />
    </div>
  );
}
