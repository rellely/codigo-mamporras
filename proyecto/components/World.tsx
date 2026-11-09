// Escenarios, vehículos, efectos y elementos ambientales animados (SVG). Coordenadas de escena 1080x1920.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, clamp, lerp, noise1, rand, tween} from './core';
import {shade} from './Character';

const O = C.ink;

// ---------------- cámara con parallax ----------------
export interface CamKey {f: number; x?: number; y?: number; z?: number; r?: number}
const CamCtx = React.createContext({x: 0, y: 0, z: 1, r: 0});
export const Camera: React.FC<{k: CamKey[]; shake?: number; drift?: number; children: React.ReactNode}> = ({k, shake = 0, drift = 1, children}) => {
  const f = useCurrentFrame();
  const val = (key: 'x' | 'y' | 'z' | 'r', def: number) => {
    const pts = k.filter((q) => q[key] !== undefined) as any[];
    if (!pts.length) return def;
    if (f <= pts[0].f) return pts[0][key];
    for (let i = 0; i < pts.length - 1; i++) if (f <= pts[i + 1].f) return tween(f, pts[i].f, pts[i + 1].f, pts[i][key], pts[i + 1][key]);
    return pts[pts.length - 1][key];
  };
  const cam = {
    x: val('x', 0) + noise1(f / 40, 1) * 6 * drift + noise1(f / 1.5, 9) * shake,
    y: val('y', 0) + noise1(f / 45, 2) * 6 * drift + noise1(f / 1.7, 7) * shake,
    z: val('z', 1), r: val('r', 0) + noise1(f / 60, 3) * 0.3 * drift,
  };
  return <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>;
};
/** capa con profundidad: depth 0 = fija (cielo), 1 = plano principal, >1 = primer término */
export const Layer: React.FC<{depth?: number; children: React.ReactNode; blur?: number; opacity?: number}> = ({depth = 1, children, blur, opacity}) => {
  const cam = React.useContext(CamCtx);
  const z = Math.pow(cam.z, depth);
  return (
    <g transform={`translate(540,960) rotate(${cam.r * depth}) scale(${z}) translate(${-540 - cam.x * depth},${-960 - cam.y * depth})`}
      style={blur ? {filter: `blur(${blur}px)`} : undefined} opacity={opacity}>
      {children}
    </g>
  );
};
export const Stage: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#000'}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0, background: bg}}>{children}</svg>
);

// ---------------- cielo y atmósfera ----------------
export const Sky: React.FC<{top: string; bottom: string; mid?: string; id?: string}> = ({top, bottom, mid, id = 'sky'}) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={top} />{mid && <stop offset="0.55" stopColor={mid} />}<stop offset="1" stopColor={bottom} />
    </linearGradient></defs>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill={`url(#${id})`} />
  </g>
);
export const Sun: React.FC<{x: number; y: number; r?: number; color?: string; glow?: string}> = ({x, y, r = 90, color = '#fff2c4', glow = '#ffcf6b'}) => {
  const f = useCurrentFrame();
  return <g>
    <defs><radialGradient id={`sg${x}${y}`}><stop offset="0" stopColor={glow} stopOpacity={0.7} /><stop offset="1" stopColor={glow} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r * 4.5 * (1 + Math.sin(f / 30) * 0.03)} fill={`url(#sg${x}${y})`} />
    <circle cx={x} cy={y} r={r} fill={color} />
  </g>;
};
export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => (
  <g><circle cx={x} cy={y} r={r * 3} fill="#cfe0ff" opacity={0.08} /><circle cx={x} cy={y} r={r} fill="#f3f0e0" />
    <circle cx={x + r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#d8d4c0" /><circle cx={x - r * 0.35} cy={y + r * 0.3} r={r * 0.12} fill="#d8d4c0" /></g>
);
export const Stars: React.FC<{n?: number; h?: number}> = ({n = 90, h = 1000}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}).map((_, i) => <circle key={i} cx={rand(i, 1) * 1400 - 160} cy={rand(i, 2) * h - 200} r={1 + rand(i, 3) * 2.5}
    fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i))} />)}</g>;
};
export const Clouds: React.FC<{n?: number; y0?: number; y1?: number; color?: string; speed?: number; scale?: number; opacity?: number; seed?: number}> =
  ({n = 6, y0 = 100, y1 = 700, color = '#ffffff', speed = 0.6, scale = 1, opacity = 0.9, seed = 1}) => {
    const f = useCurrentFrame();
    return <g opacity={opacity}>{Array.from({length: n}).map((_, i) => {
      const s = (0.6 + rand(i, seed) * 0.8) * scale; const span = 1600;
      const x = ((rand(i, seed + 1) * span + f * speed * (0.5 + rand(i, seed + 2))) % span) - 260;
      const y = lerp(y0, y1, rand(i, seed + 3));
      return <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M-120,30 Q-130,-20 -70,-20 Q-60,-70 0,-60 Q40,-100 90,-50 Q150,-50 140,10 Q160,40 120,40 L-110,40 Q-140,40 -120,30Z" fill={color} />
        <path d="M-110,40 L120,40 Q100,30 60,34 Q0,24 -60,34 Q-90,30 -110,40Z" fill={shade(color.length === 7 ? color : '#ffffff', -0.12)} opacity={0.6} />
      </g>;
    })}</g>;
  };
export const Haze: React.FC<{y: number; h?: number; color: string; opacity?: number}> = ({y, h = 500, color, opacity = 0.6}) => (
  <g><defs><linearGradient id={`hz${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0} /><stop offset="0.5" stopColor={color} stopOpacity={opacity} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
    <rect x={-800} y={y - h / 2} width={2680} height={h} fill={`url(#hz${y})`} /></g>
);
export const LightRays: React.FC<{x: number; y: number; color?: string; n?: number; opacity?: number}> = ({x, y, color = '#fff3c8', n = 7, opacity = 0.18}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}).map((_, i) => {
    const a = -60 + (i / (n - 1)) * 120 + Math.sin(f / 50 + i) * 4; const w = 40 + rand(i, 4) * 60;
    return <path key={i} d={`M${x},${y} L${x - w},${y + 2200} L${x + w},${y + 2200}Z`} fill={color} opacity={opacity * (0.5 + 0.5 * Math.sin(f / 30 + i * 2))} transform={`rotate(${a},${x},${y})`} />;
  })}</g>;
};

// ---------------- terreno ----------------
export const Ridge: React.FC<{y: number; amp?: number; color: string; seed?: number; jag?: number; stroke?: boolean; snow?: string; w0?: number; w1?: number}> =
  ({y, amp = 80, color, seed = 1, jag = 0.008, stroke = false, snow, w0 = -800, w1 = 1880}) => {
    const pts: string[] = [];
    for (let x = w0; x <= w1; x += 20) pts.push(`${x},${y - Math.abs(noise1(x * jag, seed) * amp + noise1(x * jag * 3, seed + 5) * amp * 0.35)}`);
    const d = `M${w0},3000 L${pts.join(' L')} L${w1},3000Z`;
    return <g><path d={d} fill={color} stroke={stroke ? O : 'none'} strokeWidth={4} />
      {snow && <path d={`M${w0},${y} L${pts.join(' L')} L${w1},${y}Z`} fill={snow} opacity={0} />}</g>;
  };
