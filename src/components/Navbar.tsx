import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCycleLabel, getCollections } from '../data/poemsCatalog';
import { getUiCopy } from '../data/uiCopy';
import { useMagnetic } from '../lib/motion';
import { AmbientSound } from './AmbientSound';
import { TransitionLink, usePageTransition } from './PageTransition';
import { useReadingSurface } from './ReadingSurfaceContext';
import { useSmoothScroll } from './SmoothScrollProvider';

interface AnchorNavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function AnchorNavButton({ label, active, onClick }: AnchorNavButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  useMagnetic(btnRef, 0.18);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className={`editorial-link whitespace-nowrap shrink-0 cursor-pointer border-0 bg-transparent px-1 py-1 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
        active ? 'text-[#171A21]' : 'text-[#4C5361] hover:text-[#171A21]'
      }`}
    >
      {label}
    </button>
  );
}

interface ArchiveNavLinkProps {
  to: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function ArchiveNavLink({ to, label, active, onClick }: ArchiveNavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(linkRef, 0.18);

  return (
    <TransitionLink
      ref={linkRef}
      to={to}
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className={`editorial-link whitespace-nowrap shrink-0 px-1 py-1 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
        active ? 'text-[#171A21]' : 'text-[#4C5361] hover:text-[#171A21]'
      }`}
    >
      {label}
    </TransitionLink>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang } = useLanguage();
  const copy = getUiCopy(lang);
  const { quietMode } = useReadingSurface();
  const { scrollToElement } = useSmoothScroll();
  const { navigateWithTransition } = usePageTransition();
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(wordmarkRef, 0.14);

  const isReadingRoom =
    location.pathname.startsWith('/poems/') && location.pathname !== '/poems/';
  const isQuietHidden = isReadingRoom && quietMode;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, isQuietHidden]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const isHome = location.pathname === '/';
  const isArchive =
    location.pathname === '/poems' || location.pathname.startsWith('/poems/');
  const isDisclaimer =
    location.pathname === '/disclaimer' || location.pathname === '/legal';
  const isJourneyActive =
    isHome &&
    (location.hash === '#chapter-story' ||
      location.hash === '#chapter-presence');
  const isCyclesActive = isHome && location.hash === '#chapter-cycles';

  const navigateToSection = (
    primaryId: string,
    fallbackId: string,
    targetHash: string
  ) => {
    setMobileOpen(false);
    if (isHome) {
      const targetEl =
        document.getElementById(primaryId) ??
        document.getElementById(fallbackId);
      if (targetEl) {
        scrollToElement(targetEl.id, 0);
      }
      return;
    }
    navigateWithTransition(`/#${targetHash}`, copy.transitionLabels.home);
  };

  const cyclesSummary = getCollections()
    .map((id) => getCycleLabel(id, lang))
    .join(' · ');

