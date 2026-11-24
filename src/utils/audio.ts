// Web Audio API sound effects & walkie-talkie squelch synthesizer

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playNoiseBurst(ctx: AudioContext, durationSec: number, gainLevel: number, centerHz: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.65));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = centerHz;
  filter.Q.value = 1.4;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

/**
 * Walkie-talkie PTT key-up squelch sound
 */
export function playSquelchOn() {
  const ctx = getAudioContext();
  if (!ctx) return;

  playNoiseBurst(ctx, 0.08, 0.14, 1800);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1120, ctx.currentTime);
  osc.frequency.setValueAtTime(1420, ctx.currentTime + 0.035);

  gain.gain.setValueAtTime(0.11, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.095);
}

/**
 * Walkie-talkie PTT release roger-beep + static tail
 */
export function playSquelchOff() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1260, now);
  osc.frequency.setValueAtTime(920, now + 0.055);

  gain.gain.setValueAtTime(0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.135);

  setTimeout(() => {
    const c = getAudioContext();
    if (c) playNoiseBurst(c, 0.09, 0.1, 1500);
  }, 55);
}

/**
 * Warm German railway station triad chime for puzzle progress
 */
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [392.0, 493.88, 587.33]; // G4, B4, D5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.09);
    gain.gain.setValueAtTime(0.001, now + i * 0.09);
    gain.gain.linearRampToValueAtTime(0.1, now + i * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.09);
    osc.stop(now + i * 0.09 + 0.35);
  });
}

/**
 * Error buzz (-30s penalty)
 */
export function playErrorBuzz() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.12].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(185, now + offset);
    osc.frequency.linearRampToValueAtTime(145, now + offset + 0.09);

    gain.gain.setValueAtTime(0.09, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.105);
  });
}

/**
 * Metallic Euro coin clink
 */
export function playCoinClink() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const partials = [2480, 3890];

  partials.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(i === 0 ? 0.08 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  });
}

/**
 * Mechanical locker switch / key click
 */
export function playMechanicalClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, 0.04, 0.16, 900);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
  gain.gain.setValueAtTime(0.07, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Celebratory chord when Locker 337 opens
 */
export function playVictoryFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const start = now + idx * 0.11;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.11, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.9);
  });
}

// ================= PROCEDURAL LOOPING AMBIENT SOUNDSCAPES =================

interface ActiveAmbientLayer {
  act: 1 | 2 | 3 | 4;
  layerGain: GainNode;
  stopNodes: () => void;
}

let ambientMasterGain: GainNode | null = null;
let activeLayer: ActiveAmbientLayer | null = null;
let ambientMuted = false;
let ambientDucked = false;

function getAmbientMaster(ctx: AudioContext): GainNode {
  if (!ambientMasterGain || ambientMasterGain.context !== ctx) {
    ambientMasterGain = ctx.createGain();
    ambientMasterGain.gain.setValueAtTime(computeAmbientTargetGain(), ctx.currentTime);
    ambientMasterGain.connect(ctx.destination);
  }
  return ambientMasterGain;
}

function computeAmbientTargetGain(): number {
  if (ambientMuted) return 0.0001;
  return ambientDucked ? 0.22 : 1.0;
}

function applyMasterGainRamp(durationSec = 0.25) {
  if (!audioCtx || !ambientMasterGain) return;
  const now = audioCtx.currentTime;
  ambientMasterGain.gain.cancelScheduledValues(now);
  ambientMasterGain.gain.setValueAtTime(Math.max(0.0001, ambientMasterGain.gain.value), now);
  ambientMasterGain.gain.linearRampToValueAtTime(computeAmbientTargetGain(), now + durationSec);
}

/**
 * Generates a click-free crossfaded looping noise buffer (brown or pink-ish coloration).
 */
function createSeamlessNoiseBuffer(
  ctx: AudioContext,
  durationSec: number,
  color: 'brown' | 'pink'
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * durationSec);
  const crossfade = Math.floor(ctx.sampleRate * 0.35);
  const raw = new Float32Array(length + crossfade);

  if (color === 'brown') {
    let last = 0;
    for (let i = 0; i < raw.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.03 * white) / 1.03;
      raw[i] = last * 3.2;
    }
  } else {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < raw.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      raw[i] = (b0 + b1 + b2 + white * 0.015) * 1.4;
    }
  }

  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const out = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    if (i < crossfade) {
      const t = i / crossfade;
      out[i] = raw[i] * t + raw[length + i] * (1 - t);
    } else {
      out[i] = raw[i];
    }
  }
  return buffer;
}

/**
 * Generates a seamless periodic rail-joint clatter loop ("tuk-tuk ... tuk-tuk") for Act 3 train.
 */
