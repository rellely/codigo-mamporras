// EPISODIO 2 — ¿Y si Napoleón hubiera ganado?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Army, Camera, Cannon, Clouds, Flag, FlagFace, Galleon, Ground, Haze, Layer, LightRays, MiniSoldier, Rain, Ridge, Sea, Sky, Smoke, Snow, Stage, Sun, Tree, Embers, Explosion, Dust, Mountains} from '../../components/World';
import {MapView} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';

const FR = '#2a5bd7', FR2 = '#7ea3f0';
const french = {coat: '#1d3f8f', pants: '#f4f0e6', hat: 'shako' as const, hatColor: '#1a1a1a'};
const british = {coat: '#c1272d', pants: '#e9e4d6', hat: 'shako' as const, hatColor: '#1a1a1a'};
const prussian = {coat: '#1d2a3a', pants: '#2a3442', hat: 'cap' as const, hatColor: '#1a1a1a'};
const austrian = {coat: '#f0ece0', pants: '#f0ece0', hat: 'shako' as const, hatColor: '#1a1a1a'};
const russian = {coat: '#1f4a30', pants: '#e5e0d2', hat: 'shako' as const, hatColor: '#1a1a1a'};

const Battlefield: React.FC<{rain?: boolean; sunny?: number}> = ({rain, sunny = 0}) => (
  <>
    <Layer depth={0}><Sky top={sunny ? '#6aa0d8' : '#4a5566'} mid={sunny ? '#a8c8e8' : '#7a8290'} bottom={sunny ? '#f6dfa8' : '#b8b4a6'} id={sunny ? 'skyS' : 'skyR'} />
      {sunny > 0 && <g opacity={sunny}><Sun x={820} y={420} r={90} /><LightRays x={820} y={420} n={8} opacity={0.2} /></g>}</Layer>
    <Layer depth={0.2}><Clouds n={7} y0={120} y1={650} color={sunny ? '#ffffff' : '#8a909a'} speed={0.7} opacity={sunny ? 0.8 : 0.95} /></Layer>
    <Layer depth={0.45}><Ridge y={1100} amp={60} color={sunny ? '#7fa060' : '#5f7050'} seed={4} /></Layer>
    <Layer depth={0.6}><Ridge y={1200} amp={40} color={sunny ? '#6a8e4a' : '#4d5f40'} seed={7} />
      <g transform="translate(860,1130) scale(0.5)" stroke={C.ink} strokeWidth={6}><rect x={-160} y={-120} width={320} height={120} fill="#d8cbb0" /><path d="M-180,-120 L0,-200 L180,-120Z" fill="#8a4a32" /><rect x={-30} y={-60} width={60} height={60} fill="#5a3a24" /></g>
    </Layer>
    <Layer depth={0.8}><Ground y={1300} color={sunny ? '#5f7f3e' : '#4a5634'} color2={sunny ? '#6e8f48' : '#5b4a32'} /></Layer>
    {rain && <Layer depth={1.4}><Rain n={140} /></Layer>}
  </>
);

// ---------- 1. Waterloo, mañana del 18 de junio ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const g = cue.word('ganado');
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.0, y: 0}, {f: g - 20, z: 1.15, y: 120}, {f: g + 10, z: 1.6, y: 340, x: 0}, {f: d, z: 1.65, y: 350}]}>
        <Battlefield />
        <Layer depth={0.7}><Army x={-120} y={1225} rows={2} cols={16} dx={70} s={0.55} soldier={{...french, marching: false}} flag="france" /></Layer>
        <Layer depth={0.75}><Smoke x={120} y={1220} color="#bfbab0" n={8} opacity={0.4} /><Smoke x={980} y={1220} color="#bfbab0" n={8} opacity={0.4} /><Haze y={1250} color="#c8c4b8" h={200} opacity={0.5} /></Layer>
        <Layer depth={1}><Character d={CAST.napoleon} x={540} y={1780} scale={1.65} pose="handInCoat" expr={f > g ? 'smug' : 'determined'} look={0.15} /></Layer>
        <Layer depth={1.5}><Rain n={50} opacity={0.25} /></Layer>
      </Camera>
    </Stage>
    <DateStamp text="18·06·1815" sub="WATERLOO (ACTUAL BÉLGICA)" from={6} dur={130} y={640} />
    <Amb name="wind" vol={0.2} dur={d} /><Amb name="snare_march" vol={0.12} dur={d} /><Sfx name="cannon" at={30} vol={0.3} /><Sfx name="impact" at={g} vol={0.45} />
  </AbsoluteFill>;
};