export const Mountains: React.FC<{y: number; color: string; snow?: string; seed?: number; h?: number; n?: number}> = ({y, color, snow = '#f4f6fb', seed = 2, h = 500, n = 6}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const x = -200 + i * (1500 / (n - 1)) + rand(i, seed) * 120; const hh = h * (0.6 + rand(i, seed + 1) * 0.5); const w = hh * (0.9 + rand(i, seed + 2) * 0.4);
    return <g key={i}>
      <path d={`M${x - w},${y} L${x - w * 0.2},${y - hh * 0.85} L${x},${y - hh} L${x + w * 0.25},${y - hh * 0.8} L${x + w},${y}Z`} fill={color} stroke={O} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${x},${y - hh} L${x + w * 0.25},${y - hh * 0.8} L${x + w},${y} L${x + w * 0.1},${y}Z`} fill={shade(color, -0.2)} />
      <path d={`M${x - w * 0.2},${y - hh * 0.85} L${x},${y - hh} L${x + w * 0.25},${y - hh * 0.8} L${x + w * 0.12},${y - hh * 0.72} L${x},${y - hh * 0.8} L${x - w * 0.1},${y - hh * 0.7}Z`} fill={snow} />
    </g>;
  })}</g>
);
export const Ground: React.FC<{y: number; color: string; color2?: string}> = ({y, color, color2}) => (
  <g><rect x={-1000} y={y} width={3080} height={3000} fill={color} />
    {color2 && Array.from({length: 30}).map((_, i) => <ellipse key={i} cx={rand(i, 8) * 1600 - 260} cy={y + 30 + rand(i, 9) * 800} rx={40 + rand(i, 3) * 90} ry={8 + rand(i, 4) * 10} fill={color2} opacity={0.5} />)}
  </g>
);
export const Tree: React.FC<{x: number; y: number; s?: number; kind?: 'pine' | 'birch' | 'palm' | 'round'; color?: string; snow?: boolean}> = ({x, y, s = 1, kind = 'pine', color = '#2f5a3a', snow}) => {
  const f = useCurrentFrame(); const sway = Math.sin(f / 25 + x) * 2;
  return <g transform={`translate(${x},${y}) scale(${s}) rotate(${sway},0,0)`}>
    {kind === 'pine' && <><rect x={-8} y={-40} width={16} height={40} fill="#4a3424" stroke={O} strokeWidth={3} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-70 + i * 14},${-30 - i * 60} L0,${-130 - i * 60} L${70 - i * 14},${-30 - i * 60}Z`} fill={color} stroke={O} strokeWidth={3} strokeLinejoin="round" />)}
      {snow && [0, 1, 2].map((i) => <path key={'s' + i} d={`M${-30 + i * 6},${-90 - i * 60} L0,${-130 - i * 60} L${30 - i * 6},${-90 - i * 60} Q0,${-100 - i * 60} ${-30 + i * 6},${-90 - i * 60}Z`} fill="#f3f6fb" />)}</>}
    {kind === 'birch' && <><rect x={-7} y={-260} width={14} height={260} fill="#eeeae0" stroke={O} strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-7} y={-240 + i * 46} width={8} height={5} fill="#333" />)}
      {!snow && <ellipse cx={0} cy={-250} rx={60} ry={80} fill={color} stroke={O} strokeWidth={3} />}
      {snow && <path d="M0,-200 L-40,-260 M0,-160 L36,-220 M0,-230 L20,-280" stroke="#4a4a4a" strokeWidth={4} />}</>}
    {kind === 'palm' && <><path d="M-6,0 Q-20,-120 6,-240 L14,-240 Q-6,-120 8,0Z" fill="#8a6a44" stroke={O} strokeWidth={3} />
      {[-150, -110, -60, -20, 20].map((a, i) => <path key={i} d="M10,-240 Q60,-280 120,-230 Q60,-255 10,-240Z" fill={color} stroke={O} strokeWidth={3} transform={`rotate(${a + 60},10,-240)`} />)}</>}
    {kind === 'round' && <><rect x={-8} y={-60} width={16} height={60} fill="#5a3e28" stroke={O} strokeWidth={3} /><circle cx={0} cy={-110} r={70} fill={color} stroke={O} strokeWidth={3} /><circle cx={20} cy={-125} r={30} fill={shade(color, 0.15)} /></>}
  </g>;
};

// ---------------- partículas ----------------
export const Snow: React.FC<{n?: number; wind?: number; size?: number; opacity?: number}> = ({n = 140, wind = 1.5, size = 1, opacity = 0.9}) => {
  const f = useCurrentFrame();
  return <g opacity={opacity}>{Array.from({length: n}).map((_, i) => {
    const sp = 2 + rand(i, 1) * 4; const y = ((rand(i, 2) * 2200 + f * sp) % 2200) - 140;
    const x = ((rand(i, 3) * 1400 + f * wind * sp * 0.6 + Math.sin(f / 20 + i) * 20) % 1400) - 160;
    return <circle key={i} cx={x} cy={y} r={(2 + rand(i, 4) * 5) * size} fill="#fff" />;
  })}</g>;
};
export const Rain: React.FC<{n?: number; angle?: number; opacity?: number}> = ({n = 120, angle = 12, opacity = 0.5}) => {
  const f = useCurrentFrame();
  return <g opacity={opacity}>{Array.from({length: n}).map((_, i) => {
    const sp = 40 + rand(i, 1) * 20; const y = ((rand(i, 2) * 2300 + f * sp) % 2300) - 200; const x = rand(i, 3) * 1500 - 200 - y * Math.tan(angle * Math.PI / 180);
    return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 60} stroke="#cfe0f0" strokeWidth={2.5} />;
  })}</g>;
};
export const Embers: React.FC<{n?: number; color?: string; y0?: number}> = ({n = 50, color = '#ffb347', y0 = 1900}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}).map((_, i) => {
    const sp = 1.5 + rand(i, 1) * 3; const y = y0 - ((rand(i, 2) * 1800 + f * sp) % 1800); const x = rand(i, 3) * 1200 - 60 + Math.sin(f / 15 + i) * 30;
    return <circle key={i} cx={x} cy={y} r={2 + rand(i, 4) * 4} fill={color} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i))} />;
  })}</g>;
};
export const Dust: React.FC<{n?: number; color?: string}> = ({n = 40, color = '#fff'}) => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: n}).map((_, i) => {
    const x = (rand(i, 1) * 1200 + f * (0.3 + rand(i, 5)) + Math.sin(f / 40 + i) * 30) % 1200 - 60; const y = (rand(i, 2) * 2000 - f * 0.4 * rand(i, 6) + 2000) % 2000;
    return <circle key={i} cx={x} cy={y} r={1.5 + rand(i, 3) * 3} fill={color} opacity={0.15 + 0.25 * Math.abs(Math.sin(f / 25 + i))} />;
  })}</g>;
};

// ---------------- humo, fuego, explosiones ----------------
export const Smoke: React.FC<{x: number; y: number; n?: number; color?: string; spread?: number; rise?: number; size?: number; opacity?: number}> =
  ({x, y, n = 10, color = '#555', spread = 60, rise = 600, size = 1, opacity = 0.6}) => {
    const f = useCurrentFrame();
    return <g>{Array.from({length: n}).map((_, i) => {
      const life = 90; const k = ((f + i * (life / n)) % life) / life;
      return <circle key={i} cx={x + Math.sin(i * 3 + k * 4) * spread * k + k * 80} cy={y - k * rise} r={(30 + k * 110) * size}
        fill={shade(color, k * 0.3)} opacity={opacity * Math.sin(Math.PI * Math.min(1, k * 1.3))} />;
    })}</g>;
  };
