// EPISODIO 7 — ¿Y si el ser humano nunca hubiera existido?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand, lerp} from '../../components/core';
import {Camera, Clouds, Fire, Ground, Haze, Layer, LightRays, Moon, Mountains, Ridge, Sea, Sky, Smoke, Snow, Stage, Stars, Sun, Tree, Dust, Skyline} from '../../components/World';
import {Mammoth, Sloth, Wolf, Deer, Birds, Field} from '../../components/World2';
import {MapView, ProjCfg, makeProj} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';

const Forest: React.FC<{y: number; n?: number; s?: number; seed?: number; grow?: number}> = ({y, n = 12, s = 1, seed = 1, grow = 1}) => (
  <g>{Array.from({length: n}).map((_, i) => { const g = clamp(grow * 1.6 - (i % 5) * 0.12); if (g <= 0) return null;
    return <Tree key={i} x={-100 + i * (1300 / n) + rand(i, seed) * 60} y={y + rand(i, seed + 1) * 40} s={s * (0.8 + rand(i, seed + 2) * 0.5) * easeOut(g)} kind={i % 3 ? 'pine' : 'round'} color={['#2f5a3a', '#3a6a3a', '#4a7a3a'][i % 3]} />; })}</g>
);

// ---------- 1. La Tierra ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n45 = cue.word('4500'); const n300 = cue.word('300000'); const nun = cue.word('nunca');
  const handOp = f < nun ? clamp((f - n300) / 10) : 1 - clamp((f - nun) / 25);
  return <AbsoluteFill>
    <Stage bg="#04050c"><rect width={1080} height={1920} fill="#04050c" /><Stars n={140} h={1920} />
      <g transform="translate(0,40)"><MapView proj={{type: 'ortho', center: [20, 10], scale: 420}} theme="vintage" rotateKeys={[[0, -20, 10], [d, 80, 15]]} hideGrid /></g>
      {handOp > 0 && <g transform="translate(540,1520) scale(1.3)" opacity={handOp}><path d="M-40,60 L-50,-20 Q-50,-36 -38,-36 Q-28,-36 -28,-20 L-26,-50 Q-26,-66 -14,-66 Q-2,-66 -2,-50 L0,-60 Q0,-76 12,-76 Q24,-76 24,-60 L26,-46 Q28,-60 40,-58 Q50,-56 48,-40 L46,30 Q58,10 70,16 Q80,24 70,40 L40,80 Q20,96 -10,96 Q-40,92 -40,60Z" fill="#b8502a" opacity={0.8} />
        <text y={150} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={22} fill="#e8c8a0">{L('Pintura rupestre: huella de mano')}</text></g>}
    </Stage>
    <BigStat value={4500} suffix=" M" from={n45} label={L('años de la Tierra')} y={250} hold={n300 - n45} />
    <BigStat value={300000} from={n300} label={L('años de Homo sapiens')} y={250} hold={nun - n300 + 30} color="#9fd0ff" />
    <Amb name="wind" vol={0.1} dur={d} /><Sfx name="ding" at={n45} vol={0.3} /><Sfx name="ding" at={n300} vol={0.3} /><Sfx name="impact" at={nun} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 2. Megafauna ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mam = cue.word('mamut'); const per = cue.word('perezoso'); const qui = cue.word('quizá');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.15, x: -60}, {f: per, z: 1.0, x: 40}, {f: d, z: 0.95, x: 80}]}>
      <Layer depth={0}><Sky top="#6a8ab8" bottom="#e8eef2" id="skyIA" /><Clouds n={5} y0={150} y1={500} speed={0.4} /></Layer>
      <Layer depth={0.3}><Mountains y={1150} color="#7a8aa0" snow="#f4f6fa" h={650} n={6} seed={12} /></Layer>
      <Layer depth={0.55}><Ridge y={1200} amp={40} color="#c8c49a" seed={3} /><Mammoth x={tween(f, 0, d, 980, 760)} y={1240} s={0.35} facing={-1} /><Mammoth x={tween(f, 0, d, 1150, 920)} y={1250} s={0.3} facing={-1} /></Layer>
      <Layer depth={0.8}><Ground y={1280} color="#b8b07a" color2="#a8a06a" /><Mammoth x={tween(f, 0, d, 120, 520)} y={1560} s={0.9} /></Layer>
      <Layer depth={1}>{f > per - 20 && <Sloth x={880} y={1780} s={0.8} facing={-1} />}</Layer>
      <Layer depth={1.3}><Snow n={40} size={0.6} wind={1} opacity={0.6} /></Layer>
    </Camera></Stage>
    <Chip text={L('MAMUT LANUDO')} from={mam} y={300} x={330} />
    <Chip text={L('PEREZOSO GIGANTE')} from={per} y={410} x={680} color="#fff" rot={3} />
    <Chip text={L('¿SEGUIRÍAN AQUÍ?')} from={qui} y={520} color="#9fd0ff" />
    <Amb name="wind" vol={0.3} dur={d} /><Sfx name="thunder" at={mam} vol={0.2} />
  </AbsoluteFill>;
};

