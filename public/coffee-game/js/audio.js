// ============================================================
// Tiny WebAudio synth — no audio files needed, all bleeps drawn
// from oscillators/noise. Context is created lazily on first
// user gesture (autoplay policy) and everything routes through
// one master gain so the mute button is a single switch.
// ============================================================

let ctx = null;
let master = null;
let muted = false;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}
export function isMuted() { return muted; }

function tone(freq, { t = 0, dur = 0.15, type = 'sine', vol = 0.5, slide = 0 } = {}) {
  if (!ensureCtx()) return;
  const now = ctx.currentTime + t;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + dur);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(vol, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

function noise({ t = 0, dur = 0.3, vol = 0.2, freq = 1200 } = {}) {
  if (!ensureCtx()) return;
  const now = ctx.currentTime + t;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(f).connect(g).connect(master);
  src.start(now);
  src.stop(now + dur + 0.05);
}

export const sfx = {
  click()    { tone(660, { dur: 0.06, type: 'triangle', vol: 0.25 }); },
  pop()      { tone(320, { dur: 0.09, type: 'triangle', vol: 0.35, slide: 260 }); },
  order()    { tone(520, { dur: 0.08, type: 'square', vol: 0.15 }); tone(780, { t: 0.07, dur: 0.1, type: 'square', vol: 0.15 }); },
  steam()    { noise({ dur: 0.5, vol: 0.14, freq: 2400 }); },
  serve()    { tone(880, { dur: 0.1, type: 'sine', vol: 0.4 }); tone(1320, { t: 0.08, dur: 0.16, type: 'sine', vol: 0.35 }); },
  coin()     { tone(988, { dur: 0.07, type: 'square', vol: 0.16 }); tone(1319, { t: 0.06, dur: 0.12, type: 'square', vol: 0.16 }); },
  angry()    { tone(300, { dur: 0.2, type: 'sawtooth', vol: 0.2, slide: -160 }); tone(180, { t: 0.16, dur: 0.28, type: 'sawtooth', vol: 0.18, slide: -90 }); },
  buy()      { [523, 659, 784, 1047].forEach((f, i) => tone(f, { t: i * 0.07, dur: 0.12, type: 'triangle', vol: 0.3 })); },
  star()     { [784, 988, 1175, 1568].forEach((f, i) => tone(f, { t: i * 0.09, dur: 0.2, type: 'sine', vol: 0.3 })); },
  meow()     { tone(620, { dur: 0.24, type: 'sawtooth', vol: 0.12, slide: -300 }); },
  error()    { tone(196, { dur: 0.15, type: 'square', vol: 0.2 }); },
  bell()     { [1047, 784].forEach((f, i) => tone(f, { t: i * 0.3, dur: 0.7, type: 'sine', vol: 0.35 })); },
};
