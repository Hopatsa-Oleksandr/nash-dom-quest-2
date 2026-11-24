import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Compass,
  Eye,
  MapPin,
  Navigation,
  X,
} from 'lucide-react';
import type { GameState, Role } from '../../types/game';
import { SceneBackdrop } from '../ResilientMedia';
import { SchorndorfFieldSvg, SchorndorfMapBackdropSvg } from '../scenes/AtmosphericSvgs';

interface Act1SceneProps {
  role: Role;
  state: GameState;
  onInspectHotspot: (hotspotId: string, label: string) => void;
  onAttemptStep: (stepIndex: number, isCorrect: boolean, choiceLabel: string, feedback: string) => void;
  onSceneTabChange?: (tabLabel: string) => void;
}

interface HotspotInfo {
  id: string;
  x: number;
  y: number;
  shortLabel: string;
  title: string;
  description: string;
  detailTag: string;
}

const P2_HOTSPOTS: HotspotInfo[] = [
  {
    id: 'stairs',
    x: 18,
    y: 66,
    shortLabel: 'Сходи підземки',
    title: 'Перекритий підземний перехід (Сходи)',
    description:
      'Бетонні сходи накриті сірим будівельним флісом (Vlies) та перетягнуті жовто-чорною стрічкою «GESPERRT». З велосипедом сюди точно не спуститися.',
    detailTag: 'Сірий фліс · Жовта стрічка',
  },
  {
    id: 'barrier',
    x: 47,
    y: 54,
    shortLabel: 'Бар’єр і сигнал «H»',
    title: 'Червоно-білий бар’єр + Знак «Пішоходам заборонено» + Сигнал «H»',
    description:
      'Біля червоно-білої огорожі висить круглий знак «Verbot für Fußgänger», а праворуч стоїть біла табличка з чорною літерою «H». За нею видно гравійний заїзд і дерев’яний настил із жовтою розміткою.',
    detailTag: 'Знак «H» · Обхід Süd / Rampe Ost',
  },
  {
    id: 'excavator',
    x: 74,
    y: 48,
    shortLabel: 'Жовтий екскаватор',
    title: 'Жовтий екскаватор на коліях (Zweiwegebagger)',
    description:
      'Важкий жовтий екскаватор працює прямо на щебені між коліями 2 та 3. Прохід поруч заблоковано, працює будівельна техніка — небезпечна зона!',
    detailTag: 'Колії 2–3 · Активні роботи',
  },
  {
    id: 'sector',
    x: 84,
    y: 24,
    shortLabel: 'Табличка A / 4 / 5',
    title: 'Табличка сектору DB «A / 4 / 5»',
    description:
      'Синій вказівник платформ: Сектор A, Колія 4 та Колія 5. Знизу приклеєно жовту тимчасову стрілку «UMLEITUNG →» із маленьким зеленим значком велосипеда.',
    detailTag: 'Сектор A · Gleis 4 / 5',
  },
];

interface DetourFork {
  step: number;
  prompt: string;
  options: {
    id: string;
    label: string;
    sub: string;
    isCorrect: boolean;
    errorFeedback: string;
  }[];
}

