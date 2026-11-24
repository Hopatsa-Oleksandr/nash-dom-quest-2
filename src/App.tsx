import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Clock,
  Copy,
  Eye,
  RefreshCw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  ACT_TITLES,
  COIN_POOL,
  DEFAULT_PLAYERS,
  type CoinDenom,
  type GameState,
  type PlayerFocusView,
  type Role,
  type SessionConfig,
} from './types/game';
import {
  addInventoryItem,
  appendLog,
  buildPartnerInviteUrl,
  bumpState,
  clearUrlParams,
  createInitialGameState,
  getRemainingSeconds,
  getSelectedCoinsTotalCents,
  parseUrlSessionParams,
  PENALTY_SECONDS,
} from './utils/gameState';
import { formatTimeMMSS, ukVerb } from './utils/ukrainianGrammar';
import {
  playCoinClink,
  playErrorBuzz,
  playMechanicalClick,
  playSuccessChime,
  playVictoryFanfare,
  setAmbientDucked,
  setAmbientMuted,
  startActAmbient,
  stopAmbient,
  unlockAudioContext,
} from './utils/audio';
import { usePeerSession } from './hooks/usePeerSession';
import { LobbyScreen } from './components/LobbyScreen';
import { PlayerAvatar } from './components/ResilientMedia';
import { RadioAndToolsPanel } from './components/RadioAndToolsPanel';
import {
  ExitConfirmModal,
  TimeoutScreen,
  VictoryScreen,
} from './components/EndScreens';
import { Act1Scene } from './components/acts/Act1Scene';
import { Act2Scene } from './components/acts/Act2Scene';
import { Act3Scene } from './components/acts/Act3Scene';
import { Act4Scene } from './components/acts/Act4Scene';

const UNLOCK_SEQUENCE: ('turn_key' | 'press_red' | 'pull_handle' | 'confirm')[] = [
  'turn_key',
  'press_red',
  'pull_handle',
  'confirm',
];

const UNLOCK_LABELS: Record<'turn_key' | 'press_red' | 'pull_handle' | 'confirm', string> = {
  turn_key: 'Ключ повернуто праворуч',
  press_red: 'Червону кнопку «Freigabe» натиснуто',
  pull_handle: 'Ручку потягнуто на себе',
  confirm: 'Зелену кнопку «OK» підтверджено',
};

