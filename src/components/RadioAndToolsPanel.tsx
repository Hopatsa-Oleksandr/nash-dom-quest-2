import React from 'react';
import {
  Backpack,
  BookText,
  Mic,
  MicOff,
  Radio,
  Volume2,
} from 'lucide-react';
import type { GameState, Role } from '../types/game';
import { PlayerAvatar } from './ResilientMedia';

interface RadioAndToolsPanelProps {
  role: Role;
  state: GameState;
  soloMode: boolean;
  partnerOnline: boolean;
  isTalking: boolean;
  partnerTalking: boolean;
  micError: string | null;
  activeTab: 'notebook' | 'inventory';
  onTabChange: (tab: 'notebook' | 'inventory') => void;
  onStartTalking: () => void;
  onStopTalking: () => void;
}

export const RadioAndToolsPanel: React.FC<RadioAndToolsPanelProps> = ({
  role,
  state,
  soloMode,
  partnerOnline,
  isTalking,
  partnerTalking,
  micError,
  activeTab,
  onTabChange,
  onStartTalking,
  onStopTalking,
}) => {
  const partnerRole: Role = role === 'p1' ? 'p2' : 'p1';
  const partner = state.players[partnerRole];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Walkie-Talkie PTT Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <PlayerAvatar role={partnerRole} name={partner.name} sizeClass="w-9 h-9" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                Рація · {partner.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {soloMode
                  ? 'Соло-режим (тест звуку рації)'
                  : partnerTalking
                  ? 'Партнер говорить в ефірі...'
                  : partnerOnline
                  ? 'На зв’язку (Канал 337)'
                  : 'Очікування підключення партнера...'}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 text-[11px] font-mono-tabular font-semibold shrink-0 ${
              partnerTalking
                ? 'text-emerald-300'
                : isTalking
                ? 'text-amber-300'
                : 'text-slate-400'
            }`}
          >
            {partnerTalking ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>ПРИЙОМ</span>
              </>
            ) : isTalking ? (
              <>
                <Radio className="w-4 h-4" />
                <span>ЕФІР</span>
              </>
            ) : (
              <span>ТИША</span>
            )}
          </div>
        </div>

        {/* Mobile-Safe Hold-To-Talk (PTT) Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore on browsers without capture support
            }
            onStartTalking();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onStopTalking();
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onStopTalking();
          }}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 touch-none select-none transition-transform duration-100 cursor-pointer ${
            isTalking
              ? 'bg-emerald-500 text-slate-950 scale-[0.99] shadow-lg shadow-emerald-500/20'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
          }`}
        >
          {isTalking ? (
            <>
              <Mic className="w-5 h-5 shrink-0" />
              <span>ГОВОРИ — ВІДПУСТИ ДЛЯ ЗАВЕРШЕННЯ</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5 shrink-0" />
              <span>УТРИМУЙ, ЩОБ ГОВОРИТИ (PTT)</span>
            </>
          )}
        </button>

        {micError && (
          <p className="text-[11px] text-amber-300 leading-snug">{micError}</p>
        )}
      </div>

      {/* Notebook & Inventory Panel */}
      <div className="flex-1 min-h-[210px] bg-slate-900/95 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('notebook')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'notebook'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookText className="w-3.5 h-3.5" />
            <span>Блокнот ({state.notebook.length})</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('inventory')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" />
            <span>Інвентар ({state.inventory.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-3">
          {activeTab === 'notebook' ? (
            <ul className="space-y-2.5 text-xs">
              {[...state.notebook].reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="pb-2 border-b border-slate-800/80 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-500 mb-0.5">
                    <span>Акт {entry.act}</span>
                    <span>
                      {new Date(entry.timestamp).toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p
                    className={`leading-relaxed ${
                      entry.type === 'success'
                        ? 'text-emerald-300'
                        : entry.type === 'error'
                        ? 'text-rose-300'
                        : entry.type === 'clue'
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {entry.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2 text-xs">
              {state.inventory.map((item) => (
                <li
                  key={item}
                  className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
