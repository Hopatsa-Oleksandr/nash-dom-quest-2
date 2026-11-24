import React, { useState } from 'react';
import {
  Bike,
  Check,
  Copy,
  Headphones,
  HelpCircle,
  Play,
  RefreshCw,
  Users,
} from 'lucide-react';
import {
  DEFAULT_PLAYERS,
  GENERATED_ASSETS,
  type Gender,
  type Role,
  type SessionConfig,
} from '../types/game';
import {
  buildPartnerInviteUrl,
  generateRoomCode,
  sanitizeRoomCode,
} from '../utils/gameState';
import { ukVerb } from '../utils/ukrainianGrammar';
import { PlayerAvatar } from './ResilientMedia';
import { HowToPlayModal } from './HowToPlayModal';

interface LobbyScreenProps {
  initialRoomCode?: string;
  initialRole?: Role;
  initialName?: string;
  initialGender?: Gender;
  onStartGame: (config: SessionConfig) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  initialRoomCode,
  initialRole,
  initialName,
  initialGender,
  onStartGame,
}) => {
  const [role, setRole] = useState<Role>(initialRole ?? 'p1');
  const [name, setName] = useState<string>(
    initialName ?? DEFAULT_PLAYERS[initialRole ?? 'p1'].name
  );
  const [gender, setGender] = useState<Gender>(
    initialGender ?? DEFAULT_PLAYERS[initialRole ?? 'p1'].gender
  );
  const [roomCode, setRoomCode] = useState<string>(
    initialRoomCode || generateRoomCode()
  );
  const [nameEdited, setNameEdited] = useState<boolean>(Boolean(initialName));
  const [copiedLink, setCopiedLink] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const handleSelectRole = (nextRole: Role) => {
    setRole(nextRole);
    if (!nameEdited) {
      setName(DEFAULT_PLAYERS[nextRole].name);
    }
    setGender(DEFAULT_PLAYERS[nextRole].gender);
  };

  const partnerRole: Role = role === 'p1' ? 'p2' : 'p1';
  const cleanRoom = sanitizeRoomCode(roomCode) || 'V337-MAIN';
  const partnerInviteUrl = buildPartnerInviteUrl(cleanRoom, partnerRole);

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(partnerInviteUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback ignored gracefully
    }
  };

  const launch = (soloMode: boolean) => {
    const finalName = name.trim() || DEFAULT_PLAYERS[role].name;
    onStartGame({
      roomCode: cleanRoom,
      role,
      name: finalName,
      gender,
      soloMode,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
      {/* Main Split Hero & Setup Container */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Atmospheric Illustrated Key Art & Mission Brief */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={GENERATED_ASSETS.lobbyHero}
                alt="Станція Шорндорф — прибуття потяга MEX"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <div className="text-xs font-mono-tabular text-amber-300 mb-1.5">
                  Schorndorf Bf → Stuttgart Hbf · 30:00 до штрафу
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight [text-wrap:balance]">
                  Операція: Валіза 337
                </h1>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                Валіза замкнена в камері схову на Stuttgart Hauptbahnhof, а до штрафу залишилося рівно{' '}
                <strong className="text-white font-mono-tabular">30 хвилин</strong>. Один гравець пробирається з велосипедом крізь ремонт станції Шорндорф, інший тримає в руках схеми DB, тарифи VVS та вицвілий чек. Спілкуйтеся по рації, щоб встигнути!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <div className="text-slate-400">Акт 1</div>
                  <div className="font-semibold text-slate-100 mt-0.5">Шорндорф: Обхід</div>
                </div>
                <div>
                  <div className="text-slate-400">Акт 2</div>
                  <div className="font-semibold text-slate-100 mt-0.5">Посадка на MEX</div>
                </div>
                <div>
                  <div className="text-slate-400">Акт 3</div>
                  <div className="font-semibold text-slate-100 mt-0.5">Чек і монети</div>
                </div>
                <div>
                  <div className="text-slate-400">Акт 4</div>
                  <div className="font-semibold text-slate-100 mt-0.5">Ящик № 337</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lobby Setup Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Налаштування сесії</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Обери свою роль, вкажи ім’я та поділись кодом кімнати з напарником.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHowToPlayOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Як грати</span>
                </button>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Твоя роль</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectRole('p1')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-2 ${
                      role === 'p1'
                        ? 'bg-amber-400/12 border-amber-400 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <PlayerAvatar role="p1" name={DEFAULT_PLAYERS.p1.name} sizeClass="w-10 h-10" />
                      <Headphones className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Координатор</div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Мапи DB, тарифи, вицвілий чек (Юяся)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole('p2')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-2 ${
                      role === 'p2'
                        ? 'bg-amber-400/12 border-amber-400 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <PlayerAvatar role="p2" name={DEFAULT_PLAYERS.p2.name} sizeClass="w-10 h-10" />
                      <Bike className="w-4 h-4 text-sky-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Польовий гравець</div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Велосипед, станція, потяг, ящик (Сясюня)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name + Gender Toggle */}
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-8 space-y-1.5">
                  <label htmlFor="player-name" className="block text-xs font-semibold text-slate-300">
                    Ім’я гравця
                  </label>
                  <input
                    id="player-name"
                    type="text"
                    maxLength={24}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameEdited(true);
                    }}
                    placeholder={DEFAULT_PLAYERS[role].name}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="col-span-4 space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-300">Стать (мова)</span>
                  <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-950 border border-slate-700 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setGender('m')}
                      className={`rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        gender === 'm'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ч
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('f')}
                      className={`rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        gender === 'f'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ж
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 -mt-2">
                Приклад граматики: «{name.trim() || DEFAULT_PLAYERS[role].name}{' '}
                {ukVerb(gender, 'found')} вихід і {ukVerb(gender, 'madeIt')} на потяг!»
              </div>

              {/* Room Code & Invite Link */}
              <div className="space-y-2">
                <label htmlFor="room-code" className="block text-xs font-semibold text-slate-300">
                  Код кімнати (PeerJS)
                </label>
                <div className="flex gap-2">
                  <input
                    id="room-code"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(sanitizeRoomCode(e.target.value))}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 font-mono-tabular text-sm font-bold text-amber-300 uppercase tracking-wider focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setRoomCode(generateRoomCode())}
                    title="Згенерувати новий код"
                    className="px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Скопійовано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Лінк партнеру</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => launch(false)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Увійти в кімнату (2 гравці)</span>
              </button>

              <button
                type="button"
                onClick={() => launch(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Соло-перегляд (перемикання ролей на 1 пристрої)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <HowToPlayModal open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
    </div>
  );
};
