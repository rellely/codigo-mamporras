// EPISODIO 4 — ¿Y si España nunca hubiera perdido sus colonias en América?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Army, Camera, Cannon, Clouds, Explosion, Flag, FlagFace, Galleon, Ground, Haze, Layer, LightRays, Mountains, Palace, Ridge, Sea, Sky, Smoke, Stage, Sun, Tree, Embers, Dust, Cathedral} from '../../components/World';
import {MapView, ProjCfg} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';
import {geoPath} from 'd3-geo';
import {makeProj} from '../../components/MapView';

const GOLD = '#d9a520', RED = '#b8202e';
const NUEVA_ESPANA = ['Mexico', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Belize', 'Cuba', 'Dominican Rep.', 'Puerto Rico'];
const NUEVA_GRANADA = ['Colombia', 'Venezuela', 'Ecuador', 'Panama'];
const PERU = ['Peru', 'Chile'];
const PLATA = ['Argentina', 'Bolivia', 'Paraguay', 'Uruguay'];
const ALL = [...NUEVA_ESPANA, ...NUEVA_GRANADA, ...PERU, ...PLATA];
const AMERICAS: ProjCfg = {type: 'mercator', center: [-80, 5], scale: 520};
// territorios septentrionales de Nueva España y Luisiana (c. 1790), contorno aproximado
const NORTE: [number, number][] = [[-124.4, 42], [-111, 42], [-104, 44], [-95, 49], [-89.5, 47.5], [-91, 36], [-89.6, 30.2], [-84, 30], [-82.6, 27.5], [-80.1, 25.2], [-81.5, 25], [-82.8, 29.5], [-89.5, 29.2], [-97.2, 26], [-106.5, 31.8], [-111, 31.3], [-117.1, 32.5], [-120.6, 34.5], [-122.5, 37.8], [-124.4, 42]];
const Norte: React.FC<{proj: ProjCfg; at: number; color?: string; dashed?: boolean}> = ({proj, at, color = RED, dashed}) => {
  const f = useCurrentFrame(); const k = clamp((f - at) / 15); if (k <= 0) return null;
  const pr = makeProj(proj); const d = 'M' + NORTE.map((ll) => (pr(ll) ?? [0, 0]).join(',')).join(' L') + 'Z';
  return <g opacity={k}><path d={d} fill={color} opacity={0.55} /><path d={d} fill="none" stroke={color} strokeWidth={4} strokeDasharray={dashed ? '14 10' : undefined} /></g>;
};

// ---------- 1. El imperio hacia 1790 ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const cal = cue.word('california'); const pat = cue.word('patagonia'); const nun = cue.word('nunca');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={AMERICAS} theme="vintage" zoom={[[0, 1.0], [cal, 1.0], [cal + 30, 1.0], [d, 0.92]]} focus={[-80, 5]}
        fills={[{names: ALL, color: RED, at: 6, dur: 12, stagger: 1.2}, {names: ['Spain'], color: RED, at: 6, dur: 12}]}
        pins={[{at: [-122.4, 37.8], from: cal, label: L('California'), big: true}, {at: [-68.3, -50], from: pat, label: L('Patagonia'), big: true, dx: -230}]}
        labels={[{at: [-62, -14], text: L('IMPERIO ESPAÑOL'), sub: L('HACIA 1790 · FRONTERAS APROX.'), from: 12, size: 54, color: '#fff'}]}>
        <Norte proj={AMERICAS} at={10} dashed />
      </MapView>
      <g transform={`translate(${tween(f, 0, d, -300, 300)},1700) scale(0.45)`}><Galleon x={0} y={0} /></g>
    </Stage>
    <Sfx name="paper" at={2} vol={0.4} /><Sfx name="ding" at={cal} vol={0.3} /><Sfx name="ding" at={pat} vol={0.3} /><Sfx name="impact" at={nun} vol={0.35} /><Amb name="sea" vol={0.12} dur={d} />
  </AbsoluteFill>;
};

