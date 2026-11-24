export type Role = 'p1' | 'p2';
export type Gender = 'f' | 'm';

export interface PlayerProfile {
  role: Role;
  name: string;
  gender: Gender;
}

export interface SessionConfig {
  roomCode: string;
  role: Role;
  name: string;
  gender: Gender;
  soloMode: boolean;
}

export type CoinDenom = '200' | '100' | '50' | '20' | '10';

export interface GameLogEntry {
  id: string;
  timestamp: number;
  act: 1 | 2 | 3 | 4;
  text: string;
  type: 'info' | 'success' | 'error' | 'clue';
}

export interface GameState {
  version: number;
  updatedAt: number;
  phase: 'playing' | 'victory' | 'timeout';
  act: 1 | 2 | 3 | 4;
  startedAt: number;
  totalDurationSec: number; // 1800 seconds (30:00)
  penaltySec: number;       // 30s per mistake
  mistakes: number;
  finishedRemainingSec: number | null;

  players: {
    p1: PlayerProfile;
    p2: PlayerProfile;
  };

  act1: {
    step: number; // 0..4
    inspectedHotspots: string[];
    completed: boolean;
  };

  act2: {
    ticketValidated: boolean;
    validatorZone: string;
    validatorBikeClass: string;
    validatorTimeWindow: string;
    inspectedDisplay: boolean;
    boardedSector: string | null;
    completed: boolean;
  };

  act3: {
    p2SharedMemory: boolean;
    p1RevealedClues: string[];
    p1SolvedLockerNumber: boolean;
    p1SolvedFee: boolean;
    p2SelectedCoins: Record<CoinDenom, number>;
    p2CoinsLocked: boolean;
    completed: boolean;
  };

  act4: {
    selectedBlock: '037-060' | '323-339';
    selectedLocker: number | null;
    coinsInserted: boolean;
    unlockStep: number; // 0..4
    unlockTimerEndsAt: number | null;
    completed: boolean;
  };

  inventory: string[];
  notebook: GameLogEntry[];
  lastPenaltyAt: number | null;
  lastToast: {
    id: string;
    text: string;
    tone: 'info' | 'success' | 'error';
  } | null;
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'solo';

export interface PlayerFocusView {
  sceneTab: string;
  panelTab: 'notebook' | 'inventory';
}

export type PeerMessage =
  | {
      type: 'SYNC_STATE';
      state: GameState;
      profile: PlayerProfile;
      focus?: PlayerFocusView;
    }
  | {
      type: 'HEARTBEAT';
      state: GameState;
      profile: PlayerProfile;
      focus?: PlayerFocusView;
    }
  | {
      type: 'PTT_STATUS';
      talking: boolean;
      role: Role;
    }
  | {
      type: 'PROFILE_UPDATE';
      profile: PlayerProfile;
    }
  | {
      type: 'FOCUS_UPDATE';
      role: Role;
      focus: PlayerFocusView;
    };

export const DEFAULT_PLAYERS: Record<Role, PlayerProfile> = {
  p1: {
    role: 'p1',
    name: 'Юяся',
    gender: 'f',
  },
  p2: {
    role: 'p2',
    name: 'Сясюня',
    gender: 'm',
  },
};

export const ACT_TITLES: Record<1 | 2 | 3 | 4, { short: string; full: string; location: string }> = {
  1: {
    short: 'Шорндорф',
    full: 'Акт 1: Лабіринт будівництва — Шорндорф',
    location: 'Schorndorf Bf · Baustelle',
  },
  2: {
    short: 'Платформа 4',
    full: 'Акт 2: Посадка на MEX (Платформа 4)',
    location: 'Schorndorf · Gleis 4',
  },
  3: {
    short: 'В дорозі',
    full: 'Акт 3: В дорозі — Загублений номер і дрібні монети',
    location: 'MEX 13 · Remstal → Stuttgart',
  },
  4: {
    short: 'Ящик 337',
    full: 'Акт 4: Stuttgart Hbf — Ящик 337',
    location: 'Stuttgart Hbf · Schließfächer',
  },
};

export const COIN_POOL: Record<CoinDenom, { label: string; cents: number; maxCount: number }> = {
  '200': { label: '2 €', cents: 200, maxCount: 1 },
  '100': { label: '1 €', cents: 100, maxCount: 2 },
  '50': { label: '50 c', cents: 50, maxCount: 2 },
  '20': { label: '20 c', cents: 20, maxCount: 3 },
  '10': { label: '10 c', cents: 10, maxCount: 3 },
};

export const GENERATED_ASSETS = {
  lobbyHero: '/src/assets/images/lobby_hero_station_1795545685384.jpg',
  avatarP1: '/src/assets/images/avatar_yuyasya_1795545680602.jpg',
  avatarP2: '/src/assets/images/avatar_syasyunya_1795545679316.jpg',
  victorySuitcase: '/src/assets/images/victory_suitcase_337_1795545680488.jpg',
};
