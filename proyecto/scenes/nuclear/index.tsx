// EPISODIO 6 — ¿Y si estallara una bomba nuclear en medio de Europa? (escenario hipotético y divulgativo, sin víctimas visibles)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Camera, Clouds, Crowd, Flag, FlagFace, Flash, Ground, Haze, Layer, Moon, Skyline, Sky, Smoke, Snow, Stage, Stars, Sun, Embers, Ridge, Cathedral, Sea, Dust, Jet} from '../../components/World';
import {MushroomCloud, Shockwave, Bunker, Birds} from '../../components/World2';
import {MapView, ProjCfg, makeProj} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';

const EUROPE: ProjCfg = {type: 'conic', center: [15, 51], scale: 1700, parallels: [40, 60]};
const GZ: [number, number] = [10.4, 50.2]; // punto hipotético en Europa central

const City: React.FC<{night?: boolean}> = ({night}) => <>
  <Skyline y={1260} color={night ? '#1c1a2c' : '#4a4a5a'} seed={5} windows={night ? '#ffd27a' : undefined} h={360} n={15} />
  <Cathedral x={760} y={1260} s={0.55} color={night ? '#3a3448' : '#8a8090'} />
</>;

// ---------- 1. Destello ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const sol = cue.word('soles') + 4;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 80}, {f: sol, z: 1.1, y: 40}, {f: d, z: 1.0}]} shake={f > sol && f < sol + 40 ? 10 * (1 - (f - sol) / 40) : 0}>
      <Layer depth={0}><Sky top={f > sol ? '#3a1a2a' : '#0a0c22'} mid={f > sol ? '#c85a3a' : '#22264a'} bottom={f > sol ? '#ffb46a' : '#4a3a5a'} id={f > sol ? 'skyN2' : 'skyN1'} />{f < sol && <><Stars n={70} h={900} /><Moon x={850} y={330} r={50} /></>}</Layer>
      <Layer depth={0.25}><MushroomCloud x={540} y={1180} at={sol} s={1.1} /></Layer>
      <Layer depth={0.45}><Ridge y={1180} amp={30} color="#2a2838" seed={3} /></Layer>
      <Layer depth={0.6}><City night={f < sol} /></Layer>
      <Layer depth={0.8}><Ground y={1300} color="#2a2430" /><Crowd y={1460} n={16} s={0.7} colors={['#2a2830', '#3a3440', '#2f2c38']} seed={3} /></Layer>
      <Flash at={sol} dur={22} />
    </Camera></Stage>
    <DateStamp text={L('ESCENARIO HIPOTÉTICO')} sub={L('EUROPA CENTRAL')} from={6} dur={sol} y={640} />
    <Amb name="wind" vol={0.18} dur={d} /><Sfx name="impact" at={sol} vol={0.6} /><Sfx name="boom" at={sol + 30} vol={0.6} /><Sfx name="thunder" at={sol + 34} vol={0.4} /><Sfx name="heartbeat" at={6} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 2. Hiroshima y Nagasaki ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const hir = cue.word('hiroshima'); const kt = cue.word('15'); const n140 = cue.word('140');
  const dome = f > kt - 10;
  return <AbsoluteFill>
    {!dome && <Stage bg="#8fb1b8"><MapView proj={{type: 'mercator', center: [134, 35], scale: 2600}} theme="vintage" zoom={[[0, 1.0], [kt, 1.15]]} focus={[132, 34]}
      fills={[{names: ['Japan'], color: '#c9b78a', at: 0, dur: 1}]}
      pins={[{at: [132.45, 34.39], from: hir, label: L('Hiroshima · 6 ago'), big: true, color: '#ff8a5a'}, {at: [129.87, 32.75], from: hir + 14, label: L('Nagasaki · 9 ago'), big: true, color: '#ff8a5a', dy: 50}]} /></Stage>}
    {dome && <Stage><Camera k={[{f: kt - 10, z: 1.1}, {f: d, z: 1.0, y: -40}]}>
      <Layer depth={0}><Sky top="#4a5a7a" bottom="#e8d8c0" id="skyH1" /><Clouds n={4} y0={200} y1={500} speed={0.3} /></Layer>
      <Layer depth={0.6}><Ground y={1250} color="#8a8478" /><g transform="translate(540,1260)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
        <path d="M-300,0 L-300,-260 L300,-260 L300,0Z" fill="#b8ae9c" /><path d="M-300,-260 L-260,-300 L-160,-280 L-120,-300 L-60,-262Z" fill="#a89e8c" />
        <rect x={-110} y={-420} width={220} height={160} fill="#b8ae9c" /><path d="M-110,-420 Q0,-560 110,-420" fill="none" strokeWidth={10} />
        {[-80, -40, 0, 40, 80].map((x) => <path key={x} d={`M${x},-420 Q${x * 0.4},-520 0,-540`} fill="none" strokeWidth={6} />)}
        {Array.from({length: 8}).map((_, i) => <rect key={i} x={-280 + i * 72} y={-220} width={36} height={60} fill="#3a3430" />)}
      </g></Layer>
      <Layer depth={0.9}><Sea y={1500} color="#4a6a7a" amp={6} /></Layer>
    </Camera></Stage>}
    <DateStamp text={L('AGOSTO 1945')} sub={L('ÚNICO USO EN GUERRA')} from={0} dur={kt} y={250} />
    {dome && <BigStat value={15} suffix=" kt" from={kt} label={L('potencia de la bomba de Hiroshima')} y={250} hold={n140 - kt} />}
    {dome && <BigStat value={140000} prefix="≈" from={n140} label={L('víctimas antes de acabar 1945')} y={250} color="#ff8a6a" />}
    {dome && <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 800, fontSize: 28, color: '#fff', opacity: 0.85}}>{L('Cúpula de la Bomba Atómica, Hiroshima (memorial)')}</div>}
    <Sfx name="paper" at={2} vol={0.3} /><Sfx name="ding" at={hir} vol={0.25} /><Sfx name="bell" at={kt} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 3. Potencia actual ----------