export const Fire: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const f = useCurrentFrame();
  const fl = (i: number) => 1 + noise1(f / 3, i) * 0.25;
  return <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={-40} rx={160} ry={120} fill="#ff8a2a" opacity={0.18} />
    {[{c: '#d7263d', w: 70, h: 170}, {c: '#ff7b2a', w: 52, h: 130}, {c: '#ffd25a', w: 30, h: 80}].map((l, i) =>
      <path key={i} d={`M${-l.w},0 Q${-l.w},${-l.h * 0.5 * fl(i)} ${noise1(f / 4, i + 9) * 16},${-l.h * fl(i + 3)} Q${l.w},${-l.h * 0.5 * fl(i + 1)} ${l.w},0Z`} fill={l.c} />)}
  </g>;
};
export const Explosion: React.FC<{x: number; y: number; at: number; s?: number; color?: string}> = ({x, y, at, s = 1, color = '#ffb03a'}) => {
  const f = useCurrentFrame() - at; if (f < 0 || f > 70) return null;
  const k = f / 70; const fl = clamp(1 - f / 10);
  return <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={60 + k * 520} fill="none" stroke="#fff" strokeWidth={20 * (1 - k)} opacity={1 - k} />
    {Array.from({length: 9}).map((_, i) => { const a = (i / 9) * Math.PI * 2 + rand(i, 3); const r = 40 + k * 260 * (0.6 + rand(i, 5));
      return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.7 - k * 160} r={(80 + rand(i, 8) * 60) * (0.5 + k)} fill={k < 0.3 ? color : '#4a4040'} opacity={(1 - k) * 0.85} />; })}
    <circle r={150 * (1 - k * 0.6)} fill="#fff6c8" opacity={fl} />
    {Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; const r = k * 600;
      return <rect key={'d' + i} x={Math.cos(a) * r} y={Math.sin(a) * r - 200 * k + 400 * k * k} width={14} height={10} fill="#2a2228" transform={`rotate(${f * 20 + i * 30})`} opacity={1 - k} />; })}
  </g>;
};
export const Flash: React.FC<{at: number; color?: string; dur?: number}> = ({at, color = '#fff', dur = 10}) => {
  const f = useCurrentFrame(); const k = (f - at) / dur; if (k < 0 || k > 1) return null;
  return <rect x={-1000} y={-1000} width={3080} height={3920} fill={color} opacity={1 - k} />;
};

