import React from 'react';

/**
 * ACT 1 (P2 Field): Schorndorf Bahnhof under construction (16:9, 1280x720)
 * Landmarks match % hotspot coordinates:
 * - Blocked Underpass Stairs (grey fleece & yellow tape): ~18%, 66%
 * - Red-White Barrier + No Pedestrian + Signal "H": ~47%, 54%
 * - Yellow Excavator on tracks: ~74%, 48%
 * - Blue DB Sector Sign A / 4 / 5: ~84%, 24%
 */
export const SchorndorfFieldSvg: React.FC = () => (
  <svg
    viewBox="0 0 1280 720"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full block"
    aria-label="Станція Шорндорф на ремонті"
  >
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0C1729" />
        <stop offset="55%" stopColor="#1A2C47" />
        <stop offset="100%" stopColor="#263B59" />
      </linearGradient>
      <linearGradient id="concrete1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <pattern id="redWhiteStripe" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="28" fill="#DC2626" />
        <rect x="14" width="14" height="28" fill="#F8FAFC" />
      </pattern>
      <pattern id="yellowBlackTape" width="22" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
        <rect width="11" height="12" fill="#FACC15" />
        <rect x="11" width="11" height="12" fill="#1E293B" />
      </pattern>
    </defs>

    {/* Twilight sky */}
    <rect width="1280" height="720" fill="url(#sky1)" />

    {/* Distant Schorndorf skyline / hills */}
    <path d="M0 320 Q180 265 380 295 T820 275 T1280 290 L1280 410 L0 410 Z" fill="#132238" />
    <rect x="70" y="245" width="95" height="90" fill="#162842" />
    <polygon points="65,245 117,205 170,245" fill="#111E33" />
    <rect x="210" y="265" width="120" height="75" fill="#162842" />

    {/* Overhead catenary poles & wires */}
    <g stroke="#475569" strokeWidth="2.5" opacity="0.7">
      <line x1="0" y1="125" x2="1280" y2="165" />
      <line x1="0" y1="150" x2="1280" y2="190" />
      <line x1="360" y1="80" x2="360" y2="390" strokeWidth="5" />
      <line x1="890" y1="70" x2="890" y2="395" strokeWidth="6" />
    </g>

    {/* Warm station lamp glows */}
    <circle cx="240" cy="180" r="110" fill="url(#lampGlow)" />
    <circle cx="660" cy="175" r="115" fill="url(#lampGlow)" />
    <circle cx="1090" cy="155" r="120" fill="url(#lampGlow)" />

    {/* Station canopy right side */}
    <polygon points="780,60 1280,25 1280,105 780,125" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <line x1="1080" y1="95" x2="1080" y2="135" stroke="#64748B" strokeWidth="5" />

    {/* Gravel rail bed & tracks */}
    <polygon points="480,350 1280,315 1280,465 420,465" fill="#2A2E35" />
    {/* Track sleepers & steel rails */}
    <g stroke="#64748B" strokeWidth="3">
      <line x1="510" y1="378" x2="1280" y2="345" />
      <line x1="490" y1="406" x2="1280" y2="378" />
      <line x1="465" y1="432" x2="1280" y2="412" />
    </g>

    {/* Concrete station foreground plaza */}
    <polygon points="0,390 1280,430 1280,720 0,720" fill="url(#concrete1)" />
    {/* Wet reflections & paving seams */}
    <g stroke="#475569" strokeWidth="1.5" opacity="0.45">
      <line x1="0" y1="485" x2="1280" y2="510" />
      <line x1="0" y1="575" x2="1280" y2="605" />
      <line x1="340" y1="405" x2="270" y2="720" />
      <line x1="720" y1="418" x2="810" y2="720" />
    </g>

    {/* === LANDMARK 1 (18%, 66%): BLOCKED UNDERPASS STAIRS WITH GREY FLEECE & YELLOW TAPE === */}
    <g transform="translate(80, 390)">
      {/* Concrete stairwell walls */}
      <polygon points="15,40 275,40 295,210 0,210" fill="#1E293B" stroke="#475569" strokeWidth="3" />
      {/* Steps descending */}
      <rect x="35" y="60" width="215" height="22" fill="#334155" />
      <rect x="42" y="88" width="202" height="22" fill="#293548" />
      <rect x="48" y="116" width="190" height="22" fill="#1F2A3A" />
      <rect x="54" y="144" width="178" height="22" fill="#17202E" />
      {/* Draped Grey Protective Construction Fleece (Vlies) */}
      <path
        d="M25,52 Q95,44 150,58 T265,50 L252,188 Q170,198 110,182 T34,190 Z"
        fill="#94A3B8"
        fillOpacity="0.82"
        stroke="#CBD5E1"
        strokeWidth="2"
      />
      {/* Wrinkles in grey fleece */}
      <path d="M60,72 Q135,88 220,76 M52,115 Q145,102 232,122 M64,156 Q140,168 224,152" stroke="#64748B" strokeWidth="2.5" fill="none" />
      {/* Yellow caution tape criss-crossing the stairwell */}
      <rect x="5" y="75" width="285" height="16" transform="rotate(8 145 83)" fill="url(#yellowBlackTape)" stroke="#0F172A" strokeWidth="1.5" />
      <rect x="5" y="128" width="285" height="16" transform="rotate(-11 145 136)" fill="url(#yellowBlackTape)" stroke="#0F172A" strokeWidth="1.5" />
      {/* Sign on stairwell */}
      <rect x="92" y="18" width="118" height="26" rx="4" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
      <text x="151" y="36" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="monospace">
        GESPERRT
      </text>
    </g>

    {/* === LANDMARK 2 (47%, 54%): RED-WHITE BARRIER + NO PEDESTRIAN SIGN + SIGNAL "H" === */}
    <g transform="translate(475, 290)">
      {/* Signal "H" (Haltetafel) pole */}
      <rect x="182" y="5" width="8" height="160" fill="#94A3B8" />
      <rect x="158" y="8" width="56" height="64" rx="4" fill="#F8FAFC" stroke="#0F172A" strokeWidth="5" />
      <text x="186" y="54" textAnchor="middle" fill="#0F172A" fontSize="42" fontWeight="900" fontFamily="sans-serif">
        H
      </text>

      {/* Red-white Baustelle barrier */}
      <rect x="18" y="125" width="10" height="82" fill="#64748B" />
      <rect x="210" y="125" width="10" height="82" fill="#64748B" />
      <rect x="8" y="128" width="222" height="32" rx="3" fill="url(#redWhiteStripe)" stroke="#0F172A" strokeWidth="2.5" />
      <rect x="18" y="172" width="202" height="14" rx="2" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
      {/* Flashing amber warning lamps on barrier */}
      <circle cx="24" cy="118" r="9" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
      <circle cx="214" cy="118" r="9" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />

      {/* German "No Pedestrian" Sign (Verbot für Fußgänger) */}
      <rect x="88" y="55" width="6" height="75" fill="#94A3B8" />
      <circle cx="91" cy="56" r="32" fill="#F8FAFC" stroke="#DC2626" strokeWidth="8" />
      {/* Pedestrian silhouette inside */}
      <circle cx="91" cy="41" r="5" fill="#0F172A" />
      <path d="M91,47 L91,60 M91,50 L82,58 M91,50 L100,56 M91,60 L84,73 M91,60 L98,73" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
      {/* Red diagonal bar */}
      <line x1="71" y1="36" x2="111" y2="76" stroke="#DC2626" strokeWidth="6" />
    </g>

    {/* === LANDMARK 3 (74%, 48%): YELLOW EXCAVATOR ON TRACKS === */}
    <g transform="translate(830, 245)">
      {/* Rail undercarriage & steel wheels */}
      <rect x="65" y="148" width="165" height="24" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
      <circle cx="96" cy="174" r="16" fill="#334155" stroke="#94A3B8" strokeWidth="3" />
      <circle cx="148" cy="174" r="16" fill="#334155" stroke="#94A3B8" strokeWidth="3" />
      <circle cx="200" cy="174" r="16" fill="#334155" stroke="#94A3B8" strokeWidth="3" />
      {/* Yellow body & cab */}
      <rect x="82" y="72" width="138" height="76" rx="8" fill="#EAB308" stroke="#713F12" strokeWidth="3" />
      <rect x="145" y="84" width="60" height="44" rx="4" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
      <rect x="92" y="96" width="42" height="32" rx="3" fill="#CA8A04" />
      {/* Amber beacon */}
      <rect x="172" y="58" width="14" height="14" rx="3" fill="#F97316" />
      <circle cx="179" cy="64" r="22" fill="#F59E0B" opacity="0.22" />
      {/* Hydraulic Boom Arm & Bucket */}
      <path d="M88,108 L22,52 L-35,105" fill="none" stroke="#EAB308" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88,108 L22,52 L-35,105" fill="none" stroke="#713F12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bucket */}
      <path d="M-48,96 L-20,108 L-28,142 L-64,132 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
    </g>

    {/* === LANDMARK 4 (84%, 24%): BLUE DB SECTOR SIGN A / 4 / 5 === */}
    <g transform="translate(970, 115)">
      <rect x="0" y="0" width="215" height="96" rx="6" fill="#1D4ED8" stroke="#E2E8F0" strokeWidth="3.5" />
      {/* Sector A white box */}
      <rect x="10" y="10" width="62" height="76" rx="4" fill="#F8FAFC" />
      <text x="41" y="64" textAnchor="middle" fill="#0F172A" fontSize="48" fontWeight="900" fontFamily="sans-serif">
        A
      </text>
      {/* Track 4 & Track 5 */}
      <line x1="142" y1="12" x2="142" y2="84" stroke="#93C5FD" strokeWidth="2" opacity="0.6" />
      <text x="106" y="34" textAnchor="middle" fill="#BFDBFE" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        Gleis
      </text>
      <text x="106" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="40" fontWeight="800" fontFamily="monospace">
        4
      </text>
      <text x="176" y="34" textAnchor="middle" fill="#BFDBFE" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        Gleis
      </text>
      <text x="176" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="40" fontWeight="800" fontFamily="monospace">
        5
      </text>
      {/* Yellow temporary Umleitung arrow sticker underneath */}
      <rect x="28" y="102" width="160" height="28" rx="4" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
      <text x="108" y="121" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="800" fontFamily="sans-serif">
        UMLEITUNG →
      </text>
    </g>

    {/* Foreground Bicycle Handlebar Hint (Bottom Left) */}
    <g opacity="0.72" transform="translate(20, 625)">
      <path d="M0,70 Q90,25 185,48" fill="none" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />
      <path d="M0,70 Q90,25 185,48" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
      <rect x="160" y="36" width="44" height="18" rx="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="95" cy="40" r="10" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * ACT 1 (P1 Coordinator): Blueprint background for DB Baustelle Map
 */
export const SchorndorfMapBackdropSvg: React.FC = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
    <defs>
      <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E3A5F" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="1280" height="720" fill="#0A1628" />
    <rect width="1280" height="720" fill="url(#bpGrid)" />
    <circle cx="1160" cy="110" r="55" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
  </svg>
);

