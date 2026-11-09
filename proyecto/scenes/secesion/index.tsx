// EPISODIO 9 — ¿Y si el Sur hubiera ganado la guerra civil de EE. UU.?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Army, Camera, Cannon, Clouds, Explosion, Flag, FlagFace, Ground, Haze, Layer, LightRays, Ridge, Sky, Smoke, Stage, Sun, Tree, Embers, Dust, Stars} from '../../components/World';
import {Field} from '../../components/World2';
import {MapView, ProjCfg} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';

const US: ProjCfg = {type: 'conic', center: [-92, 38], scale: 1250, parallels: [29.5, 45.5]};
const CSA = ['South Carolina', 'Mississippi', 'Florida', 'Alabama', 'Georgia', 'Louisiana', 'Texas', 'Virginia', 'Arkansas', 'North Carolina', 'Tennessee'];
const BORDER = ['Delaware', 'Maryland', 'Kentucky', 'Missouri', 'West Virginia'];
const UNION = ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York', 'New Jersey', 'Pennsylvania', 'Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa', 'Kansas', 'California', 'Oregon'];
const BLUE = '#2a5bb0', GRAY = '#8a8f96';
const uniSoldier = {coat: '#1d2a5a', pants: '#6a86b0', hat: 'cap' as const, hatColor: '#1d2a5a'};
const conSoldier = {coat: '#8a8f96', pants: '#7a7466', hat: 'cap' as const, hatColor: '#8a8f96'};

// ---------- 1. Appomattox ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const lee = cue.word('lee'); const sur = cue.word('sur');
  const shake = f > lee + 20 && f < sur;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.25, y: 120}, {f: sur, z: 1.05, y: 40}, {f: d, z: 1.0}]}>
      <Layer depth={0}><rect x={-500} y={-500} width={2080} height={2920} fill="#7a5a3a" />{Array.from({length: 14}).map((_, i) => <rect key={i} x={-500 + i * 160} y={-500} width={8} height={2000} fill="#6a4a2e" />)}
        <g transform="translate(540,620)" stroke={C.ink} strokeWidth={8}><rect x={-160} y={-200} width={320} height={260} fill="#9fc0d8" /><path d="M0,-200 L0,60 M-160,-70 L160,-70" strokeWidth={10} stroke="#f4ecd8" /></g>
        <rect x={-500} y={1450} width={2080} height={900} fill="#5a3a24" /></Layer>
      <Layer depth={0.7}><g transform="translate(540,1480)" stroke={C.ink} strokeWidth={6}><rect x={-260} y={-40} width={520} height={30} fill="#8a5a34" /><rect x={-230} y={-10} width={20} height={160} fill="#6a4426" /><rect x={210} y={-10} width={20} height={160} fill="#6a4426" />
        <rect x={-60} y={-70} width={110} height={34} fill="#fbf6e6" strokeWidth={3} /></g></Layer>
      <Layer depth={1}><Character d={CAST.grant} x={250} y={1780} scale={1.3} pose={shake ? 'present' : 'relaxed'} expr="determined" look={0.5} />
        <Character d={CAST.lee} x={830} y={1780} scale={1.3} pose={shake ? 'present' : 'behind'} expr="sad" facing={-1} look={0.5} propOverride="none" /></Layer>
    </Camera></Stage>
    <DateStamp text="9·4·1865" sub={L('APPOMATTOX, VIRGINIA')} from={6} dur={lee + 30} y={640} />
    <NameTag name="Ulysses S. Grant" role={L('General de la Unión')} from={lee - 30} dur={50} y={1500} x={40} color={BLUE} />
    <NameTag name="Robert E. Lee" role={L('General confederado')} from={lee + 20} dur={50} y={1500} x={500} color={GRAY} />
    <Amb name="wind" vol={0.1} dur={d} /><Sfx name="paper" at={lee + 10} vol={0.4} /><Sfx name="impact" at={sur} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 2. Secesión ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const onc = cue.word('once'); const est = cue.word('estados', 1); const esc = cue.word('esclavitud');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8"><MapView proj={US} theme="vintage" dataset="us"
      fills={[{names: UNION, color: BLUE, at: 0, dur: 10}, {names: CSA, color: GRAY, at: onc, dur: 10, stagger: 3}, {names: BORDER, color: '#7ea3d8', at: onc + 30, dur: 10}]}
      labels={[{at: [-80, 43.5], text: L('UNIÓN'), from: 4, size: 60, color: '#fff'}, {at: [-87, 32.5], text: L('CONFEDERACIÓN'), from: est, size: 50, color: '#fff'}, {at: [-110, 40], text: L('TERRITORIOS'), sub: L('FRONTERAS ACTUALES, APROX.'), from: 8, size: 34, color: '#5a4a30'}]} /></Stage>
    <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center', opacity: clamp((f - 6) / 10)}}>
      <svg width={170} height={110}><FlagFace kind="usa1861" w={170} h={110} /></svg><span style={{fontFamily: FONT_TITLE, fontSize: 64, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>VS</span>
      <svg width={170} height={110} style={{opacity: clamp((f - est) / 10)}}><FlagFace kind="csa" w={170} h={110} /></svg></div>
    <DateStamp text="1861" sub={L('SECESIÓN')} from={0} dur={esc} y={420} />
    <Chip text={L('MOTIVO: LA ESCLAVITUD')} from={esc} y={460} size={44} color="#fff" />
    {CSA.map((_, i) => <Sfx key={i} name="pop" at={onc + i * 3} vol={0.25} />)}
  </AbsoluteFill>;
};

// ---------- 3. Cuatro millones de personas esclavizadas (tono solemne) ----------
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const cua = cue.word('cuatro');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.1}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#2a1a2a" mid="#7a3a3a" bottom="#d8884a" id="skyE3" /><Sun x={540} y={1060} r={90} color="#ffc890" glow="#ff7a4a" /></Layer>
      <Layer depth={0.5}><Field y={1150} color="#c8b8a0" rows={16} wheat={false} /></Layer>
      <Layer depth={0.7}><g opacity={0.9}>{Array.from({length: 40}).map((_, i) => <circle key={i} cx={-100 + (i % 20) * 70 + (Math.floor(i / 20) % 2) * 35} cy={1200 + Math.floor(i / 20) * 60} r={10} fill="#f8f4ee" />)}</g></Layer>
    </Camera></Stage>
    <BigStat value={4000000} prefix="≈" from={cua} label={L('personas esclavizadas (censo de 1860)')} y={420} color="#f4ecd8" />
    <Amb name="wind" vol={0.2} dur={d} />
  </AbsoluteFill>;
};