const S3: SceneFC = ({d}) => {
  const f = useCurrentFrame();
  const bubbles: [string, number, number, string][] = [['Hiroshima', 15, 6, '#ffd27a'], [L('Ojiva moderna'), 300, 24, '#ff8a4a'], [L('Ojiva grande'), 800, 44, '#d7263d']];
  return <AbsoluteFill>
    <Stage bg="#0b0a12"><rect width={1080} height={1920} fill="#0b0a12" /><Stars n={60} h={1920} />
      {bubbles.map(([lab, kt, at, col], i) => { const k = easeOut(clamp((f - at) / 18)); const r = Math.sqrt(kt) * 10 * k; const y = 1000;
        const x = [190, 470, 790][i];
        return <g key={i}><circle cx={x} cy={y - r} r={r} fill={col} opacity={0.85} stroke={C.ink} strokeWidth={6} />
          {k > 0.5 && <><text x={x} y={y + 70} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={56} fill="#fff">{kt} kt</text>
            <text x={x} y={y + 110} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={28} fill="#c8c0d0">{lab}</text></>}</g>; })}
      <text x={540} y={1560} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={24} fill="#8a8098">{L('Área del círculo proporcional a la potencia · ejemplos orientativos')}</text>
    </Stage>
    <Sfx name="pop" at={6} /><Sfx name="pop" at={24} /><Sfx name="boom" at={44} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 4. El estallido ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const eur = cue.word('europa'); const bol = cue.word('bola'); const ond = cue.word('onda'); const cal = cue.word('calor');
  const side = f >= bol - 6;
  const pr = makeProj(EUROPE); const [gx, gy] = pr(GZ) ?? [540, 960];
  return <AbsoluteFill>
    {!side && <Stage bg="#1c2c3c"><MapView proj={EUROPE} theme="cold" zoom={[[0, 1.0], [eur, 1.0], [bol, 2.4]]} focus={GZ}
      labels={[{at: [GZ[0], GZ[1] + 0.9], text: L('CIUDAD HIPOTÉTICA'), from: eur, size: 40, color: '#fff'}]}>
      {[1, 2, 3].map((i) => { const k = clamp((f - eur - i * 6) / 14); return <circle key={i} cx={gx} cy={gy} r={i * 18 * k} fill="none" stroke={['#fff2c0', '#ff8a4a', '#d7263d'][i - 1]} strokeWidth={4} opacity={k} />; })}
      <circle cx={gx} cy={gy} r={8} fill={C.yellow} stroke={C.ink} strokeWidth={3} />
    </MapView></Stage>}
    {side && <Stage><Camera k={[{f: bol - 6, z: 1.3, y: -120}, {f: ond, z: 1.0, y: 0}, {f: d, z: 0.92, y: 40}]} shake={f > ond && f < ond + 50 ? 12 * (1 - (f - ond) / 50) : 0}>
      <Layer depth={0}><Sky top="#3a1a1a" mid="#d8703a" bottom="#ffd08a" id="skyB4" /></Layer>
      <Layer depth={0.3}><MushroomCloud x={540} y={1250} at={bol - 30} s={1.5} /></Layer>
      <Layer depth={0.55}><g transform={`skewX(${f > ond ? Math.sin((f - ond) / 2) * 3 * Math.max(0, 1 - (f - ond) / 40) : 0})`}><City /></g></Layer>
      <Layer depth={0.7}><Ground y={1300} color="#5a4a40" /><Shockwave x={540} y={1300} at={ond} s={1} /><Dust n={50} color="#e8c8a0" /></Layer>
      <Layer depth={1.2}>{f > cal && <Embers n={60} color="#ffb04a" />}</Layer>
    </Camera></Stage>}
    <Chip text={L('BOLA DE FUEGO')} from={bol} dur={ond - bol + 30} y={300} x={330} color="#fff2c0" />
    <Chip text={L('ONDA EXPANSIVA')} from={ond} y={400} x={700} color="#ff8a4a" rot={3} />
    <Chip text={L('CALOR EXTREMO')} from={cal} y={500} x={420} color="#d7263d" textColor="#fff" />
    <Sfx name="whoosh" at={bol - 8} vol={0.4} /><Sfx name="boom" at={ond} vol={0.7} /><Sfx name="crumble" at={ond + 8} vol={0.5} /><Amb name="fire" vol={0.25} from={cal} dur={d - cal} /><Amb name="wind" vol={0.3} dur={d} />
  </AbsoluteFill>;
};