// ---------------- banderas ----------------
type FlagKind = 'republica' | 'csa' | 'usa1861' | 'nato' | 'germany' | 'ussr' | 'russia' | 'france' | 'uk' | 'prussia' | 'burgundy' | 'spain' | 'prc' | 'roc' | 'usa' | 'japan' | 'ukraine' | 'india' | 'white' | 'gran_colombia' | 'argentina' | 'mexico' | 'eu' | 'germany1871' | 'austria';
export const FlagFace: React.FC<{kind: FlagKind; w: number; h: number}> = ({kind, w, h}) => {
  const tri = (a: string, b: string, c: string, vert = true) => vert
    ? <><rect width={w / 3} height={h} fill={a} /><rect x={w / 3} width={w / 3} height={h} fill={b} /><rect x={(2 * w) / 3} width={w / 3} height={h} fill={c} /></>
    : <><rect width={w} height={h / 3} fill={a} /><rect y={h / 3} width={w} height={h / 3} fill={b} /><rect y={(2 * h) / 3} width={w} height={h / 3} fill={c} /></>;
  const star = (cx: number, cy: number, r: number, fill: string, rot = 0) => {
    const p = Array.from({length: 10}).map((_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2 + rot; const rr = i % 2 ? r * 0.4 : r; return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ');
    return <polygon points={p} fill={fill} />;
  };
  switch (kind) {
    case 'ussr': return <g><rect width={w} height={h} fill="#cc1f1f" />
      <g transform={`translate(${w * 0.17},${h * 0.32}) scale(${h / 170})`} fill="#ffd23f">
        <path d="M-6,-22 A24,24 0 1,1 -20,14 L-15,11 A18,18 0 1,0 -6,-16Z" />
        <path d="M-18,13 L-27,23 L-23,27 L-14,17Z" />
        <path d="M-15,-13 L17,19 L13,23 L-19,-9Z" />
        <path d="M-25,-15 L-9,-31 L-3,-25 L-19,-9Z" />
        <path d="M0,-50 l3.5,8 8.5,.7 -6.5,5.5 2,8.5 -7.5,-4.5 -7.5,4.5 2,-8.5 -6.5,-5.5 8.5,-.7Z" fill="none" stroke="#ffd23f" strokeWidth={2.2} />
      </g></g>;
    case 'russia': return tri('#fff', '#1c57a5', '#d52b1e', false);
    case 'ukraine': return <><rect width={w} height={h / 2} fill="#0057b7" /><rect y={h / 2} width={w} height={h / 2} fill="#ffd700" /></>;
    case 'france': return tri('#1f3f95', '#fff', '#d7263d');
    case 'uk': return <g><rect width={w} height={h} fill="#1f3a8a" />
      <path d={`M0,0 L${w},${h} M${w},0 L0,${h}`} stroke="#fff" strokeWidth={h * 0.2} /><path d={`M0,0 L${w},${h} M${w},0 L0,${h}`} stroke="#c8102e" strokeWidth={h * 0.07} />
      <path d={`M${w / 2},0 V${h} M0,${h / 2} H${w}`} stroke="#fff" strokeWidth={h * 0.3} /><path d={`M${w / 2},0 V${h} M0,${h / 2} H${w}`} stroke="#c8102e" strokeWidth={h * 0.18} /></g>;
    case 'prussia': return <g><rect width={w} height={h} fill="#fff" /><rect width={w} height={h * 0.12} fill="#111" /><rect y={h * 0.88} width={w} height={h * 0.12} fill="#111" /><ellipse cx={w / 2} cy={h / 2} rx={w * 0.12} ry={h * 0.25} fill="#111" /></g>;
    case 'burgundy': return <g><rect width={w} height={h} fill="#f6f1e2" /><path d={`M${w * 0.15},${h * 0.1} L${w * 0.85},${h * 0.9} M${w * 0.85},${h * 0.1} L${w * 0.15},${h * 0.9}`} stroke="#c0202e" strokeWidth={h * 0.11} strokeLinecap="round" strokeDasharray={`${h * 0.12} ${h * 0.05}`} /></g>;
    case 'spain': return <g><rect width={w} height={h} fill="#c60b1e" /><rect y={h / 4} width={w} height={h / 2} fill="#ffc400" /></g>;
    case 'prc': return <g><rect width={w} height={h} fill="#de2910" />{star(w * 0.17, h * 0.27, h * 0.15, '#ffde00')}
      {[[0.33, 0.1], [0.4, 0.2], [0.4, 0.35], [0.33, 0.45]].map(([x, y], i) => <g key={i}>{star(w * x, h * y, h * 0.05, '#ffde00', i)}</g>)}</g>;
    case 'roc': return <g><rect width={w} height={h} fill="#fe0000" /><rect width={w / 2} height={h / 2} fill="#000095" /><circle cx={w / 4} cy={h / 4} r={h * 0.1} fill="#fff" />
      {Array.from({length: 12}).map((_, i) => <path key={i} d={`M${w / 4},${h / 4 - h * 0.19} l${h * 0.03},${h * 0.07} l${-h * 0.06},0Z`} fill="#fff" transform={`rotate(${i * 30},${w / 4},${h / 4})`} />)}</g>;
    case 'usa': return <g>{Array.from({length: 13}).map((_, i) => <rect key={i} y={(i * h) / 13} width={w} height={h / 13} fill={i % 2 ? '#fff' : '#b22234'} />)}
      <rect width={w * 0.4} height={(h * 7) / 13} fill="#3c3b6e" />{Array.from({length: 20}).map((_, i) => <circle key={i} cx={w * 0.04 + (i % 5) * w * 0.08} cy={h * 0.06 + Math.floor(i / 5) * h * 0.12} r={h * 0.02} fill="#fff" />)}</g>;
    case 'japan': return <g><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#bc002d" /></g>;
    case 'india': return <g>{tri('#ff9933', '#fff', '#138808', false)}<circle cx={w / 2} cy={h / 2} r={h * 0.12} fill="none" stroke="#000080" strokeWidth={3} /></g>;
    case 'gran_colombia': return <g><rect width={w} height={h / 2} fill="#fcd116" /><rect y={h / 2} width={w} height={h / 4} fill="#003893" /><rect y={(3 * h) / 4} width={w} height={h / 4} fill="#ce1126" /></g>;
    case 'argentina': return <g>{tri('#74acdf', '#fff', '#74acdf', false)}<circle cx={w / 2} cy={h / 2} r={h * 0.09} fill="#f6b40e" /></g>;
    case 'mexico': return <g>{tri('#006847', '#fff', '#ce1126')}<circle cx={w / 2} cy={h / 2} r={h * 0.12} fill="#8a5a2b" /></g>;
    case 'eu': return <g><rect width={w} height={h} fill="#003399" />{Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <g key={i}>{star(w / 2 + Math.cos(a) * h * 0.33, h / 2 + Math.sin(a) * h * 0.33, h * 0.06, '#ffcc00')}</g>; })}</g>;
    case 'austria': return tri('#ed2939', '#fff', '#ed2939', false);
    case 'republica': return tri('#c60b1e', '#ffc400', '#6c2c7c', false);
    case 'germany': return tri('#111', '#dd0000', '#ffce00', false);
    case 'csa': return <g><rect width={w} height={h / 3} fill="#c8102e" /><rect y={h / 3} width={w} height={h / 3} fill="#fff" /><rect y={(2 * h) / 3} width={w} height={h / 3} fill="#c8102e" />
      <rect width={w * 0.38} height={(2 * h) / 3} fill="#1f2f6f" />{Array.from({length: 7}).map((_, i) => { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; return <g key={i}>{star(w * 0.19 + Math.cos(a) * h * 0.2, h / 3 + Math.sin(a) * h * 0.2, h * 0.05, '#fff')}</g>; })}</g>;
    case 'usa1861': return <g>{Array.from({length: 13}).map((_, i) => <rect key={i} y={(i * h) / 13} width={w} height={h / 13} fill={i % 2 ? '#fff' : '#b22234'} />)}
      <rect width={w * 0.4} height={(h * 7) / 13} fill="#3c3b6e" />{Array.from({length: 34}).map((_, i) => <circle key={i} cx={w * 0.03 + (i % 7) * w * 0.055} cy={h * 0.05 + Math.floor(i / 7) * h * 0.1} r={h * 0.016} fill="#fff" />)}</g>;
    case 'nato': return <g><rect width={w} height={h} fill="#004990" /><g transform={`translate(${w / 2},${h / 2})`}><circle r={h * 0.18} fill="none" stroke="#fff" strokeWidth={h * 0.03} />
      <path d={`M0,${-h * 0.36} L${h * 0.06},0 L0,${h * 0.36} L${-h * 0.06},0Z M${-h * 0.36},0 L0,${h * 0.06} L${h * 0.36},0 L0,${-h * 0.06}Z`} fill="#fff" /></g></g>;
    case 'germany1871': return tri('#111', '#fff', '#d7263d', false);
    default: return <rect width={w} height={h} fill="#fff" />;
  }
};
/** bandera ondeando en mástil */
export const Flag: React.FC<{kind: FlagKind; x: number; y: number; w?: number; h?: number; pole?: number; wave?: number; lower?: number; flip?: boolean}> =
  ({kind, x, y, w = 260, h = 170, pole = 420, wave = 1, lower = 0, flip}) => {
    const f = useCurrentFrame(); const id = `fl${kind}${x}${y}`.replace(/[^a-z0-9]/gi, '');
    const segs = 12; const fy = y - pole + 10 + lower * (pole - h - 20);
    const pts = (yy: number) => Array.from({length: segs + 1}).map((_, i) => { const t = i / segs; return [t * w, yy + Math.sin(f / 4.5 - t * 5) * 14 * t * wave]; });
    const top = pts(0), bot = pts(h);
    const d = `M${top.map((p) => p.join(',')).join(' L')} L${bot.reverse().map((p) => p.join(',')).join(' L')}Z`;
    return <g transform={`translate(${x},0) scale(${flip ? -1 : 1},1)`}>
      <rect x={-6} y={y - pole} width={12} height={pole} fill="#9a8f80" stroke={O} strokeWidth={3} /><circle cx={0} cy={y - pole} r={10} fill={C.gold} stroke={O} strokeWidth={3} />
      <g transform={`translate(6,${fy})`}>
        <defs><clipPath id={id}><path d={d} /></clipPath></defs>
        <g clipPath={`url(#${id})`}><FlagFace kind={kind} w={w} h={h + 30} />
          {Array.from({length: segs}).map((_, i) => <rect key={i} x={(i * w) / segs} y={-20} width={w / segs + 1} height={h + 60} fill="#000" opacity={0.18 * (0.5 + 0.5 * Math.sin(f / 4.5 - (i / segs) * 5 + 1.2))} />)}
        </g>
        <path d={d} fill="none" stroke={O} strokeWidth={4} />
      </g>
    </g>;
  };