// ---------- 2. Coronación y Austerlitz ----------
const Cathedral: React.FC = () => {
  const f = useCurrentFrame();
  return <g>
    <rect x={-600} y={-600} width={2280} height={3120} fill="#2b2433" />
    {[-1, 0, 1, 2].map((i) => <g key={i} transform={`translate(${180 + i * 300},0)`}>
      <path d="M-110,1500 L-110,500 Q0,250 110,500 L110,1500" fill="none" stroke="#4a3f58" strokeWidth={34} />
      <path d="M-70,900 L-70,560 Q0,380 70,560 L70,900Z" fill="#3a6aa8" stroke="#1a1424" strokeWidth={8} />
      {[0, 1, 2, 3].map((j) => <rect key={j} x={-70 + (j % 2) * 70} y={560 + Math.floor(j / 2) * 170} width={70} height={170} fill={['#c0392b', '#e8b33b', '#2e86de', '#27ae60'][(i + j) % 4]} opacity={0.6} />)}
    </g>)}
    <LightRays x={540} y={300} color="#ffe9b0" n={6} opacity={0.14} />
    <rect x={-600} y={1450} width={2280} height={900} fill="#5a4a3a" /><rect x={240} y={1450} width={600} height={900} fill="#8a1a24" />
    <Dust n={40} color="#ffe9b0" />
  </g>;
};
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const emp = cue.word('emperador'); const aus = cue.word('austerlitz');
  const battle = f >= aus - 6;
  return <AbsoluteFill>
    {!battle && <Stage><Camera k={[{f: 0, z: 1.0, y: 80}, {f: aus, z: 1.25, y: 180}]}>
      <Layer depth={0.5}><Cathedral /></Layer>
      <Layer depth={0.8}><Crowd2 /></Layer>
      <Layer depth={1}><Character d={CAST.napoleonCoronation} x={540} y={1700} scale={1.55} pose={f > emp - 10 ? 'victory' : 'holdFront'} expr={f > emp ? 'happy' : 'determined'} jump={f > emp - 10 ? tween(f, emp - 10, emp, 0, 20) : 0} /></Layer>
    </Camera></Stage>}
    {battle && <Stage><Camera k={[{f: aus - 6, z: 1.2, y: 0}, {f: d, z: 1.0, y: -40}]} shake={3}>
      <Layer depth={0}><Sky top="#5a7fb0" mid="#e8c8a0" bottom="#f8e6b8" id="skyA" /><Sun x={540} y={760} r={110} color="#fff6d0" glow="#ffd27a" /><LightRays x={540} y={760} n={9} opacity={0.18} /></Layer>
      <Layer depth={0.5}><Ridge y={1120} amp={70} color="#b8b8c4" seed={2} /><Haze y={1150} color="#f4ecdc" h={300} opacity={0.8} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#8a9a6a" /><Army x={600} y={1260} rows={2} cols={9} s={0.5} dx={70} speed={0.9} soldier={{...austrian, facing: 1}} /><Army x={720} y={1340} rows={2} cols={7} s={0.55} speed={1.1} soldier={{...russian, facing: 1}} /></Layer>
      <Layer depth={0.9}><Army x={-500} y={1450} rows={3} cols={10} s={0.75} dx={70} speed={2.2} soldier={{...french, hat: 'bearskin'}} flag="france" />
        <Cannon x={160} y={1720} s={0.9} fireAt={[aus + 5, aus + 40, aus + 70]} /><Explosion x={800} y={1290} at={aus + 15} s={0.4} /><Explosion x={640} y={1330} at={aus + 50} s={0.4} /></Layer>
      <Layer depth={1.3}><Smoke x={300} y={1800} color="#dddddd" n={8} opacity={0.5} /></Layer>
    </Camera></Stage>}
    {!battle && <DateStamp text="2·12·1804" sub="NOTRE-DAME, PARÍS" from={emp - 30} dur={aus - emp + 20} y={250} />}
    {battle && <DateStamp text="2·12·1805" sub="AUSTERLITZ" from={aus - 6} dur={200} y={250} />}
    {battle && <div style={{position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center', opacity: clamp((f - aus) / 10)}}>
      <svg width={130} height={86}><FlagFace kind="france" w={130} h={86} /></svg><span style={{fontFamily: FONT_TITLE, fontSize: 64, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>VS</span>
      <svg width={130} height={86}><FlagFace kind="austria" w={130} h={86} /></svg><svg width={130} height={86}><FlagFace kind="russia" w={130} h={86} /></svg></div>}
    {!battle && <><Sfx name="bell" at={emp - 6} vol={0.4} /><Sfx name="cheer" at={emp} vol={0.4} /></>}
    {battle && <><Amb name="march" vol={0.25} from={aus - 6} dur={d - aus + 6} /><Sfx name="cannon" at={aus + 5} vol={0.45} /><Sfx name="boom" at={aus + 15} vol={0.3} /><Sfx name="cannon" at={aus + 40} vol={0.4} /><Sfx name="boom" at={aus + 50} vol={0.3} /></>}
  </AbsoluteFill>;
};
const Crowd2: React.FC = () => {
  const f = useCurrentFrame();
  return <g>{Array.from({length: 12}).map((_, i) => <g key={i} transform={`translate(${-40 + i * 100},${1480 + (i % 2) * 40}) scale(0.9)`} stroke={C.ink} strokeWidth={3}>
    <path d="M-36,0 Q-40,-110 0,-114 Q40,-110 36,0Z" fill={['#7a1e2e', '#1d3f8f', '#2b2b2f', '#5a3a6a'][i % 4]} /><circle cx={0} cy={-140} r={28} fill="#f3d3bb" />
    <path d="M-28,-150 Q0,-185 28,-150" fill={i % 3 ? '#ecebe8' : '#4a3324'} />{i % 4 === 0 && <ellipse cx={0} cy={-170} rx={34} ry={10} fill="#1a1a1a" />}
  </g>)}</g>;
};

// ---------- 3. Mapa 1812 ----------
const EMPIRE = ['France', 'Belgium', 'Netherlands', 'Luxembourg'];
const SATS = ['Spain', 'Italy', 'Germany', 'Poland', 'Switzerland', 'Croatia', 'Slovenia'];
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mad = cue.word('madrid'); const var_ = cue.word('varsovia');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={{type: 'conic', center: [12, 47], scale: 2300, parallels: [40, 55]}} theme="vintage"
        zoom={[[0, 1.25], [d, 1.0]]} focus={[8, 47]}
        fills={[{names: EMPIRE, color: FR, at: 4, dur: 10}, {names: SATS, color: FR2, at: 14, dur: 12, stagger: 3}]}
        labels={[{at: [2.4, 46.6], text: 'IMPERIO FRANCÉS', from: 8, size: 52, color: '#fff'}, {at: [10, 51], text: 'ESTADOS SATÉLITE', sub: 'Y ALIADOS FORZOSOS', from: 30, size: 40, color: '#14306e'}]}
        pins={[{at: [-3.7, 40.4], from: mad, label: 'Madrid', big: true}, {at: [21, 52.2], from: var_, label: 'Varsovia', big: true}, {at: [2.35, 48.85], from: 6, label: 'París', color: '#fff'}]}
        arrows={[{from: [-3.7, 40.4], to: [21, 52.2], at: mad + 6, dur: var_ - mad + 6, color: C.yellow, curve: -0.2}]} />
    </Stage>
    <DateStamp text="1812" sub="EUROPA (FRONTERAS APROXIMADAS)" from={0} dur={d} y={250} />
    <Sfx name="paper" at={2} vol={0.5} /><Sfx name="whoosh" at={mad + 6} vol={0.4} /><Sfx name="ding" at={var_} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 4. Campaña de Rusia ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const inv = cue.word('invierno'); const sol = cue.word('pequeña');
  const showMap = f < inv - 8;
  const alive = (i: number) => f < inv ? 1 : 1 - clamp((f - inv - rand(i, 7) * (sol - inv + 20)) / 12);
  return <AbsoluteFill>
    {showMap && <Stage bg="#8fb1b8"><MapView proj={{type: 'conic', center: [30, 54], scale: 2400, parallels: [45, 60]}} theme="vintage"
      fills={[{names: ['Russia', 'Belarus', 'Ukraine', 'Lithuania', 'Latvia', 'Estonia'], color: '#3a7a4a', at: 0, dur: 1}, {names: ['Poland'], color: FR2, at: 0, dur: 1}]}
      arrows={[{from: [23.9, 54.9], to: [37.6, 55.75], at: 6, dur: 40, color: FR, width: 26, label: '≈ 600.000'}]}
      pins={[{at: [37.6, 55.75], from: 40, label: 'Moscú', big: true}, {at: [23.9, 54.9], from: 4, label: 'Niemen'}]} labels={[{at: [33, 57], text: 'IMPERIO RUSO', from: 4, size: 50}]} /></Stage>}
    {!showMap && <Stage><Camera k={[{f: inv - 8, z: 1.15, x: -40}, {f: d, z: 1.0, x: 40}]}>
      <Layer depth={0}><Sky top="#7c8798" bottom="#d8dde4" id="skyW" /></Layer>
      <Layer depth={0.3}><Ridge y={1080} amp={40} color="#e9edf2" seed={5} /></Layer>
      <Layer depth={0.5}>{Array.from({length: 8}).map((_, i) => <Tree key={i} x={-60 + i * 170} y={1150} s={0.7} kind="birch" snow />)}</Layer>
      <Layer depth={0.7}><Ground y={1180} color="#eef2f6" color2="#dfe5ec" />
        {Array.from({length: 26}).map((_, i) => <g key={i} opacity={alive(i)}><MiniSoldier x={1200 - ((f * 0.8 + i * 70) % 1500)} y={1230 + (i % 3) * 50} s={0.8} coat={['#1d3f8f', '#5a5a6a', '#3a4a7a'][i % 3]} pants="#d8d4c8" hat={i % 4 ? 'shako' : 'bearskin'} facing={-1} phase={i} /></g>)}</Layer>
      <Layer depth={1}><Character d={CAST.napoleonWinter} x={360} y={1750} scale={1.45} pose="handInCoat" expr="sad" walking walkSpeed={0.6} look={-0.3} facing={-1} />
        <Character d={CAST.kutuzov} x={900} y={1650} scale={1.05} pose="crossArms" expr="smug" look={-0.4} facing={-1} /></Layer>
      <Layer depth={1.4}><Snow n={170} wind={-1.8} size={1.2} /></Layer>
    </Camera></Stage>}
    {showMap && <DateStamp text="JUNIO 1812" sub="INVASIÓN DE RUSIA" from={0} dur={inv} y={250} />}
    {!showMap && <NameTag name="Mijaíl Kutúzov" role="Comandante en jefe ruso" from={inv + 10} dur={80} x={420} y={1500} color="#1f4a30" />}
    {!showMap && <Chip text="HASTA -30 °C" from={inv} y={300} color="#9fd0ff" size={70} />}
    <Amb name="march" vol={0.2} dur={inv} /><Amb name="wind" vol={0.4} from={inv - 8} dur={d - inv + 8} />
  </AbsoluteFill>;
};

// ---------- 5. Elba y Waterloo ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const wat = cue.word('waterloo'); const wel = cue.word('wellington'); const blu = cue.word('blücher'); const llu = cue.word('lluvia'); const tie = cue.word('tiempo');
  const elba = f < wat - 6;
  return <AbsoluteFill>
    {elba && <Stage><Camera k={[{f: 0, z: 1.1}, {f: wat, z: 1.0, x: 80}]}>
      <Layer depth={0}><Sky top="#1a2a4a" bottom="#e89a6a" id="skyE" /><Sun x={300} y={1000} r={80} color="#ffd9a0" /></Layer>
      <Layer depth={0.4}><g transform="translate(250,1100)"><path d="M-300,0 Q-150,-160 0,-120 Q150,-200 300,0Z" fill="#3a4a3a" stroke={C.ink} strokeWidth={4} /></g><text x={250} y={960} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={56} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">ELBA</text></Layer>
      <Layer depth={0.7}><Sea y={1100} color="#2a4a6a" /></Layer>
      <Layer depth={1}><Galleon x={tween(f, 0, wat, 380, 900)} y={1350} s={0.75} flag="france" /></Layer>
    </Camera></Stage>}
    {!elba && <Stage><Camera k={[{f: wat - 6, z: 1.05, x: 0}, {f: blu, z: 1.0, x: 0}, {f: blu + 20, z: 0.95, x: -60}, {f: d, z: 1.1, x: 0, y: 60}]}>
      <Battlefield rain={f > llu - 10} />
      <Layer depth={0.65}>
        <Army x={-60} y={1230} rows={2} cols={8} s={0.5} dx={70} soldier={{...british, marching: false, facing: 1}} flag="uk" />
        <Army x={600} y={1230} rows={2} cols={8} s={0.5} dx={70} soldier={{...french, marching: false, facing: -1}} flag="france" />
        {f > blu && <Army x={-700 + Math.min(f - blu, 120) * 3} y={1150} rows={2} cols={10} s={0.4} dx={70} soldier={{...prussian}} flag="prussia" />}
      </Layer>
      <Layer depth={1}>
        <Character d={CAST.wellington} x={170} y={1780} scale={1.15} pose="holdUp" expr="determined" look={0.5} />
        <Character d={CAST.napoleon} x={880} y={1780} scale={1.15} pose="handInCoat" expr={f > tie ? 'surprised' : 'determined'} facing={-1} look={0.4} />
        {f > blu && <Character d={CAST.blucher} x={tween(f, blu, blu + 30, -200, 520)} y={1620} scale={0.8} pose="holdUp" expr="shout" walking={f < blu + 30} />}
      </Layer>
    </Camera></Stage>}
    {elba && <DateStamp text="1815" sub="HUIDA DE ELBA" from={0} dur={wat} y={250} />}
    {!elba && <NameTag name="Wellington" role="Ejército anglo-aliado" from={wel - 4} dur={50} x={40} y={1450} color="#c1272d" />}
    {!elba && <NameTag name="Blücher" role="Ejército prusiano" from={blu + 8} dur={60} x={440} y={1080} color="#1d2a3a" />}
    {!elba && f > llu && <Chip text="BARRO · ATAQUE RETRASADO" from={llu} y={330} color="#9fd0ff" />}
    <Amb name="sea" vol={0.3} dur={wat} /><Amb name="rain" vol={0.3} from={llu - 10} dur={d - llu + 10} /><Amb name="snare_march" vol={0.15} from={wat} dur={d - wat} /><Sfx name="thunder" at={llu} vol={0.4} /><Sfx name="march" at={blu} vol={0.4} dur={80} />
  </AbsoluteFill>;
};

// ---------- 6. Giro: Napoleón gana ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const gana = cue.word('gana'); const sunny = tween(f, 8, 40, 0, 1);
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0}, {f: gana, z: 1.1, y: 80}, {f: d, z: 1.3, y: 180}]}>
      <Battlefield sunny={sunny} />
      <Layer depth={0.7}><Army x={-100} y={1240} rows={3} cols={14} s={0.55} dx={72} speed={f > gana ? 0 : 0.4} soldier={{...french, hat: 'bearskin', marching: f < gana}} flag="france" /></Layer>
      <Layer depth={1}><Character d={CAST.napoleon} x={540} y={1800} scale={1.6} pose={f > gana ? 'victory' : 'handInCoat'} expr={f > gana ? 'happy' : 'determined'} jump={f > gana && f < gana + 20 ? Math.sin(((f - gana) / 20) * Math.PI) * 40 : 0} />
        {f > gana && <Flag kind="france" x={880} y={1800} pole={900} w={260} h={170} />}</Layer>
      {f > gana && <Layer depth={1.2}><Embers n={40} color="#ffd60a" /></Layer>}
    </Camera></Stage>
    <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', opacity: clamp((f - 15) / 10) * (1 - clamp((f - gana + 10) / 10))}}>
      <span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 44, background: '#fff', padding: '8px 18px', border: '5px solid #000', borderRadius: 10}}>☀ SUELO SECO · PRUSIANOS LEJOS</span></div>
    <Chip text="¡VICTORIA FRANCESA!" from={gana} y={330} size={64} />
    <Sfx name="cheer" at={gana} vol={0.6} /><Sfx name="cannon" at={gana - 20} vol={0.3} /><Sfx name="impact" at={gana} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 7. Giro de guion: ni así ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const aus = cue.word('austria'); const rus = cue.word('rusia');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={{type: 'conic', center: [14, 49], scale: 1900, parallels: [40, 55]}} theme="vintage"
        fills={[{names: ['France'], color: FR, at: 0, dur: 1}, {names: ['Austria', 'Czechia', 'Hungary', 'Slovakia'], color: '#e8e2d4', at: aus - 4, dur: 10}, {names: ['Russia', 'Belarus', 'Ukraine', 'Lithuania', 'Latvia', 'Estonia'], color: '#3a7a4a', at: rus - 4, dur: 10}, {names: ['United Kingdom'], color: '#c1272d', at: 0, dur: 1}, {names: ['Germany'], color: '#5a6a7a', at: 0, dur: 1}]}
        arrows={[{from: [16.4, 48.2], to: [7.5, 48.6], at: aus, dur: 30, color: '#f4f0e6', width: 30, label: 'AUSTRIA'}, {from: [30, 54], to: [9, 50], at: rus, dur: 40, color: '#2f8a4a', width: 36, label: 'RUSIA', curve: 0.15}]}
        labels={[{at: [2.4, 46.8], text: 'FRANCIA', from: 0, size: 48, color: '#fff'}]} />
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Character d={CAST.napoleon} x={820} y={1880} scale={0.9} pose="despair" expr="worried" facing={-1} /></svg>
    <Chip text="¡SORPRESA!" from={2} dur={aus} y={300} size={70} color="#ff5a5a" textColor="#fff" />
    <BigStat value={800000} from={rus + 20} prefix="+" label="soldados de la coalición (aprox.)" y={300} />
    <Sfx name="pop" at={2} /><Amb name="march" vol={0.35} from={aus} dur={d - aus} /><Sfx name="impact" at={rus + 20} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 8. Si hubiera ganado en Rusia ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const cod = cue.word('código'); const met = cue.word('métrico'); const ue = cue.word('unión');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={{type: 'conic', center: [18, 50], scale: 1500, parallels: [40, 60]}} theme="vintage"
        fills={[{names: ['France', 'Belgium', 'Netherlands', 'Luxembourg', 'Spain', 'Portugal', 'Italy', 'Germany', 'Poland', 'Switzerland', 'Austria', 'Czechia', 'Slovakia', 'Hungary', 'Croatia', 'Slovenia', 'Denmark', 'Lithuania', 'Latvia', 'Estonia', 'Belarus', 'Ukraine', 'Russia', 'Romania', 'Bulgaria', 'Serbia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Macedonia', 'Greece', 'Moldova', 'Sweden', 'Norway', 'Finland'], color: FR, at: 4, dur: 10, stagger: 1.2}, {names: ['United Kingdom', 'Ireland'], color: '#c1272d', at: 0, dur: 1}]}
        labels={[{at: [15, 50], text: 'IMPERIO NAPOLEÓNICO', sub: 'HIPOTÉTICO', from: 30, size: 58, color: '#fff'}]} />
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <Icon at={cod} x={250} y={1650} kind="book" /><Icon at={met} x={540} y={1650} kind="ruler" /><Icon at={ue} x={830} y={1650} kind="eu" />
    </svg>
    <Chip text="CÓDIGO NAPOLEÓNICO" from={cod} y={1480} x={290} size={30} /><Chip text="SISTEMA MÉTRICO" from={met} y={1530} x={560} size={30} color="#fff" rot={2} /><Chip text="¿UE EN 1812?" from={ue} y={1480} x={830} size={30} />
    <Sfx name="pop" at={cod} /><Sfx name="pop" at={met} /><Sfx name="pop" at={ue} /><Sfx name="whoosh" at={4} vol={0.3} />
  </AbsoluteFill>;
};
const Icon: React.FC<{at: number; x: number; y: number; kind: 'book' | 'ruler' | 'eu'}> = ({at, x, y, kind}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null; const k = easeOut(clamp(f / 10)); const bob = Math.sin(f / 10) * 6;
  return <g transform={`translate(${x},${y + bob}) scale(${k})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <circle r={120} fill="#fffaf0" />
    {kind === 'book' && <g><rect x={-60} y={-75} width={120} height={150} rx={8} fill="#1d3f8f" /><rect x={-48} y={-62} width={96} height={124} fill="#2a5bd7" strokeWidth={3} /><text x={0} y={10} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={60} fill={C.gold} stroke="none">N</text></g>}
    {kind === 'ruler' && <g transform="rotate(-25)"><rect x={-95} y={-25} width={190} height={50} fill="#e8b33b" />{Array.from({length: 10}).map((_, i) => <line key={i} x1={-85 + i * 19} y1={-25} x2={-85 + i * 19} y2={i % 5 ? -10 : 2} strokeWidth={3} />)}<text x={0} y={18} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={28} fill={C.ink} stroke="none">1 m</text></g>}
    {kind === 'eu' && <g transform="translate(-75,-50)"><FlagFace kind="eu" w={150} h={100} /></g>}
  </g>;
};

// ---------- 9. Santa Elena ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.3, y: 200}, {f: d, z: 1.0, y: 0}]}>
      <Layer depth={0}><Sky top="#2a1e4a" mid="#c8506a" bottom="#f4b46a" id="skyH" /><Sun x={760} y={1060} r={100} color="#ffe0a8" glow="#ff9a6a" /></Layer>
      <Layer depth={0.2}><Clouds n={5} y0={300} y1={800} color="#f2a0a0" speed={0.3} opacity={0.6} /></Layer>
      <Layer depth={0.6}><Sea y={1100} color="#3a3a6a" color2="#2a2a50" /></Layer>
      <Layer depth={0.85}><path d="M-200,1500 Q100,1250 400,1300 Q600,1280 700,1500 L700,2400 L-200,2400Z" fill="#3a3028" stroke={C.ink} strokeWidth={6} /><Tree x={80} y={1330} kind="palm" s={1.1} color="#2a4a2a" /></Layer>
      <Layer depth={1}><Character d={CAST.napoleon} x={420} y={1440} scale={0.95} pose="behind" expr="sad" look={0.7} facing={1} /></Layer>
    </Camera></Stage>
    <DateStamp text="5·5·1821" sub="SANTA ELENA" from={0} dur={150} y={250} />
    <Amb name="sea" vol={0.4} dur={d} /><Amb name="wind" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

export const napoleonScenes = {s1_waterloo: S1, s2_ascenso: S2, s3_mapa: S3, s4_rusia: S4, s5_batalla: S5, s6_giro: S6, s7_twist: S7, s8_imperio: S8, s9_final: S9};
