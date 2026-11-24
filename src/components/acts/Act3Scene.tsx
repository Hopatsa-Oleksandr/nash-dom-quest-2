import React, { useState } from 'react';
import {
  CheckCircle2,
  Coins,
  FileSearch,
  Lock,
  MessageSquareShare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { COIN_POOL, type CoinDenom, type GameState, type Role } from '../../types/game';
import { formatEuroFromCents } from '../../utils/ukrainianGrammar';
import { getSelectedCoinsTotalCents } from '../../utils/gameState';
import { SceneBackdrop } from '../ResilientMedia';
import { CoordinatorDbDeskSvg, TrainInteriorSvg } from '../scenes/AtmosphericSvgs';

interface Act3SceneProps {
  role: Role;
  state: GameState;
  onP1RevealClue: (clueId: string) => void;
  onP1SubmitLockerNumber: (value: string) => void;
  onP1SubmitFee: (value: string) => void;
  onP2ShareMemory: () => void;
  onP2AdjustCoin: (denom: CoinDenom, delta: 1 | -1) => void;
  onP2ResetCoins: () => void;
  onP2ConfirmCoins: () => void;
}

const DENOM_ORDER: CoinDenom[] = ['200', '100', '50', '20', '10'];

export const Act3Scene: React.FC<Act3SceneProps> = ({
  role,
  state,
  onP1RevealClue,
  onP1SubmitLockerNumber,
  onP1SubmitFee,
  onP2ShareMemory,
  onP2AdjustCoin,
  onP2ResetCoins,
  onP2ConfirmCoins,
}) => {
  const [lockerInput, setLockerInput] = useState(state.act3.p1SolvedLockerNumber ? '337' : '');
  const [feeInput, setFeeInput] = useState(state.act3.p1SolvedFee ? '4.50' : '');

  const totalCents = getSelectedCoinsTotalCents(state.act3.p2SelectedCoins);

  if (role === 'p1') {
    const revealedBlock = state.act3.p1RevealedClues.includes('block');
    const revealedNum = state.act3.p1RevealedClues.includes('number');
    const revealedTariff = state.act3.p1RevealedClues.includes('tariff');

    return (
      <div className="relative w-full h-full flex flex-col">
        <SceneBackdrop
          customSrc="/assets/scene2-p1.jpg"
          alt="Вицвілий чек камери схову Stuttgart Hbf"
          fallbackSvg={<CoordinatorDbDeskSvg />}
          photoScrimClass="bg-slate-950/80"
        />

        <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/70 shrink-0">
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-white">
                Фото вицвілого чека DB · Stuttgart Hbf
              </h3>
              <p className="text-[11px] text-slate-400">
                Натискай на затерті зони чека, щоб підвищити контраст, і звірся зі спогадом партнера!
              </p>
            </div>
            <div className="text-[11px] font-mono-tabular text-slate-300">
              Монети партнера:{' '}
              <span className={state.act3.p2CoinsLocked ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                {state.act3.p2CoinsLocked ? '4,50 € готові' : 'Збирає в потязі...'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Left: Faded Thermal Paper Receipt */}
            <div className="md:col-span-7 bg-[#E7E2D4] text-slate-900 rounded-xl p-3.5 shadow-inner border border-stone-400 font-mono-tabular flex flex-col justify-between relative">
              <div className="flex items-center justify-between border-b border-dashed border-stone-500 pb-2">
                <div>
                  <div className="text-xs font-extrabold tracking-tight text-slate-900">
                    DB Station&amp;Service AG
                  </div>
                  <div className="text-[11px] text-stone-700">Stuttgart Hbf · Schließfächer</div>
                </div>
                <span className="text-[10px] font-bold text-stone-600">QUITTUNG</span>
              </div>

              <div className="my-2.5 space-y-2">
                {/* Interactive Zone 1: Block & Sign */}
                <button
                  type="button"
                  onClick={() => onP1RevealClue('block')}
                  className={`w-full text-left p-2 rounded border transition-colors cursor-pointer ${
                    revealedBlock
                      ? 'bg-amber-100/90 border-amber-500 text-slate-900'
                      : 'bg-stone-300/70 border-stone-400 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>ЗОНА РОЗТАШУВАННЯ</span>
                    <span>{revealedBlock ? 'Контраст +' : 'Натисни для огляду'}</span>
                  </div>
                  {revealedBlock ? (
                    <div className="text-xs font-bold mt-0.5">
                      Блок 323–339 · Поруч із табличкою «Rauchfreier Bahnhof»
                    </div>
                  ) : (
                    <div className="text-xs blur-[2px] select-none mt-0.5">
                      Бл█к 32█–33█ · Поруч зі зн██ом R████...
                    </div>
                  )}
                </button>

                {/* Interactive Zone 2: Smudged Locker Number */}
                <button
                  type="button"
                  onClick={() => onP1RevealClue('number')}
                  className={`w-full text-left p-2 rounded border transition-colors cursor-pointer ${
                    revealedNum
                      ? 'bg-amber-100/90 border-amber-500 text-slate-900'
                      : 'bg-stone-300/70 border-stone-400 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>FACH-NR. (НОМЕР ЯЩИКА)</span>
                    <span>{revealedNum ? 'Контраст +' : 'Натисни для огляду'}</span>
                  </div>
                  {revealedNum ? (
                    <div className="text-xs mt-0.5 space-y-0.5">
                      <div className="font-extrabold text-sm">
                        FACH: <span className="text-red-700">3 [?] [?]</span> (середній ряд верхній)
                      </div>
                      <div className="text-[11px] text-stone-700">
                        Контрольна ознака чека: <strong>непарний номер</strong>, сума цифр = <strong>13</strong>.
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs blur-[2px] select-none mt-0.5">
                      FACH: 3 █ █ · Неп██ний · сума = ██
                    </div>
                  )}
                </button>

                {/* Interactive Zone 3: Overtime Tariff */}
                <button
                  type="button"
                  onClick={() => onP1RevealClue('tariff')}
                  className={`w-full text-left p-2 rounded border transition-colors cursor-pointer ${
                    revealedTariff
                      ? 'bg-amber-100/90 border-amber-500 text-slate-900'
                      : 'bg-stone-300/70 border-stone-400 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>РОЗРАХУНОК ДОПЛАТИ (NACHZAHLUNG)</span>
                    <span>{revealedTariff ? 'Контраст +' : 'Натисни для огляду'}</span>
                  </div>
                  {revealedTariff ? (
                    <div className="text-[11px] mt-0.5 space-y-0.5 leading-snug">
                      <div>Здано: <strong>вчора 11:30</strong> · Зараз: <strong>14:25</strong> (26 год 55 хв)</div>
                      <div>Прострочення понад 24 год: <strong>2 год 55 хв = 3 початі год</strong></div>
                      <div className="font-bold text-slate-900">
                        Тариф: 3,00 € (фікс. збір) + 0,50 € × кожна почата год
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs blur-[2px] select-none mt-0.5">
                      Вчора ██:30 → 14:25 · 3,00 € + 0,50 €/год
                    </div>
                  )}
                </button>
              </div>

              {state.act3.p2SharedMemory && (
                <div className="text-[11px] bg-blue-100 border border-blue-400 text-blue-950 rounded p-2 font-sans">
                  <strong>Спогад партнера:</strong> «Ящик рівно над номером 338, поруч зі знаком Rauchfreier Bahnhof!»
                </div>
              )}
            </div>

            {/* Right: Logic Deduction Inputs */}
            <div className="md:col-span-5 bg-slate-900/92 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between gap-3">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <FileSearch className="w-4 h-4" />
                  <span>Дедукція координатора</span>
                </div>

                {/* Locker Number Form */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">
                    1. Вирахуваний номер ящика
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      disabled={state.act3.p1SolvedLockerNumber}
                      value={state.act3.p1SolvedLockerNumber ? '337' : lockerInput}
                      onChange={(e) => setLockerInput(e.target.value)}
                      placeholder="Напр. 337"
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono-tabular text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      disabled={state.act3.p1SolvedLockerNumber}
                      onClick={() => onP1SubmitLockerNumber(lockerInput)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                        state.act3.p1SolvedLockerNumber
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {state.act3.p1SolvedLockerNumber ? 'OK · 337' : 'Звірити'}
                    </button>
                  </div>
                </div>

                {/* Overtime Fee Form */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">
                    2. Точна сума доплати (€)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      maxLength={6}
                      disabled={state.act3.p1SolvedFee}
                      value={state.act3.p1SolvedFee ? '4.50' : feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      placeholder="Напр. 4.50"
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono-tabular text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      disabled={state.act3.p1SolvedFee}
                      onClick={() => onP1SubmitFee(feeInput)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                        state.act3.p1SolvedFee
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {state.act3.p1SolvedFee ? 'OK · 4,50 €' : 'Звірити'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-snug border-t border-slate-800 pt-2.5">
                {state.act3.p1SolvedLockerNumber && state.act3.p1SolvedFee ? (
                  <span className="text-emerald-300 font-semibold">
                    Дані підтверджено! Продиктуй партнеру суму 4,50 €, щоб зібрати точні монети без здачі.
                  </span>
                ) : (
                  <span>
                    Запитай партнера по рації про його спогад щодо ящика, потім обчисли номер і суму доплати.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === P2 FIELD VIEW (On the MEX Train): Memory Note + Euro Coin Pouch Mini-Puzzle ===
  return (
    <div className="relative w-full h-full flex flex-col">
      <SceneBackdrop
        customSrc="/assets/scene3-p2.jpg"
        alt="У потязі MEX 13 до Штутгарта"
        fallbackSvg={<TrainInteriorSvg />}
        photoScrimClass="bg-slate-950/65"
      />

      <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/70 shrink-0">
          <div>
            <h3 className="font-display text-xs sm:text-sm font-bold text-white">
              Потяг MEX 13 · У дорозі до Stuttgart Hbf
            </h3>
            <p className="text-[11px] text-slate-300">
              Передай свій спогад координатору і підготуй точні монети — автомат у Штутгарті здачі не дає!
            </p>
          </div>
          <div className="text-[11px] font-mono-tabular text-amber-300">
            Зібрано: <strong className="text-white text-xs">{formatEuroFromCents(totalCents)}</strong>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Left: P2 Memory Note */}
          <div className="md:col-span-5 bg-slate-950/88 backdrop-blur-sm border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Твій спогад про камеру схову</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                «Пам’ятаю точно: наш ящик був <strong className="text-amber-300">рівно над номером 338</strong>, у синьому блоці одразу поруч зі знаком <strong className="text-sky-300">«Rauchfreier Bahnhof»</strong>!»
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                «І ще: наліпка на автоматі попереджала — <strong className="text-slate-200">автомат здачі не видає</strong>, приймає лише точну суму монетами євро.»
              </p>
            </div>

            <button
              type="button"
              onClick={onP2ShareMemory}
              disabled={state.act3.p2SharedMemory}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                state.act3.p2SharedMemory
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {state.act3.p2SharedMemory ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Спогад передано координатору</span>
                </>
              ) : (
                <>
                  <MessageSquareShare className="w-3.5 h-3.5" />
                  <span>Зафіксувати спогад у блокноті</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Euro Coin Pouch Mini-Puzzle */}
          <div className="md:col-span-7 bg-slate-950/90 backdrop-blur-sm border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Coins className="w-4 h-4" />
                <span>Гаманець монет (без здачі)</span>
              </div>
              <button
                type="button"
                disabled={state.act3.p2CoinsLocked}
                onClick={onP2ResetCoins}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Скинути</span>
              </button>
            </div>

            {/* Euro Coin Buttons */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {DENOM_ORDER.map((denom) => {
                const cfg = COIN_POOL[denom];
                const used = state.act3.p2SelectedCoins[denom];
                const left = cfg.maxCount - used;
                const isBimetallic = denom === '200' || denom === '100';

                return (
                  <div
                    key={denom}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 flex flex-col items-center gap-1.5"
                  >
                    <button
                      type="button"
                      disabled={state.act3.p2CoinsLocked || left <= 0}
                      onClick={() => onP2AdjustCoin(denom, 1)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono-tabular font-extrabold text-[11px] sm:text-xs shadow-md transition-transform active:scale-95 disabled:opacity-35 cursor-pointer ${
                        isBimetallic
                          ? denom === '200'
                            ? 'bg-amber-300 text-slate-950 ring-4 ring-slate-300'
                            : 'bg-slate-200 text-slate-950 ring-4 ring-amber-400'
                          : 'bg-amber-400 text-slate-950 ring-2 ring-amber-200'
                      }`}
                    >
                      {cfg.label}
                    </button>

                    <div className="text-[10px] font-mono-tabular text-slate-400">
                      Є: {left}
                    </div>

                    <div className="flex items-center gap-1 w-full">
                      <button
                        type="button"
                        disabled={state.act3.p2CoinsLocked || used <= 0}
                        onClick={() => onP2AdjustCoin(denom, -1)}
                        className="flex-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30 cursor-pointer"
                        aria-label={`Прибрати ${cfg.label}`}
                      >
                        −
                      </button>
                      <span className="font-mono-tabular text-xs font-bold text-amber-300 w-4 text-center">
                        {used}
                      </span>
                      <button
                        type="button"
                        disabled={state.act3.p2CoinsLocked || left <= 0}
                        onClick={() => onP2AdjustCoin(denom, 1)}
                        className="flex-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30 cursor-pointer"
                        aria-label={`Додати ${cfg.label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Confirm Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="text-xs">
                <span className="text-slate-400">У долоні: </span>
                <span className="font-mono-tabular font-bold text-base text-white">
                  {formatEuroFromCents(totalCents)}
                </span>
              </div>

              {state.act3.p2CoinsLocked ? (
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Монети готові! Чекаємо чек...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onP2ConfirmCoins}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Підготувати монети до оплати
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
