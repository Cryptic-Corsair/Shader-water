import type { SiteLang } from '../../context/LanguageContext';
import { POET_TIMELINE_MILESTONES } from '../../data/authorProfile';

export interface MeridianMilestone {
  id: string;
  yearLabel: string;
  sortKey: number;
  kindLabel: string;
  title: string;
  citation: string;
  location: string;
  upcoming: boolean;
}

export function buildMeridianTimeline(lang: SiteLang = 'bn'): MeridianMilestone[] {
  return [...POET_TIMELINE_MILESTONES]
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((entry) => ({
      id: entry.id,
      yearLabel: entry.yearLabel[lang],
      sortKey: entry.sortKey,
      kindLabel: entry.kindLabel[lang],
      title: entry.title,
      citation: entry.citation[lang],
      location: entry.location[lang],
      upcoming: entry.upcoming,
    }));
}