  return (
    <>
      <header
        aria-hidden={isQuietHidden}
        data-testid="site-navbar"
        className={`pointer-events-none fixed inset-x-0 top-3.5 z-40 transition-all duration-300 ${
          isQuietHidden
            ? '-translate-y-4 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="mx-auto max-w-[82rem] px-4 md:px-10">
          <div className="glass-light pointer-events-auto flex h-12 w-full items-center justify-between gap-2 rounded-full px-3.5 shadow-[0_10px_32px_rgba(24,28,36,0.14)] md:grid md:h-[52px] md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-6">
            {/* Zone 1 (Left Rail): Brand Wordmark */}
            <div className="flex items-center justify-self-start min-w-0">
              <TransitionLink
                ref={wordmarkRef}
                to="/"
                className="font-editorial-serif whitespace-nowrap shrink-0 text-[1.06rem] font-semibold text-[#171A21] transition-opacity duration-200 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] md:text-[1.2rem]"
              >
                {copy.brand}
              </TransitionLink>
            </div>

            {/* Zone 2 (Center Stage): Unboxed Single-Line Editorial Navigation */}
            <nav
              aria-label="Primary navigation"
              className="hidden items-center justify-self-center gap-5 md:flex lg:gap-8"
            >
              <AnchorNavButton
                label={copy.nav.journey}
                active={isJourneyActive}
                onClick={() =>
                  navigateToSection(
                    'chapter-story',
                    'chapter-presence',
                    'chapter-story'
                  )
                }
              />
              <AnchorNavButton
                label={copy.nav.cycles}
                active={isCyclesActive}
                onClick={() =>
                  navigateToSection('chapter-cycles', 'chapter-4', 'chapter-cycles')
                }
              />
              <ArchiveNavLink
                to="/poems"
                label={copy.nav.archive}
                active={isArchive}
              />
              <ArchiveNavLink
                to="/disclaimer"
                label={copy.nav.disclaimer}
                active={isDisclaimer}
              />
            </nav>

            {/* Zone 3 (Right Rail): Language, Ambient Audio & Mobile Menu */}
            <div className="flex items-center justify-self-end gap-1.5 shrink-0 sm:gap-2.5">
              {/* Compact BN / EN Switcher */}
              <div
                role="group"
                aria-label={copy.nav.langSwitchAria}
                data-testid="language-switcher"
                className="inline-flex items-center rounded-full border border-[#171A21]/14 bg-white/45 p-0.5"
              >
                <button
                  type="button"
                  lang="bn"
                  onClick={() => setLang('bn')}
                  aria-pressed={lang === 'bn'}
                  data-testid="lang-bn"
                  className={`cursor-pointer whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition-colors sm:px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    lang === 'bn'
                      ? 'bg-[#171A21] text-[#F6F4EF]'
                      : 'text-[#4C5361] hover:text-[#171A21]'
                  }`}
                >
                  বাং
                </button>
                <button
                  type="button"
                  lang="en"
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                  data-testid="lang-en"
                  className={`cursor-pointer whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition-colors sm:px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    lang === 'en'
                      ? 'bg-[#171A21] text-[#F6F4EF]'
                      : 'text-[#4C5361] hover:text-[#171A21]'
                  }`}
                >
                  EN
                </button>
              </div>

              <span
                aria-hidden="true"
                className="hidden h-4 w-px bg-[#171A21]/14 sm:block"
              />

              <AmbientSound />

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={
                  mobileOpen ? copy.nav.closeMenu : copy.nav.openMenu
                }
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation-drawer"
                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full text-[#171A21] transition-colors hover:bg-[#171A21]/10 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                {mobileOpen ? (
                  <X className="h-4.5 w-4.5" />
                ) : (
                  <Menu className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Frosted Mobile Navigation Drawer */}
      <div
        id="mobile-navigation-drawer"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-30 flex flex-col justify-between bg-[#3E4756]/92 px-6 pb-10 pt-24 text-[#F6F4EF] backdrop-blur-[28px] transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
          {/* Mobile Language Switcher */}
          <div
            role="group"
            aria-label={copy.nav.langSwitchAria}
            className="mb-2 flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-2"
          >
            <span className="pl-3 text-xs font-medium text-[#F6F4EF]/80">
              {lang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Select Language'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                lang="bn"
                onClick={() => setLang('bn')}
                aria-pressed={lang === 'bn'}
                className={`cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  lang === 'bn'
                    ? 'bg-[#F6F4EF] text-[#171A21] shadow-sm'
                    : 'text-[#F6F4EF]/70 hover:text-[#F6F4EF]'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                lang="en"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-[#F6F4EF] text-[#171A21] shadow-sm'
                    : 'text-[#F6F4EF]/70 hover:text-[#F6F4EF]'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigateToSection(
                'chapter-story',
                'chapter-presence',
                'chapter-story'
              )
            }
            className="font-editorial-serif rounded-2xl border border-white/14 bg-white/6 px-5 py-4 text-left text-2xl font-normal text-[#F6F4EF]/90 transition-colors hover:border-white/30"
          >
            {copy.nav.journey}
          </button>
          <button
            type="button"
            onClick={() =>
              navigateToSection('chapter-cycles', 'chapter-4', 'chapter-cycles')
            }
            className="font-editorial-serif rounded-2xl border border-white/14 bg-white/6 px-5 py-4 text-left text-2xl font-normal text-[#F6F4EF]/90 transition-colors hover:border-white/30"
          >
            {copy.nav.cycles}
          </button>
          <TransitionLink
            to="/poems"
            onClick={() => setMobileOpen(false)}
            className={`font-editorial-serif rounded-2xl border px-5 py-4 text-2xl font-normal transition-colors ${
              isArchive
                ? 'border-white/35 bg-white/15 text-[#F6F4EF]'
                : 'border-white/14 bg-white/6 text-[#F6F4EF]/90'
            }`}
          >
            {copy.nav.archive}
          </TransitionLink>
          <TransitionLink
            to="/disclaimer"
            onClick={() => setMobileOpen(false)}
            className={`font-editorial-serif rounded-2xl border px-5 py-4 text-2xl font-normal transition-colors ${
              isDisclaimer
                ? 'border-white/35 bg-white/15 text-[#F6F4EF]'
                : 'border-white/14 bg-white/6 text-[#F6F4EF]/90'
            }`}
          >
            {copy.nav.disclaimer}
          </TransitionLink>
        </nav>

        <p className="font-editorial-serif text-base text-[#F6F4EF]/75">
          {cyclesSummary}
        </p>
      </div>
    </>
  );
}
