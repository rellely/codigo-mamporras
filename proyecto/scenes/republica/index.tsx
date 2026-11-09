// EPISODIO 8 — ¿Y si nunca hubiera habido una dictadura en España?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Camera, ClassicBuilding, Clouds, Crowd, Explosion, Flag, FlagFace, Ground, Haze, Layer, LightRays, Mountains, Ridge, Sky, Smoke, Snow, Stage, Sun, Tree, Embers, Dust, Palace, Sea} from '../../components/World';
import {MapView, ProjCfg} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';

const SPAIN: ProjCfg = {type: 'mercator', center: [-3.6, 38.6], scale: 4200};
const REP = '#7a3a8a';

const PropPlane: React.FC<{x: number; y: number; s?: number; facing?: number}> = ({x, y, s = 1, facing = 1}) => {
  const f = useCurrentFrame();
  return <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
    <path d="M-120,0 Q-40,-22 90,-10 Q120,0 90,10 Q-40,22 -120,0Z" fill="#6a6a5a" /><path d="M-10,-6 L-50,-70 L-20,-70 L30,-6Z M-10,6 L-50,70 L-20,70 L30,6Z" fill="#5a5a4a" />
    <path d="M-110,0 L-140,-40 L-120,-40 L-96,-4Z" fill="#5a5a4a" /><ellipse cx={100} cy={0} rx={4} ry={36 * Math.abs(Math.sin(f))} fill="#aaa" />
  </g>;
};

