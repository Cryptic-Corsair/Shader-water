import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExcerptNarrationQueue,
  buildPoemNarrationQueue,
  clampNarrationRate,
  sanitizeVerseForSpeech,
  selectPreferredVoice,
  type VoiceLike,
} from './poemSpeech';

test('sanitizeVerseForSpeech strips ornamental stars, hearts, tildes, and excess punctuation cleanly', () => {
  assert.equal(
    sanitizeVerseForSpeech('শুধু প্রকাশের অপেক্ষায়----'),
    'শুধু প্রকাশের অপেক্ষায়'
  );
  assert.equal(
    sanitizeVerseForSpeech('তুমি আমার নীল আকাশের বিশালতা,,'),
    'তুমি আমার নীল আকাশের বিশালতা'
  );
  assert.equal(
    sanitizeVerseForSpeech('সকাল বেলার মিষ্টি রোদের আলো।।'),
    'সকাল বেলার মিষ্টি রোদের আলো।'
  );
  assert.equal(
    sanitizeVerseForSpeech('♡ চোখে~চোখ রেখে মনের ভাষা বুঝতে লাগে!!'),
    'চোখে চোখ রেখে মনের ভাষা বুঝতে লাগে!'
  );
  assert.equal(
    sanitizeVerseForSpeech('~☆~ ভালো থাকা বললেই কি ভালো থাকা যায়---??'),
    'ভালো থাকা বললেই কি ভালো থাকা যায়?'
  );
  assert.equal(sanitizeVerseForSpeech('☆~☆ অতএব ☆~☆'), 'অতএব');
  assert.equal(sanitizeVerseForSpeech('~☆~ ---- !!'), '');
});

test('buildPoemNarrationQueue tracks stanza and line coordinates while skipping symbol-only lines', () => {
  const queue = buildPoemNarrationQueue([
    ['প্রথম লাইন,,', '☆~☆'],
    ['দ্বিতীয় স্তবক ---- শেষ।।', 'তৃতীয় লাইন!!'],
  ]);

  assert.equal(queue.length, 3);
  assert.deepEqual(
    queue.map((seg) => ({
      index: seg.index,
      stanzaIndex: seg.stanzaIndex,
      lineIndex: seg.lineIndex,
      spokenText: seg.spokenText,
    })),
    [
      { index: 0, stanzaIndex: 0, lineIndex: 0, spokenText: 'প্রথম লাইন' },
      { index: 1, stanzaIndex: 1, lineIndex: 0, spokenText: 'দ্বিতীয় স্তবক, শেষ।' },
      { index: 2, stanzaIndex: 1, lineIndex: 1, spokenText: 'তৃতীয় লাইন!' },
    ]
  );
});

test('buildExcerptNarrationQueue creates single-stanza queue for selected verses', () => {
  const queue = buildExcerptNarrationQueue([
    'এই দুনিয়ায় হায়! মানুষ চেনা দায়!',
    'স্বার্থের জন্য করে সবাই লড়াই।',
  ]);
  assert.equal(queue.length, 2);
  assert.equal(queue[0].stanzaIndex, 0);
  assert.equal(queue[1].lineIndex, 1);
});

test('selectPreferredVoice prioritizes bn-BD then bn-IN then generic bn then default fallback', () => {
  const voices: VoiceLike[] = [
    { name: 'English US', lang: 'en-US', default: true },
    { name: 'Bengali India', lang: 'bn-IN', localService: true },
    { name: 'Bengali Bangladesh', lang: 'bn-BD', localService: false },
  ];

  assert.equal(selectPreferredVoice(voices)?.name, 'Bengali Bangladesh');
  assert.equal(
    selectPreferredVoice([voices[0], voices[1]])?.name,
    'Bengali India'
  );
  assert.equal(
    selectPreferredVoice([
      voices[0],
      { name: 'Generic Bengali', lang: 'bn' },
    ])?.name,
    'Generic Bengali'
  );
  assert.equal(selectPreferredVoice([voices[0]])?.name, 'English US');
  assert.equal(selectPreferredVoice([]), null);
});

test('clampNarrationRate snaps to allowed cadence steps', () => {
  assert.equal(clampNarrationRate(0.75), 0.8);
  assert.equal(clampNarrationRate(0.92), 0.92);
  assert.equal(clampNarrationRate(1.5), 1.08);
  assert.equal(clampNarrationRate(Number.NaN), 0.92);
});