const DETOUR_FORKS: DetourFork[] = [
  {
    step: 0,
    prompt: 'Крок 1/4 · Старт біля входу на станцію Шорндорф. Куди вести велосипед?',
    options: [
      {
        id: 'f1-stairs',
        label: 'Перелізти через жовту стрічку в підземний перехід',
        sub: 'Сходи накриті сірим флісом (GESPERRT)',
        isCorrect: false,
        errorFeedback: 'Підземний перехід перекритий сірим флісом! З велосипедом по закритих сходах не пройти (-30 сек).',
      },
      {
        id: 'f1-south',
        label: 'Південний гравійний обхід повз червоно-білий бар’єр (Umleitung Süd)',
        sub: 'Рівний заїзд до сигналу «H», без сходів',
        isCorrect: true,
        errorFeedback: '',
      },
      {
        id: 'f1-bridge',
        label: 'Тимчасовий дерев’яний місток (12 крутих сходинок)',
        sub: 'Без пандуса, вузький прохід',
        isCorrect: false,
        errorFeedback: 'Правило веломаршруту: сходи без пандуса заборонені з велосипедом! (-30 сек).',
      },
    ],
  },
  {
    step: 1,
    prompt: 'Крок 2/4 · Ти біля червоно-білого бар’єру та сигналу «H». Який прохід обрати?',
    options: [
      {
        id: 'f2-tracks',
        label: 'Проскочити напряму через щебінь біля жовтого екскаватора',
        sub: 'Робоча зона на коліях 2–3',
        isCorrect: false,
        errorFeedback: 'Небезпечна зона екскаватора (Lebensgefahr)! Майстер будівництва завернув тебе назад (-30 сек).',
      },
      {
        id: 'f2-ramp',
        label: 'Пандус «Rampe Ost» одразу за сигналом «H»',
        sub: 'Ширина 1.4 м, плавний спуск для велосипедів',
        isCorrect: true,
        errorFeedback: '',
      },
      {
        id: 'f2-north',
        label: 'Металева драбина «Behelfsbrücke Nord»',
        sub: 'Тільки для пішоходів без багажу',
        isCorrect: false,
        errorFeedback: 'На Behelfsbrücke Nord немає пандуса для велосипеда! (-30 сек).',
      },
    ],
  },
  {
    step: 2,
    prompt: 'Крок 3/4 · Ти на тимчасовому настилі між коліями. Який перехід веде до потрібного сектору?',
    options: [
      {
        id: 'f3-b3',
        label: 'Прохід «B-3» за червоною стрічкою (Nur Baustellenpersonal)',
        sub: 'Службовий коридор',
        isCorrect: false,
        errorFeedback: 'Прохід B-3 лише для персоналу будівництва! (-30 сек).',
      },
      {
        id: 'f3-elev',
        label: 'Ліфт «Aufzug Gleis 2»',
        sub: 'Скляна шахта біля колії 2',
        isCorrect: false,
        errorFeedback: 'Згідно зі схемою DB, ліфт на колії 2 несправний (Außer Betrieb)! (-30 сек).',
      },
      {
        id: 'f3-a45',
        label: 'Тимчасовий прохід під табличкою «A / 4 / 5» із зеленою велострілкою',
        sub: 'Відкритий перехід до острівної платформи 4/5',
        isCorrect: true,
        errorFeedback: '',
      },
    ],
  },
  {
    step: 3,
    prompt: 'Крок 4/4 · Фінальна розвилка на острівній платформі! Куди котити велосипед на Штутгарт?',
    options: [
      {
        id: 'f4-g5',
        label: 'Ліворуч на Колію 5 (напрямок Aalen)',
        sub: 'Східний напрямок',
        isCorrect: false,
        errorFeedback: 'Колія 5 їде в протилежний бік — на Аален! Нам потрібен Штутгарт (-30 сек).',
      },
      {
        id: 'f4-g4',
        label: 'Прямо на Платформу 4 — Сектор A (напрямок Stuttgart Hbf)',
        sub: 'Через жовту тактильну смугу до колії 4',
        isCorrect: true,
        errorFeedback: '',
      },
      {
        id: 'f4-exit',
        label: 'Праворуч до виходу Bahnhofstraße',
        sub: 'Назад у місто',
        isCorrect: false,
        errorFeedback: 'Це вихід назад на вулицю, а потяг MEX ось-ось прибуде! (-30 сек).',
      },
    ],
  },
];