// ---------- 2. Virreinatos y rutas ----------
const WORLD: ProjCfg = {type: 'mercator', center: [-55, 12], scale: 300};
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const vir = cue.word('virreinatos'); const pla = cue.word('plata'); const oce = cue.word('océanos');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={WORLD} theme="vintage" zoom={[[0, 1.35], [pla, 1.35], [pla + 25, 1.0]]} focus={[-75, 5]}
        fills={[{names: NUEVA_ESPANA, color: '#c0392b', at: vir + 4, dur: 10}, {names: PERU, color: '#d98a1f', at: vir + 18, dur: 10}, {names: NUEVA_GRANADA, color: '#2e7d4f', at: vir + 32, dur: 10}, {names: PLATA, color: '#2a6fb0', at: vir + 46, dur: 10}, {names: ['Spain'], color: RED, at: 0, dur: 1}]}
        labels={[{at: [-102, 22], text: L('NUEVA ESPAÑA'), from: vir + 6, size: 40, color: '#fff'}, {at: [-75, -10], text: L('PERÚ'), from: vir + 20, size: 40, color: '#fff'}, {at: [-72, 5], text: L('N. GRANADA'), from: vir + 34, size: 36, color: '#fff'}, {at: [-63, -30], text: L('RÍO DE LA PLATA'), from: vir + 48, size: 36, color: '#fff'}]}
        pins={[{at: [-65.75, -19.6], from: pla, label: L('Potosí'), color: '#e8e8e8'}, {at: [-96.1, 19.2], from: oce, label: L('Veracruz')}, {at: [-6.3, 36.5], from: oce, label: L('Cádiz')}, {at: [-99.9, 16.85], from: oce + 10, label: L('Acapulco'), dy: 40}]}
        arrows={[{from: [-96.1, 19.2], to: [-6.3, 36.5], at: oce, dur: 30, color: GOLD, curve: -0.2, label: L('FLOTA DE INDIAS')}, {from: [-99.9, 16.85], to: [-178, 14], at: oce + 10, dur: 30, color: GOLD, curve: 0.1, label: L('→ MANILA')}]}>
        <Norte proj={WORLD} at={vir + 4} color="#c0392b" dashed />
      </MapView>
    </Stage>
    {f > pla && f < oce + 10 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{Array.from({length: 18}).map((_, i) => { const y = ((f - pla) * (10 + rand(i, 2) * 8) + rand(i, 1) * 400) - 200;
      return <g key={i} transform={`translate(${rand(i, 3) * 1080},${y}) rotate(${f * 6 + i * 40})`}><ellipse rx={36} ry={34 * Math.abs(Math.cos(f / 6 + i))} fill="#d8dde2" stroke={C.ink} strokeWidth={5} /><text y={10} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={26} fill="#7a8088">8</text></g>; })}</svg>}
    <Chip text={L("REAL DE A 8 · LA MONEDA GLOBAL")} from={pla} dur={oce - pla + 10} y={300} color="#e8e8e8" />
    <Sfx name="pop" at={vir + 4} /><Sfx name="pop" at={vir + 18} /><Sfx name="pop" at={vir + 32} /><Sfx name="pop" at={vir + 46} /><Sfx name="ding" at={pla} vol={0.4} /><Sfx name="whoosh" at={oce} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 3. Plan de Aranda ----------
const Throne: React.FC = () => <g>
  <rect x={-600} y={-600} width={2280} height={3120} fill="#6a1a22" />
  {Array.from({length: 9}).map((_, i) => <g key={i} transform={`translate(${-80 + i * 160},0)`}><path d="M0,200 L0,1400" stroke="#4e1218" strokeWidth={50} /><circle cx={0} cy={200} r={30} fill={GOLD} /></g>)}
  <g transform="translate(540,620)"><path d="M-260,-200 L260,-200 L220,300 L-220,300Z" fill="#8a1a24" stroke={C.ink} strokeWidth={8} /><path d="M-60,-120 L-80,-180 L-30,-150 L0,-200 L30,-150 L80,-180 L60,-120Z" fill={GOLD} stroke={C.ink} strokeWidth={5} />
    <g transform="translate(-70,-80)"><rect width={140} height={180} rx={20} fill="#f2ead6" stroke={C.ink} strokeWidth={5} /><rect x={8} y={8} width={60} height={80} fill={RED} /><rect x={72} y={8} width={60} height={80} fill={GOLD} /><rect x={8} y={92} width={60} height={80} fill={GOLD} /><rect x={72} y={92} width={60} height={80} fill={RED} /></g></g>
  <rect x={-600} y={1380} width={2280} height={900} fill="#4a2a1a" /><rect x={240} y={1380} width={600} height={900} fill="#8a1a24" />