export default function App() {
  const initialUrl = useMemo(() => parseUrlSessionParams(), []);

  const [session, setSession] = useState<SessionConfig | null>(() => {
    if (initialUrl.autoLaunch && initialUrl.roomCode && initialUrl.role) {
      const defaults = DEFAULT_PLAYERS[initialUrl.role];
      return {
        roomCode: initialUrl.roomCode,
        role: initialUrl.role,
        name: initialUrl.name || defaults.name,
        gender: initialUrl.gender || defaults.gender,
        soloMode: false,
      };
    }
    return null;
  });

  // In solo preview mode, allows toggling active viewport role without leaving session
  const [soloActiveRole, setSoloActiveRole] = useState<Role>(initialUrl.role ?? 'p2');

  const [gameState, setGameState] = useState<GameState>(() => {
    const p1 = { ...DEFAULT_PLAYERS.p1 };
    const p2 = { ...DEFAULT_PLAYERS.p2 };
    if (initialUrl.autoLaunch && initialUrl.role) {
      if (initialUrl.role === 'p1') {
        p1.name = initialUrl.name || p1.name;
        p1.gender = initialUrl.gender || p1.gender;
      } else {
        p2.name = initialUrl.name || p2.name;
        p2.gender = initialUrl.gender || p2.gender;
      }
    }
    return createInitialGameState(p1, p2);
  });

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [copiedRoomLink, setCopiedRoomLink] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const [ambientIsMuted, setAmbientIsMuted] = useState(false);

  const [playerFocus, setPlayerFocus] = useState<Record<Role, PlayerFocusView>>({
    p1: { sceneTab: 'Сектори', panelTab: 'notebook' },
    p2: { sceneTab: 'Огляд станції', panelTab: 'notebook' },
  });

  const activeRole: Role = session
    ? session.soloMode
      ? soloActiveRole
      : session.role
    : 'p1';

  const partnerRole: Role = activeRole === 'p1' ? 'p2' : 'p1';

  const handlePartnerFocus = useCallback((remoteRole: Role, focus: PlayerFocusView) => {
    setPlayerFocus((prev) => {
      const cur = prev[remoteRole];
      if (cur.sceneTab === focus.sceneTab && cur.panelTab === focus.panelTab) {
        return prev;
      }
      return {
        ...prev,
        [remoteRole]: focus,
      };
    });
  }, []);

  const peer = usePeerSession({
    session,
    gameState,
    setGameState,
    localFocus: playerFocus[activeRole],
    onPartnerFocus: handlePartnerFocus,
  });

  const updateLocalFocus = useCallback(
    (patch: Partial<PlayerFocusView>) => {
      setPlayerFocus((prev) => {
        const current = prev[activeRole];
        const next: PlayerFocusView = {
          sceneTab: patch.sceneTab ?? current.sceneTab,
          panelTab: patch.panelTab ?? current.panelTab,
        };
        if (next.sceneTab === current.sceneTab && next.panelTab === current.panelTab) {
          return prev;
        }
        peer.broadcastFocus(next);
        return {
          ...prev,
          [activeRole]: next,
        };
      });
    },
    [activeRole, peer.broadcastFocus]
  );

  const handleSceneTabChange = useCallback(
    (tabLabel: string) => {
      updateLocalFocus({ sceneTab: tabLabel });
    },
    [updateLocalFocus]
  );

  const handlePanelTabChange = useCallback(
    (panelTab: 'notebook' | 'inventory') => {
      updateLocalFocus({ panelTab });
    },
    [updateLocalFocus]
  );

  // Keep default scene labels accurate for Acts 3 & 4 (which don't have separate inner tabs)
  useEffect(() => {
    if (!session || gameState.phase !== 'playing') return;
    if (gameState.act === 3) {
      updateLocalFocus({
        sceneTab: activeRole === 'p1' ? 'Вицвілий чек' : 'Монети і спогад',
      });
    } else if (gameState.act === 4) {
      const label =
        activeRole === 'p1'
          ? 'Інструкція DB'
          : gameState.act4.selectedLocker === 337
          ? 'Ящик № 337'
          : `Блок ${gameState.act4.selectedBlock}`;
      updateLocalFocus({ sceneTab: label });
    }
  }, [
    session,
    gameState.phase,
    gameState.act,
    gameState.act4.selectedBlock,
    gameState.act4.selectedLocker,
    activeRole,
    updateLocalFocus,
  ]);

  // Authoritative state mutator that bumps monotonic version and broadcasts immediately
  const mutateGameState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setGameState((prev) => {
        const next = bumpState(prev, updater);
        peer.broadcastState(next);
        return next;
      });
    },
    [peer.broadcastState]
  );

  // Trigger brief visual -0:30 penalty badge flash whenever penalty timestamp changes
  useEffect(() => {
    if (!gameState.lastPenaltyAt) return;
    setPenaltyFlash(true);
    const t = window.setTimeout(() => setPenaltyFlash(false), 1400);
    return () => window.clearTimeout(t);
  }, [gameState.lastPenaltyAt]);

  // Smoothly crossfade Web Audio ambient soundscape whenever active Act changes
  useEffect(() => {
    if (!session || gameState.phase !== 'playing') {
      stopAmbient();
      return;
    }
    startActAmbient(gameState.act);
  }, [session, gameState.phase, gameState.act]);

  // Cleanly stop ambient audio on component unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  // Automatically duck ambient soundscape while either player transmits on PTT walkie-talkie
  useEffect(() => {
    setAmbientDucked(peer.isTalking || peer.partnerTalking);
  }, [peer.isTalking, peer.partnerTalking]);

  // Unlock browser AudioContext on first user interaction (essential for direct URL launch)
  useEffect(() => {
    if (!session || gameState.phase !== 'playing') return;
    const handleGesture = () => {
      unlockAudioContext();
      startActAmbient(gameState.act);
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [session, gameState.phase, gameState.act]);

  const handleToggleAmbientMute = useCallback(() => {
    setAmbientIsMuted((prev) => {
      const next = !prev;
      setAmbientMuted(next);
      return next;
    });
  }, []);

  // 1-second global countdown ticker + automatic timeout transition
  useEffect(() => {
    if (!session || gameState.phase !== 'playing') return;
    const id = window.setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);
      const rem = getRemainingSeconds(gameState, currentNow);
      if (rem <= 0 && gameState.phase === 'playing') {
        mutateGameState((prev) => ({
          ...prev,
          phase: 'timeout',
          finishedRemainingSec: 0,
        }));
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [session, gameState, mutateGameState]);

  const remainingSec = getRemainingSeconds(gameState, nowMs);

  const handleStartFromLobby = useCallback((cfg: SessionConfig) => {
    const p1 = { ...DEFAULT_PLAYERS.p1 };
    const p2 = { ...DEFAULT_PLAYERS.p2 };
    if (cfg.role === 'p1') {
      p1.name = cfg.name;
      p1.gender = cfg.gender;
    } else {
      p2.name = cfg.name;
      p2.gender = cfg.gender;
    }

    setSoloActiveRole(cfg.role);
    setGameState(createInitialGameState(p1, p2));
    setSession(cfg);
    setNowMs(Date.now());

    // Keep URL synced for convenience in 2-player mode
    if (!cfg.soloMode && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('room', cfg.roomCode);
      url.searchParams.set('role', cfg.role);
      url.searchParams.set('name', cfg.name);
      url.searchParams.set('gender', cfg.gender);
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const handleConfirmExit = useCallback(() => {
    setExitModalOpen(false);
    stopAmbient();
    peer.disconnect();
    clearUrlParams();
    setSession(null);
  }, [peer]);

  const handlePlayAgain = useCallback(() => {
    mutateGameState((prev) => {
      const fresh = createInitialGameState(prev.players.p1, prev.players.p2);
      return {
        ...fresh,
        version: prev.version + 1,
      };
    });
    setNowMs(Date.now());
  }, [mutateGameState]);

  const handleCopyPartnerLink = async () => {
    if (!session) return;
    const partnerRole: Role = session.role === 'p1' ? 'p2' : 'p1';
    const url = buildPartnerInviteUrl(session.roomCode, partnerRole);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRoomLink(true);
      window.setTimeout(() => setCopiedRoomLink(false), 2000);
    } catch {
      // ignore
    }
  };

  // Helper to apply a 30-second penalty with Ukrainian log & toast
  const applyMistake = useCallback(
    (act: 1 | 2 | 3 | 4, message: string) => {
      playErrorBuzz();
      mutateGameState((prev) => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        penaltySec: prev.penaltySec + PENALTY_SECONDS,
        lastPenaltyAt: Date.now(),
        lastToast: { id: `err-${Date.now()}`, text: message, tone: 'error' },
        notebook: appendLog(prev.notebook, act, message, 'error'),
      }));
    },
    [mutateGameState]
  );

  // ================= ACT 1 HANDLERS =================
  const handleAct1Inspect = useCallback(
    (hotspotId: string, label: string) => {
      const p2 = gameState.players.p2;
      if (gameState.act1.inspectedHotspots.includes(hotspotId)) return;
      playMechanicalClick();
      mutateGameState((prev) => ({
        ...prev,
        act1: {
          ...prev.act1,
          inspectedHotspots: prev.act1.inspectedHotspots.includes(hotspotId)
            ? prev.act1.inspectedHotspots
            : [...prev.act1.inspectedHotspots, hotspotId],
        },
        notebook: appendLog(
          prev.notebook,
          1,
          `${p2.name} ${ukVerb(p2.gender, 'inspected')} орієнтир: ${label}.`,
          'clue',
          `act1-spot-${hotspotId}`
        ),
      }));
    },
    [gameState.act1.inspectedHotspots, gameState.players.p2, mutateGameState]
  );

  const handleAct1AttemptStep = useCallback(
    (stepIndex: number, isCorrect: boolean, choiceLabel: string, errorFeedback: string) => {
      const p2 = gameState.players.p2;
      if (!isCorrect) {
        applyMistake(1, errorFeedback);
        return;
      }

      playSuccessChime();
      mutateGameState((prev) => {
        if (prev.act1.step !== stepIndex) return prev;
        const nextStep = prev.act1.step + 1;
        const finishedAct1 = nextStep >= 4;

        const msg = finishedAct1
          ? `${p2.name} ${ukVerb(p2.gender, 'walked')} весь обхід із велосипедом і ${ukVerb(
              p2.gender,
              'madeIt'
            )} на Платформу 4! Потяг MEX 13 вже прибуває.`
          : `${p2.name} успішно ${ukVerb(p2.gender, 'walked')} крок ${nextStep}/4: ${choiceLabel}.`;

        return {
          ...prev,
          act: finishedAct1 ? 2 : 1,
          act1: {
            ...prev.act1,
            step: nextStep,
            completed: finishedAct1,
          },
          inventory: finishedAct1
            ? addInventoryItem(prev.inventory, 'Вихід на Платформу 4 (Сектор A)')
            : prev.inventory,
          lastToast: { id: `ok-${Date.now()}`, text: msg, tone: 'success' },
          notebook: appendLog(prev.notebook, 1, msg, 'success'),
        };
      });
    },
    [applyMistake, gameState.players.p2, mutateGameState]
  );

  // ================= ACT 2 HANDLERS =================
  const handleAct2UpdateValidator = useCallback(
    (field: 'validatorZone' | 'validatorBikeClass' | 'validatorTimeWindow', value: string) => {
      playMechanicalClick();
      mutateGameState((prev) => ({
        ...prev,
        act2: {
          ...prev.act2,
          [field]: value,
        },
      }));
    },
    [mutateGameState]
  );

  const handleAct2ValidateTicket = useCallback(() => {
    const { validatorZone, validatorBikeClass, validatorTimeWindow } = gameState.act2;
    const p2 = gameState.players.p2;
    const valid =
      validatorZone === 'Z4' &&
      validatorBikeClass === 'V-RAD' &&
      validatorTimeWindow === 'NACH-09';

    if (!valid) {
      applyMistake(
        2,
        'Компостер відхилив комбінацію! Перевір Зону VVS, Клас велосипеда і Часове вікно у координатора (-30 сек).'
      );
      return;
    }

    playSuccessChime();
    const msg = `${p2.name} ${ukVerb(
      p2.gender,
      'punched'
    )} правильний велоквиток (Zone 4 · V-RAD · Ab 09:00)! Час сідати у правильний сектор MEX 13.`;

    mutateGameState((prev) => ({
      ...prev,
      act2: {
        ...prev.act2,
        ticketValidated: true,
      },
      inventory: addInventoryItem(prev.inventory, 'Велоквиток VVS (Zone 4 · V-RAD)'),
      lastToast: { id: `tkt-${Date.now()}`, text: msg, tone: 'success' },
      notebook: appendLog(prev.notebook, 2, msg, 'success', 'act2-ticket-ok'),
    }));
  }, [applyMistake, gameState.act2, gameState.players.p2, mutateGameState]);

  const handleAct2InspectDisplay = useCallback(() => {
    if (gameState.act2.inspectedDisplay) return;
    const p2 = gameState.players.p2;
    playMechanicalClick();
    mutateGameState((prev) => ({
      ...prev,
      act2: {
        ...prev.act2,
        inspectedDisplay: true,
      },
      notebook: appendLog(
        prev.notebook,
        2,
        `${p2.name} ${ukVerb(
          p2.gender,
          'inspected'
        )} табло Gleis 4: MEX 13 о 14:22 ← Stuttgart Hbf, вагони [C]—[B]—[A].`,
        'clue',
        'act2-display'
      ),
    }));
  }, [gameState.act2.inspectedDisplay, gameState.players.p2, mutateGameState]);

  const handleAct2BoardSector = useCallback(
    (sector: 'A' | 'B' | 'C') => {
      const p2 = gameState.players.p2;
      if (!gameState.act2.ticketValidated) {
        applyMistake(
          2,
          'Спочатку потрібно прокомпостувати велоквиток VVS на платформі! Без квитка контролер не пустить (-30 сек).'
        );
        return;
      }

      if (sector !== 'B') {
        const reason =
          sector === 'C'
            ? 'У Секторі C (напрямок Stuttgart) — 1-й клас і тиха зона, велосипеди заборонені! (-30 сек).'
            : 'У Секторі A немає велокріплень! Запитай у координатора схему вагонів MEX 13 (-30 сек).';
        applyMistake(2, reason);
        return;
      }

      playSuccessChime();
      const msg = `${p2.name} ${ukVerb(
        p2.gender,
        'boarded'
      )} у веловагон Сектору B! Потяг MEX 13 рушив до Stuttgart Hbf.`;

      mutateGameState((prev) => ({
        ...prev,
        act: 3,
        act2: {
          ...prev.act2,
          boardedSector: 'B',
          completed: true,
        },
        lastToast: { id: `brd-${Date.now()}`, text: msg, tone: 'success' },
        notebook: appendLog(prev.notebook, 2, msg, 'success', 'act2-boarded'),
      }));
    },
    [applyMistake, gameState.act2.ticketValidated, gameState.players.p2, mutateGameState]
  );

  // ================= ACT 3 HANDLERS =================
  const checkAct3Completion = (draft: GameState): GameState => {
    const ready =
      draft.act3.p1SolvedLockerNumber &&
      draft.act3.p1SolvedFee &&
      draft.act3.p2CoinsLocked;
    if (!ready || draft.act3.completed) return draft;

    playSuccessChime();
    const msg =
      'Потяг прибув на Stuttgart Hbf! Номер ящика 337 вирахувано, точні 4,50 € монетами готові. Прямуємо до камер схову!';
    return {
      ...draft,
      act: 4,
      act3: {
        ...draft.act3,
        completed: true,
      },
      inventory: addInventoryItem(
        addInventoryItem(draft.inventory, 'Номер ящика: 337 (Блок 323–339)'),
        'Точні монети: 4,50 € (без здачі)'
      ),
      lastToast: { id: `act3-done-${Date.now()}`, text: msg, tone: 'success' },
      notebook: appendLog(draft.notebook, 3, msg, 'success', 'act3-complete'),
    };
  };

  const handleAct3RevealClue = useCallback(
    (clueId: string) => {
      if (gameState.act3.p1RevealedClues.includes(clueId)) return;
      playMechanicalClick();
      mutateGameState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          p1RevealedClues: [...prev.act3.p1RevealedClues, clueId],
        },
      }));
    },
    [gameState.act3.p1RevealedClues, mutateGameState]
  );

  const handleAct3P2ShareMemory = useCallback(() => {
    if (gameState.act3.p2SharedMemory) return;
    const p2 = gameState.players.p2;
    playSuccessChime();
    const msg = `${p2.name} ${ukVerb(
      p2.gender,
      'passed'
    )} спогад: «Ящик рівно над номером 338, поруч зі знаком Rauchfreier Bahnhof. Автомат здачі не дає!»`;
    mutateGameState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        p2SharedMemory: true,
      },
      lastToast: { id: `mem-${Date.now()}`, text: msg, tone: 'info' },
      notebook: appendLog(prev.notebook, 3, msg, 'clue', 'act3-memory'),
    }));
  }, [gameState.act3.p2SharedMemory, gameState.players.p2, mutateGameState]);

  const handleAct3SubmitLockerNumber = useCallback(
    (raw: string) => {
      const cleaned = raw.trim();
      const p1 = gameState.players.p1;
      if (cleaned !== '337') {
        applyMistake(
          3,
          `Номер «${cleaned || '—'}» не збігається з чеком та спогадом (над 338, непарний, сума цифр 13)! (-30 сек).`
        );
        return;
      }
      playSuccessChime();
      const msg = `${p1.name} ${ukVerb(p1.gender, 'solved')} номер ящика: № 337!`;
      mutateGameState((prev) =>
        checkAct3Completion({
          ...prev,
          act3: {
            ...prev.act3,
            p1SolvedLockerNumber: true,
          },
          lastToast: { id: `lnum-${Date.now()}`, text: msg, tone: 'success' },
          notebook: appendLog(prev.notebook, 3, msg, 'success', 'act3-num-337'),
        })
      );
    },
    [applyMistake, gameState.players.p1, mutateGameState]
  );

  const handleAct3SubmitFee = useCallback(
    (raw: string) => {
      const normalized = raw.trim().replace(',', '.').replace('€', '').trim();
      const parsed = Number.parseFloat(normalized);
      const p1 = gameState.players.p1;
      if (Number.isNaN(parsed) || Math.abs(parsed - 4.5) > 0.001) {
        applyMistake(
          3,
          'Неправильна сума доплати! Перерахуй: 3,00 € + 3 початі години × 0,50 € (-30 сек).'
        );
        return;
      }
      playSuccessChime();
      const msg = `${p1.name} ${ukVerb(
        p1.gender,
        'solved'
      )} суму доплати: рівно 4,50 €! Передай партнеру в потяг.`;
      mutateGameState((prev) =>
        checkAct3Completion({
          ...prev,
          act3: {
            ...prev.act3,
            p1SolvedFee: true,
          },
          lastToast: { id: `fee-${Date.now()}`, text: msg, tone: 'success' },
          notebook: appendLog(prev.notebook, 3, msg, 'success', 'act3-fee-450'),
        })
      );
    },
    [applyMistake, gameState.players.p1, mutateGameState]
  );

  const handleAct3AdjustCoin = useCallback(
    (denom: CoinDenom, delta: 1 | -1) => {
      playCoinClink();
      mutateGameState((prev) => {
        if (prev.act3.p2CoinsLocked) return prev;
        const current = prev.act3.p2SelectedCoins[denom];
        const next = Math.max(0, Math.min(COIN_POOL[denom].maxCount, current + delta));
        if (next === current) return prev;
        return {
          ...prev,
          act3: {
            ...prev.act3,
            p2SelectedCoins: {
              ...prev.act3.p2SelectedCoins,
              [denom]: next,
            },
          },
        };
      });
    },
    [mutateGameState]
  );

  const handleAct3ResetCoins = useCallback(() => {
    playMechanicalClick();
    mutateGameState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        p2SelectedCoins: { '200': 0, '100': 0, '50': 0, '20': 0, '10': 0 },
      },
    }));
  }, [mutateGameState]);

  const handleAct3ConfirmCoins = useCallback(() => {
    const total = getSelectedCoinsTotalCents(gameState.act3.p2SelectedCoins);
    const p2 = gameState.players.p2;
    if (total !== 450) {
      applyMistake(
        3,
        `Зібрано ${(total / 100).toFixed(2).replace('.', ',')} €, але для автомата без здачі потрібна точна сума від координатора! (-30 сек).`
      );
      return;
    }
    playSuccessChime();
    const msg = `${p2.name} ${ukVerb(p2.gender, 'collected')} точні монети на суму 4,50 € без здачі!`;
    mutateGameState((prev) =>
      checkAct3Completion({
        ...prev,
        act3: {
          ...prev.act3,
          p2CoinsLocked: true,
        },
        lastToast: { id: `coins-${Date.now()}`, text: msg, tone: 'success' },
        notebook: appendLog(prev.notebook, 3, msg, 'success', 'act3-coins-ok'),
      })
    );
  }, [applyMistake, gameState.act3.p2SelectedCoins, gameState.players.p2, mutateGameState]);

  // ================= ACT 4 HANDLERS =================
  const handleAct4SelectBlock = useCallback(
    (block: '037-060' | '323-339') => {
      playMechanicalClick();
      mutateGameState((prev) => ({
        ...prev,
        act4: {
          ...prev.act4,
          selectedBlock: block,
        },
      }));
    },
    [mutateGameState]
  );

  const handleAct4ClickLocker = useCallback(
    (lockerNum: number) => {
      const p2 = gameState.players.p2;
      if (lockerNum !== 337) {
        applyMistake(
          4,
          `Ящик № ${String(lockerNum).padStart(
            3,
            '0'
          )} — чужий! Шукай блок 323–339 біля «Rauchfreier Bahnhof», рівно над 338 (-30 сек).`
        );
        return;
      }
      playSuccessChime();
      const msg = `${p2.name} ${ukVerb(p2.gender, 'found')} ящик № 337! Час вкинути 4,50 € і відкрити замок.`;
      mutateGameState((prev) => ({
        ...prev,
        act4: {
          ...prev.act4,
          selectedLocker: 337,
        },
        lastToast: { id: `l337-${Date.now()}`, text: msg, tone: 'success' },
        notebook: appendLog(prev.notebook, 4, msg, 'success', 'act4-found-337'),
      }));
    },
    [applyMistake, gameState.players.p2, mutateGameState]
  );

  const handleAct4BackToWall = useCallback(() => {
    mutateGameState((prev) => ({
      ...prev,
      act4: {
        ...prev.act4,
        selectedLocker: null,
      },
    }));
  }, [mutateGameState]);

  const handleAct4InsertCoins = useCallback(() => {
    const p2 = gameState.players.p2;
    playCoinClink();
    window.setTimeout(() => playCoinClink(), 130);
    window.setTimeout(() => playSuccessChime(), 270);

    const msg = `${p2.name} ${ukVerb(
      p2.gender,
      'inserted'
    )} 4,50 €! Замок активовано на 25 секунд — виконуй 4 кроки інструкції DB!`;

    mutateGameState((prev) => ({
      ...prev,
      act4: {
        ...prev.act4,
        coinsInserted: true,
        unlockStep: 0,
        unlockTimerEndsAt: Date.now() + 25000,
      },
      lastToast: { id: `ins-${Date.now()}`, text: msg, tone: 'info' },
      notebook: appendLog(prev.notebook, 4, msg, 'clue', 'act4-coins-in'),
    }));
  }, [gameState.players.p2, mutateGameState]);

  const handleAct4MechanicalAction = useCallback(
    (action: 'turn_key' | 'press_red' | 'pull_handle' | 'confirm') => {
      const p2 = gameState.players.p2;
      const expected = UNLOCK_SEQUENCE[gameState.act4.unlockStep];

      if (action !== expected) {
        applyMistake(
          4,
          'Неправильний порядок механізму! Засувка скинулась на Крок 1 — слухай інструкцію координатора (-30 сек).'
        );
        mutateGameState((prev) => ({
          ...prev,
          act4: {
            ...prev.act4,
            unlockStep: 0,
            unlockTimerEndsAt: Date.now() + 25000,
          },
        }));
        return;
      }

      const nextStep = gameState.act4.unlockStep + 1;
      if (nextStep >= 4) {
        playVictoryFanfare();
        const finalRem = getRemainingSeconds(gameState, Date.now());
        const winMsg = `${p2.name} ${ukVerb(p2.gender, 'opened')} ящик № 337 і ${ukVerb(
          p2.gender,
          'saved'
        )} валізу!`;
        mutateGameState((prev) => ({
          ...prev,
          phase: 'victory',
          finishedRemainingSec: finalRem,
          act4: {
            ...prev.act4,
            unlockStep: 4,
            unlockTimerEndsAt: null,
            completed: true,
          },
          inventory: addInventoryItem(prev.inventory, 'Врятована валіза № 337'),
          lastToast: { id: `win-${Date.now()}`, text: winMsg, tone: 'success' },
          notebook: appendLog(prev.notebook, 4, winMsg, 'success', 'act4-victory'),
        }));
      } else {
        playMechanicalClick();
        const stepMsg = `Крок ${nextStep}/4: ${UNLOCK_LABELS[action]}!`;
        mutateGameState((prev) => ({
          ...prev,
          act4: {
            ...prev.act4,
            unlockStep: nextStep,
          },
          lastToast: { id: `mstep-${Date.now()}`, text: stepMsg, tone: 'success' },
        }));
      }
    },
    [applyMistake, gameState, mutateGameState]
  );

  const handleAct4MechanicalTimeoutReset = useCallback(() => {
    playErrorBuzz();
    mutateGameState((prev) => {
      if (!prev.act4.coinsInserted || prev.act4.completed) return prev;
      return {
        ...prev,
        act4: {
          ...prev.act4,
          unlockStep: 0,
          unlockTimerEndsAt: Date.now() + 25000,
        },
        lastToast: {
          id: `mreset-${Date.now()}`,
          text: '25 секунд минуло — механічна засувка скинулась на Крок 1. Спробуй швидше!',
          tone: 'error',
        },
      };
    });
  }, [mutateGameState]);

  // ================= RENDER ROUTING =================
  if (!session) {
    return (
      <LobbyScreen
        initialRoomCode={initialUrl.roomCode}
        initialRole={initialUrl.role}
        initialName={initialUrl.name}
        initialGender={initialUrl.gender}
        onStartGame={handleStartFromLobby}
      />
    );
  }

  if (gameState.phase === 'victory') {
    return (
      <>
        <audio ref={peer.remoteAudioRef} autoPlay playsInline className="hidden" />
        <VictoryScreen
          state={gameState}
          onPlayAgain={handlePlayAgain}
          onReturnLobby={handleConfirmExit}
        />
      </>
    );
  }

  if (gameState.phase === 'timeout') {
    return (
      <>
        <audio ref={peer.remoteAudioRef} autoPlay playsInline className="hidden" />
        <TimeoutScreen
          state={gameState}
          onPlayAgain={handlePlayAgain}
          onReturnLobby={handleConfirmExit}
        />
      </>
    );
  }

  const activePlayer = gameState.players[activeRole];
  const partnerPlayer = gameState.players[partnerRole];
  const partnerFocus = playerFocus[partnerRole];
  const partnerPanelLabel = partnerFocus.panelTab === 'notebook' ? 'Блокнот' : 'Інвентар';
  const actMeta = ACT_TITLES[gameState.act];
  const timerUrgent = remainingSec <= 60;
  const timerWarning = remainingSec > 60 && remainingSec <= 300;

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
      {/* Hidden remote PeerJS audio output for PTT walkie-talkie */}
      <audio ref={peer.remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Compact Single-Row Top HUD (<15% mobile height) */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 py-2">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Player Role, Partner Active Tab Marker & Current Act */}
          <div className="flex items-center gap-2.5 min-w-0">
            <PlayerAvatar
              role={activeRole}
              name={activePlayer.name}
              sizeClass="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white truncate">
                <span className="truncate">{activePlayer.name}</span>
                <span className="text-slate-500 font-normal hidden sm:inline">·</span>
                <span className="text-slate-400 font-medium text-xs hidden sm:inline whitespace-nowrap">
                  {activeRole === 'p1' ? 'Координатор' : 'Польовий гравець'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                <span className="text-amber-300 font-medium whitespace-nowrap shrink-0">
                  Акт {gameState.act}/4 · {actMeta.short}
                </span>
                <span className="text-slate-600" aria-hidden="true">
                  /
                </span>
                <span
                  title={`Партнер ${partnerPlayer.name} зараз переглядає: ${partnerFocus.sceneTab} · ${partnerPanelLabel}`}
                  className={`inline-flex items-center gap-1 min-w-0 truncate ${
                    session.soloMode || peer.partnerOnline ? 'text-sky-300' : 'text-slate-500'
                  }`}
                >
                  <Eye className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[210px] md:max-w-[260px]">
                    <span className="hidden sm:inline">{partnerPlayer.name}: </span>
                    {partnerFocus.sceneTab} · {partnerPanelLabel}
                  </span>
                </span>
              </div>
            </div>

            {/* Solo Preview Role Switcher */}
            {session.soloMode && (
              <button
                type="button"
                onClick={() => setSoloActiveRole((r) => (r === 'p1' ? 'p2' : 'p1'))}
                className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-400/50 text-amber-200 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                title="Перемкнути екран ролі в Соло-режимі"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{activeRole === 'p1' ? 'До Сясюні' : 'До Юясі'}</span>
              </button>
            )}
          </div>

          {/* Center: 30:00 Locker Countdown Timer */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border ${
                timerUrgent
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : timerWarning
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <div className="leading-none">
                <div className="font-mono-tabular text-sm sm:text-lg font-extrabold tracking-tight">
                  {formatTimeMMSS(remainingSec)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 hidden md:block mt-0.5">
                  До штрафу за камеру схову
                </div>
              </div>

              {penaltyFlash && (
                <span className="absolute -bottom-5 right-0 font-mono-tabular text-xs font-extrabold text-rose-400">
                  −0:30
                </span>
              )}
            </div>
          </div>

          {/* Right: P2P Connection Controls + Top-Right ✕ Exit Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!session.soloMode && (
              <>
                <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 pr-1">
                  {peer.partnerOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="whitespace-nowrap">Синхр. OK</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      <span className="whitespace-nowrap">Очікування...</span>
                    </>
                  )}
                </div>

                {!peer.partnerOnline && (
                  <button
                    type="button"
                    onClick={peer.reconnectNow}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] sm:text-xs font-semibold text-amber-300 whitespace-nowrap cursor-pointer"
                    title="Перепідключити PeerJS"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Перепідключити</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyPartnerLink}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 whitespace-nowrap cursor-pointer"
                  title="Скопіювати посилання для партнера"
                >
                  {copiedRoomLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Скопійовано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-mono-tabular">{session.roomCode}</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Ambient Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleAmbientMute}
              aria-label={ambientIsMuted ? 'Увімкнути фоновий звук' : 'Вимкнути фоновий звук'}
              title={ambientIsMuted ? 'Увімкнути фоновий звук' : 'Вимкнути фоновий звук'}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                ambientIsMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'
                  : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
              }`}
            >
              {ambientIsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Top-Right ✕ Exit Button */}
            <button
              type="button"
              onClick={() => setExitModalOpen(true)}
              aria-label="Вийти в головне меню"
              title="Вийти в головне меню"
              className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-rose-600/90 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Arena (Landscape: 16:9 Stage Left + Radio/Tools Right; Portrait: 16:9 Stage Top + Radio/Tools Below) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-5 py-3 sm:py-4 flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* Left/Center Column: Locked 16:9 Scene Viewport + Act Header/Toast */}
        <section className="w-full lg:col-span-8 xl:col-span-9 flex flex-col gap-2.5">
          {/* Compact Act Subtitle & Feedback Toast */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-0.5">
            <div className="text-slate-300 font-semibold">
              {actMeta.full}
              <span className="text-slate-500 mx-1.5">·</span>
              <span className="text-slate-400 font-normal">{actMeta.location}</span>
            </div>
            <div className="font-mono-tabular text-slate-400">
              Помилок: <span className="text-white font-semibold">{gameState.mistakes}</span>
            </div>
          </div>

          {/* Strictly Locked 16:9 (aspect-video) Interactive Stage */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            {gameState.act === 1 && (
              <Act1Scene
                role={activeRole}
                state={gameState}
                onInspectHotspot={handleAct1Inspect}
                onAttemptStep={handleAct1AttemptStep}
                onSceneTabChange={handleSceneTabChange}
              />
            )}

            {gameState.act === 2 && (
              <Act2Scene
                role={activeRole}
                state={gameState}
                onUpdateValidator={handleAct2UpdateValidator}
                onValidateTicket={handleAct2ValidateTicket}
                onInspectDisplay={handleAct2InspectDisplay}
                onBoardSector={handleAct2BoardSector}
                onSceneTabChange={handleSceneTabChange}
              />
            )}

            {gameState.act === 3 && (
              <Act3Scene
                role={activeRole}
                state={gameState}
                onP1RevealClue={handleAct3RevealClue}
                onP1SubmitLockerNumber={handleAct3SubmitLockerNumber}
                onP1SubmitFee={handleAct3SubmitFee}
                onP2ShareMemory={handleAct3P2ShareMemory}
                onP2AdjustCoin={handleAct3AdjustCoin}
                onP2ResetCoins={handleAct3ResetCoins}
                onP2ConfirmCoins={handleAct3ConfirmCoins}
              />
            )}

            {gameState.act === 4 && (
              <Act4Scene
                role={activeRole}
                state={gameState}
                onSelectBlock={handleAct4SelectBlock}
                onClickLocker={handleAct4ClickLocker}
                onBackToWall={handleAct4BackToWall}
                onInsertCoins={handleAct4InsertCoins}
                onMechanicalAction={handleAct4MechanicalAction}
                onMechanicalTimeoutReset={handleAct4MechanicalTimeoutReset}
              />
            )}
          </div>

          {/* Live Event Feedback Banner Below Scene */}
          {gameState.lastToast && (
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                gameState.lastToast.tone === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : gameState.lastToast.tone === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {gameState.lastToast.text}
            </div>
          )}
        </section>

        {/* Right Column (Desktop) / Bottom Deck (Mobile Portrait): PTT Radio + Notebook + Inventory */}
        <aside className="w-full lg:col-span-4 xl:col-span-3 lg:h-[calc(100vh-110px)] lg:sticky lg:top-16">
          <RadioAndToolsPanel
            role={activeRole}
            state={gameState}
            soloMode={session.soloMode}
            partnerOnline={peer.partnerOnline}
            isTalking={peer.isTalking}
            partnerTalking={peer.partnerTalking}
            micError={peer.micError}
            activeTab={playerFocus[activeRole].panelTab}
            onTabChange={handlePanelTabChange}
            onStartTalking={peer.startTalking}
            onStopTalking={peer.stopTalking}
          />
        </aside>
      </main>

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        open={exitModalOpen}
        onCancel={() => setExitModalOpen(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
}
