import {
  POEMS_CATALOG,
  getFeaturedPoems,
  type CycleId,
  type PoemMeta,
} from '../../data/poemsCatalog';

export function getFeaturedTodayPoem(date: Date = new Date()): PoemMeta {
  const featured = getFeaturedPoems();
  if (featured.length === 0) {
    throw new Error('No featured poems available in catalog.');
  }
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % featured.length;
  return featured[index];
}

export interface HeroCycleVisual {
  id: CycleId;
  indexLabelBn: string;
  indexLabelEn: string;
  azimuthDeg: number;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  accentGlow: string;
  ringAccent: string;
  eclipseShiftX: number;
  eclipseShiftY: number;
  eclipseOpacity: number;
}

export const HERO_CYCLE_ORDER: readonly CycleId[] = [
  'twilight-sky',
  'masks-reality',
  'longing-dawn',
] as const;

export const HERO_CYCLE_VISUALS: Record<CycleId, HeroCycleVisual> = {
  'twilight-sky': {
    id: 'twilight-sky',
    indexLabelBn: '০১',
    indexLabelEn: '01',
    azimuthDeg: 0,
    skyTop: '#26303E',
    skyMid: '#48596D',
    skyBottom: '#1C222D',
    accentGlow: '#B2C2D4',
    ringAccent: '#DFBC91',
    eclipseShiftX: 16,
    eclipseShiftY: -12,
    eclipseOpacity: 0.78,
  },
  'masks-reality': {
    id: 'masks-reality',
    indexLabelBn: '০২',
    indexLabelEn: '02',
    azimuthDeg: 120,
    skyTop: '#2D2B31',
    skyMid: '#5A4F4B',
    skyBottom: '#1D1E24',
    accentGlow: '#DFBC91',
    ringAccent: '#E7CAA4',
    eclipseShiftX: 6,
    eclipseShiftY: -5,
    eclipseOpacity: 0.92,
  },
  'longing-dawn': {
    id: 'longing-dawn',
    indexLabelBn: '০৩',
    indexLabelEn: '03',
    azimuthDeg: 240,
    skyTop: '#383B47',
    skyMid: '#7D7069',
    skyBottom: '#232732',
    accentGlow: '#F2E5D0',
    ringAccent: '#F6F4EF',
    eclipseShiftX: 28,
    eclipseShiftY: -20,
    eclipseOpacity: 0.56,
  },
};

export function getHeroPoemForCycle(cycleId: CycleId): PoemMeta {
  const inCycle = POEMS_CATALOG.filter((p) => p.collection === cycleId).sort(
    (a, b) => a.order - b.order
  );
  const featured = inCycle.find((p) => p.featured);
  if (featured) return featured;
  if (inCycle[0]) return inCycle[0];
  return getFeaturedTodayPoem();
}

export const HERO_STANZA: [string, string] = [
  'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
  'গোধূলির ছায়া,, রক্তিম সূর্যাস্ত।।',
];