// ---------------- agua ----------------
export const Sea: React.FC<{y: number; color?: string; color2?: string; amp?: number; rough?: number}> = ({y, color = '#2a5f8a', color2, amp = 14, rough = 1}) => {
  const f = useCurrentFrame(); const c2 = color2 ?? shade(color, -0.25);
  const wave = (yy: number, ph: number, a: number, len: number) => {
    const pts: string[] = []; for (let x = -800; x <= 1900; x += 30) pts.push(`${x},${yy + Math.sin(x / len + f / 12 * rough + ph) * a}`);
    return `M-800,3000 L${pts.join(' L')} L1900,3000Z`;
  };
  return <g>
    <path d={wave(y, 0, amp, 90)} fill={color} />
    {[1, 2, 3, 4].map((i) => <path key={i} d={wave(y + i * 70, i, amp * (1 + i * 0.3), 90 + i * 20)} fill={i % 2 ? c2 : color} opacity={0.6} />)}
    {Array.from({length: 26}).map((_, i) => { const x = (rand(i, 1) * 1400 + f * 1.2) % 1400 - 160; const yy = y + 30 + rand(i, 2) * 500;
      return <path key={'c' + i} d={`M${x},${yy} q20,-10 40,0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.25 + 0.3 * Math.sin(f / 10 + i)} />; })}
  </g>;
};

// ---------------- arquitectura ----------------
export const Kremlin: React.FC<{x: number; y: number; s?: number; night?: boolean}> = ({x, y, s = 1, night}) => {
  const wall = night ? '#7a2a2a' : '#b5473a', wallD = shade(wall, -0.25);
  return <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    {/* muralla almenada */}
    <rect x={-700} y={-160} width={1400} height={160} fill={wall} />
    {Array.from({length: 46}).map((_, i) => <path key={i} d={`M${-700 + i * 30 + 4},-160 l0,-22 l8,8 l8,-8 l0,22Z`} fill={wall} strokeWidth={3} />)}
    {/* torre Spásskaya */}
    <rect x={-80} y={-420} width={160} height={260} fill={wall} />
    <rect x={-60} y={-560} width={120} height={140} fill={wall} />
    <circle cx={0} cy={-490} r={42} fill="#f4ecd8" /><path d="M0,-490 L0,-520 M0,-490 L22,-482" stroke={O} strokeWidth={5} />
    <path d="M-60,-560 L0,-760 L60,-560Z" fill="#3e7a52" />
    <path d="M-50,-560 L-40,-600 L40,-600 L50,-560Z" fill={wallD} />
    <path d="M0,-760 L0,-790" />
    <path d="M0,-850 l12,26 28,2 -22,18 8,28 -26,-16 -26,16 8,-28 -22,-18 28,-2Z" fill="#e8343a" stroke="#ffd166" strokeWidth={3} />
    <path d="M-40,-160 L-40,-260 Q0,-310 40,-260 L40,-160Z" fill="#3a1a18" />
    {/* catedral de San Basilio estilizada */}
    {[[-380, 1, '#d8a23a', '#2f7a5a'], [-300, 1.25, '#c33a3a', '#2f5fa8'], [-210, 0.95, '#2f7a5a', '#e8b33b']].map(([dx, k, c1, c2]: any, i) => (
      <g key={i} transform={`translate(${dx},-160) scale(${k})`}>
        <rect x={-34} y={-180} width={68} height={180} fill="#d9cdb4" />
        <path d={`M-40,-180 Q-60,-250 0,-300 Q60,-250 40,-180Z`} fill={c1} />
        {[0, 1, 2].map((j) => <path key={j} d={`M${-30 + j * 20},-200 Q${-20 + j * 20},-260 ${-10 + j * 20},-200`} stroke={c2} strokeWidth={8} fill="none" />)}
        <path d="M0,-300 L0,-340" /><circle cx={0} cy={-345} r={6} fill={C.gold} />
      </g>))}
    {/* cúpulas doradas */}
    {[[260, 1], [360, 0.8], [460, 1.1]].map(([dx, k], i) => <g key={'g' + i} transform={`translate(${dx},-160) scale(${k})`}>
      <rect x={-40} y={-200} width={80} height={200} fill="#efe6d2" /><rect x={-26} y={-260} width={52} height={60} fill="#efe6d2" />
      <path d="M-30,-260 Q-40,-320 0,-350 Q40,-320 30,-260Z" fill="#e8b33b" /><path d="M0,-350 L0,-390 M-12,-378 L12,-378" />
      {[0, 1, 2].map((j) => <rect key={j} x={-28 + j * 20} y={-170} width={12} height={34} rx={6} fill="#3a3a5a" />)}
    </g>)}
    {night && Array.from({length: 20}).map((_, i) => <rect key={'w' + i} x={-650 + i * 66} y={-120} width={10} height={16} fill="#ffd27a" stroke="none" opacity={0.6} />)}
  </g>;
};
export const RussianWhiteHouse: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4}>
    <rect x={-520} y={-300} width={1040} height={300} fill="#eef0ee" />
    <rect x={-170} y={-620} width={340} height={320} fill="#f4f5f2" />
    <rect x={-110} y={-700} width={220} height={80} fill="#f4f5f2" />
    <rect x={-30} y={-760} width={60} height={60} fill="#cfd6db" />
    {Array.from({length: 14}).map((_, r) => Array.from({length: 8}).map((_, c) => <rect key={r + '-' + c} x={-150 + c * 38} y={-600 + r * 22} width={24} height={12} fill="#9fb5c6" strokeWidth={0} />))}
    {Array.from({length: 7}).map((_, r) => Array.from({length: 24}).map((_, c) => <rect key={'b' + r + '-' + c} x={-500 + c * 42} y={-280 + r * 36} width={28} height={18} fill="#9fb5c6" strokeWidth={0} />))}
  </g>
);
export const BerlinWall: React.FC<{y: number; broken?: number; x0?: number; x1?: number}> = ({y, broken = 0, x0 = -200, x1 = 1280}) => {
  const f = useCurrentFrame(); const n = Math.ceil((x1 - x0) / 120);
  return <g stroke={O} strokeWidth={4}>
    {Array.from({length: n}).map((_, i) => {
      const gone = broken > 0 && i >= Math.floor(n / 2) - 1 && i <= Math.floor(n / 2) + 1;
      const fall = gone ? clamp(broken) : 0;
      return <g key={i} transform={`translate(${x0 + i * 120},${y}) rotate(${fall * (i % 2 ? 80 : -80)},60,0)`} opacity={1 - fall * 0.2}>
        <rect x={0} y={-360} width={116} height={360} fill="#d9d6cf" />
        <rect x={-6} y={-380} width={128} height={30} rx={14} fill="#cfcac0" />
        {i % 2 === 0 && <path d={`M14,-200 q30,-60 60,0 t50,-10`} stroke={['#e74c3c', '#3498db', '#f1c40f', '#2ecc71'][i % 4]} strokeWidth={14} fill="none" />}
        {i % 3 === 1 && <text x={20} y={-120} fontFamily="Anton" fontSize={50} fill={['#8e44ad', '#e67e22'][i % 2]} stroke="none">{['FREI', 'LOVE', '1989', 'NO'][i % 4]}</text>}
      </g>;
    })}
    {broken > 0 && Array.from({length: 14}).map((_, i) => <rect key={'r' + i} x={540 + (rand(i, 2) - 0.5) * 300} y={y - 20 - rand(i, 4) * 30} width={30 + rand(i, 1) * 40} height={22} fill="#cfcac0" transform={`rotate(${rand(i, 5) * 60})`} opacity={clamp(broken)} />)}
  </g>;
};
export const Skyline: React.FC<{y: number; color: string; seed?: number; windows?: string; h?: number; n?: number; tall?: number}> = ({y, color, seed = 1, windows, h = 400, n = 16, tall}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const w = 70 + rand(i, seed) * 90; const x = -200 + i * (1500 / n); const hh = h * (0.4 + rand(i, seed + 1) * 0.8) * (tall === i ? 2.2 : 1);
    return <g key={i}><rect x={x} y={y - hh} width={w} height={hh} fill={color} />
      {windows && Array.from({length: Math.floor(hh / 40)}).map((_, r) => Array.from({length: Math.floor(w / 26)}).map((_, c) =>
        rand(i * 100 + r * 10 + c, seed) > 0.45 ? <rect key={r + '-' + c} x={x + 8 + c * 26} y={y - hh + 14 + r * 40} width={12} height={18} fill={windows} opacity={0.8} /> : null))}
    </g>;
  })}</g>
);
export const Taipei101: React.FC<{x: number; y: number; s?: number; color?: string; lit?: boolean}> = ({x, y, s = 1, color = '#5f8a7a', lit = true}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    <path d="M-70,0 L-60,-250 L60,-250 L70,0Z" fill={color} />
    {Array.from({length: 8}).map((_, i) => <path key={i} d={`M-52,${-250 - i * 90} L-66,${-340 - i * 90} L66,${-340 - i * 90} L52,${-250 - i * 90}Z`} fill={shade(color, i % 2 ? 0.05 : -0.05)} />)}
    <rect x={-30} y={-1010} width={60} height={60} fill={color} /><path d="M-6,-1010 L0,-1160 L6,-1010Z" fill="#cfd6db" />
    {lit && Array.from({length: 8}).map((_, i) => <path key={'l' + i} d={`M-50,${-262 - i * 90} L50,${-262 - i * 90}`} stroke="#ffe08a" strokeWidth={3} opacity={0.8} />)}
  </g>
);
export const Fab: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const f = useCurrentFrame();
  return <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4}>
    <rect x={-420} y={-260} width={840} height={260} fill="#e7ecf2" /><rect x={-420} y={-290} width={840} height={30} fill="#c4ced8" />
    {Array.from({length: 9}).map((_, i) => <rect key={i} x={-390 + i * 92} y={-220} width={60} height={110} fill="#8fb7d8" />)}
    <rect x={-120} y={-120} width={240} height={120} fill="#5a6b7a" /><text x={0} y={-150} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={54} fill="#2b4f7a" stroke="none">FAB</text>
    {[-300, 300].map((cx) => <g key={cx}><rect x={cx - 24} y={-380} width={48} height={90} fill="#c4ced8" /><Smoke x={cx} y={-380} n={6} color="#e8eef5" spread={30} rise={300} size={0.5} opacity={0.5} /></g>)}
    {Array.from({length: 9}).map((_, i) => <rect key={'g' + i} x={-390 + i * 92} y={-220} width={60} height={110} fill="#bfe3ff" stroke="none" opacity={0.3 + 0.3 * Math.sin(f / 10 + i)} />)}
  </g>;
};
export const ClassicBuilding: React.FC<{x: number; y: number; s?: number; color?: string; title?: string; cols?: number}> = ({x, y, s = 1, color = '#e8dcc0', title, cols = 8}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    <rect x={-460} y={-420} width={920} height={420} fill={color} />
    <path d="M-500,-420 L0,-600 L500,-420Z" fill={shade(color, 0.08)} /><path d="M-400,-440 L0,-570 L400,-440Z" fill={shade(color, -0.1)} />
    {Array.from({length: cols}).map((_, i) => <g key={i}><rect x={-420 + i * (840 / (cols - 1)) - 18} y={-400} width={36} height={360} fill={shade(color, 0.12)} />
      <rect x={-420 + i * (840 / (cols - 1)) - 26} y={-410} width={52} height={16} fill={shade(color, -0.05)} /></g>)}
    <rect x={-480} y={-40} width={960} height={40} fill={shade(color, -0.15)} />
    {title && <text x={0} y={-450} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={34} fill={O} stroke="none" letterSpacing={3}>{title}</text>}
    <path d="M-50,-40 L-50,-200 Q0,-250 50,-200 L50,-40Z" fill="#3a2a20" />
  </g>
);
export const Cathedral: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#e9d8b0'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    <rect x={-180} y={-380} width={360} height={380} fill={color} />
    {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 230},0)`}><rect x={-70} y={-640} width={140} height={640} fill={color} />
      <rect x={-50} y={-720} width={100} height={80} fill={shade(color, 0.08)} /><path d="M-50,-720 Q0,-820 50,-720Z" fill="#c9a24a" /><path d="M0,-800 L0,-860 M-16,-840 L16,-840" />
      <path d="M-24,-560 L-24,-480 Q0,-510 24,-480 L24,-560 Q0,-590 -24,-560Z" fill="#3a2a20" /></g>)}
    <path d="M-180,-380 L0,-480 L180,-380Z" fill={shade(color, -0.08)} /><circle cx={0} cy={-260} r={50} fill="#7aa0c8" />
    <path d="M-60,0 L-60,-150 Q0,-210 60,-150 L60,0Z" fill="#5a3a24" />
  </g>
);
export const Palace: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#efe6d0'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={O} strokeWidth={4}>
    <rect x={-640} y={-360} width={1280} height={360} fill={color} /><rect x={-660} y={-390} width={1320} height={30} fill={shade(color, -0.1)} />
    {Array.from({length: 18}).map((_, i) => <g key={i}><rect x={-600 + i * 70} y={-320} width={34} height={70} fill="#7b98b5" /><rect x={-600 + i * 70} y={-200} width={34} height={90} fill="#7b98b5" /></g>)}
    {Array.from({length: 30}).map((_, i) => <rect key={'b' + i} x={-640 + i * 44} y={-420} width={20} height={30} fill={color} />)}
    <rect x={-60} y={-110} width={120} height={110} fill="#5a3a24" />
  </g>
);
export const Wall: React.FC<{y: number; color?: string}> = ({y, color = '#cfc2a6'}) => (
  <g stroke={O} strokeWidth={3}><rect x={-800} y={y - 900} width={2680} height={900} fill={color} />
    {Array.from({length: 12}).map((_, r) => Array.from({length: 26}).map((_, c) => <rect key={r + '-' + c} x={-800 + c * 110 + (r % 2) * 55} y={y - 900 + r * 75} width={110} height={75} fill="none" stroke={shade(color, -0.12)} strokeWidth={3} />))}
  </g>
);

