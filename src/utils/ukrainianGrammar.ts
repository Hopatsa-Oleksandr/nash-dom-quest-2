import type { Gender } from '../types/game';

/**
 * Selects the grammatically correct Ukrainian masculine/feminine form.
 */
export function g(gender: Gender, masc: string, fem: string): string {
  return gender === 'f' ? fem : masc;
}

/**
 * Common Ukrainian verbs & adjectives inflected by player gender.
 */
export function ukVerb(
  gender: Gender,
  key:
    | 'found'
    | 'madeIt'
    | 'passed'
    | 'walked'
    | 'punched'
    | 'boarded'
    | 'collected'
    | 'opened'
    | 'saved'
    | 'connected'
    | 'errored'
    | 'ready'
    | 'solved'
    | 'inspected'
    | 'shared'
    | 'inserted'
    | 'selected'
): string {
  const dict: Record<typeof key, [string, string]> = {
    found: ['знайшов', 'знайшла'],
    madeIt: ['встиг', 'встигла'],
    passed: ['передав', 'передала'],
    walked: ['пройшов', 'пройшла'],
    punched: ['прокомпостував', 'прокомпостувала'],
    boarded: ['сів', 'сіла'],
    collected: ['зібрав', 'зібрала'],
    opened: ['відкрив', 'відкрила'],
    saved: ['врятував', 'врятувала'],
    connected: ['підключився', 'підключилася'],
    errored: ['помилився', 'помилилася'],
    ready: ['готовий', 'готова'],
    solved: ['розгадав', 'розгадала'],
    inspected: ['оглянув', 'оглянула'],
    shared: ['поділився', 'поділилася'],
    inserted: ['вкинув', 'вкинула'],
    selected: ['обрав', 'обрала'],
  };
  const [masc, fem] = dict[key];
  return gender === 'f' ? fem : masc;
}

export function formatTimeMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatEuroFromCents(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}

export function pluralizeMistakes(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} помилка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} помилки`;
  return `${count} помилок`;
}