// ---------- 1. Golpe de julio de 1936 ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const gol = cue.word('golpe'); const dic = cue.word('dictadura');
  const crack = clamp((f - gol - 10) / 20);
  return <AbsoluteFill>
    <Stage bg="#8fb1b8"><MapView proj={SPAIN} theme="vintage" zoom={[[0, 1.0], [d, 1.08]]} focus={[-3.6, 38.6]}
      fills={[{names: ['Spain'], color: REP, at: 0, dur: 10}]}
      pins={[{at: [-2.94, 35.29], from: gol, label: 'Melilla', color: '#d7263d'}]}
      labels={[{at: [-3.7, 40.2], text: L('ESPAÑA'), from: 4, size: 70, color: '#fff'}]}>
      <path d={`M${430},${560} L${480},${700} L${440},${820} L${520},${960} L${470},${1100} L${540},${1260}`} transform={`translate(80,0)`} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray={`${crack * 900} 2000`} strokeLinecap="round" />
    </MapView></Stage>
    <DateStamp text="17·7·1936" sub={L('GOLPE MILITAR')} from={6} dur={dic} y={640} />
    <Amb name="wind" vol={0.15} dur={d} /><Sfx name="impact" at={gol + 10} vol={0.5} /><Sfx name="crumble" at={gol + 12} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 2. La Segunda República ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const seg = cue.word('segunda'); const vot = cue.word('voto');
  const ballot = f >= vot - 6;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.1, y: 60}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#5a8ac0" bottom="#f0e0c0" id="skyR2" /><Clouds n={4} y0={150} y1={450} speed={0.4} /></Layer>
      <Layer depth={0.45}><ClassicBuilding x={540} y={1200} s={0.9} color="#e8d0b0" title={ballot ? 'COLEGIO ELECTORAL' : 'PUERTA DEL SOL'} cols={7} /><Flag kind="republica" x={540} y={760} pole={200} w={150} h={100} /></Layer>
      <Layer depth={0.75}><Ground y={1200} color="#b8a888" /><Crowd y={1290} n={18} s={0.7} cheer={!ballot} flags={['republica']} seed={5} /></Layer>
      <Layer depth={1}>{!ballot ? <Character d={CAST.azana} x={300} y={1760} scale={1.3} pose="talkA" pose2="open" mix={Math.abs(Math.sin(f / 25))} expr="happy" talking look={0.3} />
        : <><Character d={CAST.maestra} x={380} y={1760} scale={1.35} pose="holdFront" expr="happy" look={0.5} propOverride="paper" />
          <g transform="translate(720,1600)" stroke={C.ink} strokeWidth={6}><rect x={-110} y={-140} width={220} height={200} rx={10} fill="#d8e6ee" opacity={0.85} /><rect x={-50} y={-150} width={100} height={14} fill="#333" />
            <rect x={-30} y={-210 + Math.min(f - vot, 20) * 3} width={60} height={70} fill="#fbf6e6" strokeWidth={3} /></g></>}</Layer>
    </Camera></Stage>
    <DateStamp text="14·4·1931" sub={L('PROCLAMACIÓN DE LA REPÚBLICA')} from={seg - 10} dur={vot - seg} y={250} />
    {!ballot && <NameTag name="Manuel Azaña" role={L('Presidente del Gobierno y de la República')} from={seg + 10} dur={60} y={1560} color={REP} />}
    {ballot && <Chip text={L('1933 · PRIMER VOTO DE LAS MUJERES')} from={vot} y={300} size={40} />}
    <Amb name="crowd" vol={0.2} dur={d} /><Sfx name="cheer" at={seg} vol={0.4} /><Sfx name="paper" at={vot + 10} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 3. Guerra civil y exilio ----------
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const gue = cue.word('guerra'); const rep = cue.word('represión'); const exi = cue.word('medio');
  const exile = f >= exi - 8;
  return <AbsoluteFill>
    {!exile && <Stage><Camera k={[{f: 0, z: 1.1}, {f: exi, z: 1.0, x: 40}]} shake={3}>
      <Layer depth={0}><Sky top="#5a5a6a" bottom="#d8b88a" id="skyG3" /></Layer>
      <Layer depth={0.3}>{[0, 1].map((i) => <PropPlane key={i} x={-200 + ((f * 7 + i * 500) % 1500)} y={420 + i * 120} s={0.5} />)}</Layer>
      <Layer depth={0.45}><Ridge y={1150} amp={70} color="#b89a6a" seed={6} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#a8885a" />{Array.from({length: 6}).map((_, i) => <Tree key={i} x={-40 + i * 220} y={1270} s={0.5} kind="round" color="#6a7a4a" />)}
        <Explosion x={760} y={1250} at={20} s={0.4} /><Explosion x={300} y={1230} at={80} s={0.35} /><Smoke x={760} y={1230} color="#5a5450" n={8} opacity={0.5} /></Layer>
      <Layer depth={1}><Character d={CAST.miliciana} x={330} y={1780} scale={1.3} pose="rifle" expr="determined" propOverride="rifle" look={0.3} /></Layer>
    </Camera></Stage>}
    {exile && <Stage><Camera k={[{f: exi - 8, z: 1.1}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#7a8aa0" bottom="#e8eef2" id="skyX3" /></Layer>
      <Layer depth={0.4}><Mountains y={1200} color="#8a90a0" snow="#f4f6fa" h={700} n={6} seed={3} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#eef2f6" /></Layer>
      <Layer depth={0.85}>{Array.from({length: 12}).map((_, i) => <Character key={i} d={[CAST.citizenM, CAST.citizenF, CAST.maestra][i % 3]} x={-150 + ((f * 2 + i * 110) % 1300)} y={1400 + (i % 3) * 90} scale={0.42 + (i % 3) * 0.06} walking walkSpeed={0.8} expr="sad" seed={i * 5} />)}</Layer>
      <Layer depth={1.3}><Snow n={100} wind={0.8} /></Layer>
    </Camera></Stage>}
    <DateStamp text="1936 – 1939" sub={L('GUERRA CIVIL')} from={gue - 6} dur={exi - gue} y={250} />
    {!exile && <Chip text={L('REPRESIÓN EN AMBOS BANDOS')} from={rep} y={420} color="#fff" />}
    {exile && <BigStat value={450000} prefix="≈" from={exi} label={L('exiliados en «La Retirada», 1939')} y={250} />}
    {!exile && <><Amb name="gunfire" vol={0.25} dur={exi} /><Sfx name="boom" at={20} vol={0.35} /><Sfx name="boom" at={80} vol={0.3} /></>}
    {exile && <Amb name="wind" vol={0.35} from={exi - 8} dur={d - exi + 8} />}
  </AbsoluteFill>;
};

// ---------- 4. Franco ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const fra = cue.word('francisco'); const cen = cue.word('censura'); const ais = cue.word('aislamiento');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.15, y: 80}, {f: cen, z: 1.0}, {f: d, z: 0.95}]}>
      <Layer depth={0}><Sky top="#3a3a44" bottom="#8a8478" id="skyF4" /></Layer>
      <Layer depth={0.45}><Palace x={540} y={1250} s={0.8} color="#c8bca8" /></Layer>
      <Layer depth={0.75}><Ground y={1250} color="#6a6458" /></Layer>
      <Layer depth={1}><Character d={CAST.franco} x={380} y={1780} scale={1.35} pose="behind" expr="determined" look={0.3} /></Layer>
    </Camera></Stage>
    {f > cen && <div style={{position: 'absolute', top: 420, right: 70, width: 420, transform: `rotate(4deg) scale(${easeOut(clamp((f - cen) / 8))})`}}>
      <div style={{background: '#f4ecd8', border: `6px solid ${C.ink}`, padding: 20, fontFamily: FONT_UI, fontWeight: 800, fontSize: 22, color: '#555', lineHeight: 1.6}}>
        {Array.from({length: 6}).map((_, i) => <div key={i} style={{background: i % 2 ? '#111' : 'transparent', height: 20, margin: '8px 0', borderBottom: i % 2 ? 'none' : '3px solid #999'}} />)}</div>
      <div style={{position: 'absolute', top: 70, left: -10, right: -10, textAlign: 'center', transform: 'rotate(-14deg)'}}><span style={{fontFamily: FONT_TITLE, fontSize: 62, color: '#d7263d', border: '8px solid #d7263d', padding: '0 14px', borderRadius: 10, background: 'rgba(244,236,216,0.8)'}}>{L('CENSURADO')}</span></div></div>}
    <DateStamp text="1939 – 1975" sub={L('DICTADURA')} from={0} dur={cen} y={250} />
    <NameTag name="Francisco Franco" role={L('Dictador (1939–1975)')} from={fra} dur={70} y={1560} color="#8a7a4a" />
    <Chip text={L('AISLAMIENTO INTERNACIONAL')} from={ais} y={300} color="#fff" />
    <Sfx name="stamp" at={cen} vol={0.7} /><Sfx name="snare_march" at={0} vol={0.12} dur={d} />
  </AbsoluteFill>;
};

