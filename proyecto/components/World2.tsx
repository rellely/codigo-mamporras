// Elementos adicionales: hongo nuclear, onda expansiva, fauna prehistórica y actual, campos, refugio.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, clamp, lerp, noise1, rand, tween, easeOut} from './core';
import {shade} from './Character';

const O = C.ink;

/** hongo nuclear estilizado (sin víctimas visibles): destello → bola de fuego → columna y sombrero */
export const MushroomCloud: React.FC<{x: number; y: number; at: number; s?: number}> = ({x, y, at, s = 1}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null;
  const grow = easeOut(clamp(f / 90)); const rise = easeOut(clamp(f / 140));
  const heat = clamp(1 - f / 70); // blanco-naranja → gris
  const capCol = heat > 0.5 ? '#fff2c0' : heat > 0 ? '#ff9a4a' : '#8a7a70';
  const capY = -120 - rise * 620; const capR = 70 + grow * 230;
  const roll = f / 12;
  return <g transform={`translate(${x},${y}) scale(${s})`}>
    {/* columna */}
    <path d={`M${-30 - grow * 30},0 Q${-50 - grow * 20},${capY * 0.5} ${-40 - grow * 20},${capY + 40} L${40 + grow * 20},${capY + 40} Q${50 + grow * 20},${capY * 0.5} ${30 + grow * 30},0Z`} fill={shade('#9a8478', heat * 0.4)} />
    {Array.from({length: 6}).map((_, i) => <ellipse key={'c' + i} cx={Math.sin(roll + i) * 10} cy={capY * (0.25 + i * 0.12)} rx={40 + grow * 25} ry={22} fill={shade('#8a7a70', 0.1 + heat * 0.4)} opacity={0.8} />)}
    {/* sombrero toroidal */}
    {Array.from({length: 9}).map((_, i) => { const a = (i / 9) * Math.PI * 2 + roll * 0.3; const px = Math.cos(a) * capR * 0.75, py = Math.sin(a) * capR * 0.25;
      return <circle key={i} cx={px} cy={capY + py} r={capR * 0.42} fill={i % 2 ? capCol : shade(capCol.length === 7 ? capCol : '#8a7a70', -0.12)} />; })}
    <ellipse cx={0} cy={capY - capR * 0.1} rx={capR * 0.9} ry={capR * 0.45} fill={capCol} />
    <ellipse cx={0} cy={capY + capR * 0.15} rx={capR * 0.7} ry={capR * 0.18} fill={shade('#8a7a70', -0.2 + heat * 0.5)} opacity={0.6} />
    {heat > 0 && <ellipse cx={0} cy={capY} rx={capR * 0.5} ry={capR * 0.3} fill="#fff6d8" opacity={heat * 0.8} />}
    {/* anillo de condensación */}
    {f > 30 && f < 120 && <ellipse cx={0} cy={capY * 0.55} rx={capR * 1.3} ry={capR * 0.16} fill="none" stroke="#f4f4f4" strokeWidth={14} opacity={0.6 * (1 - (f - 30) / 90)} />}
    {/* polvo en la base */}
    {Array.from({length: 10}).map((_, i) => { const r = 60 + grow * (300 + rand(i, 2) * 200); const a = (i / 10) * Math.PI; return <circle key={'b' + i} cx={Math.cos(a) * r} cy={-Math.sin(a) * 30 * grow} r={50 + grow * 60} fill="#8a7a6a" opacity={0.7 * grow} />; })}
  </g>;
};
/** anillo de onda expansiva sobre el suelo (vista lateral) */
export const Shockwave: React.FC<{x: number; y: number; at: number; s?: number}> = ({x, y, at, s = 1}) => {
  const f = useCurrentFrame() - at; if (f < 0 || f > 60) return null; const k = f / 60;
  return <g transform={`translate(${x},${y}) scale(${s})`}><ellipse rx={100 + k * 1400} ry={30 + k * 300} fill="none" stroke="#fff" strokeWidth={30 * (1 - k)} opacity={1 - k} />
    <ellipse rx={80 + k * 1300} ry={20 + k * 250} fill="#d8c8a8" opacity={0.25 * (1 - k)} /></g>;
};

// ---------------- fauna (vista lateral, patas animadas) ----------------
const legs = (f: number, xs: number[], top: number, len: number, w: number, col: string, speed = 1, walking = true) =>
  xs.map((lx, i) => { const sw = walking ? Math.sin(f / (6 / speed) + i * Math.PI * 0.5 + (i % 2) * Math.PI) * 14 : 0;
    return <path key={i} d={`M${lx},${top} L${lx + sw},${top + len}`} stroke={col} strokeWidth={w} strokeLinecap="round" />; });
