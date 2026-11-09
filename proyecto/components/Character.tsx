// Rig de personaje 2D: cabeza grande, extremidades articuladas (cinemática directa), expresiones,
// parpadeo, habla, respiración, caminar y gestos. Todo dibujado en SVG con contorno de tinta y sombreado cel.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, clamp, lerp, noise1} from './core';

export type Expr = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'determined' | 'smug' | 'worried' | 'shout';
export type PoseName = keyof typeof POSES;

export interface Design {
  name: string;
  skin: string;
  build?: 'slim' | 'normal' | 'stout' | 'big';
  face?: 'oval' | 'round' | 'long' | 'square' | 'jaw';
  nose?: 'small' | 'big' | 'hook' | 'round' | 'long';
  hair?: {style: string; color: string};
  facial?: {style: string; color: string};
  brows?: string;
  hat?: {style: string; color: string; accent?: string; accent2?: string};
  outfit: {
    type: 'military' | 'suit' | 'tunic' | 'combat' | 'court' | 'smock' | 'cleanroom' | 'dhoti' | 'greatcoat' | 'robe';
    coat: string; accent?: string; shirt?: string; pants: string; boots?: string; tie?: string;
    epaulettes?: string; sash?: string; medals?: number; tails?: boolean; collar?: string; buttons?: string; belt?: string;
    vest?: string; cape?: string; glove?: string; embroidery?: string; armband?: string; bowtie?: boolean;
  };
  extras?: {glasses?: 'round' | 'pince' | 'square'; birthmark?: boolean; cigar?: boolean; pipe?: boolean; eyepatch?: boolean;
    wrinkles?: boolean; blush?: boolean; mask?: boolean; earring?: boolean; heavyBrow?: boolean; mole?: boolean};
  prop?: string; // 'sword' | 'flag' | 'umbrella' | 'paper' | 'brush' | 'telescope' | 'rifle' | 'microphone' | 'chip' | 'pointer'
  propColor?: string;
  hideHandR?: boolean;
}

// ángulos: [hombro, codo] por brazo (positivo = hacia fuera/arriba; codo positivo = flexión hacia dentro)
export const POSES = {
  idle: {l: [8, 8], r: [8, 8]},
  relaxed: {l: [5, 20], r: [5, 20]},
  point: {l: [8, 8], r: [100, -5]},
  pointUp: {l: [8, 8], r: [155, 0]},
  pointL: {l: [100, -5], r: [8, 8]},
  fist: {l: [8, 8], r: [150, 25]},
  victory: {l: [145, 15], r: [145, 15]},
  handInCoat: {l: [6, 10], r: [-8, 118]},
  behind: {l: [-4, -10], r: [-4, -10]},
  crossArms: {l: [-6, 112], r: [-6, 112]},
  think: {l: [-6, 105], r: [-10, 150]},
  talkA: {l: [30, 60], r: [45, 70]},
  talkB: {l: [20, 45], r: [65, 55]},
  open: {l: [55, 30], r: [55, 30]},
  shrug: {l: [55, 110], r: [55, 110]},
  salute: {l: [8, 8], r: [85, 150]},
  despair: {l: [150, 150], r: [150, 150]},
  holdUp: {l: [8, 8], r: [125, 40]},
  holdFront: {l: [40, 80], r: [40, 80]},
  present: {l: [8, 8], r: [60, 40]},
  paint: {l: [20, 70], r: [80, 40]},
  wave: {l: [8, 8], r: [130, -25]},
  stop: {l: [8, 8], r: [80, 90]},
  march: {l: [10, 10], r: [10, 10]},
  rifle: {l: [30, 110], r: [15, 120]},
  hip: {l: [35, 125], r: [35, 125]},
};

const ALONG = ['sword', 'saber', 'pointer', 'brush'];
const BUILD = {slim: 50, normal: 58, stout: 66, big: 72};
const O = C.ink; // contorno
const SW = 6; // grosor contorno