// ---------- 5. Lluvia radiactiva y Chernóbil ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const llu = cue.word('lluvia'); const che = cue.word('chernóbil');
  const pr = makeProj(EUROPE); const [gx, gy] = pr(GZ) ?? [0, 0]; const [cx, cy] = pr([30.1, 51.39]) ?? [0, 0];
  const plume = clamp((f - llu) / 70); const cher = f >= che - 4;
  return <AbsoluteFill>
    <Stage bg="#1c2c3c"><MapView proj={EUROPE} theme="cold" zoom={[[0, 1.4], [che - 4, 1.4], [che + 20, 1.0]]} focus={cher ? [22, 53] : [16, 50.5]}
      pins={cher ? [{at: [30.1, 51.39], from: che, label: L('Chernóbil, 1986'), big: true, color: '#ffd60a'}] : [{at: GZ, from: 0, color: '#ff8a4a'}]}>
      {!cher && <g><path d={`M${gx},${gy} C${gx + 120 * plume},${gy - 40 * plume} ${gx + 300 * plume},${gy - 30 * plume} ${gx + 420 * plume},${gy + 10 * plume} C${gx + 300 * plume},${gy + 60 * plume} ${gx + 120 * plume},${gy + 50 * plume} ${gx},${gy}Z`} fill="#c8f04a" opacity={0.45} />
        {Array.from({length: 6}).map((_, i) => { const k = ((f + i * 12) % 60) / 60; return <path key={i} d={`M${gx - 200 + k * 500},${gy - 150 + i * 60} l60,0 l-14,-12 M${gx - 140 + k * 500},${gy - 150 + i * 60} l-14,12`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6 * Math.sin(Math.PI * k)} />; })}</g>}
      {cher && Array.from({length: 7}).map((_, i) => { const k = clamp((f - che - i * 5) / 40); const a = [-2.6, -2.2, -1.8, -0.4, 0.2, 2.6, 3.0][i];
        return <ellipse key={i} cx={cx + Math.cos(a) * 260 * k} cy={cy + Math.sin(a) * 160 * k} rx={140 * k} ry={80 * k} fill="#c8f04a" opacity={0.28} />; })}
    </MapView></Stage>
    {!cher && <Chip text={L('VIENTO DEL OESTE →')} from={llu} y={300} color="#fff" />}
    {cher && <div style={{position: 'absolute', bottom: 270, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 700, fontSize: 26, color: '#c8d4e0'}}>{L('Extensión aproximada de la nube de 1986 (accidente, no una bomba)')}</div>}
    <Amb name="wind" vol={0.35} dur={d} /><Sfx name="digital" at={che} vol={0.25} />
  </AbsoluteFill>;
};