function createRailClatterBuffer(ctx: AudioContext): AudioBuffer {
  const durationSec = 1.4;
  const length = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const out = buffer.getChannelData(0);

  // Rail joint impact moments inside the 1.4s cycle
  const hits = [
    { time: 0.08, amp: 0.72, decay: 0.042 },
    { time: 0.24, amp: 0.52, decay: 0.038 },
    { time: 0.78, amp: 0.65, decay: 0.042 },
    { time: 0.94, amp: 0.45, decay: 0.036 },
  ];

  for (let i = 0; i < length; i++) {
    const t = i / ctx.sampleRate;
    let sample = 0;
    for (const h of hits) {
      const dt = t - h.time;
      if (dt >= 0 && dt < 0.16) {
        const env = Math.exp(-dt / h.decay);
        const thud = Math.sin(2 * Math.PI * (78 - dt * 140) * dt);
        const grit = (Math.random() * 2 - 1) * 0.45;
        sample += (thud * 0.65 + grit) * env * h.amp;
      }
    }
    out[i] = sample;
  }
  return buffer;
}

function buildActLayer(ctx: AudioContext, act: 1 | 2 | 3 | 4): ActiveAmbientLayer {
  const layerGain = ctx.createGain();
  layerGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  layerGain.connect(getAmbientMaster(ctx));

  const stoppers: (() => void)[] = [];

  const registerSource = (node: AudioScheduledSourceNode) => {
    node.start();
    stoppers.push(() => {
      try {
        node.stop();
      } catch {
        // ignore if already stopped
      }
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    });
  };

  if (act === 1) {
    // ACT 1: Schorndorf Baustelle — excavator engine rumble + outdoor breeze + subtle machinery modulation
    const brownSrc = ctx.createBufferSource();
    brownSrc.buffer = createSeamlessNoiseBuffer(ctx, 4.0, 'brown');
    brownSrc.loop = true;

    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.value = 180;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.11;

    brownSrc.connect(lowFilter);
    lowFilter.connect(rumbleGain);
    rumbleGain.connect(layerGain);
    registerSource(brownSrc);

    // Distant excavator diesel hum with slow LFO throttle swell
    const engineOsc = ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 54;

    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 125;

    const engineGain = ctx.createGain();
    engineGain.gain.value = 0.028;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.22;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 18;
    lfo.connect(lfoDepth);
    lfoDepth.connect(engineFilter.frequency);

    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(layerGain);
    registerSource(engineOsc);
    registerSource(lfo);

    // Subtle open-air twilight rain/wind hush
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = createSeamlessNoiseBuffer(ctx, 4.5, 'pink');
    airSrc.loop = true;

    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 780;
    airFilter.Q.value = 0.7;

    const airGain = ctx.createGain();
    airGain.gain.value = 0.032;

    airSrc.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(layerGain);
    registerSource(airSrc);
  } else if (act === 2) {
    // ACT 2: Platform 4 — German station canopy air + idling electric MEX traction hum
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = createSeamlessNoiseBuffer(ctx, 4.5, 'pink');
    airSrc.loop = true;

    const canopyFilter = ctx.createBiquadFilter();
    canopyFilter.type = 'bandpass';
    canopyFilter.frequency.value = 460;
    canopyFilter.Q.value = 0.85;

    const canopyGain = ctx.createGain();
    canopyGain.gain.value = 0.055;

    airSrc.connect(canopyFilter);
    canopyFilter.connect(canopyGain);
    canopyGain.connect(layerGain);
    registerSource(airSrc);

    // Electric regional train idling traction hum (100Hz + 200Hz harmonic)
    const hum1 = ctx.createOscillator();
    hum1.type = 'sine';
    hum1.frequency.value = 100;
    const hum2 = ctx.createOscillator();
    hum2.type = 'triangle';
    hum2.frequency.value = 200;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 280;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.022;

    const breathLfo = ctx.createOscillator();
    breathLfo.type = 'sine';
    breathLfo.frequency.value = 0.16;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.008;
    breathLfo.connect(breathGain);
    breathGain.connect(humGain.gain);

    hum1.connect(humFilter);
    hum2.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(layerGain);
    registerSource(hum1);
    registerSource(hum2);
    registerSource(breathLfo);
  } else if (act === 3) {
    // ACT 3: Moving MEX 13 Train — warm cabin drone + seamless looping rail-joint clatter
    const cabinSrc = ctx.createBufferSource();
    cabinSrc.buffer = createSeamlessNoiseBuffer(ctx, 4.0, 'brown');
    cabinSrc.loop = true;

    const cabinFilter = ctx.createBiquadFilter();
    cabinFilter.type = 'lowpass';
    cabinFilter.frequency.value = 210;

    const cabinGain = ctx.createGain();
    cabinGain.gain.value = 0.115;

    cabinSrc.connect(cabinFilter);
    cabinFilter.connect(cabinGain);
    cabinGain.connect(layerGain);
    registerSource(cabinSrc);

    // Periodic rail-joint rhythm ("tuk-tuk ... tuk-tuk")
    const clatterSrc = ctx.createBufferSource();
    clatterSrc.buffer = createRailClatterBuffer(ctx);
    clatterSrc.loop = true;

    const clatterFilter = ctx.createBiquadFilter();
    clatterFilter.type = 'lowpass';
    clatterFilter.frequency.value = 340;

    const clatterGain = ctx.createGain();
    clatterGain.gain.value = 0.075;

    clatterSrc.connect(clatterFilter);
    clatterFilter.connect(clatterGain);
    clatterGain.connect(layerGain);
    registerSource(clatterSrc);

    // Subtle electric motor speed whine
    const motorOsc = ctx.createOscillator();
    motorOsc.type = 'sine';
    motorOsc.frequency.value = 148;
    const motorGain = ctx.createGain();
    motorGain.gain.value = 0.012;
    motorOsc.connect(motorGain);
    motorGain.connect(layerGain);
    registerSource(motorOsc);
  } else {
    // ACT 4: Stuttgart Hbf Luggage Locker Hall — resonant underground ventilation + 50Hz European fluorescent warmth
    const hallSrc = ctx.createBufferSource();
    hallSrc.buffer = createSeamlessNoiseBuffer(ctx, 5.0, 'pink');
    hallSrc.loop = true;

    const hallFilter = ctx.createBiquadFilter();
    hallFilter.type = 'bandpass';
    hallFilter.frequency.value = 270;
    hallFilter.Q.value = 1.6;

    const hallGain = ctx.createGain();
    hallGain.gain.value = 0.068;

    hallSrc.connect(hallFilter);
    hallFilter.connect(hallGain);
    hallGain.connect(layerGain);
    registerSource(hallSrc);

    // 50Hz mains + 150Hz subtle fluorescent tube hum in the locker hall
    const mains50 = ctx.createOscillator();
    mains50.type = 'sine';
    mains50.frequency.value = 50;
    const mainsGain = ctx.createGain();
    mainsGain.gain.value = 0.025;
    mains50.connect(mainsGain);
    mainsGain.connect(layerGain);
    registerSource(mains50);

    const fluor150 = ctx.createOscillator();
    fluor150.type = 'sine';
    fluor150.frequency.value = 150;
    const fluorGain = ctx.createGain();
    fluorGain.gain.value = 0.009;

    const shimmerLfo = ctx.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 0.12;
    const shimmerDepth = ctx.createGain();
    shimmerDepth.gain.value = 0.003;
    shimmerLfo.connect(shimmerDepth);
    shimmerDepth.connect(fluorGain.gain);

    fluor150.connect(fluorGain);
    fluorGain.connect(layerGain);
    registerSource(fluor150);
    registerSource(shimmerLfo);
  }

  return {
    act,
    layerGain,
    stopNodes: () => {
      stoppers.forEach((fn) => fn());
      try {
        layerGain.disconnect();
      } catch {
        // ignore
      }
    },
  };
}