// ---------------- vehículos ----------------
export const Tank: React.FC<{x: number; y: number; s?: number; color?: string; facing?: number; moving?: boolean; turret?: number; star?: boolean}> =
  ({x, y, s = 1, color = '#5d6b3c', facing = 1, moving = true, turret = 0, star = true}) => {
    const f = useCurrentFrame(); const rumble = moving ? Math.sin(f * 1.7) * 2 : 0;
    return <g transform={`translate(${x},${y + rumble}) scale(${s * facing},${s})`} stroke={O} strokeWidth={5} strokeLinejoin="round">
      <path d="M-260,-20 Q-280,-60 -240,-80 L240,-80 Q290,-60 260,-20 Q240,10 200,10 L-200,10 Q-240,10 -260,-20Z" fill="#2c2c2a" />
      {Array.from({length: 7}).map((_, i) => <g key={i} transform={`translate(${-210 + i * 70},-30) rotate(${moving ? f * 12 : 0})`}><circle r={30} fill="#4a4a46" /><path d="M-20,0 L20,0 M0,-20 L0,20" stroke="#2a2a28" /></g>)}
      <path d="M-250,-80 L-230,-130 L240,-130 L270,-80Z" fill={color} />
      <g transform={`rotate(${turret},20,-150)`}>
        <path d="M-120,-130 Q-110,-210 20,-215 Q130,-210 140,-130Z" fill={shade(color, 0.08)} />
        <rect x={120} y={-188} width={270} height={22} rx={8} fill={shade(color, -0.1)} />
        <rect x={380} y={-194} width={30} height={34} rx={6} fill={shade(color, -0.2)} />
        {star && <path d="M-30,-180 l7,14 16,1 -12,10 4,16 -15,-9 -15,9 4,-16 -12,-10 16,-1Z" fill="#d7263d" stroke="none" />}
      </g>
    </g>;
  };
