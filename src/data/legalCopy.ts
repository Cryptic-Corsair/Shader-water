import type { SiteLang } from '../context/LanguageContext';

export interface LegalSectionItem {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
}

export interface LegalPageContent {
  eyebrow: string;
  title: string;
  lead: string;
  effectiveLabel: string;
  effectiveDate: string;
  correspondenceHeading: string;
  correspondenceBody: string;
  copyEmailLabel: string;
  copiedEmailLabel: string;
  backHomeLabel: string;
  openArchiveLabel: string;
  sections: readonly LegalSectionItem[];
}

export const LEGAL_COPY: Record<SiteLang, LegalPageContent> = {
  bn: {
    eyebrow: 'আইনি তথ্য ও নীতিমালা',
    title: 'কপিরাইট, দায়মুক্তি ও ব্যবহারের শর্তাবলী',
    lead: 'অনন্যা হাসানের সংগৃহীত বাংলা কবিতাগার, পাঠকক্ষ, ওয়েব অডিও ও স্বয়ংক্রিয় আবৃত্তি ব্যবস্থার মেধাস্বত্ব, গোপনীয়তা ও ব্যবহারসংক্রান্ত আনুষ্ঠানিক বিবরণ।',
    effectiveLabel: 'সংকলন ও হালনাগাদ',
    effectiveDate: '২০২৩–২০২৪ সংস্করণ · সর্বশেষ পরিমার্জনা ২০২৫',
    correspondenceHeading: 'স্বত্বানুমতি ও প্রাতিষ্ঠানিক যোগাযোগ',
    correspondenceBody:
      'কবিতার পুনঃপ্রকাশ, আবৃত্তি অনুষ্ঠান, অনুবাদ বা মুদ্রিত সংকলনে উদ্ধৃতির অনুমতির জন্য অনুগ্রহ করে সরাসরি ইমেইলে যোগাযোগ করুন।',
    copyEmailLabel: 'ইমেইল কপি করুন',
    copiedEmailLabel: 'কপি হয়েছে',
    backHomeLabel: 'নীড়পাতায় ফিরুন',
    openArchiveLabel: 'সব কবিতা পড়ুন',
    sections: [
      {
        id: 'copyright',
        eyebrow: '০১ · মেধাস্বত্ব ও স্বত্বাধিকার',
        title: 'সাহিত্যকর্ম ও কপিরাইট সংরক্ষণ',
        paragraphs: [
          'এই সংকলনে প্রকাশিত সকল বাংলা কবিতা, শিরোনাম, রচনাকালের তারিখ এবং পাঠ-বিন্যাস অনন্যা হাসানের মৌলিক সাহিত্যকর্ম ও কপিরাইট আইন দ্বারা সংরক্ষিত। ১৩ ডিসেম্বর ২০২৩ থেকে ২ ফেব্রুয়ারি ২০২৪ পর্যন্ত রচিত প্রতিটি রচনার সর্বস্বত্ব লেখক কর্তৃক সংরক্ষিত।',
          'পাঠক ও গবেষকরা ব্যক্তিগত পাঠ, সাহিত্য সমালোচনা বা অবাণিজ্যিক শিক্ষামূলক আলোচনায় কবির নাম ও কবিতার শিরোনাম স্পষ্টভাবে উল্লেখ করে সংক্ষিপ্ত অংশ উদ্ধৃত করতে পারবেন। লেখকের পূর্বানুমতি ব্যতীত সম্পূর্ণ কবিতা বাণিজ্যিকভাবে পুনর্মুদ্রণ, বিতরণ, বা অন্য মাধ্যমে প্রকাশ করা নিষিদ্ধ।',
        ],
      },
      {
        id: 'editorial-disclaimer',
        eyebrow: '০২ · সম্পাদকীয় দায়মুক্তি',
        title: 'মূল বাংলা পাঠ, অনুবাদ ও টীকা',
        paragraphs: [
          'এই ওয়েবসাইটের প্রতিটি কবিতা কবির মূল বাংলা বানান, বিরামচিহ্ন ও ছন্দের নিজস্ব রূপ অক্ষুণ্ণ রেখে প্রকাশ করা হয়েছে। কবিতাগুলোতে প্রকাশিত ভাবনা, আবেগ ও বক্তব্য সম্পূর্ণরূপে সৃজনশীল ও সাহিত্যিক প্রকাশ—এগুলোকে কোনো ব্যক্তি, প্রতিষ্ঠান বা ঘটনার প্রতি নির্দিষ্ট তথ্যগত বিবৃতি বা পরামর্শ হিসেবে গণ্য করা উচিত নয়।',
          'পাঠকের সুবিধার্থে প্রদত্ত ইংরেজি পরিচিতি, বিষয়ভিত্তিক চক্রবিন্যাস ও পাঠকক্ষের প্রান্তটীকা (marginalia) কেবল ব্যাখ্যামূলক সহায়তা হিসেবে সংযোজিত হয়েছে; অর্থ ও ব্যঞ্জনার ক্ষেত্রে মূল বাংলা পঙ্‌ক্তিই চূড়ান্ত ও প্রামাণ্য।',
        ],
      },
      {
        id: 'web-speech-audio',
        eyebrow: '০৩ · ওয়েব স্পিচ ও অডিও বিজ্ঞপ্তি',
        title: 'কবিতা আবৃত্তি ও আবহ ধ্বনির প্রযুক্তিগত সীমা',
        paragraphs: [
          'কবিতা শোনার ঐচ্ছিক আবৃত্তি সুবিধাটি সম্পূর্ণভাবে আপনার ব্রাউজারের বিল্ট-ইন Web Speech API (SpeechSynthesis) ব্যবহার করে আপনার ডিভাইসেই পরিচালিত হয়। একইভাবে, গোধূলির আবহ ধ্বনি আপনার ব্রাউজারের Web Audio API-এর মাধ্যমে তাৎক্ষণিকভাবে তৈরি হয়।',
          'বাংলা কণ্ঠস্বরের প্রাপ্যতা, উচ্চারণভঙ্গি ও শব্দের গতির মান ব্যবহারকারীর ডিভাইস, অপারেটিং সিস্টেম ও ব্রাউজারের ভাষা-সমর্থনের ওপর নির্ভরশীল। পাঠের সময় কোনো কণ্ঠস্বর বা অডিও রেকর্ড, সংরক্ষণ বা বাইরের কোনো সার্ভারে প্রেরণ করা হয় না।',
        ],
      },
      {
        id: 'privacy-storage',
        eyebrow: '০৪ · গোপনীয়তা ও ব্যবহারের শর্ত',
        title: 'তথ্য সংরক্ষণ, কুকি ও বাহ্যিক সংযোগ',
        paragraphs: [
          'এই কবিতাগার কোনো বিজ্ঞাপন, আচরণগত ট্র্যাকিং কুকি বা তৃতীয় পক্ষের বিশ্লেষণী নজরদারি ব্যবহার করে না। আপনার নির্বাচিত ভাষা (বাংলা/English), পাঠকক্ষের অক্ষরের আকার এবং গোধূলি বা দিবালোক প্রদর্শনের পছন্দ কেবল আপনার ব্রাউজারের লোকাল স্টোরেজে (localStorage) সংরক্ষিত থাকে।',
          'উন্নত বাংলা ও ইংরেজি মুদ্রণশৈলীর জন্য ওয়েব ফন্ট লোড করা হতে পারে, যা স্ট্যান্ডার্ড ব্রাউজার অনুরোধের আওতায় পড়ে। চিঠিপত্রের ফর্মে প্রদত্ত ইমেইল ঠিকানা তাৎক্ষণিক বৈধতা যাচাইয়ের মধ্যেই সীমাবদ্ধ থাকে এবং কোনো অযাচিত বাণিজ্যিক তালিকায় যুক্ত করা হয় না।',
        ],
      },
    ],
  },
  en: {
    eyebrow: 'Legal & Editorial Notice',
    title: 'Disclaimer, Copyright & Terms of Use',
    lead: 'Formal copyright statement, editorial boundaries, client-side Web Speech API audio notice, and privacy commitments governing Ananya Hasan’s collected Bengali poetry archive.',
    effectiveLabel: 'Collection Edition',
    effectiveDate: '2023–2024 Notebook · Revised 2025',
    correspondenceHeading: 'Permissions & Correspondence',
    correspondenceBody:
      'For anthology licensing, public recitation permissions, formal translation requests, or takedown inquiries, please write directly to the correspondence desk.',
    copyEmailLabel: 'Copy Email',
    copiedEmailLabel: 'Copied',
    backHomeLabel: 'Return Home',
    openArchiveLabel: 'Explore Poems',
    sections: [
      {
        id: 'copyright',
        eyebrow: '01 · Literary Ownership',
        title: 'Copyright & Attribution of Original Works',
        paragraphs: [
          'All Bengali poems, original titles, composition dates, and stanza arrangements published in this collection are the original literary property of Ananya Hasan, written between 13 December 2023 and 2 February 2024. All moral and economic copyright belongs exclusively to the author.',
          'Readers, critics, and educators may quote brief passages for non-commercial review, scholarship, or literary commentary provided clear attribution to Ananya Hasan and the poem title is preserved. Reproduction, scraping, syndication, or commercial republication of full works without written consent is prohibited.',
        ],
      },
      {
        id: 'editorial-disclaimer',
        eyebrow: '02 · Editorial Scope',
        title: 'Artistic Expression & Archival Notes Disclaimer',
        paragraphs: [
          'Every poem is archived verbatim in its original Bengali orthography, poetic punctuation, and cadence. All themes, reflections, and imagery represent artistic and lyrical expression and are not intended as factual claims, legal counsel, or personal commentary directed at specific real-world individuals or entities.',
          'English cycle headings, summaries, reading-time estimates, and Reading Room marginalia are editorial framing aids created for bilingual navigation. In all matters of interpretation and meaning, the original Bengali text remains authoritative.',
        ],
      },
      {
        id: 'web-speech-audio',
        eyebrow: '03 · Audio Narration Notice',
        title: 'Web Speech API & Client-Side Soundscape Limitations',
        paragraphs: [
          'The optional poem narration toggle operates locally inside your web browser using the standard Web Speech API (SpeechSynthesis), and the optional coastal twilight soundscape is synthesized locally via the Web Audio API.',
          'Because speech synthesis relies entirely on voices installed in your operating system and browser (such as bn-BD or bn-IN speech packs), pronunciation quality, cadence, and availability vary by device and are not guaranteed across headless or unsupported environments. Zero audio data is recorded, logged, or uploaded to any server.',
        ],
      },
      {
        id: 'privacy-storage',
        eyebrow: '04 · Privacy & Governance',
        title: 'Zero Tracking, Local Preferences & Governing Principles',
        paragraphs: [
          'This publication uses no behavioral analytics, advertising cookies, or third-party tracking scripts. Browser localStorage is used strictly on your device to remember interface language (Bangla or English), Reading Room font size, and Twilight or Daylight surface selection.',
          'Web typography stylesheets may fetch standard open-source font families over HTTPS. This archive is provided on an "as-is" basis without warranties regarding uninterrupted availability, and any disputes relating to literary ownership or archival use are governed by applicable international copyright conventions.',
        ],
      },
    ],
  },
} as const;