/**
 * Smoothly crossfades into the looping ambient soundscape for the specified act (1..4).
 */
export function startActAmbient(act: 1 | 2 | 3 | 4): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (activeLayer && activeLayer.act === act) {
    return;
  }

  const now = ctx.currentTime;

  // Smooth fade-out of previous act layer
  if (activeLayer) {
    const prev = activeLayer;
    prev.layerGain.gain.cancelScheduledValues(now);
    prev.layerGain.gain.setValueAtTime(Math.max(0.0001, prev.layerGain.gain.value), now);
    prev.layerGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    window.setTimeout(() => {
      prev.stopNodes();
    }, 680);
    activeLayer = null;
  }

  // Build and fade-in new act layer
  const next = buildActLayer(ctx, act);
  next.layerGain.gain.cancelScheduledValues(now);
  next.layerGain.gain.setValueAtTime(0.0001, now);
  next.layerGain.gain.linearRampToValueAtTime(1.0, now + 0.85);
  activeLayer = next;
}

/**
 * Smoothly fades out and stops all ambient audio (used on exit/victory/timeout).
 */
export function stopAmbient(): void {
  if (!activeLayer || !audioCtx) {
    activeLayer = null;
    return;
  }
  const prev = activeLayer;
  activeLayer = null;
  const now = audioCtx.currentTime;
  prev.layerGain.gain.cancelScheduledValues(now);
  prev.layerGain.gain.setValueAtTime(Math.max(0.0001, prev.layerGain.gain.value), now);
  prev.layerGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
  window.setTimeout(() => {
    prev.stopNodes();
  }, 420);
}

/**
 * Mutes or unmutes the looping ambient soundscape smoothly.
 */
export function setAmbientMuted(muted: boolean): void {
  ambientMuted = muted;
  applyMasterGainRamp(0.25);
}

/**
 * Ducks ambient volume automatically while PTT walkie-talkie voice is active.
 */
export function setAmbientDucked(ducked: boolean): void {
  if (ambientDucked === ducked) return;
  ambientDucked = ducked;
  applyMasterGainRamp(0.18);
}

/**
 * Unlocks AudioContext on first user gesture (for direct URL-launch sessions).
 */
export function unlockAudioContext(): void {
  getAudioContext();
}

