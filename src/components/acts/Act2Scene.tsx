import React, { useEffect, useState } from 'react';
import { Bike, CheckCircle2, Clock, Monitor, Ticket, TrainFront, X } from 'lucide-react';
import type { GameState, Role } from '../../types/game';
import { SceneBackdrop } from '../ResilientMedia';
import { CoordinatorDbDeskSvg, Platform4MexSvg } from '../scenes/AtmosphericSvgs';

interface Act2SceneProps {
  role: Role;
  state: GameState;
  onUpdateValidator: (field: 'validatorZone' | 'validatorBikeClass' | 'validatorTimeWindow', value: string) => void;
  onValidateTicket: () => void;
  onInspectDisplay: () => void;
  onBoardSector: (sector: 'A' | 'B' | 'C') => void;
  onSceneTabChange?: (tabLabel: string) => void;
}

export const Act2Scene: React.FC<Act2SceneProps> = ({
  role,
  state,
  onUpdateValidator,
  onValidateTicket,
  onInspectDisplay,
  onBoardSector,
  onSceneTabChange,
}) => {
  const [modal, setModal] = useState<'none' | 'validator' | 'display'>('none');
  const [p1Tab, setP1Tab] = useState<'tariff' | 'consist'>('tariff');

  useEffect(() => {
    if (!onSceneTabChange) return;
    if (role === 'p1') {
      onSceneTabChange(p1Tab === 'tariff' ? 'Тариф VVS' : 'Схема MEX');
    } else if (modal === 'validator') {
      onSceneTabChange('Компостер VVS');
    } else if (modal === 'display') {
      onSceneTabChange('Табло Gleis 4');
    } else {
      onSceneTabChange('Платформа 4');
    }
  }, [role, p1Tab, modal, onSceneTabChange]);

  if (role === 'p2') {
    return (
      <div className="relative w-full h-full">
        <SceneBackdrop
          customSrc="/assets/scene2-p2.jpg"
          alt="Платформа 4 — потяг MEX"
          fallbackSvg={<Platform4MexSvg />}
        />

        {/* Top Bar Status */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <div className="bg-slate-950/85 backdrop-blur-sm border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-200 pointer-events-auto">
            <span className="font-semibold text-amber-300">Платформа 4 · MEX 13</span>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className={state.act2.ticketValidated ? 'text-emerald-300 font-semibold' : 'text-amber-200'}>
              {state.act2.ticketValidated ? 'Велоквиток прокомпостовано' : 'Потрібен велоквиток'}
            </span>
          </div>
        </div>

        {/* Interactive Hotspots (%) */}
        {modal === 'none' && (
          <>
            {/* Ticket Validator Hotspot */}
            <button
              type="button"
              onClick={() => setModal('validator')}
              style={{ left: '17%', top: '61%' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold shadow-lg transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
                state.act2.ticketValidated
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400'
                  : 'bg-red-700/95 text-white border-amber-300'
              }`}
            >
              {state.act2.ticketValidated ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <Ticket className="w-4 h-4 shrink-0" />
              )}
              <span>{state.act2.ticketValidated ? 'Квиток OK' : 'Компостер VVS'}</span>
            </button>

            {/* Platform Display Hotspot */}
            <button
              type="button"
              onClick={() => {
                onInspectDisplay();
                setModal('display');
              }}
              style={{ left: '33%', top: '21%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/92 text-sky-200 border border-sky-400/80 text-xs font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer whitespace-nowrap"
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Табло Gleis 4</span>
            </button>

            {/* Train Carriage Boarding Doors: C, B, A */}
            {(
              [
                { sector: 'C' as const, x: 55, y: 56 },
                { sector: 'B' as const, x: 72, y: 56 },
                { sector: 'A' as const, x: 89, y: 56 },
              ]
            ).map((door) => (
              <button
                key={door.sector}
                type="button"
                onClick={() => onBoardSector(door.sector)}
                style={{ left: `${door.x}%`, top: `${door.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2.5 py-2 rounded-lg border text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer whitespace-nowrap ${
                  state.act2.ticketValidated
                    ? 'bg-amber-400 text-slate-950 border-white'
                    : 'bg-slate-900/85 text-slate-300 border-slate-500'
                }`}
              >
                <TrainFront className="w-3.5 h-3.5 shrink-0" />
                <span>Сектор {door.sector}</span>
              </button>
            ))}
          </>
        )}

        {/* Platform Display Modal */}
        {modal === 'display' && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-[#172C66] border-2 border-slate-200 rounded-xl p-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-blue-400/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-[#172C66] font-mono-tabular font-extrabold px-2 py-0.5 rounded text-sm">
                    Gleis 4
                  </span>
                  <span className="font-mono-tabular text-amber-300 font-bold text-base">MEX 13 · 14:22</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModal('none')}
                  className="p-1 rounded hover:bg-blue-800 cursor-pointer"
                  aria-label="Закрити табло"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-lg font-bold">← Напрямок: Stuttgart Hbf</p>
                <p className="text-blue-100 text-xs">
                  Поточний час на станції: <strong className="font-mono-tabular text-amber-300">14:18</strong> (будній день)
                </p>
                <div className="bg-slate-950/70 rounded-lg p-2.5 font-mono-tabular text-xs text-sky-200">
                  Порядок вагонів (голова ліворуч ←):
                  <div className="mt-1.5 flex items-center justify-center gap-2 text-sm font-bold text-white">
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded">← C</span>
                    <span>—</span>
                    <span className="px-2.5 py-1 bg-blue-700 rounded">B</span>
                    <span>—</span>
                    <span className="px-2.5 py-1 bg-blue-700 rounded">A</span>
                  </div>
                </div>
                <p className="text-xs text-blue-200 pt-1">
                  Повідом координатору напрямок потяга та поточний час, щоб дізнатися код велоквитка і вагон для велосипеда!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DB / VVS Bike Ticket Validator Modal */}
        {modal === 'validator' && (
          <div className="absolute inset-0 z-20 bg-slate-950/88 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center overflow-y-auto custom-scroll">
            <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">
                    Компостер VVS / DB · Велоквиток (Schorndorf → Stuttgart)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setModal('none')}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                  aria-label="Закрити компостер"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                {/* Part 1: Zone */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    1. Тарифна зона VVS (Schorndorf → Stuttgart Hbf)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'Z1', label: 'Zone 1' },
                      { id: 'Z2', label: 'Zone 2' },
                      { id: 'Z3', label: 'Zone 3' },
                      { id: 'Z4', label: 'Zone 4' },
                    ].map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        disabled={state.act2.ticketValidated}
                        onClick={() => onUpdateValidator('validatorZone', z.id)}
                        className={`py-2 rounded-lg font-mono-tabular font-bold border transition-colors cursor-pointer ${
                          state.act2.validatorZone === z.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Part 2: Bike Class */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    2. Клас перевезення (Bike Class)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'NORMAL', label: 'Normal (P1)' },
                      { id: 'V-RAD', label: 'Fahrrad (V-RAD)' },
                      { id: 'E-CARGO', label: 'E-Cargo (XL)' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        disabled={state.act2.ticketValidated}
                        onClick={() => onUpdateValidator('validatorBikeClass', c.id)}
                        className={`py-2 px-2 rounded-lg font-semibold border transition-colors cursor-pointer ${
                          state.act2.validatorBikeClass === c.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Part 3: Time Window */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    3. Часове вікно VVS (зараз 14:18)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'SPERR', label: '06:00–09:00' },
                      { id: 'NACH-09', label: 'Ab 09:00 (Frei)' },
                      { id: 'NACHT', label: '22:00–05:00' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={state.act2.ticketValidated}
                        onClick={() => onUpdateValidator('validatorTimeWindow', t.id)}
                        className={`py-2 px-2 rounded-lg font-mono-tabular font-semibold border transition-colors cursor-pointer ${
                          state.act2.validatorTimeWindow === t.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono-tabular text-slate-400">
                  Код: {state.act2.validatorZone} · {state.act2.validatorBikeClass} · {state.act2.validatorTimeWindow}
                </span>
                {state.act2.ticketValidated ? (
                  <button
                    type="button"
                    onClick={() => setModal('none')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Квиток готовий — до потяга →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onValidateTicket();
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Прокомпостувати квиток
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === P1 COORDINATOR VIEW: VVS/DB Tariff Guide & MEX 13 Train Consist ===
  return (
    <div className="relative w-full h-full flex flex-col">
      <SceneBackdrop
        customSrc="/assets/scene2-p1.jpg"
        alt="Тарифна таблиця VVS та схема MEX"
        fallbackSvg={<CoordinatorDbDeskSvg />}
        photoScrimClass="bg-slate-950/75"
      />

      <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/70 shrink-0">
          <div>
            <h3 className="font-display text-xs sm:text-sm font-bold text-white">
              DB Navigator · Тарифи VVS та схема MEX 13
            </h3>
            <p className="text-[11px] text-slate-400">
              Статус велоквитка:{' '}
              <span className={state.act2.ticketValidated ? 'text-emerald-300 font-semibold' : 'text-amber-300'}>
                {state.act2.ticketValidated ? 'Прокомпостовано! Диктуй сектор посадки.' : 'Очікує валідації на платформі'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700/80">
            <button
              type="button"
              onClick={() => setP1Tab('tariff')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                p1Tab === 'tariff' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Тариф VVS (Квиток)
            </button>
            <button
              type="button"
              onClick={() => setP1Tab('consist')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                p1Tab === 'consist' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Схема вагонів MEX
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pt-3">
          {p1Tab === 'tariff' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Zones */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2">
                <div className="font-semibold text-amber-300">1. Тарифні зони VVS</div>
                <table className="w-full font-mono-tabular text-[11px]">
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-1 text-slate-300">Stuttgart Hbf</td>
                      <td className="py-1 text-right text-slate-400">Zone 1</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-300">Waiblingen</td>
                      <td className="py-1 text-right text-slate-400">Zone 2</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-300">Grunbach</td>
                      <td className="py-1 text-right text-slate-400">Zone 3</td>
                    </tr>
                    <tr className="bg-amber-500/10">
                      <td className="py-1.5 font-bold text-white">Schorndorf</td>
                      <td className="py-1.5 text-right font-bold text-amber-300">Zone 4</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] text-slate-400">
                  Поїздка Schorndorf → Stuttgart охоплює <strong className="text-white">Zone 4</strong>.
                </p>
              </div>

              {/* Bike Class */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5" />
                  <span>2. Клас велосипеда</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/70 text-slate-400">
                    <strong className="text-slate-200">Normal (P1):</strong> без велосипеда
                  </div>
                  <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-200">
                    <strong className="text-white">Fahrrad (V-RAD):</strong> стандартний дорожній або гірський велосипед
                  </div>
                  <div className="p-2 rounded bg-slate-800/70 text-slate-400">
                    <strong className="text-slate-200">E-Cargo (XL):</strong> вантажні триколісні велосипеди
                  </div>
                </div>
              </div>

              {/* Time Window */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. Часове вікно VVS</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-200">
                    <strong>06:00–09:00:</strong> Sperrzeit — провіз велосипедів заборонений!
                  </div>
                  <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-200">
                    <strong className="text-white">Ab 09:00 (Frei):</strong> денний дозвіл для велосипедів (до 22:00)
                  </div>
                  <div className="p-2 rounded bg-slate-800/70 text-slate-400">
                    <strong>22:00–05:00:</strong> лише нічні рейси
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/92 border border-slate-700/80 rounded-xl p-3.5 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-white text-sm">
                  Схема потяга bwegt MEX 13 (3-вагонний склад)
                </h4>
                <span className="font-mono-tabular text-amber-300">Уточни напрямок на табло платформи!</span>
              </div>

              {/* Direction Stuttgart Hbf */}
              <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-500/40 space-y-2">
                <div className="font-semibold text-sky-200">
                  Напрямок ← Stuttgart Hbf (жовтий ніс у Секторі C)
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono-tabular text-center">
                  <div className="p-2 rounded bg-slate-800 border border-slate-600">
                    <div className="text-amber-300 font-bold">← Сектор C</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">1. Klasse · Тиха зона</div>
                    <div className="text-[10px] text-rose-300 mt-0.5">Велосипед заборонено</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/70 border-2 border-emerald-400">
                    <div className="text-white font-bold">Сектор B</div>
                    <div className="text-[11px] text-emerald-200 mt-0.5">Mehrzweckbereich</div>
                    <div className="text-[10px] text-emerald-300 font-bold mt-0.5">ВЕЛОВАГОН (Низька підлога)</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800 border border-slate-600">
                    <div className="text-slate-200 font-bold">Сектор A</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">2. Klasse · Сидячий</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Без велокріплень</div>
                  </div>
                </div>
              </div>

              {/* Direction Aalen (reverse contrast so P1 checks direction!) */}
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Напрямок → Aalen (зворотний склад):</span>
                <span className="font-mono-tabular">[C: 2.Kl] — [B: 2.Kl] — [A: Веловагон →]</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