export const Act1Scene: React.FC<Act1SceneProps> = ({
  role,
  state,
  onInspectHotspot,
  onAttemptStep,
  onSceneTabChange,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotInfo | null>(null);
  const [showRouteDrawer, setShowRouteDrawer] = useState(false);
  const [p1Tab, setP1Tab] = useState<'sectors' | 'passages' | 'bike'>('sectors');

  useEffect(() => {
    if (!onSceneTabChange) return;
    if (role === 'p1') {
      const labels: Record<'sectors' | 'passages' | 'bike', string> = {
        sectors: 'Сектори',
        passages: 'Тимчасові проходи',
        bike: 'Веломаршрут',
      };
      onSceneTabChange(labels[p1Tab]);
    } else if (showRouteDrawer) {
      onSceneTabChange(`Розвилка (${state.act1.step + 1}/4)`);
    } else if (selectedHotspot) {
      onSceneTabChange(selectedHotspot.shortLabel);
    } else {
      onSceneTabChange('Огляд станції');
    }
  }, [role, p1Tab, showRouteDrawer, selectedHotspot, state.act1.step, onSceneTabChange]);

  const currentStep = Math.min(state.act1.step, 3);
  const activeFork = DETOUR_FORKS[currentStep];

  if (role === 'p2') {
    return (
      <div className="relative w-full h-full">
        <SceneBackdrop
          customSrc="/assets/scene1-p2.jpg"
          alt="Станція Шорндорф на ремонті"
          fallbackSvg={<SchorndorfFieldSvg />}
        />

        {/* Top subtle scene bar */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-200 pointer-events-auto">
            <span className="font-semibold text-amber-300">Шорндорф · Будівництво</span>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className="font-mono-tabular">Крок {state.act1.step}/4</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedHotspot(null);
              setShowRouteDrawer((v) => !v);
            }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            {showRouteDrawer ? 'Сховати розвилку' : `Обрати шлях (${state.act1.step + 1}/4)`}
          </button>
        </div>

        {/* 4 Locked-% Interactive Hotspots */}
        {!showRouteDrawer &&
          P2_HOTSPOTS.map((spot) => {
            const inspected = state.act1.inspectedHotspots.includes(spot.id);
            const isActive = selectedHotspot?.id === spot.id;
            const showPulseGlow = !inspected && !isActive;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => {
                  setSelectedHotspot(spot);
                  onInspectHotspot(spot.id, spot.title);
                }}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-white shadow-xl'
                    : inspected
                    ? 'bg-slate-900/88 text-emerald-300 border-emerald-400/70 shadow-md'
                    : 'bg-slate-950/90 text-amber-200 border-amber-400/90 shadow-[0_0_16px_rgba(251,191,36,0.45)]'
                }`}
              >
                {showPulseGlow && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-xl border border-amber-300/75 bg-amber-400/20 hotspot-glow-ring"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {inspected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                  )}
                  <span className="hidden sm:inline">{spot.shortLabel}</span>
                </span>
              </button>
            );
          })}

        {/* Hotspot Inspection Card */}
        {selectedHotspot && !showRouteDrawer && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-lg z-20 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono-tabular text-amber-300">
                  Орієнтир · {selectedHotspot.detailTag}
                </p>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedHotspot.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                aria-label="Закрити опис"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {selectedHotspot.description}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Опиши цей об’єкт по рації для звірки з планом DB.</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedHotspot(null);
                  setShowRouteDrawer(true);
                }}
                className="text-amber-300 hover:text-amber-200 font-semibold whitespace-nowrap cursor-pointer"
              >
                Перейти до вибору шляху →
              </button>
            </div>
          </div>
        )}

        {/* 4-Step Detour Choice Overlay */}
        {showRouteDrawer && (
          <div className="absolute inset-0 z-20 bg-slate-950/88 backdrop-blur-sm p-3 sm:p-5 flex flex-col justify-center overflow-y-auto custom-scroll">
            <div className="max-w-2xl w-full mx-auto bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <Bike className="w-4 h-4 shrink-0" />
                  <span>Велообхід до Платформи 4 · Крок {state.act1.step + 1} з 4</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRouteDrawer(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  Оглянути сцену
                </button>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mb-3">{activeFork.prompt}</h3>

              <div className="space-y-2">
                {activeFork.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onAttemptStep(state.act1.step, opt.isCorrect, opt.label, opt.errorFeedback);
                      if (opt.isCorrect && state.act1.step >= 3) {
                        setShowRouteDrawer(false);
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-400/70 transition-colors cursor-pointer"
                  >
                    <div className="text-xs sm:text-sm font-semibold text-slate-100">{opt.label}</div>
                    <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === P1 COORDINATOR VIEW: План обходу DB (Schorndorf Baustelle) with 3 Tabs ===
  return (
    <div className="relative w-full h-full flex flex-col">
      <SceneBackdrop
        customSrc="/assets/scene1-p1.jpg"
        alt="План обходу DB Schorndorf Baustelle"
        fallbackSvg={<SchorndorfMapBackdropSvg />}
        photoScrimClass="bg-slate-950/75"
      />

      <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden">
        {/* Header + 3 Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/70 shrink-0">
          <div>
            <h3 className="font-display text-xs sm:text-sm font-bold text-white tracking-tight">
              План обходу DB · Schorndorf Baustelle
            </h3>
            <p className="text-[11px] text-slate-400">
              Прогрес партнера: <span className="font-mono-tabular text-amber-300 font-semibold">{state.act1.step}/4 кроків</span> до Платформи 4
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700/80">
            {(
              [
                { id: 'sectors', label: 'Сектори' },
                { id: 'passages', label: 'Тимчасові проходи' },
                { id: 'bike', label: 'Веломаршрут' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setP1Tab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  p1Tab === tab.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scroll pt-3 text-xs sm:text-sm">
          {p1Tab === 'sectors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
              {/* Schematic Track Diagram */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-sky-300 font-semibold mb-2">
                  <span>Схема колій Шорндорф</span>
                  <span className="font-mono-tabular">DB Netz</span>
                </div>
                <div className="space-y-2 font-mono-tabular text-[11px]">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400">Колія 1–2</span>
                    <span className="text-rose-300">Ремонт · Aufzug Gl.2 DEFECT</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-amber-950/40 border border-amber-600/40">
                    <span className="text-amber-300">Колія 3</span>
                    <span className="text-amber-200">Екскаватор · Прохід B-3 (Персонал)</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-2 rounded bg-blue-950/70 border border-blue-400/70">
                    <span className="text-white font-bold">Колія 4 · Сектор A</span>
                    <span className="text-emerald-300 font-bold">← Stuttgart Hbf (MEX 13)</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-300">Колія 5 · Сектор A</span>
                    <span className="text-slate-400">→ Aalen (протилежний бік)</span>
                  </div>
                </div>
              </div>

              {/* Sector Rules */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Правила секторів (Табличка A / 4 / 5)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-snug">
                  <li>
                    <strong className="text-white">Прохід «A-4/5» (зелена велострілка):</strong> єдиний відкритий вихід на острівну платформу 4/5.
                  </li>
                  <li>
                    <strong className="text-rose-300">Прохід «B-3»:</strong> лише для будівельників (Nur Baustellenpersonal) — штраф за вхід.
                  </li>
                  <li>
                    <strong className="text-rose-300">Ліфт «Aufzug Gleis 2»:</strong> вимкнений на час реконструкції.
                  </li>
                  <li>
                    <strong className="text-emerald-300">Фінальний вихід:</strong> на платформі триматися <strong className="text-white">Колії 4 (Сектор A)</strong> — напрямок <strong className="text-white">Stuttgart Hbf</strong>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {p1Tab === 'passages' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Закриті та небезпечні ділянки</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Підземний перехід (сірий фліс + жовта стрічка):</strong> повністю закрито (GESPERRT).
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Жовтий екскаватор на коліях 2–3:</strong> активна зона техніки (Lebensgefahr), перехід через колії заборонений.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Дерев’яний місток / Behelfsbrücke Nord:</strong> круті сходи без пандуса — для велосипеда непридатні.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Відкриті тимчасові орієнтири</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Червоно-білий бар’єр + Сигнал «H»:</strong> знак «Пішоходам заборонено» стосується лише прямого виходу на колії! Повз бар’єр праворуч відкрито <strong className="text-amber-300">Umleitung Süd</strong>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">За сигналом «H»:</strong> розташований пологий дерев’яний пандус <strong className="text-emerald-300">«Rampe Ost»</strong> (ширина 1.4 м) — веде до настилу між коліями.
                </p>
              </div>
            </div>
          )}

          {p1Tab === 'bike' && (
            <div className="bg-slate-900/92 border border-amber-400/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                  <Bike className="w-4 h-4 shrink-0" />
                  <span>Правило DB: сходи ЗАБОРОНЕНІ без пандуса (≥1.2 м)</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Попроси партнера описати знаки на місці та продиктуй точну послідовність з 4 кроків:
              </p>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  '1. Південний обхід повз червоно-білий бар’єр (Umleitung Süd)',
                  '2. Пандус «Rampe Ost» одразу за білим сигналом «H»',
                  '3. Тимчасовий прохід під табличкою «A / 4 / 5» із зеленою велострілкою',
                  '4. Прямо на Платформу 4 · Сектор A (напрямок Stuttgart Hbf)',
                ].map((line, idx) => {
                  const done = state.act1.step > idx;
                  const active = state.act1.step === idx;
                  return (
                    <li
                      key={line}
                      className={`p-2.5 rounded-lg border ${
                        done
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                          : active
                          ? 'bg-amber-950/40 border-amber-400/70 text-white'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300'
                      }`}
                    >
                      {line}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