// ---------- 6. OTAN, artículo 5 ----------
const NATO = ['Albania', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Montenegro', 'Netherlands', 'Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Turkey', 'United Kingdom', 'United States of America'];
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const art = cue.word('artículo'); const tod = cue.word('todos'); const gue = cue.word('guerra');
  return <AbsoluteFill>
    <Stage bg="#0f2a44"><MapView proj={{type: 'mercator', center: [-25, 50], scale: 360}} theme="modern"
      fills={[{names: NATO, color: '#2a6fd6', at: art, dur: 10, stagger: 1}]}
      labels={[{at: [-40, 45], text: L('OTAN'), sub: L('32 PAÍSES'), from: tod, size: 70, color: '#fff'}]} />
      {f > gue && <rect width={1080} height={1920} fill="#d7263d" opacity={0.15 + 0.12 * Math.sin(f / 4)} />}
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Character d={CAST.natoGeneral} x={800} y={1900} scale={1.1} pose="point" expr={f > gue ? 'worried' : 'determined'} facing={-1} talking look={0.5} /></svg>
    <Chip text={L('ARTÍCULO 5')} from={art} y={280} size={70} />
    <Chip text={L('«UNO PARA TODOS»')} from={tod} y={400} color="#fff" rot={2} />
    <NameTag name={L('General (ficticio)')} role={L('Mando aliado')} from={8} dur={70} y={1340} x={420} color="#004990" />
    <Amb name="siren" vol={0.15} from={gue} dur={d - gue} /><Sfx name="stamp" at={art} vol={0.5} /><Sfx name="impact" at={gue} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 7. Caos ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const bol = cue.word('bolsas'); const esp = cue.word('espacio'); const ref = cue.word('refugio');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0}, {f: d, z: 1.1, y: 60}]}>
      <Layer depth={0}><Sky top="#3a3a4a" bottom="#8a7a70" id="skyC7" /><Clouds n={6} y0={150} y1={600} color="#5a5a66" speed={1} /></Layer>
      <Layer depth={0.5}><City /></Layer>
      <Layer depth={0.8}><Ground y={1300} color="#4a4a50" /><Bunker x={800} y={1500} s={0.9} /></Layer>
      <Layer depth={1}>{Array.from({length: 7}).map((_, i) => <Character key={i} d={i % 2 ? CAST.citizenF : CAST.citizenM} x={-100 + ((f * 3 + i * 150) % 900)} y={1660 + (i % 3) * 40} scale={0.55} walking walkSpeed={1.4} expr="worried" seed={i * 7} facing={1} />)}</Layer>
    </Camera></Stage>
    {f > bol && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(70,240)" opacity={clamp((f - bol) / 8)}>
      <rect width={440} height={260} rx={16} fill="#0b1220" stroke={C.ink} strokeWidth={6} /><path d={`M30,60 L120,80 L200,70 L${260},${70 + Math.min(f - bol, 25) * 6} L400,${210}`} fill="none" stroke="#ff4a4a" strokeWidth={10} />
      <text x={30} y={45} fontFamily={FONT_UI} fontWeight={900} fontSize={30} fill="#ff4a4a">{L('BOLSA ▼')}</text></g></svg>}
    {f > esp && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(570,240)" opacity={clamp((f - esp) / 8)}>
      <rect width={440} height={260} rx={16} fill="#1a1a1a" stroke={C.ink} strokeWidth={6} />{[0, 1, 2, 3].map((i) => <g key={i}><text x={24} y={60 + i * 52} fontFamily={FONT_UI} fontWeight={800} fontSize={26} fill="#ffd27a">{['MAD', 'PAR', 'BER', 'ROM'][i]}</text>
        <text x={130} y={60 + i * 52} fontFamily={FONT_UI} fontWeight={900} fontSize={26} fill="#ff4a4a">{L('CANCELADO')}</text></g>)}</g></svg>}
    <Chip text={L('REFUGIOS')} from={ref} y={560} x={760} color={C.yellow} />
    <Amb name="crowd" vol={0.2} dur={d} /><Amb name="siren" vol={0.15} dur={d} /><Sfx name="stamp" at={bol} /><Sfx name="stamp" at={esp} /><Sfx name="pop" at={ref} />
  </AbsoluteFill>;
};

