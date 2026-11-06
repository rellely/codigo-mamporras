// Mapas animados geográficamente correctos (Natural Earth vía world-atlas + d3-geo).
// Relleno progresivo de países, flechas de avance, etiquetas, ciudades con pulso y globo giratorio.
import React, {useMemo} from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import {geoPath, geoMercator, geoOrthographic, geoConicConformal, geoGraticule10, GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import world50 from '../assets/maps/countries-50m.json';
import world110 from '../assets/maps/countries-110m.json';
import {C, FONT_TITLE, FONT_UI, clamp, tween, easeOut} from './core';

const fc50: any = feature(world50 as any, (world50 as any).objects.countries);
const fc110: any = feature(world110 as any, (world110 as any).objects.countries);

export type ProjCfg = {type: 'mercator' | 'conic' | 'ortho'; center: [number, number]; scale: number; rotate?: [number, number, number]; parallels?: [number, number]; detail?: 50 | 110};
export const makeProj = (p: ProjCfg): GeoProjection => {
  let pr: GeoProjection;
  if (p.type === 'ortho') pr = geoOrthographic().rotate(p.rotate ?? [-p.center[0], -p.center[1], 0]).clipAngle(90);
  else if (p.type === 'conic') pr = geoConicConformal().parallels(p.parallels ?? [40, 60]).rotate([-p.center[0], 0]).center([0, p.center[1]]);
  else pr = geoMercator().center(p.center);
  pr.scale(p.scale).translate([540, 960]);
  if (p.type !== 'ortho') pr.clipExtent([[-700, -700], [1780, 2620]]);
  return pr;
};

export interface MapTheme {sea: string; sea2: string; land: string; landShade: string; border: string; grid?: string; label: string; paper?: boolean}
export const THEMES: Record<string, MapTheme> = {
  parchment: {sea: '#bcd3d0', sea2: '#9fbdb9', land: '#efe2c0', landShade: '#c9b48a', border: '#8a7350', grid: '#7a8f8c', label: '#3a2a1a', paper: true},
  modern: {sea: '#0f2a44', sea2: '#0a1d31', land: '#2d4a62', landShade: '#132a3e', border: '#6e93b3', grid: '#244a6a', label: '#e8f1ff'},
  cold: {sea: '#1c2c3c', sea2: '#121e2a', land: '#d7d2c4', landShade: '#9c968a', border: '#6b655c', grid: '#2e4256', label: '#f2efe6'},
  vintage: {sea: '#8fb1b8', sea2: '#6f949c', land: '#e8d9b0', landShade: '#b39b6e', border: '#7a6440', grid: '#56787f', label: '#2b1d10', paper: true},
};

export interface Fill {names: string[]; color: string; at: number; dur?: number; stagger?: number; glow?: boolean; until?: number; out?: number}
export interface Arrow {from: [number, number]; to: [number, number]; at: number; dur?: number; color?: string; curve?: number; width?: number; label?: string; dashed?: boolean}
export interface Label {at: [number, number]; text: string; from: number; size?: number; color?: string; sub?: string; until?: number; bg?: string; dx?: number; dy?: number}
export interface Pin {at: [number, number]; from: number; color?: string; label?: string; until?: number; big?: boolean; dx?: number; dy?: number}

export const MapView: React.FC<{
  proj: ProjCfg; theme?: keyof typeof THEMES; fills?: Fill[]; arrows?: Arrow[]; labels?: Label[]; pins?: Pin[];
  zoom?: [number, number][]; // [frame, z] centrado en foco
  focus?: [number, number]; // lon,lat del punto que se mantiene centrado al hacer zoom
  rotateKeys?: [number, number, number][]; // globo: [frame, lon, lat]
  children?: React.ReactNode; hideGrid?: boolean; dim?: string[]; dimColor?: string;
}> = ({proj, theme = 'parchment', fills = [], arrows = [], labels = [], pins = [], zoom, focus, rotateKeys, children, hideGrid, dim}) => {
  const f = useCurrentFrame(); const T = THEMES[theme];
  const isGlobe = proj.type === 'ortho';
  // rotación del globo por fotogramas
  let rot = proj.rotate;
  if (isGlobe && rotateKeys) {
    const k = rotateKeys; let lon = k[0][1], lat = k[0][2];
    for (let i = 0; i < k.length - 1; i++) if (f >= k[i][0]) { lon = tween(f, k[i][0], k[i + 1][0], k[i][1], k[i + 1][1]); lat = tween(f, k[i][0], k[i + 1][0], k[i][2], k[i + 1][2]); }
    rot = [-lon, -lat, 0];
  }
  const cfg = {...proj, rotate: rot};
  const key = JSON.stringify(cfg);
  const data = proj.detail === 110 || isGlobe ? fc110 : fc50;
  const {paths, projection, grid, sphere} = useMemo(() => {
    const pr = makeProj(cfg); const gp = geoPath(pr);
    const paths: Record<string, string> = {};
    for (const ft of data.features) { const d = gp(ft); if (d && d.length > 4) paths[ft.properties.name] = d; }
    return {paths, projection: pr, grid: gp(geoGraticule10()) ?? '', sphere: gp({type: 'Sphere'} as any) ?? ''};
  }, [key]);
  const P = (ll: [number, number]) => projection(ll) ?? [0, 0];
  // zoom de cámara sobre el mapa
  let z = 1;
  if (zoom) { z = zoom[0][1]; for (let i = 0; i < zoom.length - 1; i++) if (f >= zoom[i][0]) z = tween(f, zoom[i][0], zoom[i + 1][0], zoom[i][1], zoom[i + 1][1]); }
  const [fx, fy] = focus ? P(focus) : [540, 960];
  const tr = `translate(540,960) scale(${z}) translate(${-fx},${-fy})`;
  const sw = 1 / z;
  const fillOf: Record<string, {color: string; a: number; glow?: boolean}> = {};
  fills.forEach((fl) => fl.names.forEach((n, i) => {
    const st = fl.at + i * (fl.stagger ?? 0); let a = tween(f, st, st + (fl.dur ?? 15), 0, 1);
    if (fl.until !== undefined) a *= 1 - tween(f, fl.until, fl.until + (fl.out ?? 12), 0, 1);
    if (a > 0) fillOf[n] = {color: fl.color, a, glow: fl.glow};
  }));
  return (
    <g>
      <defs>
        <radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor={T.sea} /><stop offset="1" stopColor={T.sea2} /></radialGradient>
        <filter id="landSh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx={0} dy={6 * sw} stdDeviation={6 * sw} floodColor="#000" floodOpacity={0.35} /></filter>
        <filter id="glowF"><feGaussianBlur stdDeviation={8 * sw} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {!isGlobe && <rect x={-200} y={-200} width={1480} height={2320} fill="url(#seaG)" />}
      <g transform={tr}>
        {isGlobe && <><circle cx={540} cy={960} r={proj.scale * 1.08} fill={T.sea} opacity={0.25} /><path d={sphere} fill="url(#seaG)" stroke={T.border} strokeWidth={3} /></>}
        {!hideGrid && <path d={grid} fill="none" stroke={T.grid} strokeWidth={1.2 * sw} opacity={0.35} />}
        <g transform={`translate(0,${5 * sw})`} opacity={0.35}>{Object.entries(paths).map(([n, d]) => <path key={'s' + n} d={d} fill="#000" />)}</g>
        <g>
          {Object.entries(paths).map(([n, d]) => <path key={n} d={d} fill={dim?.includes(n) ? T.landShade : T.land} stroke={T.border} strokeWidth={1.4 * sw} strokeLinejoin="round" />)}
        </g>
        {Object.entries(fillOf).map(([n, v]) => paths[n] && v.glow ? <path key={'g' + n} d={paths[n]} fill="none" stroke={v.color} strokeWidth={14 * sw} opacity={0.3 * v.a} strokeLinejoin="round" /> : null)}
        {Object.entries(fillOf).map(([n, v]) => paths[n] ? <path key={'f' + n} d={paths[n]} fill={v.color} opacity={0.88 * v.a} stroke={v.color} strokeWidth={1.5 * sw} /> : null)}
        {Object.entries(fillOf).map(([n, v]) => paths[n] ? <path key={'b' + n} d={paths[n]} fill="none" stroke="#fff" strokeOpacity={0.35 * v.a} strokeWidth={1.2 * sw} /> : null)}
        {arrows.map((a, i) => <MapArrow key={i} a={a} P={P} f={f} sw={sw} />)}
        {pins.map((p, i) => {
          if (f < p.from || (p.until !== undefined && f > p.until)) return null;
          const [x, y] = P(p.at); const k = clamp((f - p.from) / 10); const pulse = ((f - p.from) % 40) / 40;
          return <g key={'p' + i} transform={`translate(${x},${y}) scale(${sw})`}>
            <circle r={10 + pulse * 40} fill="none" stroke={p.color ?? C.yellow} strokeWidth={4} opacity={1 - pulse} />
            <circle r={(p.big ? 14 : 10) * easeOut(k)} fill={p.color ?? C.yellow} stroke={C.ink} strokeWidth={4} />
            {p.label && <text x={18 + (p.dx ?? 0)} y={8 + (p.dy ?? 0)} fontFamily={FONT_UI} fontWeight={800} fontSize={34} fill="#fff" stroke={C.ink} strokeWidth={8} paintOrder="stroke" opacity={k}>{p.label}</text>}
          </g>;
        })}
        {labels.map((l, i) => {
          if (f < l.from || (l.until !== undefined && f > l.until + 10)) return null;
          const [x, y] = P(l.at); const k = easeOut(clamp((f - l.from) / 12)) * (l.until !== undefined ? 1 - clamp((f - l.until) / 10) : 1);
          return <g key={'l' + i} transform={`translate(${x + (l.dx ?? 0) * sw},${y + (l.dy ?? 0) * sw}) scale(${sw * (0.6 + 0.4 * k)})`} opacity={k}>
            <text textAnchor="middle" fontFamily={FONT_TITLE} fontSize={l.size ?? 56} fill={l.color ?? T.label} stroke={isLight(l.color ?? T.label) ? '#0d0a12' : '#fff'} strokeWidth={10} paintOrder="stroke" letterSpacing={2}>{l.text}</text>
            {l.sub && <text y={(l.size ?? 56) * 0.75} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={(l.size ?? 56) * 0.45} fill={l.color ?? T.label} stroke={isLight(l.color ?? T.label) ? '#0d0a12' : '#fff'} strokeWidth={7} paintOrder="stroke">{l.sub}</text>}
          </g>;
        })}
        {children}
      </g>
      {T.paper && <PaperTexture />}
    </g>
  );
};

const MapArrow: React.FC<{a: Arrow; P: (ll: [number, number]) => number[]; f: number; sw: number}> = ({a, P, f, sw}) => {
  const k = tween(f, a.at, a.at + (a.dur ?? 30), 0, 1); if (k <= 0) return null;
  const [x0, y0] = P(a.from), [x1, y1] = P(a.to);
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; const dx = x1 - x0, dy = y1 - y0; const c = a.curve ?? 0.25;
  const cx = mx - dy * c, cy = my + dx * c;
  const pt = (t: number) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
  const N = 40; const pts = Array.from({length: Math.max(2, Math.ceil(N * k))}).map((_, i, arr) => pt((i / (arr.length - 1)) * k));
  const [hx, hy] = pts[pts.length - 1]; const [px, py] = pts[Math.max(0, pts.length - 3)];
  const ang = (Math.atan2(hy - py, hx - px) * 180) / Math.PI; const w = (a.width ?? 14) * sw; const col = a.color ?? '#d7263d';
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return <g>
    <path d={d} stroke={C.ink} strokeWidth={w + 8 * sw} fill="none" strokeLinecap="round" strokeDasharray={a.dashed ? `${30 * sw} ${20 * sw}` : undefined} />
    <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={a.dashed ? `${30 * sw} ${20 * sw}` : undefined} />
    <g transform={`translate(${hx},${hy}) rotate(${ang}) scale(${sw})`}><path d="M-10,-30 L36,0 L-10,30 L0,0Z" fill={col} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" /></g>
    {a.label && k > 0.5 && <text x={pt(0.5)[0]} y={pt(0.5)[1] - 20 * sw} textAnchor="middle" fontFamily={FONT_UI} fontWeight={900} fontSize={32 * sw} fill="#fff" stroke={C.ink} strokeWidth={7 * sw} paintOrder="stroke">{a.label}</text>}
  </g>;
};

const PaperTexture: React.FC = () => <image href={staticFile('backgrounds/paper.png')} x={0} y={0} width={1080} height={1920} preserveAspectRatio="none" />;

const isLight = (hex: string) => { const n = parseInt(hex.replace('#', '').padEnd(6, hex.slice(-1)), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 > 150; };
export const projectLL = (proj: ProjCfg, ll: [number, number]) => makeProj(proj)(ll) ?? [0, 0];
