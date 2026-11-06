// Capa gráfica de la serie: subtítulos sincronizados, rótulos, fechas, contadores, sello "¿Y SI...?", acabado cinematográfico.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, noise1, rand} from './core';

export interface WordT {w: string; s: number; e: number; hl: boolean}
export interface LineT {text: string; s: number; e: number; words: WordT[]}

// ---------- subtítulos (palabra a palabra, por bloques) ----------
const chunkWords = (lines: LineT[]) => {
  const chunks: {words: WordT[]; s: number; e: number}[] = [];
  lines.forEach((ln) => {
    let cur: WordT[] = [];
    const flush = () => { if (cur.length) { chunks.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; } };
    ln.words.forEach((w) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(' ').length;
      if (/[.,:;?!…]$/.test(w.w) || cur.length >= 4 || len > 18) flush();
    });
    flush();
  });
  // extender cada bloque hasta el siguiente (sin huecos cortos)
  for (let i = 0; i < chunks.length - 1; i++) if (chunks[i + 1].s - chunks[i].e < 0.6) chunks[i].e = chunks[i + 1].s;
  return chunks;
};
export const Subtitles: React.FC<{lines: LineT[]; y?: number; raiseFrom?: number}> = ({lines, y: y0 = 1270, raiseFrom = 1e9}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const y = y0 - tween(f, raiseFrom, raiseFrom + 10, 0, 170);
  const chunks = React.useMemo(() => chunkWords(lines), [lines]);
  const ch = chunks.find((c) => t >= c.s - 0.05 && t < c.e + 0.25);
  if (!ch) return null;
  const pop = spring({frame: f - Math.round(ch.s * fps), fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 34px',
        transform: `scale(${0.82 + 0.18 * pop}) translateY(${(1 - pop) * 24}px)`, opacity: clamp(pop * 2)}}>
        {ch.words.map((w, i) => {
          const active = t >= w.s - 0.03;
          const isNow = t >= w.s && t < w.e;
          return <span key={i} style={{fontFamily: FONT_TITLE, fontSize: 94, lineHeight: 1.12, textTransform: 'uppercase', letterSpacing: 1,
            color: w.hl ? C.yellow : '#fff', WebkitTextStroke: '14px #0d0a12', paintOrder: 'stroke fill',
            textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.35)', opacity: active ? 1 : 0.0,
            transform: `scale(${isNow ? 1.08 : 1}) rotate(${w.hl && isNow ? -2 : 0}deg)`, display: 'inline-block'}}>{w.w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- título del gancho ----------
export const HookTitle: React.FC<{text: string; hl?: string; dur?: number}> = ({text, hl, dur = 100}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const p = spring({frame: f - 2, fps, config: {damping: 11, stiffness: 160}}); const out = tween(f, dur - 12, dur, 1, 0);
  if (f > dur) return null;
  const parts = hl ? text.split(hl) : [text];
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 210, left: 50, right: 50, textAlign: 'center', opacity: out, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -4}deg)`}}>
      <div style={{display: 'inline-block', background: C.yellow, color: C.ink, fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, padding: '8px 22px', borderRadius: 10, letterSpacing: 4, transform: 'rotate(-2deg)', border: `5px solid ${C.ink}`, boxShadow: '0 8px 0 #0d0a12'}}>¿Y SI…?</div>
      <div style={{marginTop: 18, fontFamily: FONT_TITLE, fontSize: 104, lineHeight: 1.02, color: '#fff', textTransform: 'uppercase', WebkitTextStroke: '16px #0d0a12', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.6)'}}>
        {parts[0]}{hl && <span style={{color: C.yellow}}>{hl}</span>}{parts[1]}
      </div>
    </div>
  </AbsoluteFill>;
};

// ---------- fecha / lugar ----------
export const DateStamp: React.FC<{text: string; sub?: string; from?: number; dur?: number; y?: number}> = ({text, sub, from = 0, dur = 90, y = 230}) => {
  const f = useCurrentFrame() - from; if (f < 0 || f > dur) return null;
  const k = easeOut(clamp(f / 12)) * (1 - clamp((f - dur + 10) / 10));
  return <div style={{position: 'absolute', left: 60, top: y, transform: `translateX(${(1 - k) * -80}px)`, opacity: k}}>
    <div style={{fontFamily: FONT_TITLE, fontSize: 92, color: C.yellow, WebkitTextStroke: '12px #0d0a12', paintOrder: 'stroke fill', lineHeight: 1}}>{text}</div>
    {sub && <div style={{fontFamily: FONT_UI, fontWeight: 800, fontSize: 38, color: '#fff', marginTop: 6, background: 'rgba(13,10,18,0.75)', padding: '6px 16px', borderRadius: 8, display: 'inline-block', letterSpacing: 2}}>{sub}</div>}
  </div>;
};
// ---------- rótulo de personaje ----------
export const NameTag: React.FC<{name: string; role?: string; from: number; dur?: number; x?: number; y?: number; color?: string; flag?: React.ReactNode}> =
  ({name, role, from, dur = 75, x = 60, y = 1580, color = C.red, flag}) => {
    const f = useCurrentFrame() - from; if (f < 0 || f > dur) return null;
    const k = easeOut(clamp(f / 10)) * (1 - clamp((f - dur + 8) / 8));
    return <div style={{position: 'absolute', left: x, top: y, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
      <div style={{display: 'flex', alignItems: 'stretch', boxShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>
        <div style={{width: 16, background: color}} />
        <div style={{background: '#fffaf0', padding: '10px 22px', border: `5px solid ${C.ink}`}}>
          <div style={{fontFamily: FONT_TITLE, fontSize: 54, color: C.ink, lineHeight: 1, textTransform: 'uppercase'}}>{name}</div>
          {role && <div style={{fontFamily: FONT_UI, fontWeight: 800, fontSize: 28, color: '#5a5060', marginTop: 4}}>{role}</div>}
        </div>
      </div>
    </div>;
  };
// ---------- cifra animada ----------
export const BigStat: React.FC<{value: number; from: number; dur?: number; prefix?: string; suffix?: string; label?: string; x?: number; y?: number; decimals?: number; color?: string; hold?: number}> =
  ({value, from, dur = 30, prefix = '', suffix = '', label, x = 540, y = 600, decimals = 0, color = C.yellow, hold = 9999}) => {
    const f = useCurrentFrame() - from; if (f < 0 || f > hold) return null;
    const v = value * easeOut(clamp(f / dur)); const k = easeOut(clamp(f / 8)) * (1 - clamp((f - hold + 8) / 8));
    const txt = v.toLocaleString('es-ES', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
    return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: k, transform: `translateX(${x - 540}px) scale(${0.7 + 0.3 * k})`}}>
      <div style={{fontFamily: FONT_TITLE, fontSize: 150, color, WebkitTextStroke: '16px #0d0a12', paintOrder: 'stroke fill', lineHeight: 1, textShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>{prefix}{txt}{suffix}</div>
      {label && <div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 42, color: '#fff', WebkitTextStroke: '8px #0d0a12', paintOrder: 'stroke fill', marginTop: 4, textTransform: 'uppercase'}}>{label}</div>}
    </div>;
  };
export const Chip: React.FC<{text: string; from: number; dur?: number; x?: number; y?: number; color?: string; textColor?: string; size?: number; rot?: number}> =
  ({text, from, dur = 9999, x = 540, y = 400, color = C.yellow, textColor = C.ink, size = 44, rot = -2}) => {
    const f = useCurrentFrame() - from; if (f < 0 || f > dur) return null;
    const k = easeOut(clamp(f / 8)) * (1 - clamp((f - dur + 8) / 8));
    return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: k, transform: `translateX(${x - 540}px) scale(${0.5 + 0.5 * k}) rotate(${rot}deg)`}}>
      <span style={{background: color, color: textColor, fontFamily: FONT_UI, fontWeight: 900, fontSize: size, padding: '8px 20px', borderRadius: 10, border: `5px solid ${C.ink}`, boxShadow: '0 7px 0 #0d0a12', textTransform: 'uppercase', letterSpacing: 1}}>{text}</span>
    </div>;
  };
/** etiqueta permanente durante escenas especulativas (honestidad histórica) */
export const HypoTag: React.FC = () => {
  const f = useCurrentFrame(); const k = easeOut(clamp(f / 10));
  return <div style={{position: 'absolute', right: 40, top: 150, opacity: k, transform: `translateX(${(1 - k) * 60}px)`}}>
    <div style={{display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(13,10,18,0.82)', padding: '8px 16px', borderRadius: 10, border: `3px solid ${C.yellow}`}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: C.yellow, opacity: 0.5 + 0.5 * Math.sin(f / 5)}} />
      <span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 28, color: C.yellow, letterSpacing: 2}}>ESCENARIO HIPOTÉTICO</span>
    </div>
  </div>;
};
/** golpe visual del giro "¿Y si...?" */
export const WhatIfBurst: React.FC<{at?: number}> = ({at = 0}) => {
  const f = useCurrentFrame() - at; if (f < 0 || f > 40) return null;
  const k = f / 40; const g = f < 10 ? noise1(f * 3, 2) * 30 : 0;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle, rgba(255,214,10,${0.35 * (1 - k)}) 0%, rgba(0,0,0,0) 60%)`}} />
    <div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', transform: `translateX(${g}px) scale(${1 + k * 0.4})`, opacity: 1 - k}}>
      <span style={{fontFamily: FONT_TITLE, fontSize: 210, color: C.yellow, WebkitTextStroke: '18px #0d0a12', paintOrder: 'stroke fill'}}>¿Y SI…?</span>
    </div>
    {f < 10 && Array.from({length: 6}).map((_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rand(i + f, 3) * 1920, height: 10 + rand(i, f) * 60, background: i % 2 ? 'rgba(255,0,80,0.35)' : 'rgba(0,220,255,0.35)', transform: `translateX(${(rand(i, f + 1) - 0.5) * 80}px)`}} />)}
  </AbsoluteFill>;
};