const shade = (hex: string, k: number) => {
  // oscurece (k<0) o aclara (k>0) un color hex
  if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c: number) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  r = f(r); g = f(g); b = f(b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
export {shade};

const rot = (a: number, L: number, side: number) => {
  const r = (a * Math.PI) / 180; return [side * Math.sin(r) * L, Math.cos(r) * L];
};

export interface CharProps {
  d: Design; x?: number; y?: number; scale?: number; facing?: 1 | -1;
  pose?: PoseName; pose2?: PoseName; mix?: number; // mezcla entre poses (0..1)
  expr?: Expr; talking?: boolean; walking?: boolean; walkSpeed?: number; look?: number; headTilt?: number;
  lean?: number; seed?: number; opacity?: number; shadow?: boolean; gestureWobble?: number; jump?: number;
  propOverride?: string; tint?: string; tintAmt?: number;
}

export const Character: React.FC<CharProps> = (p) => {
  const frame = useCurrentFrame();
  const cid = 'c' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const {d} = p; const seed = p.seed ?? d.name.length;
  const f = frame + seed * 17;
  const sw = BUILD[d.build ?? 'normal'];
  const o = d.outfit;
  // --- animación base
  const breath = Math.sin(f / 22) * 0.012;
  const walkPh = (f * (p.walkSpeed ?? 1)) / 4.2;
  const walking = !!p.walking;
  const bob = walking ? -Math.abs(Math.sin(walkPh)) * 10 : 0;
  const jump = p.jump ?? 0;
  const blink = (() => { const c = (f + seed * 31) % 97; return c < 4 ? [1, 0.4, 0.1, 0.5][c] : 1; })();
  const talkOpen = p.talking ? clamp(0.25 + 0.75 * Math.abs(noise1(f / 2.6, seed)) + 0.25 * Math.sin(f * 1.3), 0, 1) : 0;
  const tilt = (p.headTilt ?? 0) + Math.sin(f / 37) * 1.5 + (p.talking ? noise1(f / 9, seed + 3) * 3 : 0);
  const look = p.look ?? 0.25;
  // --- poses
  const A = POSES[p.pose ?? 'idle']; const B = POSES[p.pose2 ?? p.pose ?? 'idle']; const m = p.mix ?? 0;
  const wob = p.gestureWobble ?? (p.talking ? 1 : 0.4);
  const arm = (side: 'l' | 'r', k: 0 | 1) => lerp(A[side][k], B[side][k], m) + noise1(f / 14, seed + (side === 'l' ? 1 : 2) + k) * 5 * wob;
  let lS = arm('l', 0), lE = arm('l', 1), rS = arm('r', 0), rE = arm('r', 1);
  if (walking && (p.pose ?? 'idle') === 'idle') { lS = 10 + Math.sin(walkPh) * 14; rS = 10 - Math.sin(walkPh) * 14; lE = 15; rE = 15; }
  const shY = -340, hipY = -178, headY = -445;
  const shX = sw + 2;
  const L1 = 84, L2 = 78;
  const armPts = (side: number, s: number, e: number) => {
    const sx = side * shX, sy = shY + 12;
    const [ex, ey] = rot(s, L1, side); const [wx, wy] = rot(s - e, L2, side);
    return {sx, sy, ex: sx + ex, ey: sy + ey, wx: sx + ex + wx, wy: sy + ey + wy, ang: s - e};
  };
  const aL = armPts(-1, lS, lE), aR = armPts(1, rS, rE);
  // --- piernas
  const legPts = (side: number) => {
    const lift = walking ? Math.max(0, Math.sin(walkPh + (side > 0 ? Math.PI : 0))) : 0;
    const hx = side * 26, hy = hipY;
    const kx = hx + side * 4, ky = hy + 88 * (1 - 0.32 * lift);
    const ax = kx + side * 2, ay = ky + 84 * (1 - 0.45 * lift);
    return {hx, hy, kx, ky, ax, ay, lift};
  };
  const lgL = legPts(-1), lgR = legPts(1);
  const coat = o.coat, coatD = shade(coat, -0.25), pants = o.pants;
  const longCoat = o.type === 'greatcoat' || o.type === 'court' || o.type === 'robe' || o.type === 'cleanroom';
  const sleeve = o.type === 'dhoti' ? d.skin : o.type === 'smock' ? coat : coat;
  const limbW = 34, legW = o.type === 'dhoti' ? 44 : 38;

  // --- piezas
  const Limb = ({pts, w, col, cuff}: {pts: number[][]; w: number; col: string; cuff?: string}) => {
    const dd = 'M' + pts.map((q) => q.join(',')).join(' L');
    return (
      <g>
        <path d={dd} stroke={O} strokeWidth={w + SW * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={dd} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {cuff && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={w / 2 - 1} fill={cuff} />}
      </g>
    );
  };
  const Hand = ({x, y, ang, side, prop}: {x: number; y: number; ang: number; side: number; prop?: string}) => {
    const col = o.glove ?? d.skin;
    return (
      <g transform={`translate(${x},${y})`}>
        {prop && <g transform={ALONG.includes(prop) ? `rotate(${-side * ang})` : ''}><Prop kind={prop} color={d.propColor} side={side} f={f} /></g>}
        <circle r={19} fill={col} stroke={O} strokeWidth={SW - 1} />
        <ellipse cx={side * 12} cy={-6} rx={8} ry={10} fill={col} stroke={O} strokeWidth={SW - 2} />
      </g>
    );
  };
  const Boot = ({x, y, side, lift}: {x: number; y: number; side: number; lift: number}) => {
    const b = o.boots ?? '#2a2228';
    if (o.type === 'dhoti') return <ellipse cx={x + side * 4} cy={y + 4} rx={22} ry={10} fill={d.skin} stroke={O} strokeWidth={SW - 1} />;
    return (
      <g transform={`translate(${x},${y}) rotate(${side * -lift * 10})`}>
        <path d={`M${-22},-8 Q${-24},12 ${-14},14 L${side > 0 ? 34 : 14},14 Q${side > 0 ? 38 : 18},2 ${side > 0 ? 20 : 4},-6 Q0,-16 ${-22},-8Z`}
          transform={side < 0 ? 'scale(-1,1)' : ''} fill={b} stroke={O} strokeWidth={SW - 1} strokeLinejoin="round" />
      </g>
    );
  };

  const torsoPath = (() => {
    const w = sw, hw = sw - 6, belly = d.build === 'stout' || d.build === 'big' ? 14 : 0;
    const bottom = longCoat ? -60 : o.type === 'smock' ? -120 : hipY + 8;
    const bw = longCoat ? hw + 22 : hw;
    return `M${-w},${shY} Q${-w - 8 - belly},${(shY + bottom) / 2} ${-bw},${bottom} L${bw},${bottom} Q${w + 8 + belly},${(shY + bottom) / 2} ${w},${shY} Q0,${shY - 18} ${-w},${shY}Z`;
  })();

  const Torso = () => {
    const buttons = o.buttons ?? C.gold;
    const els: React.ReactNode[] = [];
    if (o.type === 'dhoti') {
      // torso desnudo con chal (Gandhi)
      els.push(<path key="b" d={torsoPath} fill={d.skin} stroke={O} strokeWidth={SW} />);
      els.push(<path key="dh" d={`M${-sw + 4},${hipY - 20} L${sw - 4},${hipY - 20} L${sw + 6},${hipY + 30} L${-sw - 6},${hipY + 30}Z`} fill={coat} stroke={O} strokeWidth={SW - 1} />);
      els.push(<path key="sh" d={`M${-sw - 4},${shY - 4} Q${-sw + 10},${shY + 60} ${10},${hipY - 10} L${sw - 6},${hipY - 30} Q${-10},${shY + 70} ${-sw + 30},${shY - 8}Z`} fill={shade(coat, -0.05)} stroke={O} strokeWidth={SW - 1} />);
      return <g>{els}</g>;
    }
    els.push(<path key="b" d={torsoPath} fill={coat} stroke={O} strokeWidth={SW} strokeLinejoin="round" />);
    // sombreado cel (lado derecho)
    els.push(<defs key="cd"><clipPath id={cid}><path d={torsoPath} /></clipPath></defs>);
    els.push(<path key="sh" d={`M${sw * 0.38},${shY - 30} Q${sw * 0.6},${(shY + hipY) / 2} ${sw * 0.3},40 L${sw + 80},40 L${sw + 80},${shY - 30}Z`} fill={coatD} opacity={0.5} clipPath={`url(#${cid})`} />);
    if (o.type === 'suit') {
      els.push(<path key="shirt" d={`M-22,${shY - 6} L0,${shY + 75} L22,${shY - 6}Z`} fill={o.shirt ?? '#f4f1ea'} stroke={O} strokeWidth={4} />);
      if (o.tie && o.bowtie) els.push(<path key="bow" d={`M0,${shY + 12} L-26,${shY} L-26,${shY + 26}Z M0,${shY + 12} L26,${shY} L26,${shY + 26}Z`} fill={o.tie} stroke={O} strokeWidth={3.5} strokeLinejoin="round" />);
      if (o.tie && !o.bowtie) els.push(<path key="tie" d={`M-8,${shY + 2} L8,${shY + 2} L5,${shY + 14} L12,${shY + 66} L0,${shY + 82} L-12,${shY + 66} L-5,${shY + 14}Z`} fill={o.tie} stroke={O} strokeWidth={3.5} />);
      els.push(<path key="lap" d={`M-24,${shY - 6} L-6,${shY + 80} M24,${shY - 6} L6,${shY + 80}`} stroke={O} strokeWidth={4} />);
      els.push(<circle key="bt" cx={0} cy={shY + 112} r={5} fill={O} />);
      els.push(<path key="pk" d={`M${sw - 34},${shY + 40} l22,-3`} stroke={O} strokeWidth={4} />);
    }
    if (o.type === 'military' || o.type === 'court' || o.type === 'greatcoat') {
      if (o.vest) els.push(<path key="vest" d={`M-20,${shY} L-26,${hipY + 4} L26,${hipY + 4} L20,${shY}Z`} fill={o.vest} stroke={O} strokeWidth={4} />);
      if (o.accent) els.push(
        <g key="lapels">
          <path d={`M-20,${shY - 4} L-34,${shY + 30} L-24,${shY + 120} L-16,${shY + 120}Z`} fill={o.accent} stroke={O} strokeWidth={4} />
          <path d={`M20,${shY - 4} L34,${shY + 30} L24,${shY + 120} L16,${shY + 120}Z`} fill={o.accent} stroke={O} strokeWidth={4} />
        </g>);
      for (let i = 0; i < 5; i++) {
        els.push(<circle key={'bl' + i} cx={-28} cy={shY + 22 + i * 22} r={4.5} fill={buttons} stroke={O} strokeWidth={2} />);
        els.push(<circle key={'br' + i} cx={28} cy={shY + 22 + i * 22} r={4.5} fill={buttons} stroke={O} strokeWidth={2} />);
      }
      if (o.embroidery) els.push(<path key="emb" d={`M-40,${shY + 6} q8,8 0,16 q8,8 0,16 M40,${shY + 6} q-8,8 0,16 q-8,8 0,16`} stroke={o.embroidery} strokeWidth={4} fill="none" />);
      if (o.type === 'court') els.push(<path key="jabot" d={`M-12,${shY - 4} q12,40 0,60 q12,10 12,0 q-12,-20 12,-60Z`} fill="#fbf6ea" stroke={O} strokeWidth={3} />);
    }
    if (o.type === 'tunic' || o.type === 'combat') {
      els.push(<path key="pl" d={`M0,${shY - 6} L0,${hipY}`} stroke={coatD} strokeWidth={4} />);
      for (let i = 0; i < 4; i++) els.push(<circle key={'b' + i} cx={0} cy={shY + 20 + i * 30} r={4.5} fill={o.buttons ?? coatD} stroke={O} strokeWidth={2} />);
      els.push(<rect key="p1" x={-sw + 12} y={shY + 26} width={34} height={28} rx={4} fill={shade(coat, -0.08)} stroke={O} strokeWidth={3.5} />);
      els.push(<rect key="p2" x={sw - 46} y={shY + 26} width={34} height={28} rx={4} fill={shade(coat, -0.08)} stroke={O} strokeWidth={3.5} />);
      if (o.type === 'combat') {
        els.push(<path key="vst" d={`M${-sw + 6},${shY + 70} L${sw - 6},${shY + 70} L${sw - 8},${hipY - 6} L${-sw + 8},${hipY - 6}Z`} fill={shade(coat, -0.18)} stroke={O} strokeWidth={4} />);
        for (let i = 0; i < 3; i++) els.push(<rect key={'pc' + i} x={-sw + 14 + i * 34} y={shY + 90} width={26} height={30} rx={4} fill={shade(coat, -0.28)} stroke={O} strokeWidth={3} />);
        for (let i = 0; i < 9; i++) els.push(<ellipse key={'cm' + i} cx={-sw + 10 + ((i * 37) % (sw * 2 - 20))} cy={shY + 10 + ((i * 53) % 60)} rx={10} ry={6} fill={shade(coat, i % 2 ? -0.2 : 0.12)} opacity={0.8} />);
      }
    }
    if (o.type === 'smock') {
      els.push(<path key="col" d={`M-26,${shY - 4} Q0,${shY + 26} 26,${shY - 4}`} stroke={O} strokeWidth={4} fill={o.shirt ?? '#ddd'} />);
      ['#c0392b', '#2e86de', '#f1c40f', '#27ae60'].forEach((c, i) => els.push(<circle key={'pd' + i} cx={-30 + i * 22} cy={shY + 90 + (i % 2) * 30} r={6 + (i % 2) * 3} fill={c} opacity={0.85} />));
    }
    if (o.type === 'cleanroom') {
      els.push(<path key="zip" d={`M0,${shY} L0,${hipY + 20}`} stroke="#b9c2cc" strokeWidth={4} />);
      els.push(<rect key="badge" x={sw - 48} y={shY + 30} width={30} height={20} rx={3} fill="#4aa3df" stroke={O} strokeWidth={3} />);
    }
    if (o.type === 'robe') {
      els.push(<path key="rb" d={`M0,${shY} L0,-62`} stroke={shade(coat, -0.3)} strokeWidth={4} />);
    }
    if (o.belt) els.push(<rect key="belt" x={-sw + 2} y={hipY - 30} width={sw * 2 - 4} height={18} fill={o.belt} stroke={O} strokeWidth={4} />,
      <rect key="bk" x={-12} y={hipY - 32} width={24} height={22} rx={3} fill={C.gold} stroke={O} strokeWidth={3} />);
    if (o.sash) els.push(<path key="sash" d={`M${-sw + 6},${shY + 6} L${sw - 4},${hipY - 34} L${sw - 6},${hipY - 8} L${-sw + 4},${shY + 36}Z`} fill={o.sash} stroke={O} strokeWidth={4} />);
    if (o.medals) for (let i = 0; i < o.medals; i++) els.push(
      <g key={'md' + i} transform={`translate(${-sw + 24 + (i % 3) * 16},${shY + 50 + Math.floor(i / 3) * 24})`}>
        <rect x={-6} y={-10} width={12} height={10} fill={['#d7263d', '#2e86de', '#f1c40f'][i % 3]} stroke={O} strokeWidth={2} />
        <circle cy={6} r={7} fill={C.gold} stroke={O} strokeWidth={2} />
      </g>);
    if (o.armband) els.push(<rect key="ab" x={-sw - 18} y={shY + 50} width={0} height={0} fill={o.armband} />);
    // cuello
    if (o.collar) els.push(<path key="collar" d={`M-30,${shY - 10} L-26,${shY + 14} L26,${shY + 14} L30,${shY - 10} Q0,${shY - 22} -30,${shY - 10}Z`} fill={o.collar} stroke={O} strokeWidth={4} />);
    return <g>{els}</g>;
  };

  const Epaulettes = () => o.epaulettes ? (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * (shX - 2)},${shY + 2})`}>
          <ellipse rx={26} ry={11} fill={o.epaulettes} stroke={O} strokeWidth={4} />
          {[-18, -9, 0, 9, 18].map((x) => <line key={x} x1={x} y1={8} x2={x * 1.1} y2={26} stroke={o.epaulettes} strokeWidth={5} strokeLinecap="round" />)}
        </g>))}
    </g>) : null;

  const Tails = () => (o.tails || o.cape) ? (
    <g>
      {o.cape && <path d={`M${-sw - 6},${shY} Q${-sw - 50},${-140} ${-sw - 30},-30 L${sw + 30},-30 Q${sw + 50},-140 ${sw + 6},${shY}Z`} fill={o.cape} stroke={O} strokeWidth={SW} />}
      {o.tails && <path d={`M${-sw + 6},${hipY - 10} L${-sw - 6},-70 L-8,-90 L0,${hipY} L8,-90 L${sw + 6},-70 L${sw - 6},${hipY - 10}Z`} fill={coatD} stroke={O} strokeWidth={SW - 1} strokeLinejoin="round" />}
    </g>) : null;

  const Head = () => <HeadGfx d={d} expr={p.expr ?? 'neutral'} blink={blink} talk={talkOpen} look={look} f={f} />;

  const behindArms = (p.pose ?? 'idle') === 'behind';
  const armL = <g key="aL"><Limb pts={[[aL.sx, aL.sy], [aL.ex, aL.ey], [aL.wx, aL.wy]]} w={limbW} col={sleeve} cuff={o.accent && o.type === 'military' ? o.accent : undefined} />
    {!behindArms && <Hand x={aL.wx} y={aL.wy} ang={aL.ang} side={-1} />}</g>;
  const propR = p.propOverride ?? d.prop;
  const armR = <g key="aR"><Limb pts={[[aR.sx, aR.sy], [aR.ex, aR.ey], [aR.wx, aR.wy]]} w={limbW} col={sleeve} cuff={o.accent && o.type === 'military' ? o.accent : undefined} />
    {!behindArms && !(d.hideHandR && (p.pose === 'handInCoat')) && <Hand x={aR.wx} y={aR.wy} ang={aR.ang} side={1} prop={propR && propR !== 'none' ? propR : undefined} />}
    {d.hideHandR && p.pose === 'handInCoat' && <path d={`M${aR.wx - 26},${aR.wy - 22} L${aR.wx + 4},${aR.wy - 26} L${aR.wx + 2},${aR.wy + 20} L${aR.wx - 24},${aR.wy + 16}Z`} fill={shade(coat, -0.1)} stroke={O} strokeWidth={4} />}
  </g>;
  const legCol = o.type === 'dhoti' ? coat : o.type === 'cleanroom' ? coat : pants;
  const bootsTall = o.boots && o.type === 'military';
  const leg = (lg: ReturnType<typeof legPts>, side: number) => (
    <g key={'lg' + side}>
      <Limb pts={[[lg.hx, lg.hy], [lg.kx, lg.ky], [lg.ax, lg.ay - 10]]} w={legW} col={legCol} />
      {bootsTall && <Limb pts={[[lg.kx, lg.ky - 6], [lg.ax, lg.ay - 10]]} w={legW + 4} col={o.boots!} />}
      <Boot x={lg.ax} y={lg.ay - 8} side={side} lift={lg.lift} />
    </g>);

  const lean = p.lean ?? 0;
  return (
    <g transform={`translate(${p.x ?? 0},${(p.y ?? 0) - jump}) scale(${(p.scale ?? 1) * (p.facing ?? 1)},${p.scale ?? 1})`} opacity={p.opacity ?? 1}>
      {p.shadow !== false && <ellipse cx={0} cy={4} rx={sw + 40 - jump * 0.1} ry={16} fill="rgba(10,5,25,0.35)" />}
      <g transform={`translate(0,${bob}) rotate(${lean},0,0)`}>
        <Tails />
        {behindArms && armL}{behindArms && armR}
        {leg(lgL, -1)}{leg(lgR, 1)}
        <g transform={`translate(0,${shY}) scale(1,${1 + breath}) translate(0,${-shY})`}>
          <Torso />
          <Epaulettes />
        </g>
        {/* cuello */}
        <rect x={-17} y={shY - 34} width={34} height={36} fill={shade(d.skin, -0.12)} stroke={O} strokeWidth={SW - 1} />
        {o.collar && o.type !== 'suit' && <path d={`M-30,${shY - 10} L-26,${shY + 12} L26,${shY + 12} L30,${shY - 10} Q0,${shY - 24} -30,${shY - 10}Z`} fill={o.collar} stroke={O} strokeWidth={4} />}
        <g transform={`translate(0,${headY + 12 + breath * 200}) rotate(${tilt},0,85) scale(0.9)`}><Head /></g>
        {!behindArms && armL}{!behindArms && armR}
        {p.tint && <path d={torsoPath} fill={p.tint} opacity={p.tintAmt ?? 0.3} />}
      </g>
    </g>
  );
};

// ---------- Cabeza ----------
const HeadGfx: React.FC<{d: Design; expr: Expr; blink: number; talk: number; look: number; f: number}> = ({d, expr, blink, talk, look, f}) => {
  const fs = d.face ?? 'oval';
  const rx = fs === 'round' ? 76 : fs === 'long' ? 64 : fs === 'square' ? 74 : fs === 'jaw' ? 70 : 70;
  const ry = fs === 'long' ? 90 : fs === 'round' ? 78 : 82;
  const skin = d.skin, skinD = shade(skin, -0.18);
  const lx = look * 12; // desplazamiento 3/4
  const hair = d.hair, hc = hair?.color ?? '#3b2a20';
  const facePath = fs === 'jaw'
    ? `M${-rx},-10 C${-rx},-70 ${-rx * 0.6},-${ry} 0,-${ry} C${rx * 0.6},-${ry} ${rx},-70 ${rx},-10 C${rx},40 ${rx * 0.75},${ry + 22} 0,${ry + 26} C${-rx * 0.75},${ry + 22} ${-rx},40 ${-rx},-10Z`
    : fs === 'square'
      ? `M${-rx},-20 C${-rx},-70 ${-rx * 0.6},-${ry} 0,-${ry} C${rx * 0.6},-${ry} ${rx},-70 ${rx},-20 L${rx - 4},30 C${rx - 8},${ry} ${rx * 0.4},${ry} 0,${ry} C${-rx * 0.4},${ry} ${-rx + 8},${ry} ${-rx + 4},30Z`
      : null;
  // expresión
  const E = {
    neutral: {bL: 0, bR: 0, bY: 0, m: 2, eye: 1},
    happy: {bL: -6, bR: -6, bY: -6, m: 14, eye: 0.85},
    angry: {bL: 18, bR: 18, bY: 6, m: -10, eye: 0.9},
    sad: {bL: -16, bR: -16, bY: -2, m: -12, eye: 0.9},
    surprised: {bL: -8, bR: -8, bY: -14, m: 0, eye: 1.25},
    determined: {bL: 10, bR: 10, bY: 3, m: -2, eye: 0.95},
    smug: {bL: 8, bR: -10, bY: -2, m: 8, eye: 0.8},
    worried: {bL: -14, bR: -14, bY: -6, m: -6, eye: 1.05},
    shout: {bL: 16, bR: 16, bY: 2, m: 0, eye: 1},
  }[expr];
  const eyeY = -8, eyeX = 27, browY = -40 + E.bY;
  const open = expr === 'surprised' ? 0.7 : expr === 'shout' ? 1 : talk;
  const browCol = d.brows ?? hc;
  const ears = <g>
    <ellipse cx={-rx + 2 + lx * 0.5} cy={4} rx={13} ry={20} fill={skin} stroke={O} strokeWidth={SW - 1} />
    <ellipse cx={rx - 2 + lx * 0.5} cy={4} rx={13} ry={20} fill={skin} stroke={O} strokeWidth={SW - 1} />
  </g>;
  return (
    <g>
      <HairBack d={d} rx={rx} ry={ry} />
      {!['hood'].includes(d.hat?.style ?? '') && ears}
      {facePath ? <path d={facePath} fill={skin} stroke={O} strokeWidth={SW} /> : <ellipse rx={rx} ry={ry} fill={skin} stroke={O} strokeWidth={SW} />}
      {/* sombra cel lateral */}
      {facePath ? <path d={`M${rx * 0.45},${-ry} C${rx * 1.05},${-ry * 0.5} ${rx * 1.05},${ry * 0.6} ${rx * 0.2},${ry + 20} C${rx * 0.85},${ry * 0.4} ${rx * 0.9},${-ry * 0.4} ${rx * 0.45},${-ry}Z`} fill={skinD} opacity={0.35} /> :
        <path d={`M${rx * 0.35},${-ry * 0.95} C${rx * 1.1},${-ry * 0.6} ${rx * 1.1},${ry * 0.6} ${rx * 0.35},${ry * 0.95} C${rx * 0.85},${ry * 0.4} ${rx * 0.85},${-ry * 0.4} ${rx * 0.35},${-ry * 0.95}Z`} fill={skinD} opacity={0.35} />}
      {d.extras?.heavyBrow && <path d={`M${-rx * 0.8},-30 Q0,-58 ${rx * 0.8},-30 Q0,-40 ${-rx * 0.8},-30Z`} fill={shade(skin, -0.2)} stroke={O} strokeWidth={4} />}
      {d.extras?.mole && <circle cx={-34 + lx} cy={30} r={4} fill="#5a3a2a" />}
      {d.extras?.birthmark && <path d="M-6,-78 c14,-6 30,-2 34,8 c6,10 -4,14 2,22 c-8,6 -22,2 -26,-6 c-10,4 -18,-4 -14,-12 c-8,-4 -4,-10 4,-12z" fill="#b5475c" opacity={0.75} />}
      {d.extras?.blush !== false && <><ellipse cx={-40 + lx} cy={26} rx={13} ry={7} fill="#e8707a" opacity={0.25} /><ellipse cx={40 + lx} cy={26} rx={13} ry={7} fill="#e8707a" opacity={0.25} /></>}
      {d.extras?.wrinkles && <path d={`M${-50 + lx},${8} q8,6 4,14 M${50 + lx},8 q-8,6 -4,14 M${-20 + lx},-58 q20,-6 40,0`} stroke={shade(skin, -0.35)} strokeWidth={3} fill="none" />}
      {/* ojos */}
      {[-1, 1].map((s) => {
        const ex = s * eyeX + lx, ey = eyeY; const sc = E.eye;
        if (d.extras?.eyepatch && s === 1) return <g key={s}><ellipse cx={ex} cy={ey} rx={17} ry={15} fill="#1a1a1a" stroke={O} strokeWidth={3} /><path d={`M${-rx},-40 L${ex},${ey} L${rx},-30`} stroke="#1a1a1a" strokeWidth={4} fill="none" /></g>;
        return (
          <g key={s}>
            <ellipse cx={ex} cy={ey} rx={13 * sc} ry={16 * sc * blink} fill="#fff" stroke={O} strokeWidth={4} />
            {blink > 0.3 && <><circle cx={ex + lx * 0.35} cy={ey + 2} r={7.5 * sc * Math.min(1, blink * 1.2)} fill="#20161a" />
              <circle cx={ex + lx * 0.35 + 3} cy={ey - 2} r={2.6} fill="#fff" /></>}
          </g>);
      })}
      {/* cejas */}
      {[-1, 1].map((s) => (
        <path key={'b' + s} d={`M${s * 12 + lx},${browY} L${s * 44 + lx},${browY - 2}`}
          transform={`rotate(${s * (s < 0 ? E.bL : E.bR) * -1},${s * 28 + lx},${browY})`}
          stroke={browCol} strokeWidth={9} strokeLinecap="round" />))}
      {/* nariz */}
      <Nose kind={d.nose ?? 'small'} lx={lx} skin={skin} />
      {/* boca */}
      {!d.extras?.mask && (open > 0.08 ? (
        <g transform={`translate(${lx * 0.8},${42})`}>
          <path d={`M-18,0 Q0,${-4 + E.m * 0.2} 18,0 Q${12},${10 + 26 * open} 0,${12 + 26 * open} Q-12,${10 + 26 * open} -18,0Z`} fill="#5a1e24" stroke={O} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M-9,${8 + 20 * open} Q0,${2 + 14 * open} 9,${8 + 20 * open}`} fill="#d9606a" />
        </g>) : (
        <path d={`M${-16 + lx * 0.8},${44 - E.m * 0.3} Q${lx * 0.8},${44 + E.m} ${16 + lx * 0.8},${44 - E.m * 0.3}`} stroke={O} strokeWidth={5} fill="none" strokeLinecap="round" />))}
      {d.extras?.mask && <path d={`M-44,14 Q0,4 44,14 L40,56 Q0,74 -40,56Z`} fill="#e7eef5" stroke={O} strokeWidth={4} />}
      <FacialHair d={d} lx={lx} talk={open} />
      <HairFront d={d} rx={rx} ry={ry} lx={lx} f={f} />
      {d.extras?.glasses && <Glasses kind={d.extras.glasses} lx={lx} />}
      {d.extras?.cigar && <g transform={`translate(${30 + lx},${46}) rotate(14)`}><rect x={0} y={-6} width={46} height={12} rx={5} fill="#7b4a26" stroke={O} strokeWidth={3} /><rect x={40} y={-6} width={8} height={12} fill="#ddd" /><circle cx={50} cy={0} r={4} fill="#ff7a2a" opacity={0.6 + 0.4 * Math.sin(f / 3)} />
        {[0, 1, 2].map((i) => { const k = ((f + i * 20) % 60) / 60; return <circle key={i} cx={54 + k * 20} cy={-k * 70} r={5 + k * 12} fill="#ccc" opacity={0.5 * (1 - k)} />; })}</g>}
      {d.extras?.pipe && <g transform={`translate(${16 + lx},${50})`}><path d="M0,0 L40,10" stroke="#3d2614" strokeWidth={6} strokeLinecap="round" /><rect x={36} y={-8} width={18} height={24} rx={5} fill="#5b3a1e" stroke={O} strokeWidth={3} /></g>}
      <Hat d={d} rx={rx} ry={ry} lx={lx} f={f} />
    </g>
  );
};