export const Galleon: React.FC<{x: number; y: number; s?: number; flag?: FlagKind; sails?: string; hull?: string; facing?: number}> =
  ({x, y, s = 1, flag = 'burgundy', sails = '#f2ead6', hull = '#6b3f22', facing = 1}) => {
    const f = useCurrentFrame(); const rock = Math.sin(f / 18) * 2.5; const bob = Math.sin(f / 14) * 8;
    const billow = 1 + Math.sin(f / 10) * 0.03;
    return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s}) rotate(${rock})`} stroke={O} strokeWidth={5} strokeLinejoin="round">
      <path d="M-300,-100 L-260,40 Q0,90 260,40 L330,-140 L230,-120 L200,-80 L-160,-80 L-220,-180 L-320,-170Z" fill={hull} />
      <path d="M-280,-60 L300,-60" stroke="#e8b33b" strokeWidth={6} />{Array.from({length: 6}).map((_, i) => <rect key={i} x={-180 + i * 70} y={-40} width={24} height={20} fill="#2a1a10" />)}
      {[-150, 30, 200].map((mx, i) => <g key={i}><rect x={mx - 6} y={-560 + i * 40} width={12} height={480 - i * 40} fill="#5a3a20" />
        {[0, 1].map((k) => <path key={k} transform={`translate(${mx},${-500 + i * 40 + k * 200}) scale(${billow},1)`} d="M-110,0 Q0,-14 110,0 Q120,80 100,160 Q0,140 -100,160 Q-120,80 -110,0Z" fill={sails} />)}
        {i === 1 && <path transform={`translate(${mx},-260) scale(${billow},1)`} d="M-60,-120 L60,-120 L50,-20 L-50,-20Z" fill="none" stroke="#c0202e" strokeWidth={10} strokeDasharray="10 6" opacity={0} />}
      </g>)}
      <path d={`M30,-380 L80,-300 M80,-380 L30,-300`} stroke="#c0202e" strokeWidth={14} strokeLinecap="round" opacity={flag === 'burgundy' ? 0.9 : 0} />
      <g transform="translate(36,-600)"><rect x={0} y={0} width={70 + Math.sin(f / 4) * 4} height={44} fill="#fff" /><FlagMini kind={flag} /></g>
    </g>;
  };
const FlagMini: React.FC<{kind: FlagKind}> = ({kind}) => <g><FlagFace kind={kind} w={74} h={44} /></g>;
export const Warship: React.FC<{x: number; y: number; s?: number; color?: string; facing?: number; flag?: FlagKind; firing?: number}> =
  ({x, y, s = 1, color = '#7c8792', facing = 1, flag, firing}) => {
    const f = useCurrentFrame(); const bob = Math.sin(f / 16 + x) * 6;
    return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s})`} stroke={O} strokeWidth={5} strokeLinejoin="round">
      <path d="M-420,-60 L440,-60 L380,30 L-380,30Z" fill={shade(color, -0.15)} />
      <path d="M-300,-60 L-280,-150 L80,-150 L100,-60Z" fill={color} /><path d="M-160,-150 L-140,-290 L-40,-290 L-20,-150Z" fill={color} />
      <rect x={-100} y={-370} width={12} height={80} fill={O} /><path d="M-130,-330 L-60,-330" />
      <g><rect x={160} y={-100} width={80} height={40} rx={8} fill={color} /><rect x={230} y={-92} width={110} height={12} fill={shade(color, -0.2)} /></g>
      <rect x={-260} y={-110} width={40} height={30} fill="#3a4450" />{Array.from({length: 6}).map((_, i) => <rect key={i} x={-250 + i * 50} y={-130} width={20} height={14} fill="#c9e3f5" strokeWidth={2} />)}
      {flag && <g transform="translate(-94,-420)"><FlagFace kind={flag} w={70} h={44} /></g>}
      {firing !== undefined && f - firing >= 0 && f - firing < 8 && <circle cx={360} cy={-86} r={30 + (f - firing) * 8} fill="#fff1b0" stroke="none" opacity={1 - (f - firing) / 8} />}
    </g>;
  };
export const LandingCraft: React.FC<{x: number; y: number; s?: number; color?: string; facing?: number}> = ({x, y, s = 1, color = '#6a7560', facing = 1}) => {
  const f = useCurrentFrame(); const bob = Math.sin(f / 9 + x * 0.01) * 7;
  return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s}) rotate(${Math.sin(f / 11 + x) * 2})`} stroke={O} strokeWidth={4}>
    <path d="M-160,-70 L150,-70 L190,-20 L170,20 L-160,20Z" fill={color} /><rect x={-150} y={-110} width={60} height={40} fill={shade(color, -0.15)} />
    {Array.from({length: 6}).map((_, i) => <circle key={i} cx={-60 + i * 36} cy={-80} r={14} fill="#4c5a3a" />)}
    <path d="M-170,10 q-30,10 -60,0" stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
  </g>;
};
export const Carrier: React.FC<{x: number; y: number; s?: number; facing?: number}> = ({x, y, s = 1, facing = 1}) => {
  const f = useCurrentFrame(); const bob = Math.sin(f / 22) * 4;
  return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s})`} stroke={O} strokeWidth={5}>
    <path d="M-560,-60 L600,-60 L540,40 L-500,40Z" fill="#6c7782" /><path d="M-600,-80 L640,-80 L620,-60 L-580,-60Z" fill="#8a95a0" />
    <path d="M-500,-80 L560,-80" stroke="#fff" strokeWidth={3} strokeDasharray="30 20" /><rect x={200} y={-200} width={90} height={120} fill="#8a95a0" /><rect x={230} y={-260} width={10} height={60} fill={O} />
    {[-300, -150, 0].map((px) => <path key={px} d={`M${px},-90 l40,-10 l20,10 l-20,10Z`} fill="#5a646e" strokeWidth={3} />)}
  </g>;
};
export const Jet: React.FC<{x: number; y: number; s?: number; color?: string; facing?: number}> = ({x, y, s = 1, color = '#7f8a94', facing = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    <path d="M-160,0 L120,-10 Q170,0 120,10Z" fill={color} /><path d="M-20,0 L-90,-80 L-50,-80 L40,-4Z" fill={shade(color, -0.12)} /><path d="M-20,4 L-90,80 L-50,80 L40,6Z" fill={shade(color, -0.2)} />
    <path d="M-150,0 L-190,-50 L-160,-50 L-120,-4Z" fill={shade(color, -0.12)} /><path d="M60,-8 Q90,-20 110,-6Z" fill="#9ed0f0" />
    <path d="M-170,0 L-260,0" stroke="#ffb347" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
  </g>
);
export const Missile: React.FC<{x0: number; y0: number; x1: number; y1: number; at: number; dur: number; arc?: number}> = ({x0, y0, x1, y1, at, dur, arc = 300}) => {
  const f = useCurrentFrame(); const k = (f - at) / dur; if (k < 0 || k > 1) return null;
  const pos = (t: number) => [lerp(x0, x1, t), lerp(y0, y1, t) - Math.sin(Math.PI * t) * arc];
  const [x, y] = pos(k); const [px, py] = pos(Math.max(0, k - 0.02)); const ang = (Math.atan2(y - py, x - px) * 180) / Math.PI;
  const trail = Array.from({length: 14}).map((_, i) => pos(Math.max(0, k - i * 0.02)));
  return <g><path d={'M' + trail.map((p) => p.join(',')).join(' L')} stroke="#e8e2d8" strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />
    <g transform={`translate(${x},${y}) rotate(${ang})`} stroke={O} strokeWidth={3}><path d="M-40,-8 L30,-8 L50,0 L30,8 L-40,8Z" fill="#dfe3e6" /><path d="M-40,0 L-70,0" stroke="#ffb347" strokeWidth={10} /></g></g>;
};
export const Cannon: React.FC<{x: number; y: number; s?: number; facing?: number; fireAt?: number[]}> = ({x, y, s = 1, facing = 1, fireAt = []}) => {
  const f = useCurrentFrame(); const last = fireAt.filter((a) => f >= a).pop(); const k = last !== undefined ? (f - last) : 99;
  const recoil = k < 10 ? -20 * (1 - k / 10) : 0;
  return <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} stroke={O} strokeWidth={4}>
    <g transform={`translate(${recoil},0) rotate(-12)`}><rect x={-60} y={-90} width={200} height={40} rx={18} fill="#3a3a3a" /><rect x={130} y={-94} width={20} height={48} rx={6} fill="#2a2a2a" /></g>
    <path d="M-80,-40 L60,-60 L40,0 L-80,0Z" fill="#6b4a2b" /><circle cx={0} cy={-10} r={46} fill="none" stroke="#4a3220" strokeWidth={12} /><circle cx={0} cy={-10} r={8} fill="#4a3220" />
    {k < 14 && <><circle cx={170} cy={-110} r={20 + k * 10} fill="#fff1b0" opacity={1 - k / 14} stroke="none" /><circle cx={200} cy={-130} r={40 + k * 12} fill="#bbb" opacity={0.7 * (1 - k / 14)} stroke="none" /></>}
  </g>;
};
export const Shuttle: React.FC<{x: number; y: number; s?: number; launch?: number}> = ({x, y, s = 1, launch}) => {
  const f = useCurrentFrame(); const k = launch !== undefined ? Math.max(0, f - launch) : 0; const lift = k * k * 0.25;
  return <g transform={`translate(${x},${y - lift}) scale(${s})`} stroke={O} strokeWidth={4} strokeLinejoin="round">
    {launch !== undefined && f >= launch && <g stroke="none"><ellipse cx={0} cy={80} rx={60} ry={160 + Math.sin(f) * 20} fill="#ffb347" opacity={0.9} /><ellipse cx={0} cy={60} rx={30} ry={100} fill="#fff4c4" /></g>}
    <rect x={-50} y={-520} width={100} height={540} rx={50} fill="#e9e4d8" /><rect x={-50} y={-200} width={100} height={30} fill="#d7263d" />
    <text x={0} y={-380} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#d7263d" stroke="none" transform="rotate(-90,0,-380)">ЭНЕРГИЯ</text>
    <g transform="translate(90,-120)"><path d="M-30,-300 Q0,-360 30,-300 L40,0 L-40,0Z" fill="#f4f4f4" /><path d="M-40,-40 L-110,20 L-40,10Z M40,-40 L110,20 L40,10Z" fill="#f4f4f4" /><path d="M-30,-300 Q0,-360 30,-300 L28,-260 L-28,-260Z" fill="#2a2a2a" />
      <text x={0} y={-150} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#1f3f95" stroke="none" transform="rotate(-90,0,-150)">БУРАН</text></g>
  </g>;
};