</g>;
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const ara = cue.word('conde'); const tre = cue.word('tres'); const dis = cue.word('discute');
  const showMap = f > tre - 6 && f < dis - 6;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.15, y: 80}, {f: tre, z: 1.0, y: 0}, {f: dis, z: 1.1, x: -60, y: 100}, {f: d, z: 1.2, x: -60, y: 140}]}>
      <Layer depth={0.4}><Throne /></Layer>
      <Layer depth={1}><Character d={CAST.carlos3} x={760} y={1720} scale={1.35} pose="think" expr={f > dis ? 'worried' : 'neutral'} facing={-1} look={0.5} />
        <Character d={CAST.aranda} x={290} y={1740} scale={1.4} pose={f > tre ? 'present' : 'talkA'} pose2="talkB" mix={Math.abs(Math.sin(f / 20))} expr={f > dis ? 'worried' : 'determined'} talking={f < dis + 20} look={0.5} /></Layer>
    </Camera></Stage>
    {showMap && <div style={{position: 'absolute', top: 280, left: 90, width: 900, height: 900, borderRadius: 30, overflow: 'hidden', border: '10px solid #fffaf0', boxShadow: '0 20px 0 rgba(0,0,0,0.5)', opacity: clamp((f - tre + 6) / 8)}}>
      <svg viewBox="90 400 900 900" width={900} height={900}>
        <MapView proj={{type: 'mercator', center: [-78, 2], scale: 560}} theme="vintage"
          fills={[{names: ['Mexico', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica'], color: '#c0392b', at: tre, dur: 10}, {names: ['Peru', 'Chile', 'Bolivia', 'Argentina', 'Paraguay', 'Uruguay'], color: '#d98a1f', at: tre + 12, dur: 10}, {names: ['Colombia', 'Venezuela', 'Ecuador', 'Panama'], color: '#2e7d4f', at: tre + 24, dur: 10}, {names: ['Cuba', 'Puerto Rico'], color: GOLD, at: tre + 36, dur: 10}]}
          labels={[{at: [-102, 23], text: L('MÉXICO'), from: tre + 2, size: 44, color: '#fff'}, {at: [-68, -20], text: L('PERÚ'), from: tre + 14, size: 44, color: '#fff'}, {at: [-70, 6], text: L('COSTA FIRME'), from: tre + 26, size: 40, color: '#fff'}, {at: [-78, 23], text: L('ESPAÑA'), sub: L('CUBA Y PUERTO RICO'), from: tre + 38, size: 30, color: '#7a4a00', dy: -40}]} />
      </svg>
    </div>}
    {f > dis - 4 && <div style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', transform: `rotate(-8deg) scale(${1 + Math.max(0, 1 - (f - dis + 4) / 6) * 0.6})`, opacity: clamp((f - dis + 4) / 4)}}>
      <span style={{fontFamily: FONT_TITLE, fontSize: 84, color: '#d7263d', border: '10px solid #d7263d', padding: '6px 24px', borderRadius: 14, background: 'rgba(255,250,240,0.85)'}}>{L('AUTENTICIDAD DISCUTIDA')}</span></div>}
    <NameTag name={L("Conde de Aranda")} role={L("Diplomático de Carlos III")} from={ara} dur={70} y={1520} color={RED} />
    <DateStamp text={L("1783")} sub={L("CORTE DE CARLOS III")} from={0} dur={ara + 10} y={250} />
    <Sfx name="paper" at={ara} vol={0.5} /><Sfx name="pop" at={tre} /><Sfx name="pop" at={tre + 12} /><Sfx name="pop" at={tre + 24} /><Sfx name="stamp" at={dis} vol={0.7} />
  </AbsoluteFill>;
};

// ---------- 4. Napoleón en Bayona ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const nap = cue.word('napoleón'); const abd = cue.word('abdicar');
  const crownX = tween(f, abd, abd + 25, 470, 640); const crownY = tween(f, abd, abd + 25, 1150, 1100);
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.1, x: -80}, {f: abd, z: 1.0, x: 0}, {f: d, z: 1.15, y: 80}]}>
      <Layer depth={0}><Sky top="#5a7aa0" bottom="#e6d6b8" id="skyB" /><Clouds n={4} y0={200} y1={500} speed={0.4} /></Layer>
      <Layer depth={0.4}><Palace x={540} y={1250} s={0.8} color="#e8dcc0" /><Flag kind="france" x={540} y={830} pole={200} w={140} h={92} /></Layer>
      <Layer depth={0.7}><Ground y={1250} color="#b8a888" /><Army x={-40} y={1290} rows={1} cols={14} dx={80} s={0.6} soldier={{coat: '#1d3f8f', pants: '#f4f0e6', hat: 'bearskin', hatColor: '#1a1a1a', marching: false}} /></Layer>
      <Layer depth={1}><Character d={CAST.fernando7} x={300} y={1760} scale={1.35} pose={f > abd ? 'shrug' : 'holdFront'} expr={f > abd ? 'sad' : 'worried'} look={0.5} />
        <Character d={CAST.napoleon} x={800} y={1760} scale={1.35} pose={f > abd + 20 ? 'holdUp' : 'handInCoat'} expr="smug" facing={-1} look={0.5} talking={f > nap && f < abd} />
        <g transform={`translate(${crownX},${f > abd + 20 ? 1060 : crownY}) scale(1.2)`} stroke={C.ink} strokeWidth={5}><path d="M-50,0 L-56,-60 L-28,-34 L0,-72 L28,-34 L56,-60 L50,0Z" fill={GOLD} /><rect x={-52} y={-12} width={104} height={14} fill={RED} /></g></Layer>
    </Camera></Stage>
    <DateStamp text={L("MAYO 1808")} sub={L("BAYONA (FRANCIA)")} from={0} dur={110} y={250} />
    <NameTag name={L("Fernando VII")} role={L("Rey de España")} from={abd - 30} dur={60} y={1540} color={RED} />
    <Sfx name="snare_march" at={0} vol={0.2} dur={d} /><Sfx name="impact" at={abd} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 5. Juntas y libertadores ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const sur = cue.word('surgen'); const bol = cue.word('simón'); const san = cue.word('josé'); const ind = cue.word('independencia');
  const heroes = f > bol - 6;
  return <AbsoluteFill>
    {!heroes && <Stage bg="#8fb1b8"><MapView proj={AMERICAS} theme="vintage" fills={[{names: ALL, color: RED, at: 0, dur: 1}]}
      pins={[{at: [-66.9, 10.5], from: sur, label: L('Caracas 1810'), color: C.yellow}, {at: [-58.4, -34.6], from: sur + 8, label: L('Buenos Aires 1810'), color: C.yellow, dx: -330}, {at: [-74.1, 4.7], from: sur + 16, label: L('Bogotá 1810'), color: C.yellow, dx: -230}, {at: [-100.9, 21.2], from: sur + 24, label: L('Dolores 1810'), color: C.yellow}]} /></Stage>}
    {heroes && <Stage><Camera k={[{f: bol - 6, z: 1.2, y: 120}, {f: san, z: 1.05, y: 40}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#3a6ab0" bottom="#f4d6a0" id="skyL" /><Sun x={540} y={900} r={110} /><LightRays x={540} y={900} n={9} opacity={0.18} /></Layer>
      <Layer depth={0.3}><Mountains y={1200} color="#7a6a8a" snow="#f4f4fa" h={700} n={6} seed={11} /></Layer>
      <Layer depth={0.6}><Ridge y={1300} amp={50} color="#8a7a50" seed={2} /><Army x={-100} y={1330} rows={2} cols={16} dx={74} s={0.5} soldier={{coat: '#17264d', pants: '#f0ece0', hat: 'shako', hatColor: '#1a1a1a', marching: false}} /></Layer>
      <Layer depth={1}><Character d={CAST.bolivar} x={300} y={1780} scale={1.35} pose="holdUp" expr="determined" look={0.4} />
        {f > san - 6 && <Character d={CAST.sanmartin} x={790} y={1780} scale={1.35} pose="holdUp" expr="determined" facing={-1} look={0.4} />}
        <Flag kind="gran_colombia" x={110} y={1600} pole={700} w={200} h={130} /><Flag kind="argentina" x={980} y={1600} pole={700} w={200} h={130} flip /></Layer>
      <Layer depth={1.3}><Dust n={30} color="#fff4d0" /></Layer>
    </Camera></Stage>}
    {heroes && <NameTag name={L("Simón Bolívar")} role={L("El Libertador")} from={bol} dur={60} y={1560} x={40} color="#17264d" />}
    {heroes && <NameTag name={L("José de San Martín")} role={L("Libertador del Sur")} from={san} dur={70} y={1680} x={380} color="#1a2b55" />}
    {Array.from({length: 4}).map((_, i) => <Sfx key={i} name="pop" at={sur + i * 8} />)}<Sfx name="impact" at={bol} vol={0.35} /><Sfx name="cheer" at={ind} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 6. Ayacucho y 1898 ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const aya = cue.word('ayacucho'); const cub = cue.word('cuba'); const n98 = cue.word('1898');
  const battle = f < cub - 6;
  return <AbsoluteFill>
    {battle && <Stage><Camera k={[{f: 0, z: 1.0}, {f: cub, z: 1.15, y: 60}]} shake={3}>
      <Layer depth={0}><Sky top="#5a8ac0" bottom="#e8e0c8" id="skyY" /><Clouds n={5} y0={200} y1={500} speed={0.8} /></Layer>
      <Layer depth={0.3}><Mountains y={1150} color="#8a7a6a" snow="#f0f0f4" h={600} n={6} seed={5} /></Layer>
      <Layer depth={0.6}><Ground y={1200} color="#9a8a5a" /><Army x={-200 + f * 0.8} y={1260} rows={3} cols={9} s={0.6} dx={74} soldier={{coat: '#17264d', pants: '#f0ece0', hat: 'shako', hatColor: '#111'}} flag="gran_colombia" />
        <Army x={700 + f * 0.6} y={1260} rows={3} cols={7} s={0.6} dx={74} soldier={{coat: '#f0ece0', pants: '#f0ece0', hat: 'shako', hatColor: '#111', facing: -1}} flag="burgundy" /></Layer>
      <Layer depth={0.9}><Cannon x={180} y={1650} s={0.9} fireAt={[20, 60, 100]} /><Explosion x={820} y={1300} at={30} s={0.4} /><Explosion x={700} y={1350} at={70} s={0.4} /><Smoke x={500} y={1300} color="#ccc" n={8} opacity={0.5} /></Layer>
      <Layer depth={1}><Character d={CAST.realista} x={880} y={1800} scale={1.1} pose="despair" expr="worried" facing={-1} propOverride="none" /></Layer>
    </Camera></Stage>}
    {!battle && <Stage bg="#8fb1b8"><MapView proj={{type: 'mercator', center: [-75, 15], scale: 1100}} theme="vintage" zoom={[[cub - 6, 1.0], [d, 1.15]]} focus={[-72, 19]}
      fills={[{names: ALL.filter((n) => n !== 'Cuba' && n !== 'Puerto Rico'), color: '#c9b78a', at: 0, dur: 1}, {names: ['Cuba', 'Puerto Rico'], color: RED, at: 0, dur: 1, glow: true, until: n98 + 6}]}
      labels={[{at: [-79, 21.8], text: L('CUBA'), from: cub, size: 54, color: '#fff'}, {at: [-66.5, 18.9], text: L('PUERTO RICO'), from: cub + 10, size: 40, color: '#fff', dy: -40}]}>
    </MapView></Stage>}
    {!battle && f > n98 && <div style={{position: 'absolute', top: 600, left: 0, right: 0, textAlign: 'center', transform: `rotate(-6deg) scale(${1 + Math.max(0, 1 - (f - n98) / 6) * 0.5})`}}>
      <span style={{fontFamily: FONT_TITLE, fontSize: 130, color: '#d7263d', border: '12px solid #d7263d', padding: '0 30px', borderRadius: 16, background: 'rgba(255,250,240,0.85)'}}>1898</span></div>}
    {battle && <DateStamp text={L("9·12·1824")} sub={L("AYACUCHO (PERÚ)")} from={aya - 10} dur={100} y={250} />}
    {battle && <><Amb name="gunfire" vol={0.3} dur={cub} /><Sfx name="cannon" at={20} vol={0.4} /><Sfx name="boom" at={30} vol={0.3} /><Sfx name="cannon" at={60} vol={0.35} /><Sfx name="boom" at={70} vol={0.3} /></>}
    <Sfx name="stamp" at={n98} vol={0.7} />
  </AbsoluteFill>;
};

// ---------- 7. Giro: el plan se aplica ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const com = cue.word('comunidad');
  const proj: ProjCfg = {type: 'mercator', center: [-50, 10], scale: 340};
  const pr = makeProj(proj); const madrid = pr([-3.7, 40.4]) ?? [0, 0];
  const caps: [number, number][] = [[-99.1, 19.4], [-77, -12], [-74.1, 4.7], [-58.4, -34.6]];
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={proj} theme="vintage" fills={[{names: [...NUEVA_ESPANA], color: '#c0392b', at: 4, dur: 10}, {names: [...PERU, ...PLATA], color: '#d98a1f', at: 10, dur: 10}, {names: NUEVA_GRANADA, color: '#2e7d4f', at: 16, dur: 10}, {names: ['Spain'], color: RED, at: 0, dur: 1}]}
        labels={[{at: [-3.7, 46], text: L('MADRID'), from: 4, size: 36, color: '#fff'}]}>
        {caps.map((ll, i) => { const [x, y] = pr(ll) ?? [0, 0]; const k = clamp((f - com - i * 6) / 20);
          return <g key={i}><line x1={madrid[0]} y1={madrid[1]} x2={madrid[0] + (x - madrid[0]) * k} y2={madrid[1] + (y - madrid[1]) * k} stroke={GOLD} strokeWidth={8} strokeDasharray="18 10" strokeDashoffset={-f * 2} />
            <g transform={`translate(${x},${y}) scale(${clamp((f - 10 - i * 5) / 10)})`} stroke={C.ink} strokeWidth={4}><path d="M-30,0 L-34,-36 L-17,-20 L0,-44 L17,-20 L34,-36 L30,0Z" fill={GOLD} /></g></g>; })}
        <Norte proj={proj} at={4} color="#c0392b" dashed />
      </MapView>
    </Stage>
    <Chip text={L("COMUNIDAD HISPÁNICA")} from={com} y={300} size={56} />
    <Sfx name="ding" at={com} vol={0.4} /><Sfx name="riser" at={com - 20} vol={0.25} />
  </AbsoluteFill>;
};