const Nose: React.FC<{kind: string; lx: number; skin: string}> = ({kind, lx, skin}) => {
  const x = lx * 1.2; const dk = shade(skin, -0.3);
  if (kind === 'hook') return <path d={`M${x - 4},-14 Q${x + 16},2 ${x + 14},22 Q${x + 4},30 ${x - 8},24`} fill={skin} stroke={O} strokeWidth={4.5} strokeLinejoin="round" />;
  if (kind === 'big' || kind === 'long') return <path d={`M${x - 6},-12 Q${x + 4},${kind === 'long' ? 20 : 12} ${x + 12},24 Q${x},34 ${x - 14},26`} fill={skin} stroke={O} strokeWidth={4.5} strokeLinejoin="round" />;
  if (kind === 'round') return <ellipse cx={x} cy={18} rx={14} ry={11} fill={shade(skin, -0.05)} stroke={O} strokeWidth={4} />;
  return <path d={`M${x - 2},6 Q${x + 8},20 ${x},24`} stroke={dk} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
};

const Glasses: React.FC<{kind: string; lx: number}> = ({kind, lx}) => {
  const r = kind === 'pince' ? 12 : 17;
  return <g stroke="#2b2b2b" strokeWidth={4} fill="rgba(200,230,255,0.15)">
    {kind === 'square' ? <><rect x={-46 + lx} y={-24} width={36} height={28} rx={6} /><rect x={10 + lx} y={-24} width={36} height={28} rx={6} /></> :
      <><circle cx={-27 + lx} cy={-8} r={r} /><circle cx={27 + lx} cy={-8} r={r} /></>}
    <path d={`M${-27 + r + lx},-10 Q${lx},-16 ${27 - r + lx},-10`} fill="none" />
    {kind !== 'pince' && <><path d={`M${-27 - r + lx},-10 L-68,-12`} /><path d={`M${27 + r + lx},-10 L68,-12`} /></>}
  </g>;
};