// ---------- 3. Campos → bosques ----------
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mit = cue.word('mitad'); const bos = cue.word('bosques');
  const grow = clamp((f - bos + 10) / 45);
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.05}, {f: d, z: 1.0, y: -40}]}>
      <Layer depth={0}><Sky top="#5a9ad8" bottom="#e8f0d8" id="skyF3" /><Sun x={820} y={420} r={70} /><Clouds n={5} y0={150} y1={500} speed={0.5} /></Layer>
      <Layer depth={0.4}><Ridge y={1100} amp={50} color={grow > 0.3 ? '#3a6a3a' : '#9ab060'} seed={4} /></Layer>
      <Layer depth={0.7}><g opacity={1 - grow}><Field y={1180} color="#d8b44a" rows={14} /></g><g opacity={grow}><Ground y={1180} color="#4a7a3a" color2="#3a6a2a" /></g>
        <Forest y={1260} n={10} s={0.9} seed={3} grow={grow} /><Forest y={1520} n={8} s={1.3} seed={7} grow={grow} /></Layer>
      <Layer depth={1}>{grow > 0.6 && <Deer x={tween(f, bos + 20, d, 300, 360)} y={1800} s={0.9} />}<Birds n={grow > 0.3 ? 8 : 0} y={500} speed={3} /></Layer>
    </Camera></Stage>
    <BigStat value={50} prefix="≈" suffix="%" from={mit} label={L('de la tierra habitable es agrícola')} y={250} hold={bos - mit + 10} />
    <Amb name="wind" vol={0.15} dur={d} /><Sfx name="riser" at={bos - 20} vol={0.25} />
  </AbsoluteFill>;
};

// ---------- 4. Biomasa de mamíferos ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n4 = cue.word('4%'); const nos = cue.word('nosotros'); const gan = cue.word('ganado');
  const col = (i: number) => (i < 4 ? '#3ddc84' : i < 40 ? '#f2a0c0' : '#c8a06a');
  const show = (i: number) => i < 4 ? n4 : i < 40 ? nos : gan;
  return <AbsoluteFill>
    <Stage bg="#14121c"><rect width={1080} height={1920} fill="#14121c" />
      {Array.from({length: 100}).map((_, i) => { const r = Math.floor(i / 10), c = i % 10; const k = easeOut(clamp((f - show(i) - (i % 10) * 0.6) / 8));
        return <rect key={i} x={140 + c * 82} y={400 + r * 82} width={70 * k} height={70 * k} rx={10} fill={col(i)} stroke={C.ink} strokeWidth={4} transform={`translate(${35 * (1 - k)},${35 * (1 - k)})`} />; })}
      {[[n4, '#3ddc84', L('4% salvajes')], [nos, '#f2a0c0', L('36% humanos')], [gan, '#c8a06a', L('60% ganado')]].map(([at, c, t]: any, i) => f > at && <g key={i} transform={`translate(${170 + i * 270},330)`}>
        <rect x={0} y={-30} width={34} height={34} rx={6} fill={c} stroke={C.ink} strokeWidth={4} /><text x={46} y={0} fontFamily={FONT_UI} fontWeight={900} fontSize={30} fill="#fff">{t}</text></g>)}
      <text x={540} y={1250} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={24} fill="#8a8098">{L('Biomasa de mamíferos · Bar-On, Phillips y Milo (PNAS, 2018)')}</text>
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{f > gan && <Deer x={860} y={1720} s={0.8} cow facing={-1} />}{f > n4 && <Wolf x={220} y={1700} s={0.9} walking={false} />}</svg>
    <Sfx name="pop" at={n4} /><Sfx name="pop" at={nos} /><Sfx name="pop" at={gan} />
  </AbsoluteFill>;
};