// ---------- 8. Invierno nuclear ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const cie = cue.word('cientos');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.1}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#5a5a60" bottom="#a8a49c" id="skyW8" /><g opacity={0.5}><Sun x={760} y={520} r={70} color="#e8e0c8" glow="#c8c0a8" /></g></Layer>
      <Layer depth={0.4}><Ridge y={1150} amp={60} color="#7a7874" seed={8} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#8a8680" /></Layer>
      <Layer depth={1}><Character d={CAST.scientist} x={330} y={1820} scale={1.3} pose="point" expr="worried" talking look={0.4} /></Layer>
      <Layer depth={1.3}><Snow n={120} wind={0.6} size={0.8} opacity={0.6} /></Layer>
    </Camera></Stage>
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'center', opacity: clamp((f - 10) / 10)}}>
      <span style={{fontFamily: FONT_TITLE, fontSize: 120, color: '#fff', WebkitTextStroke: '12px #0d0a12', paintOrder: 'stroke fill'}}>1</span>
      <span style={{fontFamily: FONT_TITLE, fontSize: 100, color: C.yellow, WebkitTextStroke: '12px #0d0a12', paintOrder: 'stroke fill'}}>≠</span>
      <span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 44, color: '#fff', WebkitTextStroke: '6px #0d0a12', paintOrder: 'stroke fill', maxWidth: 420, lineHeight: 1.05}}>{L('INVIERNO NUCLEAR')}</span>
    </div>
    <Chip text={L('HARÍAN FALTA CIENTOS')} from={cie} y={500} color="#fff" />
    <Amb name="wind" vol={0.35} dur={d} />
  </AbsoluteFill>;
};

// ---------- 9. Final ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n12 = cue.word('12');
  return <AbsoluteFill>
    <Stage bg="#05060c"><rect width={1080} height={1920} fill="#05060c" /><Stars n={120} h={1920} />
      <g transform="translate(0,-60)"><MapView proj={{type: 'ortho', center: [15, 45], scale: 430}} theme="cold" rotateKeys={[[0, -10, 40], [d, 60, 35]]} /></g>
      <Birds n={6} y={1350} speed={3} color="#f4f4f4" />
    </Stage>
    <BigStat value={12000} prefix="≈" from={n12} label={L('cabezas nucleares en el mundo (2025)')} y={250} />
    <Sfx name="ding" at={n12} vol={0.35} /><Amb name="wind" vol={0.1} dur={d} />
  </AbsoluteFill>;
};

export const nuclearScenes = {s1_destello: S1, s2_hiroshima: S2, s3_hoy: S3, s4_estallido: S4, s5_lluvia: S5, s6_otan: S6, s7_caos: S7, s8_invierno: S8, s9_final: S9};