// ---------- 5. Giro: el golpe fracasa ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const fra = cue.word('fracasa'); const nun = cue.word('nunca');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0}, {f: d, z: 1.12, y: 80}]}>
      <Layer depth={0}><Sky top="#4a8ad0" bottom="#f8e8c0" id="skyR5" /><Sun x={820} y={460} r={80} /><LightRays x={820} y={460} n={8} opacity={0.15} /></Layer>
      <Layer depth={0.45}><ClassicBuilding x={540} y={1200} s={0.9} color="#e8d0b0" title="CORTES" cols={7} /><Flag kind="republica" x={540} y={760} pole={200} w={150} h={100} /></Layer>
      <Layer depth={0.75}><Ground y={1200} color="#b8a888" /><Crowd y={1300} n={20} s={0.75} cheer={f > nun} flags={['republica']} seed={9} /></Layer>
      <Layer depth={1}><Character d={CAST.azana} x={540} y={1800} scale={1.4} pose={f > nun ? 'victory' : 'open'} expr="happy" talking={f < nun} /></Layer>
    </Camera></Stage>
    <Chip text={L('EL GOLPE FRACASA')} from={fra} y={300} size={56} />
    <Chip text={L('SIN GUERRA CIVIL')} from={nun} y={410} color="#fff" rot={2} />
    <Sfx name="cheer" at={nun} vol={0.5} /><Amb name="crowd" vol={0.2} dur={d} />
  </AbsoluteFill>;
};

// ---------- 6. Aliados y Plan Marshall ----------
const ALLIES = ['United Kingdom', 'France', 'United States of America', 'Canada', 'Russia', 'Belgium', 'Netherlands', 'Norway', 'Poland', 'Greece', 'Luxembourg', 'Denmark'];
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const ali = cue.word('aliados'); const mar = cue.word('marshall');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8"><MapView proj={{type: 'mercator', center: [-20, 46], scale: 520}} theme="vintage"
      fills={[{names: ALLIES, color: '#2a6fd6', at: ali - 10, dur: 10, stagger: 1}, {names: ['Spain'], color: '#7ea3f0', at: ali, dur: 14, glow: true}, {names: ['Germany', 'Italy'], color: '#6a6a6a', at: 0, dur: 1}]}
      labels={[{at: [-4, 40], text: L('¿ESPAÑA?'), from: ali + 4, size: 46, color: '#fff'}]}
      arrows={[{from: [-74, 40.7], to: [-5, 43], at: mar, dur: 30, color: '#3ddc84', width: 22, label: L('PLAN MARSHALL'), curve: -0.15}]} /></Stage>
    <DateStamp text="1939 – 1945" sub={L('SEGUNDA GUERRA MUNDIAL')} from={0} dur={mar} y={250} />
    <Chip text={L('EN LA REALIDAD: SIN PLAN MARSHALL')} from={mar + 30} y={300} color="#fff" size={36} />
    <Sfx name="pop" at={ali} /><Sfx name="whoosh" at={mar} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 7. Comunidad Europea ----------