/**
 * ACT 2 (P2 Field): Platform 4 with Arriving Yellow-Nose MEX Regional Train, DB Display & Ticket Validator
 * Hotspots:
 * - Ticket Validator: ~18%, 62%
 * - Platform Display: ~33%, 21%
 * - Train Sector C: ~55%, 56%
 * - Train Sector B (Bike!): ~72%, 56%
 * - Train Sector A: ~89%, 56%
 */
export const Platform4MexSvg: React.FC = () => (
  <svg
    viewBox="0 0 1280 720"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full block"
    aria-label="Платформа 4 — прибуття потяга MEX"
  >
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0D192B" />
        <stop offset="60%" stopColor="#1E314D" />
        <stop offset="100%" stopColor="#283C5C" />
      </linearGradient>
      <linearGradient id="platFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B4759" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="trainYellow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>

    <rect width="1280" height="720" fill="url(#sky2)" />

    {/* Canopy roof */}
    <polygon points="0,0 1280,0 1280,105 0,130" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <rect x="65" y="120" width="22" height="440" fill="#1E293B" stroke="#475569" strokeWidth="2" />

    {/* Platform 4 concrete floor & white safety tactile line */}
    <polygon points="0,470 1280,445 1280,720 0,720" fill="url(#platFloor)" />
    <line x1="0" y1="530" x2="1280" y2="495" stroke="#F8FAFC" strokeWidth="8" strokeDasharray="24 10" opacity="0.82" />

    {/* === DB PLATFORM DEPARTURE DISPLAY (33%, 21%) === */}
    <g transform="translate(275, 92)">
      <line x1="145" y1="-20" x2="145" y2="0" stroke="#64748B" strokeWidth="6" />
      <rect x="0" y="0" width="295" height="118" rx="6" fill="#1E3A8A" stroke="#CBD5E1" strokeWidth="3.5" />
      <rect x="10" y="10" width="54" height="30" rx="3" fill="#F8FAFC" />
      <text x="37" y="31" textAnchor="middle" fill="#1E3A8A" fontSize="18" fontWeight="900" fontFamily="monospace">
        Gl.4
      </text>
      <text x="78" y="32" fill="#FACC15" fontSize="22" fontWeight="800" fontFamily="monospace">
        MEX 13 · 14:22
      </text>
      <text x="14" y="68" fill="#FFFFFF" fontSize="21" fontWeight="800" fontFamily="sans-serif">
        ← Stuttgart Hbf
      </text>
      <rect x="12" y="82" width="271" height="26" rx="3" fill="#0F172A" />
      <text x="148" y="100" textAnchor="middle" fill="#93C5FD" fontSize="14" fontWeight="700" fontFamily="monospace">
        Сектори: [ C ] — [ B ] — [ A ]
      </text>
    </g>

    {/* === ARRIVING YELLOW-NOSE bwegt MEX REGIONAL TRAIN (Right/Center) === */}
    <g transform="translate(505, 225)">
      {/* Track shadow */}
      <ellipse cx="380" cy="260" rx="390" ry="18" fill="#090D16" opacity="0.7" />
      {/* Train body: sleek white + yellow bwegt nose */}
      <path
        d="M55,40 L775,28 L775,248 L12,248 Q2,165 55,40 Z"
        fill="#F1F5F9"
        stroke="#0F172A"
        strokeWidth="3"
      />
      {/* Yellow bwegt nose & side accent stripe */}
      <path d="M55,40 L145,38 L108,248 L12,248 Q2,165 55,40 Z" fill="url(#trainYellow)" />
      <rect x="112" y="214" width="663" height="22" fill="#1E293B" />
      <rect x="120" y="36" width="655" height="16" fill="#EAB308" />

      {/* Cab Windshield & Headlights */}
      <path d="M56,62 L116,62 L98,136 L34,136 Z" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
      <rect x="46" y="72" width="54" height="14" rx="2" fill="#111827" />
      <text x="73" y="83" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="800" fontFamily="monospace">
        MEX 13
      </text>
      <circle cx="34" cy="196" r="10" fill="#FEF08A" />
      <circle cx="88" cy="196" r="10" fill="#FEF08A" />

      {/* Sector C Carriage Window & Door (~55%) */}
      <g transform="translate(152, 65)">
        <rect x="0" y="0" width="76" height="140" rx="5" fill="#CBD5E1" stroke="#334155" strokeWidth="2.5" />
        <rect x="12" y="14" width="52" height="58" rx="3" fill="#1E293B" />
        <rect x="18" y="84" width="40" height="24" rx="3" fill="#1D4ED8" />
        <text x="38" y="101" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="monospace">
          C
        </text>
        <text x="38" y="128" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
          1. Kl.
        </text>
      </g>

      {/* Middle Windows */}
      <rect x="248" y="74" width="110" height="62" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="2" />

      {/* Sector B Carriage Door — Bike Compartment (~72%) */}
      <g transform="translate(382, 62)">
        <rect x="0" y="0" width="84" height="144" rx="5" fill="#E2E8F0" stroke="#334155" strokeWidth="2.5" />
        <rect x="14" y="14" width="56" height="58" rx="3" fill="#1E293B" />
        <rect x="22" y="84" width="40" height="24" rx="3" fill="#1D4ED8" />
        <text x="42" y="101" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="monospace">
          B
        </text>
        {/* Subtle low-floor icon */}
        <circle cx="32" cy="128" r="6" fill="none" stroke="#334155" strokeWidth="2" />
        <circle cx="52" cy="128" r="6" fill="none" stroke="#334155" strokeWidth="2" />
        <line x1="32" y1="128" x2="43" y2="118" stroke="#334155" strokeWidth="2" />
        <line x1="43" y1="118" x2="52" y2="128" stroke="#334155" strokeWidth="2" />
      </g>

      {/* Windows */}
      <rect x="488" y="70" width="106" height="62" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="2" />

      {/* Sector A Carriage Door (~89%) */}
      <g transform="translate(612, 60)">
        <rect x="0" y="0" width="80" height="144" rx="5" fill="#CBD5E1" stroke="#334155" strokeWidth="2.5" />
        <rect x="14" y="14" width="52" height="58" rx="3" fill="#1E293B" />
        <rect x="20" y="84" width="40" height="24" rx="3" fill="#1D4ED8" />
        <text x="40" y="101" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="monospace">
          A
        </text>
        <text x="40" y="128" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
          2. Kl.
        </text>
      </g>
    </g>

    {/* === DB / VVS TICKET VALIDATOR TERMINAL (18%, 62%) === */}
    <g transform="translate(152, 322)">
      {/* Metal stand */}
      <rect x="52" y="195" width="32" height="125" fill="#475569" />
      <rect x="24" y="310" width="88" height="16" rx="3" fill="#1E293B" />
      {/* Red DB/VVS Validator Box */}
      <rect x="10" y="10" width="118" height="196" rx="10" fill="#B91C1C" stroke="#F8FAFC" strokeWidth="3" />
      <rect x="22" y="24" width="94" height="26" rx="4" fill="#FACC15" />
      <text x="69" y="42" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="900" fontFamily="sans-serif">
        VVS / DB
      </text>
      {/* Screen */}
      <rect x="24" y="62" width="90" height="56" rx="4" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
      <text x="69" y="85" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="700" fontFamily="monospace">
        14:18
      </text>
      <text x="69" y="105" textAnchor="middle" fill="#FACC15" fontSize="11" fontWeight="700" fontFamily="monospace">
        ВЕЛОКВИТОК
      </text>
      {/* Ticket slot */}
      <rect x="30" y="138" width="78" height="14" rx="3" fill="#090D16" stroke="#CBD5E1" strokeWidth="1.5" />
      <text x="69" y="176" textAnchor="middle" fill="#FEE2E2" fontSize="11" fontWeight="700" fontFamily="sans-serif">
        ЕНТВЕРТЕР
      </text>
    </g>
  </svg>
);

