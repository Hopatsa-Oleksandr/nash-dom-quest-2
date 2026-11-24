import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Bike,
  Clock,
  Headphones,
  HelpCircle,
  Mic,
  X,
} from 'lucide-react';
import { PlayerAvatar } from './ResilientMedia';

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/82 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full max-h-[90vh] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 id="how-to-play-title" className="font-display text-base sm:text-lg font-bold text-white">
                Як грати
              </h2>
              <p className="text-xs text-slate-400">
                Кооперативна асиметрична гра для двох · Schorndorf → Stuttgart Hbf
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити інструкцію"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-5 text-sm">
          {/* Roles Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-amber-300 tracking-wide">
              1. Дві асиметричні ролі — кожен бачить своє
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar role="p1" name="Юяся" sizeClass="w-9 h-9" />
                    <div>
                      <div className="text-sm font-bold text-white">Юяся</div>
                      <div className="text-[11px] text-amber-300 font-medium">Координатор</div>
                    </div>
                  </div>
                  <Headphones className="w-4 h-4 text-amber-300 shrink-0" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Тримає схеми обходу станції Шорндорф, тарифну таблицю VVS, схему вагонів MEX 13, вицвілий чек камери схову та інструкцію замка DB. Не бачить реальних перешкод на станції — веде напарника за його описами.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar role="p2" name="Сясюня" sizeClass="w-9 h-9" />
                    <div>
                      <div className="text-sm font-bold text-white">Сясюня</div>
                      <div className="text-[11px] text-sky-300 font-medium">Польовий гравець</div>
                    </div>
                  </div>
                  <Bike className="w-4 h-4 text-sky-300 shrink-0" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Перебуває на місці з велосипедом: оглядає орієнтири на будівництві, обирає шлях, компостує велоквиток, сідає у потрібний вагон, збирає точні монети без здачі та відкриває ящик на Stuttgart Hbf.
                </p>
              </div>
            </div>
          </section>

          {/* PTT Walkie-Talkie Section */}
          <section className="p-4 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Mic className="w-4 h-4 shrink-0" />
              <span>2. Голосова рація Push-to-Talk (PTT)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Мікрофон вимкнений за замовчуванням. Щоб передати інформацію напарнику, <strong className="text-white">натисни й утримуй кнопку «Утримуй, щоб говорити (PTT)»</strong> — пролунає характерний сигнал рації, а фонові звуки автоматично притишаться. Відпусти кнопку, щоб завершити передачу.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Усі відкриті підказки та прогрес автоматично синхронізуються між гравцями через PeerJS та фіксуються у спільному «Блокноті».
            </p>
          </section>

          {/* Timer & Penalty Rules Section */}
          <section className="p-4 rounded-xl bg-rose-950/25 border border-rose-500/35 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>3. Таймер 30:00 та штрафи за помилки</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                У вас є рівно <strong className="text-white font-mono-tabular">30 хвилин</strong>, поки камера схову не нарахувала штраф. Кожна хибна дія — сходи без пандуса з велосипедом, неправильний код квитка, чужий вагон, невірний розрахунок суми або помилковий крок відкриття замка — <strong className="text-rose-300 font-mono-tabular">знімає 30 секунд</strong> із загального таймера.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Порада: можна також спробувати гру самостійно в режимі «Соло-перегляд».
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
