import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Coins,
  KeyRound,
  LockOpen,
  ShieldAlert,
} from 'lucide-react';
import type { GameState, Role } from '../../types/game';
import { SceneBackdrop } from '../ResilientMedia';
import { CoordinatorDbDeskSvg, StuttgartHallSvg } from '../scenes/AtmosphericSvgs';

interface Act4SceneProps {
  role: Role;
  state: GameState;
  onSelectBlock: (block: '037-060' | '323-339') => void;
  onClickLocker: (lockerNum: number) => void;
  onBackToWall: () => void;
  onInsertCoins: () => void;
  onMechanicalAction: (action: 'turn_key' | 'press_red' | 'pull_handle' | 'confirm') => void;
  onMechanicalTimeoutReset: () => void;
}

// Block 037-060 (decoy block — arranged top/bottom rows)
const BLOCK_A_LOCKERS = [
  37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59,
  38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60,
];

// Block 323-339 (real block next to Rauchfreier Bahnhof — odd on top row so 337 sits directly ABOVE 338!)
const BLOCK_B_TOP = [323, 325, 327, 329, 331, 333, 335, 337, 339];
const BLOCK_B_BOTTOM = [324, 326, 328, 330, 332, 334, 336, 338, 340];

const UNLOCK_CONTROLS: {
  id: 'turn_key' | 'press_red' | 'pull_handle' | 'confirm';
  label: string;
  sub: string;
  accent: string;
}[] = [
  {
    id: 'pull_handle',
    label: 'Потягнути ручку на себе',
    sub: 'Металева скоба дверцят',
    accent: 'border-sky-400/70 hover:bg-sky-950/60',
  },
  {
    id: 'turn_key',
    label: 'Повернути ключ праворуч',
    sub: 'На 90° до клацання',
    accent: 'border-amber-400/70 hover:bg-amber-950/60',
  },
  {
    id: 'confirm',
    label: 'Натиснути зелену «OK»',
    sub: 'Підтвердження розблокування',
    accent: 'border-emerald-400/70 hover:bg-emerald-950/60',
  },
  {
    id: 'press_red',
    label: 'Червона кнопка «Freigabe»',
    sub: 'Скидання механічного стопора',
    accent: 'border-rose-400/70 hover:bg-rose-950/60',
  },
];