// ---------- acabado cinematográfico ----------
export const Grade: React.FC<{tint?: string; tintOp?: number; vignette?: number; grain?: number}> = ({tint, tintOp = 0.12, vignette = 0.55, grain = 0.07}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {tint && <div style={{position: 'absolute', inset: 0, background: tint, opacity: tintOp, mixBlendMode: 'soft-light'}} />}
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(5,0,15,${vignette}) 100%)`}} />
    <Img src={staticFile(`backgrounds/grain${f % 4}.png`)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: grain * 0.6}} />
  </AbsoluteFill>;
};
export const SeriesBug: React.FC<{title: string}> = ({title}) => (
  <div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(13,10,18,0.7)', borderRadius: 40, padding: '6px 22px 6px 8px'}}>
      <span style={{background: C.yellow, color: C.ink, fontFamily: FONT_UI, fontWeight: 900, fontSize: 24, borderRadius: 30, padding: '4px 12px'}}>¿Y SI…?</span>
      <span style={{color: '#fff', fontFamily: FONT_UI, fontWeight: 800, fontSize: 24, letterSpacing: 1}}>{title}</span>
    </div>
  </div>
);
/** transición de tinta entre escenas (diagonal) */
export const InkWipe: React.FC<{at: number; color?: string}> = ({at, color = '#0d0a12'}) => {
  const f = useCurrentFrame() - at; if (f < -8 || f > 8) return null;
  const k = (f + 8) / 16; const x = interpolate(k, [0, 1], [-1600, 1600]);
  return <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
    <div style={{position: 'absolute', top: -400, bottom: -400, width: 1400, left: x, background: color, transform: 'skewX(-18deg)'}} />
    <div style={{position: 'absolute', top: -400, bottom: -400, width: 60, left: x - 70, background: C.yellow, transform: 'skewX(-18deg)'}} />
  </AbsoluteFill>;
};
export const EndCard: React.FC<{from: number; question: string}> = ({from, question}) => {
  const f = useCurrentFrame() - from; if (f < 0) return null; const k = easeOut(clamp(f / 14));
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', bottom: 300, left: 60, right: 60, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 40}px)`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, background: '#fffaf0', border: `6px solid ${C.ink}`, borderRadius: 18, padding: '14px 26px', boxShadow: '0 10px 0 #0d0a12'}}>
        <span style={{fontSize: 54}}>💬</span>
        <span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, color: C.ink}}>{question}</span>
      </div>
      <div style={{marginTop: 22, fontFamily: FONT_UI, fontWeight: 900, fontSize: 34, color: C.yellow, WebkitTextStroke: '6px #0d0a12', paintOrder: 'stroke fill', letterSpacing: 2}}>SÍGUEME PARA MÁS ¿Y SI…?</div>
    </div>
  </AbsoluteFill>;
};

// ---------- audio ----------
export const Sfx: React.FC<{name: string; at: number; vol?: number; dur?: number}> = ({name, at, vol = 0.6, dur}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={dur} layout="none"><Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol} /></Sequence>
);
export const Amb: React.FC<{name: string; vol?: number; from?: number; dur: number}> = ({name, vol = 0.25, from = 0, dur}) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} loop volume={(f) => vol * clamp(f / 12) * clamp((dur - f) / 12)} />
  </Sequence>
);