/**
 * ACT 2 (P1 Coordinator): Warm desk & DB Navigator app ambient backdrop
 */
export const CoordinatorDbDeskSvg: React.FC = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
    <defs>
      <linearGradient id="deskBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1B263B" />
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#deskBg)" />
    <g stroke="#334155" strokeWidth="1" opacity="0.28">
      <line x1="0" y1="180" x2="1280" y2="180" />
      <line x1="0" y1="360" x2="1280" y2="360" />
      <line x1="0" y1="540" x2="1280" y2="540" />
      <line x1="320" y1="0" x2="320" y2="720" />
      <line x1="640" y1="0" x2="640" y2="720" />
      <line x1="960" y1="0" x2="960" y2="720" />
    </g>
  </svg>
);

/**
 * ACT 3 (P2 Field): Inside the moving MEX 13 train toward Stuttgart Hbf
 */
export const TrainInteriorSvg: React.FC = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
    <defs>
      <linearGradient id="remstalSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="55%" stopColor="#334155" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A2420" />
        <stop offset="100%" stopColor="#171412" />
      </linearGradient>
    </defs>

    {/* Carriage wall */}
    <rect width="1280" height="720" fill="#172030" />

    {/* Panoramic Train Window */}
    <rect x="70" y="34" width="1140" height="310" rx="22" fill="url(#remstalSky)" stroke="#475569" strokeWidth="8" />
    {/* Passing hills & Stuttgart evening lights */}
    <path d="M74,250 Q290,190 540,230 T980,205 T1206,245 L1206,340 L74,340 Z" fill="#1E293B" />
    <g fill="#FBBF24" opacity="0.65">
      <circle cx="240" cy="268" r="3" />
      <circle cx="255" cy="272" r="2.5" />
      <circle cx="620" cy="252" r="3" />
      <circle cx="885" cy="242" r="3.5" />
      <circle cx="910" cy="254" r="2.5" />
      <circle cx="1040" cy="260" r="3" />
    </g>
    {/* Subtle motion streaks */}
    <g stroke="#94A3B8" strokeWidth="2" opacity="0.25">
      <line x1="120" y1="120" x2="360" y2="120" />
      <line x1="680" y1="95" x2="940" y2="95" />
      <line x1="420" y1="175" x2="620" y2="175" />
    </g>

    {/* Fold-down train table */}
    <polygon points="0,375 1280,375 1280,720 0,720" fill="url(#tableGrad)" />
    <line x1="0" y1="378" x2="1280" y2="378" stroke="#64748B" strokeWidth="4" />
  </svg>
);

/**
 * ACT 4 (P2 Field): Stuttgart Hbf Blue DB Luggage Lockers Hall Backdrop
 */
export const StuttgartHallSvg: React.FC = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
    <defs>
      <linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#hallWall)" />
    {/* Overhead station ceiling lights */}
    <rect x="180" y="14" width="260" height="10" rx="5" fill="#E2E8F0" opacity="0.7" />
    <rect x="840" y="14" width="260" height="10" rx="5" fill="#E2E8F0" opacity="0.7" />
    {/* Terrazzo floor */}
    <rect x="0" y="625" width="1280" height="95" fill="#172032" />
    <line x1="0" y1="625" x2="1280" y2="625" stroke="#334155" strokeWidth="3" />
  </svg>
);