// ---------------- multitudes y ejércitos ----------------
export const Crowd: React.FC<{y: number; n?: number; x0?: number; x1?: number; colors?: string[]; s?: number; cheer?: boolean; seed?: number; flags?: string[]}> =
  ({y, n = 30, x0 = -100, x1 = 1180, colors = ['#4d4a46', '#7a2e3a', '#3b4250', '#5a6b7a', '#6b5a3a'], s = 1, cheer, seed = 1, flags}) => {
    const f = useCurrentFrame();
    return <g stroke={O} strokeWidth={3}>{Array.from({length: n}).map((_, i) => {
      const x = lerp(x0, x1, (i + rand(i, seed) * 0.6) / n); const yy = y + rand(i, seed + 1) * 50; const sc = s * (0.85 + rand(i, seed + 2) * 0.3);
      const jump = cheer ? Math.max(0, Math.sin(f / 4 + i)) * 14 : Math.sin(f / 15 + i) * 2; const col = colors[i % colors.length];
      const arm = cheer ? -60 - Math.sin(f / 4 + i) * 20 : 10;
      return <g key={i} transform={`translate(${x},${yy - jump}) scale(${sc})`}>
        <path d={`M-10,-90 L${-30 + (cheer ? -10 : 0)},${-90 + arm}`} stroke={col} strokeWidth={14} strokeLinecap="round" />
        <path d="M-34,0 Q-38,-100 0,-104 Q38,-100 34,0Z" fill={col} />
        <circle cx={0} cy={-128} r={26} fill={['#f6cfae', '#e9b48e', '#d39a6a'][i % 3]} />
        <path d={`M-24,-138 Q0,-170 24,-138`} fill={['#3a2a20', '#7a5a3a', '#222', '#aaa'][i % 4]} />
        {flags && i % 5 === 2 && <g transform="translate(26,-110)"><rect x={-3} y={-150} width={6} height={160} fill="#6b4a2b" /><g transform={`translate(3,-150) skewY(${Math.sin(f / 5 + i) * 6})`}><FlagFace kind={flags[i % flags.length] as FlagKind} w={90} h={58} /></g></g>}
      </g>;
    })}</g>;
  };
/** soldado en vista lateral para formaciones */
export const MiniSoldier: React.FC<{x: number; y: number; s?: number; coat: string; pants?: string; hat?: 'shako' | 'bearskin' | 'helmet' | 'bicorne' | 'cap' | 'ushanka'; hatColor?: string; facing?: number; phase?: number; marching?: boolean; rifle?: boolean}> =
  ({x, y, s = 1, coat, pants = '#eee', hat = 'shako', hatColor = '#1a1a1a', facing = 1, phase = 0, marching = true, rifle = true}) => {
    const f = useCurrentFrame(); const ph = f / 4 + phase; const sw = marching ? Math.sin(ph) * 22 : 0; const bob = marching ? Math.abs(Math.cos(ph)) * -4 : 0;
    return <g transform={`translate(${x},${y + bob}) scale(${s * facing},${s})`} stroke={O} strokeWidth={3} strokeLinejoin="round">
      <path d={`M0,-60 L${sw * 0.9},0`} stroke={pants} strokeWidth={14} strokeLinecap="round" /><path d={`M0,-60 L${-sw * 0.9},0`} stroke={shade(pants, -0.15)} strokeWidth={14} strokeLinecap="round" />
      <rect x={-16} y={-120} width={32} height={66} rx={10} fill={coat} />
      {rifle && <path d="M14,-150 L18,-40" stroke="#5b4632" strokeWidth={6} />}
      <circle cx={2} cy={-136} r={16} fill="#f0c8a8" />
      {hat === 'shako' && <rect x={-14} y={-176} width={30} height={30} fill={hatColor} />}
      {hat === 'bearskin' && <path d="M-16,-146 Q-20,-196 2,-200 Q24,-196 18,-146Z" fill={hatColor} />}
      {hat === 'helmet' && <path d="M-18,-138 Q2,-170 22,-138Z" fill={hatColor} />}
      {hat === 'bicorne' && <path d="M-26,-146 Q2,-176 30,-146Z" fill={hatColor} />}
      {hat === 'cap' && <path d="M-16,-146 L-14,-160 L18,-160 L24,-146Z" fill={hatColor} />}
      {hat === 'ushanka' && <rect x={-18} y={-162} width={40} height={24} rx={8} fill={hatColor} />}
      <path d={`M-4,-110 L${10 + sw * 0.4},-72`} stroke={coat} strokeWidth={11} strokeLinecap="round" />
    </g>;
  };
export const Army: React.FC<{x: number; y: number; rows?: number; cols?: number; dx?: number; dy?: number; s?: number; speed?: number; soldier: Omit<React.ComponentProps<typeof MiniSoldier>, 'x' | 'y'>; flag?: FlagKind}> =
  ({x, y, rows = 4, cols = 10, dx = 70, dy = 46, s = 1, speed = 0, soldier, flag}) => {
    const f = useCurrentFrame(); const items: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const sc = s * (0.8 + r * 0.08);
      items.push(<MiniSoldier key={r + '-' + c} {...soldier} x={x + c * dx * sc + r * 20 + f * speed} y={y + r * dy} s={sc} phase={(c + r) * 0.7} />);
    }
    return <g>{flag && <Flag kind={flag} x={x + f * speed + cols * dx * s * 0.5} y={y + rows * dy - 40} w={150} h={100} pole={340} />}{items}</g>;
  };
