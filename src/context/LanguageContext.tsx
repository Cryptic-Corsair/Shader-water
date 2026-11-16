import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type SiteLang = 'bn' | 'en';

export const SITE_LANG_STORAGE_KEY = 'site-lang';

interface LanguageContextValue {
  lang: SiteLang;
  isBangla: boolean;
  setLang: (next: SiteLang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'bn',
  isBangla: true,
  setLang: () => {},
  toggleLang: () => {},
});

function getLangFromLocation(): SiteLang | null {
  if (typeof window === 'undefined') return null;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const qLang = searchParams.get('lang');
    if (qLang === 'en' || qLang === 'bn') {
      return qLang;
    }
    // Also check hash-based queries (e.g. #/?lang=bn or #/poems?lang=bn)
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?') + 1);
      const hashParams = new URLSearchParams(hashQuery);
      const hLang = hashParams.get('lang');
      if (hLang === 'en' || hLang === 'bn') {
        return hLang;
      }
    }
  } catch {
    // Ignore URL parse errors
  }
  return null;
}

function readInitialLang(): SiteLang {
  if (typeof window === 'undefined') return 'bn';
  // 1. URL parameter takes first priority
  const queryLang = getLangFromLocation();
  if (queryLang) {
    try {
      window.localStorage.setItem(SITE_LANG_STORAGE_KEY, queryLang);
    } catch {
      // Ignore storage errors
    }
    return queryLang;
  }
  // 2. Local storage takes second priority
  try {
    const stored = window.localStorage.getItem(SITE_LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'bn') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  // 3. Default is strictly Bengali (bn)
  return 'bn';
}

function applyLangAttributes(targetLang: SiteLang) {
  if (typeof document === 'undefined') return;
  const doc = document.documentElement;
  const body = document.body;
  doc.lang = targetLang;
  doc.setAttribute('data-lang', targetLang);
  if (body) {
    body.setAttribute('data-lang', targetLang);
    body.classList.remove('site-lang-bn', 'site-lang-en');
    body.classList.add(`site-lang-${targetLang}`);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>(readInitialLang);

  useEffect(() => {
    applyLangAttributes(lang);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SITE_LANG_STORAGE_KEY, lang);
      } catch {
        // Ignore storage errors
      }

      // Sync URL query without reloading the page
      try {
        const url = new URL(window.location.href);
        const currentParam = url.searchParams.get('lang');
        if (currentParam !== lang) {
          url.searchParams.set('lang', lang);
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        // Ignore URL replace errors
      }
    }
  }, [lang]);

  // Listen for browser navigation changes or external URL updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUrlChange = () => {
      const urlLang = getLangFromLocation();
      if (urlLang && urlLang !== lang) {
        setLangState(urlLang);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [lang]);

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isBangla: lang === 'bn',
        setLang,
        toggleLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
