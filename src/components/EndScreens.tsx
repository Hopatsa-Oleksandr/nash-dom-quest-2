import React from 'react';
import { Clock, RotateCcw, Trophy, AlertTriangle, LogOut } from 'lucide-react';
import { GENERATED_ASSETS, type GameState } from '../types/game';
import {
  formatTimeMMSS,
  g,
  pluralizeMistakes,
  ukVerb,
} from '../utils/ukrainianGrammar';
import { PlayerAvatar } from './ResilientMedia';

interface VictoryScreenProps {
  state: GameState;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  state,
  onPlayAgain,
  onReturnLobby,
}) => {
  const p1 = state.players.p1;
  const p2 = state.players.p2;
  const remaining = state.finishedRemainingSec ?? 0;
  const spent = Math.max(0, state.totalDurationSec - remaining);

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 px-4 py-6 sm:py-10 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Victory Artwork */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
          <img
            src={GENERATED_ASSETS.victorySuitcase}
            alt="Валізу 337 врятовано!"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                <Trophy className="w-4 h-4" />
                <span>Stuttgart Hbf · Ящик № 337 відкрито</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Валізу врятовано!
              </h1>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 bg-slate-950/60 text-center">
          <div className="p-4">
            <div className="text-[11px] text-slate-400">Залишок часу</div>
            <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
              {formatTimeMMSS(remaining)}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[11px] text-slate-400">Час операції</div>
            <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-white mt-0.5">
              {formatTimeMMSS(spent)}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[11px] text-slate-400">Помилки</div>
            <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-amber-300 mt-0.5">
              {pluralizeMistakes(state.mistakes)}
            </div>
          </div>
        </div>

        {/* Fun Ukrainian Dialogue with Dynamic Gender Grammar */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <PlayerAvatar role="p2" name={p2.name} sizeClass="w-10 h-10" />
              <div className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3">
                <div className="text-xs font-bold text-sky-300 mb-1">{p2.name}</div>
                <p className="text-slate-200 leading-relaxed">
                  «Є! Дверцята 337 клацнули, валіза на місці! І я реально{' '}
                  {ukVerb(p2.gender, 'madeIt')} до штрафу — ще й з велосипедом крізь усе будівництво Шорндорфа{' '}
                  {ukVerb(p2.gender, 'walked')}!»
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PlayerAvatar role="p1" name={p1.name} sizeClass="w-10 h-10" />
              <div className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3">
                <div className="text-xs font-bold text-amber-300 mb-1">{p1.name}</div>
                <p className="text-slate-200 leading-relaxed">
                  {state.mistakes === 0
                    ? `«Ідеальна командна робота, жодної помилки! Я ж казала — без моїх схем DB та вицвілого чека ти б досі ${g(
                        p2.gender,
                        'стояв',
                        'стояла'
                      )} біля екскаватора. А тепер каву на Штутгарті — я ${ukVerb(
                        p1.gender,
                        'ready'
                      )} святкувати!»`
                    : `«Ура, ми це зробили! Навіть попри ${pluralizeMistakes(
                        state.mistakes
                      )}, я ${ukVerb(p1.gender, 'solved')} той чек на 4,50 €, а ти точно ${ukVerb(
                        p2.gender,
                        'collected'
                      )} монети без здачі. Наступного разу перевіряємо номер ящика одразу!»`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onReturnLobby}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 cursor-pointer"
            >
              У головне меню
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Грати ще раз</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimeoutScreenProps {
  state: GameState;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
}

export const TimeoutScreen: React.FC<TimeoutScreenProps> = ({
  state,
  onPlayAgain,
  onReturnLobby,
}) => (
  <div className="min-h-screen bg-[#0B1220] text-slate-100 px-4 py-10 flex items-center justify-center">
    <div className="max-w-lg w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
      <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
        <Clock className="w-7 h-7" />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-white">Час вийшов!</h1>
      <p className="text-sm text-slate-300 leading-relaxed">
        Камера схову на Stuttgart Hbf нарахувала штраф за прострочення. Ви зупинилися на{' '}
        <strong className="text-white">Акті {state.act} з 4</strong> ({pluralizeMistakes(state.mistakes)}).
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReturnLobby}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 cursor-pointer"
        >
          У головне меню
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Грати ще раз</span>
        </button>
      </div>
    </div>
  </div>
);

interface ExitConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="exit-modal-title" className="text-base font-bold text-white">
              Ви дійсно хочете вийти в головне меню?
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              З’єднання PeerJS та рацію буде відключено, а параметри кімнати очищено.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Залишитись
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Вийти в меню</span>
          </button>
        </div>
      </div>
    </div>
  );
};