const FacialHair: React.FC<{d: Design; lx: number; talk: number}> = ({d, lx, talk}) => {
  if (!d.facial) return null; const c = d.facial.color; const x = lx * 0.9; const s = d.facial.style;
  const els: React.ReactNode[] = [];
  if (s === 'walrus') els.push(<path key="w" d={`M${x - 46},${44} Q${x - 40},${16} ${x - 8},${22} Q${x},${18} ${x + 8},${22} Q${x + 40},${16} ${x + 46},${44} Q${x + 30},${38} ${x + 18},${40} Q${x},${34 + talk * 4} ${x - 18},${40} Q${x - 30},${38} ${x - 46},${44}Z`} fill={c} stroke={O} strokeWidth={4} strokeLinejoin="round" />);
  if (s === 'pencil') els.push(<path key="pc" d={`M${x - 22},${32} Q${x},${24} ${x + 22},${32}`} stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" />);
  if (s === 'toothbrush') els.push(<rect key="t" x={x - 12} y={24} width={24} height={14} rx={3} fill={c} stroke={O} strokeWidth={3} />);
  if (s === 'mustache') els.push(<path key="m" d={`M${x - 30},${38} Q${x - 16},${20} ${x},${28} Q${x + 16},${20} ${x + 30},${38} Q${x + 14},${34} ${x},${36} Q${x - 14},${34} ${x - 30},${38}Z`} fill={c} stroke={O} strokeWidth={3.5} />);
  if (s === 'fullBeard' || s === 'beard') els.push(<path key="b" d={`M-68,0 Q-70,60 -30,${86} Q0,${102} 30,${86} Q70,60 68,0 L58,-2 Q54,40 30,50 Q0,${40 + talk * 20} -30,50 Q-54,40 -58,-2Z`} fill={c} stroke={O} strokeWidth={4} />,
    <path key="bm" d={`M${x - 28},${36} Q${x},${24} ${x + 28},${36}`} stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />);
  if (s === 'sideburns' || s === 'bigSideburns') {
    const w = s === 'bigSideburns' ? 26 : 16;
    els.push(<path key="sl" d={`M-70,-30 L-70,${s === 'bigSideburns' ? 48 : 30} Q${-70 + w},${s === 'bigSideburns' ? 56 : 34} ${-70 + w},-30Z`} fill={c} stroke={O} strokeWidth={3.5} />,
      <path key="sr" d={`M70,-30 L70,${s === 'bigSideburns' ? 48 : 30} Q${70 - w},${s === 'bigSideburns' ? 56 : 34} ${70 - w},-30Z`} fill={c} stroke={O} strokeWidth={3.5} />);
  }
  if (s === 'chinstrap') els.push(<path key="cs" d={`M-70,-10 Q-74,70 -30,${92} Q0,${104} 30,${92} Q74,70 70,-10 L60,-8 Q58,50 28,66 Q0,${60 + talk * 16} -28,66 Q-58,50 -60,-8Z`} fill={c} stroke={O} strokeWidth={4} />);
  if (s === 'goatee') els.push(<path key="g" d={`M${x - 14},64 Q${x},90 ${x + 14},64 Q${x},72 ${x - 14},64Z`} fill={c} stroke={O} strokeWidth={3} />);
  if (s === 'stubble') els.push(<path key="st" d={`M-56,30 Q0,110 56,30 Q40,70 0,78 Q-40,70 -56,30Z`} fill={c} opacity={0.18} />);
  return <g>{els}</g>;
};

const HairBack: React.FC<{d: Design; rx: number; ry: number}> = ({d, rx, ry}) => {
  const h = d.hair; if (!h) return null; const c = h.color;
  if (h.style === 'wig') return <g>
    <path d={`M${-rx - 10},-30 Q${-rx - 20},40 ${-rx - 4},70 L${rx + 4},70 Q${rx + 20},40 ${rx + 10},-30Z`} fill={c} stroke={O} strokeWidth={SW - 1} />
    <path d={`M-14,60 Q0,130 14,60`} fill={c} stroke={O} strokeWidth={4} />
    <path d="M-10,96 L10,96" stroke="#1d1d1d" strokeWidth={10} strokeLinecap="round" />
  </g>;
  if (h.style === 'long') return <path d={`M${-rx - 8},-40 Q${-rx - 20},80 ${-rx + 6},${ry + 40} L${rx - 6},${ry + 40} Q${rx + 20},80 ${rx + 8},-40Z`} fill={c} stroke={O} strokeWidth={SW - 1} />;
  if (h.style === 'curly' || h.style === 'wavy' || h.style === 'combBack')
    return <path d={`M${-rx - 6},-10 Q${-rx - 12},40 ${-rx + 10},${h.style === 'curly' ? 50 : 30} L${rx - 10},${h.style === 'curly' ? 50 : 30} Q${rx + 12},40 ${rx + 6},-10Z`} fill={c} stroke={O} strokeWidth={SW - 1} />;
  return null;
};

const HairFront: React.FC<{d: Design; rx: number; ry: number; lx: number; f: number}> = ({d, rx, ry, lx}) => {
  const h = d.hair; if (!h) return null; const c = h.color; const hl = shade(c, 0.25); const s = h.style;
  const cap = (top: number, edge = -20) =>
    `M${-rx - 4},${edge} C${-rx - 8},${-ry + 10} ${-rx * 0.5},${-ry - top} 0,${-ry - top} C${rx * 0.5},${-ry - top} ${rx + 8},${-ry + 10} ${rx + 4},${edge} C${rx - 6},${-ry * 0.55} ${rx * 0.5},${-ry * 0.72} 0,${-ry * 0.72} C${-rx * 0.5},${-ry * 0.72} ${-rx + 6},${-ry * 0.55} ${-rx - 4},${edge}Z`;
  const st = {fill: c, stroke: O, strokeWidth: SW - 1, strokeLinejoin: 'round' as const};
  switch (s) {
    case 'baldFringe':
      return <g><path d={`M${-rx - 4},-34 Q${-rx - 10},10 ${-rx + 6},26 L${-rx + 16},-30Z`} {...st} /><path d={`M${rx + 4},-34 Q${rx + 10},10 ${rx - 6},26 L${rx - 16},-30Z`} {...st} /></g>;
    case 'balding':
      return <g><path d={`M${-rx - 4},-30 Q${-rx - 10},10 ${-rx + 6},20 L${-rx + 18},-36Z`} {...st} /><path d={`M${rx + 4},-30 Q${rx + 10},10 ${rx - 6},20 L${rx - 18},-36Z`} {...st} />
        <path d={`M-20,${-ry + 4} Q0,${-ry - 12} 24,${-ry + 2}`} stroke={c} strokeWidth={5} fill="none" /></g>;
    case 'short': case 'buzz':
      return <path d={cap(s === 'buzz' ? 4 : 12, s === 'buzz' ? -26 : -18)} {...st} />;
    case 'napoleon':
      return <g><path d={cap(10, -14)} {...st} />
        <path d={`M${-10 + lx},${-ry * 0.74} q-14,22 -4,34 q4,-16 12,-20 q2,18 10,22 q-2,-20 4,-34Z`} {...st} />
        <path d={`M${-rx - 4},-18 L${-rx + 4},20 L${-rx + 14},-20Z M${rx + 4},-18 L${rx - 4},20 L${rx - 14},-20Z`} {...st} /></g>;
    case 'sidePart':
      return <g><path d={cap(10, -14)} {...st} />
        <path d={`M${30 + lx},${-ry * 0.8} C${0 + lx},${-ry * 0.7} ${-30 + lx},${-ry * 0.55} ${-44 + lx},${-ry * 0.2} C${-30 + lx},${-ry * 0.42} ${0 + lx},${-ry * 0.6} ${40 + lx},${-ry * 0.66}Z`} {...st} />
        <path d={`M${36 + lx},${-ry - 2} L${30 + lx},${-ry * 0.74}`} stroke={O} strokeWidth={3} /></g>;
    case 'combBack':
      return <g><path d={cap(26, -12)} {...st} />
        {[-44, -20, 4, 28, 50].map((x) => <path key={x} d={`M${x},${-ry * 0.74} C${x - 4},${-ry - 4} ${x + 6},${-ry - 20} ${x + 22},${-ry - 22}`} stroke={hl} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}</g>;
    case 'wavy': {
      const bumps = Array.from({length: 9}).map((_, i) => { const a = Math.PI * (1.08 + i * 0.105); return [Math.cos(a) * (rx + 12), Math.sin(a) * (ry + 18) - 6]; });
      return <g><path d={`M${-rx - 8},-4 ` + bumps.map(([x, y], i) => `Q${x * 1.08},${y * 1.1 - 6} ${x},${y}`).join(' ') + ` Q${rx + 16},-30 ${rx + 8},-4 C${rx - 10},${-ry * 0.42} ${rx * 0.35},${-ry * 0.56} ${10},${-ry * 0.5} C${-rx * 0.3},${-ry * 0.62} ${-rx + 2},${-ry * 0.42} ${-rx - 8},-4Z`} {...st} />
        {[-40, -6, 30].map((x) => <path key={x} d={`M${x - 16},${-ry - 2} q16,-14 32,0`} stroke={shade(c, -0.2)} strokeWidth={4} fill="none" />)}
        <path d={`M${-rx * 0.5},${-ry * 0.58} q20,-26 46,-10 q16,-18 40,-4`} stroke={shade(c, -0.15)} strokeWidth={4} fill="none" /></g>;
    }
    case 'curly':
      return <g><path d={cap(14, -10)} {...st} />
        {[-56, -34, -10, 14, 38, 58].map((x, i) => <circle key={x} cx={x + lx * 0.3} cy={-ry * 0.72 - (i % 2) * 8} r={15} {...st} />)}</g>;
    case 'wig':
      return <g><path d={cap(18, -26)} {...st} />
        {[-1, 1].map((sd) => [0, 1].map((k) => <ellipse key={sd + '' + k} cx={sd * (rx + 4)} cy={-22 + k * 28} rx={18} ry={12} {...st} />))}</g>;
    case 'long':
      return <path d={cap(14, -6)} {...st} />;
    case 'hijab': return null;
    default:
      return <path d={cap(10)} {...st} />;
  }
};

const Hat: React.FC<{d: Design; rx: number; ry: number; lx: number; f: number}> = ({d, rx, ry, lx}) => {
  const h = d.hat; if (!h) return null; const c = h.color; const a = h.accent ?? C.gold;
  const st = {stroke: O, strokeWidth: SW - 1, strokeLinejoin: 'round' as const};
  const top = -ry;
  switch (h.style) {
    case 'bicorne': // de lado (Napoleón)
      return <g transform={`translate(${lx * 0.5},${top + 20})`}>
        <path d={`M-150,6 C-120,-30 -60,-118 0,-122 C60,-118 120,-30 150,6 C90,-14 40,-22 0,-22 C-40,-22 -90,-14 -150,6Z`} fill={c} {...st} />
        <path d={`M-140,0 C-90,-20 90,-20 140,0`} stroke={shade(c, 0.25)} strokeWidth={4} fill="none" />
        <g transform="translate(70,-60)"><circle r={18} fill="#1f4aa8" {...st} strokeWidth={3} /><circle r={12} fill="#fff" /><circle r={6} fill="#d7263d" /></g>
      </g>;
    case 'bicorneFore': // de frente a atrás (Wellington)
      return <g transform={`translate(${lx * 0.5},${top + 18})`}>
        <path d={`M-62,4 C-66,-60 -30,-150 0,-152 C30,-150 66,-60 62,4 C30,-8 -30,-8 -62,4Z`} fill={c} {...st} />
        <path d="M0,-140 L0,-10" stroke={shade(c, 0.3)} strokeWidth={4} />
        <circle cx={-26} cy={-30} r={12} fill="#111" {...st} strokeWidth={3} />
      </g>;
    case 'bearskin':
      return <g transform={`translate(${lx * 0.4},${top + 30})`}>
        <path d="M-78,0 C-90,-110 -50,-180 0,-182 C50,-180 90,-110 78,0Z" fill={c} {...st} />
        <path d="M30,-150 q30,30 18,90" stroke={a} strokeWidth={8} fill="none" />
        <rect x={-50} y={-90} width={20} height={60} fill="#c81e2e" {...st} strokeWidth={3} />
      </g>;
    case 'shako':
      return <g transform={`translate(${lx * 0.4},${top + 20})`}>
        <path d="M-62,6 L-56,-90 L56,-90 L62,6Z" fill={c} {...st} />
        <path d="M-74,8 Q0,-6 74,8 L70,22 Q0,10 -70,22Z" fill="#111" {...st} strokeWidth={3} />
        <circle cy={-60} r={14} fill={a} {...st} strokeWidth={3} />
        <rect x={-6} y={-130} width={12} height={40} rx={6} fill={h.accent2 ?? '#d7263d'} {...st} strokeWidth={3} />
      </g>;
    case 'peakedCap':
      return <g transform={`translate(${lx * 0.5},${top + 22})`}>
        <path d="M-92,-30 C-96,-80 96,-80 92,-30 L72,0 L-72,0Z" fill={c} {...st} />
        <rect x={-74} y={-22} width={148} height={22} fill={a} {...st} strokeWidth={4} />
        <path d="M-78,0 Q0,30 78,0 L68,-2 Q0,14 -68,-2Z" fill="#141414" {...st} strokeWidth={4} />
        <path d="M0,-58 l6,12 13,1 -10,9 3,13 -12,-7 -12,7 3,-13 -10,-9 13,-1Z" fill={h.accent2 ?? '#e23b3b'} stroke={O} strokeWidth={2} />
      </g>;
    case 'ushanka':
      return <g transform={`translate(${lx * 0.4},${top + 28})`}>
        <path d="M-88,10 C-96,-80 96,-80 88,10Z" fill={c} {...st} />
        <path d="M-94,4 Q0,-30 94,4 L90,30 Q0,0 -90,30Z" fill={shade(c, 0.2)} {...st} />
        <path d="M-92,20 L-96,110 L-70,110 L-68,24Z M92,20 L96,110 L70,110 L68,24Z" fill={shade(c, 0.2)} {...st} />
        <path d="M0,-30 l5,10 11,1 -8,7 2,11 -10,-6 -10,6 2,-11 -8,-7 11,-1Z" fill="#e23b3b" />
      </g>;
    case 'helmet':
      return <g transform={`translate(${lx * 0.4},${top + 36})`}>
        <path d="M-92,6 C-100,-110 100,-110 92,6 Q0,-8 -92,6Z" fill={c} {...st} />
        <path d="M-96,4 Q0,-12 96,4" stroke={shade(c, -0.3)} strokeWidth={6} fill="none" />
        {h.accent && <path d="M0,-70 l5,10 11,1 -8,7 2,11 -10,-6 -10,6 2,-11 -8,-7 11,-1Z" fill={h.accent} />}
        <path d="M-60,-60 q20,-20 40,-10" stroke={shade(c, 0.3)} strokeWidth={6} fill="none" />
      </g>;
    case 'homburg': case 'bowler':
      return <g transform={`translate(${lx * 0.4},${top + 24})`}>
        <path d={h.style === 'bowler' ? 'M-66,-6 C-70,-110 70,-110 66,-6Z' : 'M-66,-6 L-62,-80 Q-30,-94 0,-80 Q30,-94 62,-80 L66,-6Z'} fill={c} {...st} />
        <path d="M-104,0 Q0,-22 104,0 Q100,16 70,6 Q0,-4 -70,6 Q-100,16 -104,0Z" fill={c} {...st} />
        <rect x={-64} y={-26} width={128} height={16} fill={a} />
      </g>;
    case 'beret':
      return <g transform={`translate(${lx * 0.4},${top + 18})`}><path d="M-80,0 C-100,-60 40,-90 96,-30 C100,-10 60,4 -80,0Z" fill={c} {...st} /><circle cx={6} cy={-56} r={6} fill={c} {...st} strokeWidth={3} /></g>;
    case 'crown':
      return <g transform={`translate(${lx * 0.4},${top + 16})`}>
        <path d="M-60,0 L-66,-70 L-34,-40 L0,-86 L34,-40 L66,-70 L60,0Z" fill={a} {...st} />
        <rect x={-62} y={-14} width={124} height={16} fill={h.accent2 ?? '#c0392b'} {...st} strokeWidth={3} />
        <circle cy={-86} r={8} fill="#2e86de" {...st} strokeWidth={2} />
      </g>;
    case 'stovepipe':
      return <g transform={`translate(${lx * 0.4},${top + 26})`}>
        <path d="M-58,-4 L-62,-190 Q0,-200 62,-190 L58,-4Z" fill={c} {...st} />
        <rect x={-60} y={-40} width={120} height={22} fill={a} />
        <path d="M-100,0 Q0,-24 100,0 Q96,14 60,8 Q0,0 -60,8 Q-96,14 -100,0Z" fill={c} {...st} />
      </g>;
    case 'kepi':
      return <g transform={`translate(${lx * 0.5},${top + 22})`}>
        <path d="M-74,0 L-60,-96 Q-20,-110 50,-80 L72,0Z" fill={c} {...st} />
        <path d="M-74,0 L72,0 L72,-14 L-74,-14Z" fill={shade(c, -0.2)} {...st} strokeWidth={3} />
        <path d="M-10,0 Q50,4 100,24 Q40,30 -10,14Z" fill="#141414" {...st} strokeWidth={4} />
        {h.accent && <circle cx={-6} cy={-40} r={10} fill={a} stroke={O} strokeWidth={2} />}
      </g>;
    case 'cuartelera':
      return <g transform={`translate(${lx * 0.5},${top + 24})`}>
        <path d="M-80,0 Q-70,-70 0,-76 Q70,-70 80,0 Q0,-14 -80,0Z" fill={c} {...st} />
        <path d="M-80,0 Q0,-14 80,0" stroke={shade(c, -0.25)} strokeWidth={5} fill="none" />
        <path d="M0,-76 Q8,-96 2,-112" stroke={O} strokeWidth={3} fill="none" />
        <path d="M-6,-112 L10,-112 L14,-84 L-10,-84Z" fill={h.accent2 ?? '#c0202e'} stroke={O} strokeWidth={3} />
        {h.accent && <path d="M-24,-30 l8,-14 l8,14 l-8,-4Z" fill={a} stroke={O} strokeWidth={2} />}
      </g>;
    case 'slouch':
      return <g transform={`translate(${lx * 0.4},${top + 24})`}>
        <path d="M-64,-2 Q-60,-92 0,-96 Q60,-92 64,-2Z" fill={c} {...st} />
        <path d="M-120,4 Q0,-28 120,4 Q90,26 0,12 Q-90,26 -120,4Z" fill={c} {...st} />
        <rect x={-62} y={-28} width={124} height={14} fill={a} />
      </g>;
    case 'laurel':
      return <g transform={`translate(${lx * 0.4},${top + 30})`}>
        {[-1, 1].map((sd) => Array.from({length: 7}).map((_, i) => { const an = (Math.PI * (0.1 + i * 0.11)); const x = sd * Math.cos(an) * (rx - 4), y = -Math.sin(an) * (ry * 0.62);
          return <ellipse key={sd + '-' + i} cx={x} cy={y} rx={16} ry={8} transform={`rotate(${sd * (90 - (an * 180) / Math.PI) * 0.9 + sd * 30},${x},${y})`} fill={a} stroke={O} strokeWidth={3} />; }))}
      </g>;
    case 'tricorne':
      return <g transform={`translate(${lx * 0.4},${top + 22})`}><path d="M-110,-6 Q-80,-90 0,-96 Q80,-90 110,-6 Q60,-30 0,10 Q-60,-30 -110,-6Z" fill={c} {...st} /><path d="M-100,-10 Q-60,-34 0,4 Q60,-34 100,-10" stroke={a} strokeWidth={5} fill="none" /></g>;
    case 'hood':
      return <g><path d={`M${-rx - 18},40 C${-rx - 30},-110 ${rx + 30},-110 ${rx + 18},40 L${rx - 2},40 C${rx},-60 ${-rx},-60 ${-rx + 2},40Z`} fill={c} {...st} /></g>;
    case 'cap':
      return <g transform={`translate(${lx * 0.5},${top + 20})`}><path d="M-78,4 C-84,-90 84,-90 78,4Z" fill={c} {...st} /><path d="M10,0 Q80,-6 120,14 Q70,24 10,14Z" fill={shade(c, -0.2)} {...st} /></g>;
    default: return null;
  }
};

// ---------- Objetos en mano ----------
export const Prop: React.FC<{kind: string; color?: string; side: number; f: number}> = ({kind, color, side, f}) => {
  const st = {stroke: O, strokeWidth: 4, strokeLinejoin: 'round' as const};
  switch (kind) {
    case 'sword': return <g><rect x={-5} y={10} width={10} height={150} rx={3} fill="#dfe6ee" {...st} /><rect x={-24} y={2} width={48} height={10} rx={4} fill={C.gold} {...st} /></g>;
    case 'saber': return <g><path d="M-4,12 Q20,90 0,170 L8,170 Q30,90 6,12Z" fill="#dfe6ee" {...st} /><rect x={-20} y={2} width={40} height={10} rx={4} fill={C.gold} {...st} /></g>;
    case 'flag': {
      const col = color ?? '#d7263d';
      const wv = (i: number) => Math.sin(f / 5 + i) * 10;
      return <g><rect x={-5} y={-300} width={10} height={340} fill="#6b4a2b" {...st} />
        <path d={`M5,-296 Q50,${-296 + wv(0)} 100,${-296 + wv(1)} Q150,${-296 + wv(2)} 190,${-296 + wv(3)} L190,${-196 + wv(3)} Q150,${-196 + wv(2)} 100,${-196 + wv(1)} Q50,${-196 + wv(0)} 5,-196Z`} fill={col} {...st} /></g>;
    }
    case 'umbrella': return <g><path d="M0,0 L0,190" stroke="#111" strokeWidth={8} /><path d="M-16,40 Q0,200 16,40Z" fill="#1a1a1a" {...st} /><path d="M0,0 q-14,0 -14,-14" stroke="#6b4a2b" strokeWidth={8} fill="none" /></g>;
    case 'paper': return <g transform={`translate(${side * 10},0) rotate(${side * 8})`}><rect x={-10} y={-100} width={84} height={110} fill="#fbf6e6" {...st} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={2} x2={60} y1={-84 + i * 16} y2={-84 + i * 16} stroke="#999" strokeWidth={3} />)}</g>;
    case 'brush': return <g><rect x={-4} y={0} width={8} height={90} fill="#8b5a2b" {...st} /><path d="M-6,90 L6,90 L2,118 L-2,118Z" fill="#c0392b" {...st} /></g>;
    case 'palette': return <g><ellipse cx={side * 40} cy={-10} rx={56} ry={38} fill="#c8a06b" {...st} />{['#c0392b', '#2e86de', '#f1c40f', '#fff', '#27ae60'].map((c, i) => <circle key={i} cx={side * (10 + i * 16)} cy={-24 + (i % 2) * 16} r={7} fill={c} />)}</g>;
    case 'telescope': return <g transform={`rotate(${side * -70})`}><rect x={-8} y={0} width={16} height={70} fill="#8b5a2b" {...st} /><rect x={-11} y={60} width={22} height={60} fill="#c69c4b" {...st} /></g>;
    case 'rifle': return <g><rect x={-7} y={-150} width={14} height={240} rx={3} fill="#5b4632" {...st} /><rect x={-3} y={-200} width={6} height={56} fill="#9aa" {...st} /></g>;
    case 'modernRifle': return <g transform={`rotate(${side * 20})`}><rect x={-9} y={-130} width={18} height={190} rx={3} fill="#2f3330" {...st} /><rect x={-4} y={-30} width={22} height={34} fill="#2f3330" {...st} /></g>;
    case 'microphone': return <g><rect x={-6} y={-60} width={12} height={60} fill="#333" {...st} /><circle cy={-66} r={14} fill="#777" {...st} /></g>;
    case 'chip': return <g transform="translate(0,-50)"><rect x={-34} y={-34} width={68} height={68} rx={6} fill="#2b3a4a" {...st} /><rect x={-18} y={-18} width={36} height={36} fill="#c9a43a" />
      {[-24, -12, 0, 12, 24].map((x) => <g key={x}><line x1={x} y1={-34} x2={x} y2={-46} stroke="#c9a43a" strokeWidth={4} /><line x1={x} y1={34} x2={x} y2={46} stroke="#c9a43a" strokeWidth={4} /></g>)}</g>;
    case 'pointer': return <g><rect x={-3} y={0} width={6} height={130} fill="#6b4a2b" {...st} /></g>;
    case 'wine': return <g transform="translate(0,-20)"><path d="M-14,-40 L14,-40 Q14,0 0,4 Q-14,0 -14,-40Z" fill="#7b1e2e" {...st} /><rect x={-2} y={4} width={4} height={24} fill="#ddd" /></g>;
    case 'phone': return <g transform="translate(0,-30)"><rect x={-18} y={-34} width={36} height={64} rx={6} fill="#222" {...st} /><rect x={-13} y={-28} width={26} height={48} fill="#4aa3df" /></g>;
    case 'pipe': return null;
    default: return null;
  }
};