const SIX = ['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg'];
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const com = cue.word('comunidad'); const n86 = cue.word('1986');
  return <AbsoluteFill>
    <Stage bg="#0b2a5a"><MapView proj={{type: 'conic', center: [6, 47], scale: 2000, parallels: [40, 55]}} theme="cold"
      fills={[{names: SIX, color: '#ffcc00', at: com - 6, dur: 10, stagger: 2}, {names: ['Spain'], color: '#ffcc00', at: com + 14, dur: 12, glow: true, until: n86 - 4}, {names: ['Spain'], color: '#f2a03a', at: n86 + 4, dur: 10}]}
      labels={[{at: [7, 50], text: L('LOS SEIS (1957)'), from: com, size: 46, color: '#fff'}, {at: [-3.7, 40.2], text: f < n86 ? L('¿1957?') : '1986', from: com + 14, size: 70, color: '#fff'}]} /></Stage>
    <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: clamp((f - 4) / 10)}}><svg width={180} height={120}><FlagFace kind="eu" w={180} h={120} /></svg></div>
    <Sfx name="ding" at={com} vol={0.3} /><Sfx name="stamp" at={n86} vol={0.5} />
  </AbsoluteFill>;
};

// ---------- 8. Talento perdido ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const cie = cue.word('científicos'); const art = cue.word('artistas'); const mae = cue.word('maestros');
  const cards: [number, string, string][] = [[cie, 'Severo Ochoa', L('Premio Nobel 1959, en EE. UU.')], [art, 'Federico García Lorca', L('Poeta, asesinado en 1936')], [mae, 'Antonio Machado', L('Poeta, murió en el exilio en 1939')]];
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.05}, {f: d, z: 1.0}]}>
      <Layer depth={0}><rect x={-500} y={-500} width={2080} height={2920} fill="#2f3a2f" /><rect x={-500} y={1300} width={2080} height={900} fill="#6a4a32" /></Layer>
      <Layer depth={0.5}><g transform="translate(540,620)"><rect x={-420} y={-220} width={840} height={440} fill="#1e3a2a" stroke="#6a4a32" strokeWidth={24} />
        <text x={-360} y={-100} fontFamily="Montserrat" fontWeight={600} fontSize={64} fill="#e8eee8" opacity={0.85}>a b c · 1 + 1 = 2</text></g></Layer>
      <Layer depth={1}><Character d={CAST.maestra} x={300} y={1800} scale={1.35} pose="point" expr="sad" look={0.5} propOverride="pointer" /></Layer>
    </Camera></Stage>
    {cards.map(([at, n, r], i) => f > at && <div key={i} style={{position: 'absolute', right: 50, top: 900 + i * 150, transform: `translateX(${(1 - easeOut(clamp((f - at) / 10))) * 400}px)`}}>
      <div style={{background: '#fffaf0', border: `5px solid ${C.ink}`, padding: '10px 18px', boxShadow: '0 6px 0 #0d0a12', borderLeft: `16px solid ${REP}`}}>
        <div style={{fontFamily: FONT_TITLE, fontSize: 40, color: C.ink}}>{n}</div><div style={{fontFamily: FONT_UI, fontWeight: 800, fontSize: 24, color: '#5a5060'}}>{r}</div></div></div>)}
    <Sfx name="pop" at={cie} /><Sfx name="pop" at={art} /><Sfx name="pop" at={mae} />
  </AbsoluteFill>;
};

// ---------- 9. Constitución de 1978 ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const con = cue.word('constitución');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 100}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#3a7ac0" bottom="#f8e0b0" id="skyC9" /><Sun x={540} y={960} r={110} /><LightRays x={540} y={960} n={9} opacity={0.15} /></Layer>
      <Layer depth={0.5}><ClassicBuilding x={540} y={1200} s={0.9} color="#e8dcc0" title="CONGRESO" cols={7} /></Layer>
      <Layer depth={0.75}><Ground y={1200} color="#b8a888" /><Crowd y={1300} n={22} s={0.7} cheer flags={['spain']} seed={3} /></Layer>
    </Camera></Stage>
    {f > con && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform={`translate(540,${720}) scale(${easeOut(clamp((f - con) / 10))})`} stroke={C.ink} strokeWidth={8}>
      <rect x={-170} y={-220} width={340} height={440} rx={12} fill="#8a1a24" /><rect x={-140} y={-190} width={280} height={380} fill="none" stroke={C.gold} strokeWidth={6} />
      <text y={-60} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={44} fill={C.gold} stroke="none">{L('CONSTITUCIÓN')}</text><text y={0} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={44} fill={C.gold} stroke="none">{L('ESPAÑOLA')}</text>
      <text y={90} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={80} fill={C.gold} stroke="none">1978</text></g></svg>}
    <Amb name="crowd" vol={0.2} dur={d} /><Sfx name="cheer" at={con} vol={0.4} />
  </AbsoluteFill>;
};

export const republicaScenes = {s1_golpe: S1, s2_republica: S2, s3_guerra: S3, s4_franco: S4, s5_giro: S5, s6_aliados: S6, s7_europa: S7, s8_talento: S8, s9_final: S9};