// ---------- 8. El gran bloque ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n11 = cue.word('11'); const n480 = cue.word('480'); const cal = cue.word('california');
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={AMERICAS} theme="vintage" zoom={[[0, 1.0], [cal - 10, 1.0], [cal + 20, 1.8]]} focus={[-105, 33]}
        fills={[{names: ALL, color: GOLD, at: 0, dur: 14, stagger: 0.6, glow: true}]}
        pins={[{at: [-119.4, 36.8], from: cal, label: L('¿California?'), big: true}, {at: [-99.3, 31.2], from: cal + 12, label: L('¿Texas?'), big: true}]}>
        <Norte proj={AMERICAS} at={cal - 6} color={GOLD} />
      </MapView>
    </Stage>
    <BigStat value={11.5} decimals={1} prefix="+" suffix=" M km²" from={n11} label={L("hispanoamérica (países actuales)")} y={260} hold={n480 - n11} color={C.yellow} />
    <BigStat value={480} prefix="≈" suffix=" M" from={n480} label={L("personas (España + Hispanoamérica, hoy)")} y={260} hold={cal - n480 + 5} color={C.yellow} />
    <Sfx name="ding" at={n11} vol={0.4} /><Sfx name="ding" at={n480} vol={0.4} /><Sfx name="whoosh" at={cal - 10} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 9. Final ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const rot = cue.word('roto');
  return <AbsoluteFill>
    <Stage bg="#0c0a14">
      <rect width={1080} height={1920} fill="#0c0a14" />
      <g transform="translate(0,-160)"><MapView proj={{type: 'ortho', center: [-60, 0], scale: 420}} theme="vintage" rotateKeys={[[0, -75, 5], [d, -30, 15]]}
        fills={[{names: [...ALL, 'Spain'], color: GOLD, at: 0, dur: 1, glow: true}]} hideGrid={false} /></g>
      {f > rot && <path d="M540,380 L500,560 L590,700 L520,860 L570,1000 L540,1150" fill="none" stroke="#fff" strokeWidth={10 * clamp((f - rot) / 8)} />}
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <Character d={CAST.aranda} x={180} y={1880} scale={0.95} pose="think" expr="smug" look={0.6} />
      <Character d={CAST.bolivar} x={900} y={1880} scale={0.95} pose="crossArms" expr="determined" facing={-1} look={0.6} propOverride="none" />
    </svg>
    <Sfx name="crumble" at={rot} vol={0.3} />
  </AbsoluteFill>;
};

export const espanaScenes = {s1_imperio: S1, s2_virreinatos: S2, s3_aranda: S3, s4_napoleon: S4, s5_libertadores: S5, s6_ayacucho: S6, s7_giro: S7, s8_bloque: S8, s9_final: S9};