export const Act4Scene: React.FC<Act4SceneProps> = ({
  role,
  state,
  onSelectBlock,
  onClickLocker,
  onBackToWall,
  onInsertCoins,
  onMechanicalAction,
  onMechanicalTimeoutReset,
}) => {
  const [mechRemainingSec, setMechRemainingSec] = useState<number | null>(null);

  // Track the 25-second mechanical lock reset timer
  useEffect(() => {
    const endsAt = state.act4.unlockTimerEndsAt;
    if (!endsAt || !state.act4.coinsInserted || state.act4.completed) {
      setMechRemainingSec(null);
      return;
    }

    const tick = () => {
      const rem = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setMechRemainingSec(rem);
      if (rem <= 0 && role === 'p2') {
        onMechanicalTimeoutReset();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [
    state.act4.unlockTimerEndsAt,
    state.act4.coinsInserted,
    state.act4.completed,
    role,
    onMechanicalTimeoutReset,
  ]);

  if (role === 'p2') {
    const zoomedLocker337 = state.act4.selectedLocker === 337;

    return (
      <div className="relative w-full h-full flex flex-col">
        <SceneBackdrop
          customSrc="/assets/scene4-p2.jpg"
          alt="Камери схову Stuttgart Hbf"
          fallbackSvg={<StuttgartHallSvg />}
          photoScrimClass="bg-slate-950/55"
        />

        <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
          {/* Top Bar: Block selector OR Back button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/70 shrink-0">
            <div className="flex items-center gap-2">
              {zoomedLocker337 && !state.act4.coinsInserted && (
                <button
                  type="button"
                  onClick={onBackToWall}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  aria-label="До стіни камер схову"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h3 className="font-display text-xs sm:text-sm font-bold text-white">
                  {zoomedLocker337
                    ? 'Ящик № 337 · Панель керування DB'
                    : 'Stuttgart Hbf · Стіна камер схову DB'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {zoomedLocker337
                    ? 'Вкинь підготовлені 4,50 € та виконай 4-крокову інструкцію координатора.'
                    : 'Знайди потрібний блок і натисни на наш ящик.'}
                </p>
              </div>
            </div>

            {!zoomedLocker337 && (
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => onSelectBlock('037-060')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold transition-colors cursor-pointer ${
                    state.act4.selectedBlock === '037-060'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Блок 037–060
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBlock('323-339')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold transition-colors cursor-pointer ${
                    state.act4.selectedBlock === '323-339'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Блок 323–339
                </button>
              </div>
            )}
          </div>

          {/* Main Body */}
          {!zoomedLocker337 ? (
            <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scroll pt-2.5 gap-2">
              {/* Overhead Station Sign */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs">
                <span className="font-mono-tabular font-bold text-blue-300">
                  DB Schließfächer · {state.act4.selectedBlock === '037-060' ? 'Секція 037–060' : 'Секція 323–339'}
                </span>
                {state.act4.selectedBlock === '323-339' ? (
                  <span className="font-semibold text-sky-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Знак: «Rauchfreier Bahnhof»
                  </span>
                ) : (
                  <span className="text-slate-400">Поруч із касами Reisezentrum</span>
                )}
              </div>

              {/* Blue DB Steel Lockers Wall */}
              {state.act4.selectedBlock === '037-060' ? (
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-2.5 rounded-xl bg-[#112A5C] border-2 border-[#2563EB]/60 shadow-inner">
                  {BLOCK_A_LOCKERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onClickLocker(num)}
                      className="h-14 sm:h-16 rounded-md bg-[#1D4ED8] hover:bg-[#2563EB] border border-blue-300/40 flex flex-col items-center justify-between p-1.5 shadow transition-transform active:scale-95 cursor-pointer"
                    >
                      <span className="font-mono-tabular text-[11px] font-bold text-white">
                        {String(num).padStart(3, '0')}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-blue-200/50" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 p-2.5 rounded-xl bg-[#112A5C] border-2 border-[#3B82F6]/70 shadow-inner">
                  {/* Top Row (Odd: 323..339) */}
                  <div className="grid grid-cols-9 gap-1.5">
                    {BLOCK_B_TOP.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => onClickLocker(num)}
                        className="h-16 sm:h-20 rounded-md bg-[#1D4ED8] hover:bg-[#2563EB] border border-blue-200/50 flex flex-col items-center justify-between p-1.5 shadow transition-transform active:scale-95 cursor-pointer"
                      >
                        <span className="font-mono-tabular text-xs font-extrabold text-white">
                          {num}
                        </span>
                        <span className="w-3 h-3 rounded-full bg-slate-950 border border-amber-300/70" />
                        <span className="w-4 h-1 rounded-full bg-blue-200/50" />
                      </button>
                    ))}
                  </div>
                  {/* Bottom Row (Even: 324..340 so 338 sits directly below 337) */}
                  <div className="grid grid-cols-9 gap-1.5">
                    {BLOCK_B_BOTTOM.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => onClickLocker(num)}
                        className="h-16 sm:h-20 rounded-md bg-[#1E40AF] hover:bg-[#2563EB] border border-blue-300/40 flex flex-col items-center justify-between p-1.5 shadow transition-transform active:scale-95 cursor-pointer"
                      >
                        <span className="font-mono-tabular text-xs font-extrabold text-blue-100">
                          {num}
                        </span>
                        <span className="w-3 h-3 rounded-full bg-slate-950 border border-blue-200/50" />
                        <span className="w-4 h-1 rounded-full bg-blue-200/40" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Zoomed Locker 337 Payment + 4-Step Mechanical Unlock */
            <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scroll pt-2">
              <div className="max-w-xl w-full bg-[#132957] border-2 border-blue-400/70 rounded-xl p-4 shadow-2xl space-y-3">
                {/* Locker LCD Screen */}
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 flex items-center justify-between gap-2 font-mono-tabular">
                  <div>
                    <div className="text-[11px] text-sky-400">DB SCHLIESSFACH NR. 337</div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {!state.act4.coinsInserted
                        ? 'NACHZAHLUNG: 4,50 €'
                        : `ОПЛАЧЕНО · КРОК РОЗБЛОКУВАННЯ ${state.act4.unlockStep}/4`}
                    </div>
                  </div>
                  {state.act4.coinsInserted && mechRemainingSec !== null && (
                    <div
                      className={`text-right px-2.5 py-1 rounded border ${
                        mechRemainingSec <= 8
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                          : 'bg-slate-900 border-amber-400/60 text-amber-300'
                      }`}
                    >
                      <div className="text-[10px]">Скидання замка</div>
                      <div className="text-sm font-bold">{mechRemainingSec} сек</div>
                    </div>
                  )}
                </div>

                {!state.act4.coinsInserted ? (
                  <div className="text-center py-3 space-y-3">
                    <p className="text-xs sm:text-sm text-blue-100">
                      Монетоприймач готовий. Ти вже підготував точні <strong className="text-amber-300">4,50 €</strong> у потязі!
                    </p>
                    <button
                      type="button"
                      onClick={onInsertCoins}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg transition-colors cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Вкинути підготовлені 4,50 €</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-blue-100">
                      Механізм активовано! Виконуй 4 дії точно в порядку з «Інструкції камер схову DB» координатора:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {UNLOCK_CONTROLS.map((ctrl) => (
                        <button
                          key={ctrl.id}
                          type="button"
                          onClick={() => onMechanicalAction(ctrl.id)}
                          className={`p-3 rounded-xl bg-slate-900/90 border-2 text-left transition-transform active:scale-95 cursor-pointer ${ctrl.accent}`}
                        >
                          <div className="text-xs sm:text-sm font-bold text-white">{ctrl.label}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{ctrl.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === P1 COORDINATOR VIEW: Інструкція камер схову DB (Серія S-300) ===
  const manualSteps = [
    {
      step: 1,
      title: 'Повернути ключ праворуч (на 90°)',
      detail: 'До характерного металевого клацання циліндра.',
    },
    {
      step: 2,
      title: 'Натиснути червону кнопку скидання «Freigabe»',
      detail: 'Знімає захисний стопор після доплати 4,50 €.',
    },
    {
      step: 3,
      title: 'Потягнути металеву ручку ящика на себе',
      detail: 'Відпускає засувку дверцят ящика 337.',
    },
    {
      step: 4,
      title: 'Натиснути зелену кнопку підтвердження «OK»',
      detail: 'Фінальне відкриття замка до завершення 25-секундного таймера!',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col">
      <SceneBackdrop
        customSrc="/assets/scene2-p1.jpg"
        alt="Інструкція камер схову DB"
        fallbackSvg={<CoordinatorDbDeskSvg />}
        photoScrimClass="bg-slate-950/80"
      />

      <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/70 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-white">
                Інструкція камер схову DB · Серія S-300
              </h3>
              <p className="text-[11px] text-slate-400">
                Проведи партнера до блоку 323–339 (біля «Rauchfreier Bahnhof»), ящик 337, та продиктуй послідовність!
              </p>
            </div>
          </div>

          <div className="text-xs font-mono-tabular">
            {state.act4.coinsInserted ? (
              <span className="text-emerald-300 font-bold">
                Оплачено · Крок {state.act4.unlockStep}/4
              </span>
            ) : state.act4.selectedLocker === 337 ? (
              <span className="text-amber-300 font-semibold">Біля ящика 337 · Чекає монети</span>
            ) : (
              <span className="text-slate-300">Шукає блок 323–339...</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pt-3 space-y-2.5">
          <div className="p-2.5 rounded-lg bg-blue-950/50 border border-blue-500/40 text-xs text-sky-200 flex items-center gap-2">
            <KeyRound className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              <strong>Увага:</strong> після внесення <strong className="text-white">4,50 €</strong> є лише <strong className="text-amber-300">25 секунд</strong>, щоб виконати всі 4 кроки по черзі, інакше засувка скинеться!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {manualSteps.map((m) => {
              const done = state.act4.unlockStep >= m.step;
              const current = state.act4.coinsInserted && state.act4.unlockStep === m.step - 1;
              return (
                <div
                  key={m.step}
                  className={`p-3 rounded-xl border transition-colors ${
                    done
                      ? 'bg-emerald-950/50 border-emerald-500/60'
                      : current
                      ? 'bg-amber-950/45 border-amber-400'
                      : 'bg-slate-900/90 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs font-extrabold text-amber-300">
                      КРОК {m.step}
                    </span>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : current ? (
                      <LockOpen className="w-4 h-4 text-amber-300" />
                    ) : null}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-1">{m.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