export const Mammoth: React.FC<{x: number; y: number; s?: number; facing?: number; walking?: boolean}> = ({x, y, s = 1, facing = 1, walking = true}) => {
  const f = useCurrentFrame(); const bob = walking ? Math.abs(Math.sin(f / 6)) * -4 : 0; const fur = '#7a4e2e', furD = '#5a3820';
  return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s})`} strokeLinejoin="round">
    <g>{legs(f, [-110, -60, 60, 110], -140, 140, 56, O, 0.7, walking)}</g>
    <g>{legs(f, [-110, -60, 60, 110], -140, 136, 44, furD, 0.7, walking)}</g>
    <path d="M-190,-120 Q-200,-300 -40,-320 Q60,-360 140,-290 Q200,-230 180,-130 Q100,-100 0,-110 Q-120,-90 -190,-120Z" fill={fur} stroke={O} strokeWidth={8} />
    {Array.from({length: 10}).map((_, i) => <path key={i} d={`M${-170 + i * 34},-130 l-6,40`} stroke={furD} strokeWidth={8} strokeLinecap="round" />)}
    <path d="M150,-290 Q240,-300 250,-200 Q255,-130 230,-80 Q220,-30 250,10" fill="none" stroke={O} strokeWidth={42} strokeLinecap="round" />
    <path d="M150,-290 Q240,-300 250,-200 Q255,-130 230,-80 Q220,-30 250,10" fill="none" stroke={fur} strokeWidth={30} strokeLinecap="round" transform={`rotate(${Math.sin(f / 15) * 3},250,-200)`} />
    <path d="M215,-140 Q300,-110 300,-200" fill="none" stroke={O} strokeWidth={22} strokeLinecap="round" /><path d="M215,-140 Q300,-110 300,-200" fill="none" stroke="#f2ead6" strokeWidth={14} strokeLinecap="round" />
    <circle cx={200} cy={-240} r={8} fill={O} /><path d="M120,-300 Q150,-250 130,-210" fill={furD} stroke={O} strokeWidth={5} />
  </g>;
};
export const Sloth: React.FC<{x: number; y: number; s?: number; facing?: number}> = ({x, y, s = 1, facing = 1}) => {
  const f = useCurrentFrame(); const sway = Math.sin(f / 20) * 3; const col = '#8a6a48';
  return <g transform={`translate(${x},${y}) scale(${s * facing},${s}) rotate(${sway},0,0)`} stroke={O} strokeWidth={7} strokeLinejoin="round">
    <path d="M-80,0 L-60,-60 L60,-60 L80,0Z" fill={shade(col, -0.2)} />
    <ellipse cx={0} cy={-200} rx={110} ry={170} fill={col} />
    <ellipse cx={30} cy={-380} rx={60} ry={50} fill={col} /><ellipse cx={70} cy={-370} rx={30} ry={22} fill={shade(col, 0.15)} /><circle cx={50} cy={-395} r={7} fill={O} />
    <path d={`M60,-270 Q170,${-330 + sway * 4} 180,-420`} fill="none" strokeWidth={36} strokeLinecap="round" stroke={O} /><path d={`M60,-270 Q170,${-330 + sway * 4} 180,-420`} fill="none" strokeWidth={24} strokeLinecap="round" stroke={col} />
    <path d="M170,-430 l10,-30 M182,-428 l16,-24 M192,-420 l22,-14" stroke="#efe6d4" strokeWidth={6} strokeLinecap="round" />
  </g>;
};
export const Wolf: React.FC<{x: number; y: number; s?: number; facing?: number; walking?: boolean; color?: string; dog?: boolean}> = ({x, y, s = 1, facing = 1, walking = true, color = '#7a7a80', dog}) => {
  const f = useCurrentFrame(); const tail = Math.sin(f / (dog ? 2 : 8)) * (dog ? 20 : 8);
  return <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} strokeLinejoin="round">
    <g>{legs(f, [-60, -30, 40, 70], -70, 70, 22, O, 1.3, walking)}</g>
    <g>{legs(f, [-60, -30, 40, 70], -70, 66, 12, shade(color, -0.15), 1.3, walking)}</g>
    <path d={`M-80,-90 Q-130,${-120 + tail} -150,${-80 + tail}`} fill="none" stroke={O} strokeWidth={22} strokeLinecap="round" /><path d={`M-80,-90 Q-130,${-120 + tail} -150,${-80 + tail}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
    <path d="M-90,-80 Q-90,-120 0,-120 Q70,-125 90,-100 L90,-70 Q0,-55 -90,-80Z" fill={color} stroke={O} strokeWidth={6} />
    <path d="M70,-110 Q90,-160 120,-150 Q160,-140 170,-115 L130,-100 Q100,-90 80,-95Z" fill={color} stroke={O} strokeWidth={6} />
    <path d={dog ? 'M95,-150 Q85,-120 100,-120' : 'M95,-150 L100,-185 L115,-152Z'} fill={shade(color, -0.2)} stroke={O} strokeWidth={5} />
    <circle cx={128} cy={-135} r={5} fill={O} /><circle cx={170} cy={-118} r={6} fill={O} />
    {dog && <path d="M150,-108 Q156,-90 166,-100" fill="#e86a7a" stroke={O} strokeWidth={3} />}
  </g>;
};
export const Deer: React.FC<{x: number; y: number; s?: number; facing?: number; walking?: boolean; cow?: boolean}> = ({x, y, s = 1, facing = 1, walking = false, cow}) => {
  const f = useCurrentFrame(); const col = cow ? '#f4f0e8' : '#a0703e'; const graze = walking ? 0 : Math.max(0, Math.sin(f / 30)) * 30;
  return <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} strokeLinejoin="round">
    <g>{legs(f, [-55, -30, 40, 60], -90, 90, 20, O, 0.8, walking)}</g>
    <g>{legs(f, [-55, -30, 40, 60], -90, 86, 10, shade(col, -0.2), 0.8, walking)}</g>
    <ellipse cx={0} cy={-115} rx={cow ? 100 : 85} ry={cow ? 50 : 38} fill={col} stroke={O} strokeWidth={6} />
    {cow && [[-40, -120], [20, -100], [50, -130]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx={22} ry={16} fill="#2a2a2a" />)}
    <g transform={`rotate(${graze},70,-130)`}>
      <path d="M60,-140 L90,-200" stroke={O} strokeWidth={30} strokeLinecap="round" /><path d="M60,-140 L90,-200" stroke={col} strokeWidth={20} strokeLinecap="round" />
      <ellipse cx={108} cy={-205} rx={34} ry={20} fill={col} stroke={O} strokeWidth={5} /><circle cx={110} cy={-212} r={4} fill={O} />
      {!cow && <path d="M88,-222 L80,-280 M80,-260 L60,-280 M84,-245 L100,-270 M98,-222 L104,-272 M103,-252 L120,-268" stroke="#6a4a2a" strokeWidth={6} strokeLinecap="round" />}
      {cow && <path d="M86,-222 q-14,-10 -20,-2 M108,-224 q10,-14 20,-8" stroke="#ddd" strokeWidth={7} fill="none" strokeLinecap="round" />}
    </g>
  </g>;
};
export const Birds: React.FC<{n?: number; y?: number; speed?: number; color?: string; seed?: number}> = ({n = 8, y = 500, speed = 4, color = '#2a2a33', seed = 1}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}).map((_, i) => { const x = ((f * speed + rand(i, seed) * 1500) % 1500) - 200; const yy = y + rand(i, seed + 1) * 300 + Math.sin(f / 10 + i) * 10; const wing = Math.sin(f / 3 + i) * 12;
    return <path key={i} d={`M${x - 24},${yy + wing} Q${x - 10},${yy - 6} ${x},${yy} Q${x + 10},${yy - 6} ${x + 24},${yy + wing}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />; })}</g>;
};
export const Field: React.FC<{y: number; color?: string; rows?: number; wheat?: boolean}> = ({y, color = '#d8b44a', rows = 10, wheat = true}) => {
  const f = useCurrentFrame();
  return <g><rect x={-800} y={y} width={2680} height={1600} fill={color} />{Array.from({length: rows}).map((_, r) => <g key={r}>{Array.from({length: 26}).map((_, c) => {
    const x = -200 + c * 60 + (r % 2) * 30, yy = y + 20 + r * 50; const sw = Math.sin(f / 15 + c * 0.4 + r) * 4;
    return wheat ? <path key={c} d={`M${x},${yy + 30} Q${x + sw},${yy} ${x + sw * 2},${yy - 20}`} stroke={shade(color, -0.25)} strokeWidth={4} fill="none" /> : <circle key={c} cx={x} cy={yy} r={10} fill={shade(color, -0.2)} />; })}</g>)}</g>;
};
export const Bunker: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={6} strokeLinejoin="round">
    <path d="M-300,0 Q-300,-260 0,-260 Q300,-260 300,0Z" fill="#7a7d80" /><path d="M-90,0 L-90,-150 Q0,-200 90,-150 L90,0Z" fill="#2a2c30" />
    <path d="M-200,-120 L-170,-150 M170,-150 L200,-120" strokeWidth={8} /><rect x={-40} y={-240} width={80} height={36} rx={6} fill="#f2c94c" />
    <path d="M0,-234 l12,22 h-24Z" fill="#2a2a2a" strokeWidth={2} />
  </g>
);