// ---------- 4. La guerra ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n6 = cue.word('600');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.1}, {f: d, z: 1.0, x: 40}]} shake={3}>
      <Layer depth={0}><Sky top="#5a6a7a" bottom="#d8c8a8" id="skyW4" /><Clouds n={5} y0={200} y1={600} color="#9a9aa4" speed={0.8} /></Layer>
      <Layer depth={0.45}><Ridge y={1150} amp={60} color="#7a8a5a" seed={3} />{Array.from({length: 7}).map((_, i) => <Tree key={i} x={-60 + i * 200} y={1170} s={0.5} kind="round" color="#4a6a3a" />)}</Layer>
      <Layer depth={0.7}><Ground y={1250} color="#6a7a4a" /><Army x={-80} y={1300} rows={3} cols={7} s={0.6} dx={74} soldier={{...uniSoldier, facing: 1, marching: false}} flag="usa1861" />
        <Army x={640} y={1300} rows={3} cols={7} s={0.6} dx={74} soldier={{...conSoldier, facing: -1, marching: false}} flag="csa" />
        <Explosion x={560} y={1320} at={20} s={0.4} /><Explosion x={480} y={1360} at={90} s={0.35} /><Smoke x={540} y={1300} color="#cfcfcf" n={10} opacity={0.5} /></Layer>
      <Layer depth={1}><Cannon x={180} y={1720} s={0.9} fireAt={[10, 60, 110]} /><Cannon x={900} y={1720} s={0.9} facing={-1} fireAt={[35, 85]} /></Layer>
    </Camera></Stage>
    <DateStamp text="1861 – 1865" sub={L('GUERRA DE SECESIÓN')} from={0} dur={n6} y={250} />
    <BigStat value={600000} prefix="+" from={n6} label={L('muertos (estimaciones recientes: ~750.000)')} y={250} color="#ff8a6a" />
    <Amb name="gunfire" vol={0.3} dur={d} /><Sfx name="cannon" at={10} vol={0.4} /><Sfx name="cannon" at={35} vol={0.35} /><Sfx name="boom" at={20} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 5. Gettysburg y la 13.ª Enmienda ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const get = cue.word('gettysburg'); const enm = cue.word('enmienda');
  const doc = f >= enm - 6;
  return <AbsoluteFill>
    {!doc && <Stage><Camera k={[{f: 0, z: 1.0}, {f: enm, z: 1.12, y: 60}]}>
      <Layer depth={0}><Sky top="#6a8ab0" bottom="#f0e0c0" id="skyG5" /><Clouds n={4} y0={150} y1={500} speed={0.5} /></Layer>
      <Layer depth={0.45}><Ridge y={1150} amp={50} color="#8a9a5a" seed={9} /><Army x={-200 + f * 0.5} y={1200} rows={2} cols={12} s={0.45} dx={74} soldier={conSoldier} flag="csa" /></Layer>
      <Layer depth={0.7}><Ground y={1260} color="#7a8a4a" /><Smoke x={300} y={1250} color="#dddddd" n={8} opacity={0.5} /></Layer>
      <Layer depth={1}><Character d={CAST.lee} x={300} y={1780} scale={1.3} pose="despair" expr="worried" look={0.4} propOverride="none" /><Flag kind="usa1861" x={880} y={1800} pole={800} w={230} h={150} flip /></Layer>
    </Camera></Stage>}
    {doc && <Stage><Camera k={[{f: enm - 6, z: 1.1}, {f: d, z: 1.0}]}>
      <Layer depth={0}><rect x={-500} y={-500} width={2080} height={2920} fill="#2a2420" /><LightRays x={540} y={200} color="#ffe9b0" n={6} opacity={0.12} /></Layer>
      <Layer depth={0.6}><g transform="translate(700,820)" stroke={C.ink} strokeWidth={6}><rect x={-220} y={-300} width={440} height={600} fill="#f2e6c8" />
        <text y={-200} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={48} fill="#3a2a1a" stroke="none">{L('ENMIENDA XIII')}</text>
        {Array.from({length: 9}).map((_, i) => <line key={i} x1={-170} x2={170} y1={-120 + i * 44} y2={-120 + i * 44} stroke="#a8987a" strokeWidth={4} />)}</g>
        <g transform={`translate(700,1260)`} stroke={C.ink} strokeWidth={5}>{[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * (40 + Math.min(f - enm, 20) * 6)},0) rotate(${sd * Math.min(f - enm, 20) * 2})`}>
          {[0, 1, 2].map((i) => <ellipse key={i} cx={sd * (20 + i * 36)} cy={0} rx={22} ry={14} fill="none" stroke="#8a8f96" strokeWidth={10} />)}</g>)}</g></Layer>
      <Layer depth={1}><Character d={CAST.lincoln} x={260} y={1820} scale={1.25} pose="present" expr="determined" look={0.4} /></Layer>
    </Camera></Stage>}
    {!doc && <DateStamp text="1–3·7·1863" sub="GETTYSBURG" from={get - 10} dur={enm - get} y={250} />}
    {doc && <NameTag name="Abraham Lincoln" role={L('Presidente de EE. UU. (1861–1865)')} from={enm} dur={70} y={1540} color={BLUE} />}
    <Amb name="gunfire" vol={0.2} dur={enm} /><Sfx name="cannon" at={get} vol={0.35} /><Sfx name="crumble" at={enm + 10} vol={0.3} /><Sfx name="bell" at={enm + 4} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 6. Giro: el Sur gana ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const lee = cue.word('lee'); const lin = cue.word('lincoln'); const paz = cue.word('paz');
  const phase2 = f >= lin - 6;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0}, {f: d, z: 1.1, y: 60}]}>
      <Layer depth={0}><Sky top="#5a7aa0" bottom="#e8d8b8" id="skyR6" /><Clouds n={4} y0={150} y1={500} speed={0.5} /></Layer>
      <Layer depth={0.45}><Ridge y={1150} amp={50} color="#8a9a5a" seed={9} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#7a8a4a" />{!phase2 && <Army x={-80} y={1290} rows={2} cols={12} s={0.5} dx={74} soldier={{...conSoldier, marching: false}} flag="csa" />}</Layer>
      <Layer depth={1}>{!phase2 ? <Character d={CAST.lee} x={540} y={1780} scale={1.4} pose="holdUp" expr="happy" look={0.2} />
        : <Character d={CAST.lincoln} x={360} y={1780} scale={1.35} pose={f > paz ? 'shrug' : 'think'} expr="sad" look={0.5} />}</Layer>
    </Camera></Stage>
    {phase2 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(780,980)" stroke={C.ink} strokeWidth={6}>
      <rect x={-170} y={-200} width={340} height={260} rx={14} fill="#f2e6c8" /><text y={-130} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={44} fill="#3a2a1a" stroke="none">{L('ELECCIONES 1864')}</text>
      <text x={-140} y={-50} fontFamily={FONT_UI} fontWeight={900} fontSize={36} fill="#3a2a1a" stroke="none">LINCOLN</text><text x={-140} y={20} fontFamily={FONT_UI} fontWeight={900} fontSize={36} fill="#3a2a1a" stroke="none">{L('RIVAL')}</text>
      {f > lin + 20 && <path d="M70,-70 l60,40 M130,-70 l-60,40" stroke="#d7263d" strokeWidth={12} strokeLinecap="round" />}
      {f > lin + 30 && <path d="M70,0 l20,20 l40,-40" stroke="#1f9a4a" strokeWidth={12} fill="none" strokeLinecap="round" />}</g></svg>}
    <Chip text={L('LEE GANA EN GETTYSBURG')} from={lee} dur={lin - lee} y={300} size={44} />
    <Chip text={L('PAZ: DOS PAÍSES')} from={paz} y={300} size={52} color="#fff" />
    <Sfx name="cheer" at={lee + 6} vol={0.35} /><Sfx name="stamp" at={lin + 20} vol={0.5} /><Sfx name="paper" at={paz} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 7. Dos países ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const dos = cue.word('dos'); const bra = cue.word('brasil');
  const brazil = f >= bra - 6;
  return <AbsoluteFill>
    {!brazil && <Stage bg="#8fb1b8"><MapView proj={US} theme="vintage" dataset="us" zoom={[[0, 1.0], [d, 1.05]]} focus={[-92, 38]}
      fills={[{names: [...UNION, 'Delaware', 'Maryland', 'Kentucky', 'Missouri', 'West Virginia'], color: BLUE, at: 0, dur: 1}, {names: CSA, color: GRAY, at: 0, dur: 1}]}
      labels={[{at: [-80, 43.5], text: L('ESTADOS UNIDOS'), from: dos, size: 48, color: '#fff'}, {at: [-87, 32.5], text: L('ESTADOS CONFEDERADOS'), sub: L('HIPOTÉTICO'), from: dos + 8, size: 42, color: '#fff'}]} /></Stage>}
    {brazil && <Stage bg="#8fb1b8"><MapView proj={{type: 'mercator', center: [-60, 5], scale: 420}} theme="vintage"
      fills={[{names: ['Brazil'], color: '#2e9a4f', at: bra, dur: 10, glow: true}]} labels={[{at: [-52, -10], text: L('BRASIL'), sub: L('ABOLICIÓN: 1888'), from: bra + 4, size: 60, color: '#fff'}]} /></Stage>}
    <Sfx name="stamp" at={dos} vol={0.5} /><Sfx name="whoosh" at={bra - 6} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 8. Sin superpotencia ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const sup = cue.word('superpotencia'); const gue = cue.word('guerras');
  return <AbsoluteFill>
    <Stage bg="#05060c"><rect width={1080} height={1920} fill="#05060c" /><Stars n={100} h={1920} />
      <g transform="translate(0,-40)"><MapView proj={{type: 'ortho', center: [-80, 30], scale: 440}} theme="cold" rotateKeys={[[0, -100, 35], [d, -40, 35]]}
        fills={[{names: ['United States of America'], color: BLUE, at: 0, dur: 10, glow: true, until: sup + 10, out: 20}, {names: ['United States of America'], color: '#7a8aa0', at: sup + 10, dur: 20}]} /></g>
    </Stage>
    <div style={{position: 'absolute', top: 280, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, opacity: clamp((f - gue) / 10)}}>
      {['1917', '1941'].map((y) => <span key={y} style={{fontFamily: FONT_TITLE, fontSize: 80, color: C.yellow, WebkitTextStroke: '10px #0d0a12', paintOrder: 'stroke fill', textDecoration: 'line-through'}}>{y}</span>)}</div>
    <Chip text={L('¿SIN SUPERPOTENCIA?')} from={sup} y={420} size={46} color="#fff" />
    <Sfx name="whoosh" at={sup} vol={0.3} /><Sfx name="impact" at={gue} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 9. Final ----------
const S9: SceneFC = ({d}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 100}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#2a2a4a" mid="#a85a5a" bottom="#f0b07a" id="skyF9" /><Sun x={540} y={1000} r={100} color="#ffd8a8" glow="#ff8a5a" /></Layer>
      <Layer depth={0.5}><Ridge y={1180} amp={50} color="#4a4a5a" seed={2} /></Layer>
      <Layer depth={0.75}><Ground y={1250} color="#5a5a4a" /><Flag kind="usa1861" x={200} y={1400} pole={500} w={180} h={120} /><Flag kind="csa" x={880} y={1400} pole={500} w={180} h={120} flip /></Layer>
      <Layer depth={1}><Character d={CAST.lincoln} x={330} y={1820} scale={1.2} pose="crossArms" expr="determined" look={0.6} /><Character d={CAST.lee} x={760} y={1820} scale={1.2} pose="behind" expr="determined" facing={-1} look={0.6} propOverride="none" /></Layer>
    </Camera></Stage>
    <Amb name="wind" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

export const secesionScenes = {s1_appomattox: S1, s2_secesion: S2, s3_esclavitud: S3, s4_guerra: S4, s5_gettysburg: S5, s6_giro: S6, s7_dospaises: S7, s8_superpotencia: S8, s9_final: S9};