// ---------- 5. Ni perros, ni vacas, ni trigo ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const per = cue.word('perros'); const n15 = cue.word('15000'); const vac = cue.word('vacas'); const tri = cue.word('trigo'); const mai = cue.word('maíz');
  const dogOp = clamp((f - per) / 8) * (1 - clamp((f - n15 - 20) / 15));
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.05}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#3a5a8a" bottom="#e8c89a" id="skyP5" /><Moon x={260} y={420} r={45} /></Layer>
      <Layer depth={0.5}><Forest y={1180} n={12} s={0.9} seed={9} /></Layer>
      <Layer depth={0.8}><Ground y={1250} color="#5a7a40" /><Wolf x={tween(f, 0, d, 150, 420)} y={1560} s={1.1} /><Wolf x={tween(f, 0, d, -60, 210)} y={1600} s={0.9} color="#8a8a90" /></Layer>
      <Layer depth={1}><g opacity={dogOp}><Wolf x={760} y={1780} s={1.2} dog color="#c8904a" facing={-1} walking={false} /></g></Layer>
    </Camera></Stage>
    {[[vac, '🐄', L('VACAS')], [tri, '🌾', L('TRIGO')], [mai, '🌽', L('MAÍZ')]].map(([at, e, t]: any, i) => f > at && <div key={i} style={{position: 'absolute', top: 300 + i * 0, left: 70 + i * 320, width: 300, textAlign: 'center', transform: `scale(${easeOut(clamp((f - at) / 8))})`}}>
      <div style={{fontSize: 110, position: 'relative'}}>{e}<span style={{position: 'absolute', left: 60, top: -10, fontSize: 150, color: '#d7263d', fontFamily: FONT_TITLE}}>✕</span></div>
      <div style={{fontFamily: FONT_TITLE, fontSize: 48, color: '#fff', WebkitTextStroke: '8px #0d0a12', paintOrder: 'stroke fill'}}>{t}</div></div>)}
    {f < vac - 6 && <Chip text={L('LOBO → PERRO · +15.000 AÑOS')} from={n15} y={330} />}
    <Amb name="wind" vol={0.15} dur={d} /><Sfx name="pop" at={vac} /><Sfx name="pop" at={tri} /><Sfx name="pop" at={mai} />
  </AbsoluteFill>;
};

// ---------- 6. CO₂ ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n280 = cue.word('280'); const n420 = cue.word('420');
  const val = f < n420 ? tween(f, n280 - 10, n280 + 20, 420, 280) : tween(f, n420, n420 + 20, 280, 420);
  const ang = -120 + ((val - 250) / 200) * 240;
  return <AbsoluteFill>
    <Stage bg="#0f1a28"><rect width={1080} height={1920} fill="#0f1a28" />
      <g transform="translate(540,1000)">
        <path d="M-300,0 A300,300 0 1,1 300,0" fill="none" stroke="#24364a" strokeWidth={60} transform="rotate(-30)" />
        {Array.from({length: 9}).map((_, i) => { const a = (-120 + i * 30) * Math.PI / 180; return <g key={i}><line x1={Math.sin(a) * 250} y1={-Math.cos(a) * 250} x2={Math.sin(a) * 300} y2={-Math.cos(a) * 300} stroke="#8aa0b8" strokeWidth={6} />
          <text x={Math.sin(a) * 200} y={-Math.cos(a) * 200 + 12} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={30} fill="#8aa0b8">{250 + i * 25}</text></g>; })}
        <g transform={`rotate(${ang})`}><path d="M-14,0 L0,-280 L14,0Z" fill={val > 350 ? '#ff5a5a' : '#3ddc84'} stroke={C.ink} strokeWidth={5} /></g>
        <circle r={36} fill="#dfe6ee" stroke={C.ink} strokeWidth={6} />
        <text y={140} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={110} fill={val > 350 ? '#ff5a5a' : '#3ddc84'}>{Math.round(val)}</text>
        <text y={200} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={34} fill="#fff">{L('ppm de CO₂')}</text>
      </g>
      <text x={540} y={1460} textAnchor="middle" fontFamily={FONT_UI} fontWeight={700} fontSize={28} fill="#8aa0b8">{L('Preindustrial ≈ 280 · Hoy > 420')}</text>
    </Stage>
    <Sfx name="digital" at={n280} vol={0.3} /><Sfx name="digital" at={n420} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 7. Neandertales ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const nea = cue.word('neandertales');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 100}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#1a1430" mid="#6a3a4a" bottom="#e88a5a" id="skyN7" /><Stars n={30} h={600} /></Layer>
      <Layer depth={0.4}><Mountains y={1200} color="#4a3a4a" snow="#8a7a8a" h={500} n={6} seed={6} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#5a4a3a" /><path d="M-200,1260 Q-100,700 300,760 Q420,780 420,1260Z" fill="#3a2e28" stroke={C.ink} strokeWidth={6} /><path d="M-60,1260 Q0,940 220,980 Q300,1000 300,1260Z" fill="#160f0c" /></Layer>
      <Layer depth={1}><Fire x={620} y={1640} s={0.8} /><Smoke x={620} y={1500} color="#6a5a50" n={6} opacity={0.3} size={0.6} /><Character d={CAST.neanderthal} x={400} y={1760} scale={1.35} pose="holdFront" expr="neutral" look={0.5} /></Layer>
    </Camera></Stage>
    <NameTag name={L('Neandertal')} role={L('Homo neanderthalensis · extinto hace ~40.000 años')} from={nea} dur={90} y={1560} color="#8a6a44" />
    <Amb name="fire" vol={0.3} dur={d} /><Amb name="wind" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

