import {
  DEFAULT_PLAYERS,
  type CoinDenom,
  type GameLogEntry,
  type GameState,
  type Gender,
  type PlayerProfile,
  type Role,
  type SessionConfig,
} from '../types/game';

export const INITIAL_DURATION_SEC = 1800; // 30:00
export const PENALTY_SECONDS = 30;

export function createInitialGameState(
  p1Profile: PlayerProfile = DEFAULT_PLAYERS.p1,
  p2Profile: PlayerProfile = DEFAULT_PLAYERS.p2
): GameState {
  const now = Date.now();
  return {
    version: 1,
    updatedAt: now,
    phase: 'playing',
    act: 1,
    startedAt: now,
    totalDurationSec: INITIAL_DURATION_SEC,
    penaltySec: 0,
    mistakes: 0,
    finishedRemainingSec: null,
    players: {
      p1: { ...p1Profile, role: 'p1' },
      p2: { ...p2Profile, role: 'p2' },
    },
    act1: {
      step: 0,
      inspectedHotspots: [],
      completed: false,
    },
    act2: {
      ticketValidated: false,
      validatorZone: 'Z1',
      validatorBikeClass: 'NORMAL',
      validatorTimeWindow: 'SPERR',
      inspectedDisplay: false,
      boardedSector: null,
      completed: false,
    },
    act3: {
      p2SharedMemory: false,
      p1RevealedClues: [],
      p1SolvedLockerNumber: false,
      p1SolvedFee: false,
      p2SelectedCoins: {
        '200': 0,
        '100': 0,
        '50': 0,
        '20': 0,
        '10': 0,
      },
      p2CoinsLocked: false,
      completed: false,
    },
    act4: {
      selectedBlock: '037-060',
      selectedLocker: null,
      coinsInserted: false,
      unlockStep: 0,
      unlockTimerEndsAt: null,
      completed: false,
    },
    inventory: ['Велосипед (на станції Шорндорф)', 'Рація DB-Канал 337'],
    notebook: [
      {
        id: 'init-1',
        timestamp: now,
        act: 1,
        text: 'Операція розпочалась! Мета: дістатися з Шорндорфа до камери схову на Stuttgart Hbf за 30 хвилин, поки не нарахували штраф.',
        type: 'info',
      },
    ],
    lastPenaltyAt: null,
    lastToast: null,
  };
}

/**
 * Computes remaining countdown seconds from authoritative state.
 */
export function getRemainingSeconds(state: GameState, nowMs: number = Date.now()): number {
  if (state.finishedRemainingSec !== null) {
    return Math.max(0, state.finishedRemainingSec);
  }
  const elapsed = Math.floor((nowMs - state.startedAt) / 1000);
  return Math.max(0, state.totalDurationSec - elapsed - state.penaltySec);
}

/**
 * Calculates total prepared cents in Act 3 coin pouch.
 */
export function getSelectedCoinsTotalCents(selected: Record<CoinDenom, number>): number {
  return (
    selected['200'] * 200 +
    selected['100'] * 100 +
    selected['50'] * 50 +
    selected['20'] * 20 +
    selected['10'] * 10
  );
}

/**
 * Produces a new GameState with bumped monotonic version and updated timestamp.
 */
export function bumpState(
  prev: GameState,
  updater: (draft: GameState) => GameState
): GameState {
  const next = updater(prev);
  return {
    ...next,
    version: prev.version + 1,
    updatedAt: Date.now(),
  };
}

/**
 * Adds an idempotent notebook log entry (capped at last 40 items).
 */
export function appendLog(
  notebook: GameLogEntry[],
  act: 1 | 2 | 3 | 4,
  text: string,
  type: GameLogEntry['type'],
  customId?: string
): GameLogEntry[] {
  const id = customId ?? `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (notebook.some((item) => item.id === id)) return notebook;
  return [...notebook, { id, timestamp: Date.now(), act, text, type }].slice(-40);
}

/**
 * Adds an inventory item if not already present.
 */
export function addInventoryItem(inventory: string[], item: string): string[] {
  if (inventory.includes(item)) return inventory;
  return [...inventory, item];
}

/**
 * Authoritative P2P state reconciliation using monotonic version + updatedAt tie-breaker.
 * Never loses progress when peers reconnect.
 */
export function mergeGameState(local: GameState, incoming: GameState): GameState {
  if (incoming.version > local.version) {
    return incoming;
  }
  if (incoming.version < local.version) {
    return local;
  }
  // Equal version: prefer higher act, or more recent updatedAt
  if (incoming.act > local.act) return incoming;
  if (local.act > incoming.act) return local;
  return incoming.updatedAt >= local.updatedAt ? incoming : local;
}

/**
 * Generates a readable 6-character room code.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'V337-';
  for (let i = 0; i < 4; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function sanitizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 16);
}

/**
 * Parses URL query params: ?room=...&role=p1|p2&name=...&gender=m|f
 */
export function parseUrlSessionParams(): Partial<SessionConfig> & { autoLaunch: boolean } {
  if (typeof window === 'undefined') return { autoLaunch: false };
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  const roleParam = params.get('role');
  const nameParam = params.get('name');
  const genderParam = params.get('gender');

  const role: Role | undefined =
    roleParam === 'p1' || roleParam === 'p2' ? roleParam : undefined;
  const gender: Gender | undefined =
    genderParam === 'm' || genderParam === 'f' ? genderParam : undefined;

  const cleanRoom = room ? sanitizeRoomCode(room) : undefined;
  const autoLaunch = Boolean(cleanRoom && role);

  return {
    roomCode: cleanRoom,
    role,
    name: nameParam ? nameParam.trim().slice(0, 24) : undefined,
    gender,
    autoLaunch,
  };
}

/**
 * Clears URL query parameters cleanly without page reload.
 */
export function clearUrlParams(): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

/**
 * Builds shareable invite URL for the partner role.
 */
export function buildPartnerInviteUrl(roomCode: string, partnerRole: Role): string {
  if (typeof window === 'undefined') return '';
  const partnerDefault = DEFAULT_PLAYERS[partnerRole];
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('room', sanitizeRoomCode(roomCode));
  url.searchParams.set('role', partnerRole);
  url.searchParams.set('name', partnerDefault.name);
  url.searchParams.set('gender', partnerDefault.gender);
  return url.toString();
}