// ---------- 8. La Tierra de noche ----------
const CITIES: [number, number][] = [[-0.1, 51.5], [2.35, 48.85], [-3.7, 40.4], [13.4, 52.5], [12.5, 41.9], [37.6, 55.75], [28.9, 41], [31.2, 30], [-74, 40.7], [-87.6, 41.9], [-118.2, 34], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6], [3.4, 6.5], [77.2, 28.6], [72.8, 19], [116.4, 39.9], [121.5, 31.2], [139.7, 35.7], [126.9, 37.5], [151.2, -33.9], [18.4, -33.9], [55.3, 25.2], [44.4, 33.3], [-79.4, 43.7], [4.9, 52.4], [21, 52.2], [30.5, 50.4], [106.8, -6.2], [100.5, 13.7], [114.1, 22.4], [-43.2, -22.9], [-77, -12], [-74.1, 4.7], [36.8, -1.3]];
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const osc = cue.word('oscuras'); const proj: ProjCfg = {type: 'ortho', center: [20, 30], scale: 460, rotate: [-20, -30, 0]};
  const pr = makeProj(proj); const lights = 1 - clamp((f - osc) / 40);
  return <AbsoluteFill>
    <Stage bg="#02030a"><rect width={1080} height={1920} fill="#02030a" /><Stars n={160} h={1920} />
      <MapView proj={proj} theme="modern" hideGrid>
        {CITIES.map((ll, i) => { const p = pr(ll); if (!p) return null; const vis = (() => { const r = [-proj.rotate![0], -proj.rotate![1]]; const toR = Math.PI / 180;
          return Math.sin(ll[1] * toR) * Math.sin(r[1] * toR) + Math.cos(ll[1] * toR) * Math.cos(r[1] * toR) * Math.cos((ll[0] - r[0]) * toR) > 0.05; })(); if (!vis) return null;
          return <g key={i} opacity={lights * (0.7 + 0.3 * Math.sin(f / 5 + i))}><circle cx={p[0]} cy={p[1]} r={22} fill="#ffcf6a" opacity={0.25} /><circle cx={p[0]} cy={p[1]} r={7} fill="#fff2c0" /></g>; })}
      </MapView>
    </Stage>
    <Chip text={L('SIN LUCES')} from={osc + 20} y={300} color="#0d0a12" textColor="#fff" />
    <Amb name="wind" vol={0.1} dur={d} />
  </AbsoluteFill>;
};

// ---------- 9. Planeta salvaje ----------
const S9: SceneFC = ({d}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.25, y: 120}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#3a5a9a" mid="#f0a87a" bottom="#ffe0a0" id="skyF9" /><Sun x={540} y={980} r={110} /><LightRays x={540} y={980} n={9} opacity={0.15} /></Layer>
      <Layer depth={0.3}><Mountains y={1120} color="#6a6a8a" snow="#f4eef4" h={560} n={6} seed={2} /></Layer>
      <Layer depth={0.5}><Forest y={1180} n={14} s={0.6} seed={4} /><Mammoth x={tween(f, 0, d, 900, 700)} y={1220} s={0.3} facing={-1} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#4a7a3a" color2="#3a6a2a" /><Sea y={1450} color="#3a7aa0" amp={8} /></Layer>
      <Layer depth={1}><Deer x={260} y={1720} s={0.9} /><Deer x={460} y={1760} s={0.7} facing={-1} /><Birds n={10} y={500} speed={3} /></Layer>
    </Camera></Stage>
    <Amb name="wind" vol={0.15} dur={d} /><Amb name="sea" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

export const sinhumanosScenes = {s1_tierra: S1, s2_megafauna: S2, s3_bosques: S3, s4_mamiferos: S4, s5_perros: S5, s6_clima: S6, s7_neandertales: S7, s8_noche: S8, s9_final: S9};
