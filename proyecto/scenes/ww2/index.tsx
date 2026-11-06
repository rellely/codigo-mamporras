// EPISODIO 5 — ¿Y si nunca hubiera existido la Segunda Guerra Mundial?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Camera, ClassicBuilding, Clouds, Crowd, Explosion, Fire, Flag, FlagFace, Ground, Haze, Jet, Kremlin, Layer, LightRays, Ridge, Skyline, Sky, Smoke, Stage, Stars, Sun, Tank, Tree, Embers, Dust, Rain} from '../../components/World';
import {MapView} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';

// ---------- 1. Viena, 1907 ----------
const Easel: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <path d="M-90,0 L-20,-420 M90,0 L20,-420 M0,-420 L0,0" stroke="#7a5a3a" strokeWidth={14} />
    <rect x={-130} y={-400} width={260} height={200} fill="#f4ecd8" />
    <path d="M-120,-230 L-60,-320 L-10,-270 L40,-340 L120,-230Z" fill="#8aa0b8" strokeWidth={3} /><rect x={-40} y={-300} width={70} height={70} fill="#d9cdb4" strokeWidth={3} /><path d="M-48,-300 L-5,-345 L38,-300Z" fill="#a0523a" strokeWidth={3} />
  </g>
);
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const sus = cue.word('suspende'); const adm = cue.word('admitido');
  const verdict = f > sus + 12; const adm2 = f > adm;
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0, y: -40}, {f: sus, z: 1.1, y: 60}, {f: adm, z: 1.2, y: 140}, {f: d, z: 1.28, y: 160}]}>
      <Layer depth={0}><Sky top="#8aa6c4" bottom="#e9dcc2" id="skyV" /><Clouds n={5} y0={150} y1={500} speed={0.5} color="#f4f0ea" /></Layer>
      <Layer depth={0.45}><ClassicBuilding x={540} y={1180} s={0.95} color="#e2d3b4" title="AKADEMIE DER BILDENDEN KÜNSTE" cols={8} /></Layer>
      <Layer depth={0.7}><Ground y={1180} color="#9a9488" color2="#8a8478" /><Tree x={60} y={1200} kind="round" s={1.2} color="#5a7a3a" /><Tree x={1010} y={1200} kind="round" s={1.1} color="#5a7a3a" /></Layer>
      <Layer depth={1}><Easel x={800} y={1720} /><Character d={CAST.youngHitler} x={380} y={1740} scale={1.35} pose={verdict && !adm2 ? 'despair' : 'paint'} expr={adm2 ? 'surprised' : verdict ? 'angry' : 'neutral'} look={0.4} propOverride={verdict && !adm2 ? 'none' : undefined} /></Layer>
    </Camera></Stage>
    {f > sus && <div style={{position: 'absolute', top: 540, left: 0, right: 0, textAlign: 'center', transform: `rotate(${adm2 ? 4 : -6}deg) scale(${1 + Math.max(0, 1 - (f - (adm2 ? adm : sus)) / 6) * 0.6})`}}>
      <span style={{fontFamily: FONT_TITLE, fontSize: 96, color: adm2 ? '#1f9a4a' : '#d7263d', border: `10px solid ${adm2 ? '#1f9a4a' : '#d7263d'}`, padding: '4px 26px', borderRadius: 14, background: 'rgba(255,250,240,0.9)'}}>{adm2 ? '¿ADMITIDO?' : 'NO ADMITIDO'}</span></div>}
    <DateStamp text="VIENA, 1907" sub="EXAMEN DE INGRESO" from={0} dur={sus + 10} y={640} />
    <NameTag name="Adolf Hitler" role="Aspirante a pintor, 18 años" from={cue.word('adolf')} dur={60} y={1560} color="#555" />
    <Amb name="crowd" vol={0.06} dur={d} /><Sfx name="stamp" at={sus + 2} vol={0.7} /><Sfx name="stamp" at={adm} vol={0.6} /><Sfx name="glitch" at={adm - 2} vol={0.3} />
  </AbsoluteFill>;
};

// ---------- 2. La guerra real ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mil = cue.word('70'); const pct = cue.word('3%');
  const grid = f > pct - 6;
  return <AbsoluteFill>
    {!grid && <Stage><Camera k={[{f: 0, z: 1.15}, {f: pct, z: 1.0, x: 40}]} shake={3}>
      <Layer depth={0}><Sky top="#1a1418" mid="#4a2a22" bottom="#a04a2a" id="skyW2" /></Layer>
      <Layer depth={0.3}><Skyline y={1200} color="#1e1a1c" seed={9} h={420} n={14} /><Fire x={300} y={1200} s={1.4} /><Fire x={820} y={1200} s={1.1} /><Smoke x={300} y={1100} color="#2a2222" n={10} opacity={0.6} /><Smoke x={820} y={1100} color="#2a2222" n={10} opacity={0.6} /></Layer>
      <Layer depth={0.5}>{Array.from({length: 5}).map((_, i) => <Jet key={i} x={-300 + ((f * 6 + i * 320) % 1700)} y={350 + i * 70} s={0.3} color="#3a3a3a" />)}</Layer>
      <Layer depth={0.8}><Ground y={1320} color="#2a2420" /><Tank x={300} y={1600} s={0.7} color="#4a4a3a" star={false} /><Tank x={850} y={1660} s={0.7} color="#5a5a44" star={false} facing={-1} /><Explosion x={600} y={1400} at={40} s={0.5} /><Explosion x={200} y={1350} at={110} s={0.4} /></Layer>
      <Layer depth={1.3}><Embers n={60} /></Layer>
    </Camera></Stage>}
    {grid && <Stage bg="#100c10"><rect width={1080} height={1920} fill="#100c10" />
      {Array.from({length: 100}).map((_, i) => { const r = Math.floor(i / 10), c = i % 10; const red = [44, 45, 55].includes(i) && f > pct + 6;
        return <g key={i} transform={`translate(${135 + c * 90},${560 + r * 95}) scale(${easeOut(clamp((f - pct + 6 - i * 0.3) / 6))})`}>
          <circle cy={-28} r={14} fill={red ? '#d7263d' : '#8a8490'} /><path d="M-18,10 Q-18,-12 0,-12 Q18,-12 18,10Z" fill={red ? '#d7263d' : '#8a8490'} /></g>; })}
    </Stage>}
    <DateStamp text="1939 – 1945" sub="SEGUNDA GUERRA MUNDIAL" from={0} dur={mil} y={250} />
    {!grid && <BigStat value={85} prefix="70–" suffix=" M" from={mil} label="de muertos (estimación)" y={260} />}
    {grid && <BigStat value={3} prefix="≈" suffix="%" from={pct} label="de la población mundial de 1940" y={250} color="#ff5a5a" />}
    {!grid && <><Amb name="gunfire" vol={0.25} dur={pct} /><Sfx name="boom" at={40} vol={0.35} /><Sfx name="boom" at={110} vol={0.3} /><Sfx name="jet" at={10} vol={0.3} /></>}
    <Sfx name="heartbeat" at={pct + 6} vol={0.5} />
  </AbsoluteFill>;
};

// ---------- 3. Causas ----------
const Card: React.FC<{x: number; y: number; at: number; title: string; kind: 'treaty' | 'crash' | 'map'}> = ({x, y, at, title, kind}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null; const k = easeOut(clamp(f / 12));
  return <g transform={`translate(${x},${y}) scale(${k}) rotate(${(1 - k) * -15 + (kind === 'crash' ? 3 : -3)})`} stroke={C.ink} strokeLinejoin="round">
    <rect x={-210} y={-230} width={420} height={460} rx={20} fill="#fffaf0" strokeWidth={8} />
    <rect x={-185} y={-205} width={370} height={300} fill="#e8e0cc" strokeWidth={5} />
    {kind === 'treaty' && <g><rect x={-90} y={-180} width={180} height={240} fill="#fbf6e6" strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-70} x2={70} y1={-150 + i * 30} y2={-150 + i * 30} stroke="#aaa" strokeWidth={4} />)}<circle cx={50} cy={30} r={22} fill="#b8202e" strokeWidth={3} /></g>}
    {kind === 'crash' && <g><path d={`M-170,-160 L-100,-120 L-40,-150 L20,-60 L${80},${-60 + Math.min(f, 20) * 6} L160,${40 + Math.min(f, 20) * 2}`} fill="none" stroke="#d7263d" strokeWidth={10} /><text x={0} y={70} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={50} fill="#333" stroke="none">WALL ST.</text></g>}
    {kind === 'map' && <g><circle cx={-80} cy={-60} r={60} fill="#fff" strokeWidth={4} /><circle cx={-80} cy={-60} r={24} fill="#bc002d" strokeWidth={0} /><g transform="translate(40,-130)"><rect width={120} height={80} fill="#fff" strokeWidth={4} /><rect width={40} height={80} fill="#009246" strokeWidth={0} /><rect x={80} width={40} height={80} fill="#ce2b37" strokeWidth={0} /></g>
      <path d="M-20,-60 L60,-60" strokeWidth={8} stroke="#bc002d" /><path d="M100,-40 L100,40" strokeWidth={8} stroke="#ce2b37" /></g>}
    <text x={0} y={170} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={50} fill={C.ink} stroke="none">{title}</text>
  </g>;
};
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const ver = cue.word('versalles'); const cri = cue.word('1929'); const jap = cue.word('japón');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.05}, {f: d, z: 0.95}]}>
      <Layer depth={0}><Sky top="#2a2a3a" bottom="#5a4a4a" id="skyCa" /></Layer>
      <Layer depth={0.5}><rect x={-600} y={1300} width={2280} height={900} fill="#3a2a22" />{Array.from({length: 30}).map((_, i) => <line key={i} x1={-600 + i * 80} y1={1300} x2={-600 + i * 80 - 200} y2={2200} stroke="#2a1e18" strokeWidth={4} />)}</Layer>
      <Layer depth={1}><Card x={300} y={560} at={ver} title="VERSALLES 1919" kind="treaty" /><Card x={780} y={900} at={cri} title="CRISIS DE 1929" kind="crash" /><Card x={320} y={1260} at={jap} title="JAPÓN E ITALIA" kind="map" />
        <Character d={CAST.youngHitler} x={850} y={1860} scale={0.9} pose="crossArms" expr="neutral" facing={-1} look={0.3} propOverride="none" tint="#000" tintAmt={0} /></Layer>
    </Camera></Stage>
    <Chip text="NO FUE COSA DE UN SOLO HOMBRE" from={2} dur={ver} y={300} size={40} />
    <Sfx name="paper" at={ver} vol={0.5} /><Sfx name="crumble" at={cri + 8} vol={0.3} /><Sfx name="stamp" at={jap} vol={0.5} />
  </AbsoluteFill>;
};

// ---------- 4. Múnich 1938 ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mun = cue.word('múnich'); const ver = cue.word('verdad');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 140}, {f: mun, z: 1.05, y: 40}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#6a8ab0" bottom="#e8e2d0" id="skyM" /><Clouds n={6} y0={150} y1={600} speed={0.5} color="#eef0f2" /></Layer>
      <Layer depth={0.5}><Ground y={1200} color="#7a8a6a" /><g transform="translate(820,1180) scale(0.9)" stroke={C.ink} strokeWidth={6}><path d="M-300,-40 Q-280,-90 0,-90 L260,-80 Q300,-60 280,-30 L-280,-20Z" fill="#c9ccc2" /><rect x={-60} y={-200} width={30} height={240} fill="#9a9c94" transform="rotate(-80,0,-60)" /><path d="M-160,-60 L-200,-160 L-150,-160 L-100,-70Z" fill="#b8bab0" />{[0, 1, 2].map((i) => <rect key={i} x={-120 + i * 80} y={-80} width={40} height={20} fill="#9ed0f0" />)}<circle cx={290} cy={-56} r={12} fill="#555" /></g></Layer>
      <Layer depth={0.75}><Crowd y={1290} n={14} s={0.75} cheer seed={4} /></Layer>
      <Layer depth={1}><Character d={CAST.chamberlain} x={420} y={1760} scale={1.4} pose="holdUp" expr="happy" talking={f < ver + 10} look={0.2} /></Layer>
      {f > ver && <Layer depth={1.2}>{Array.from({length: 6}).map((_, i) => { const k = (f - ver) / 60; return <g key={i} transform={`translate(${200 + i * 140 + k * 300},${900 - k * 500 - i * 40}) scale(${0.8 + (i % 2) * 0.3})`}>
        <path d={`M0,0 Q-30,${-20 + Math.sin(f / 3 + i) * 20} -60,-10 Q-30,10 0,0 Q30,${-20 + Math.sin(f / 3 + i) * 20} 60,-10 Q30,10 0,0Z`} fill="#fff" stroke={C.ink} strokeWidth={3} /></g>; })}</Layer>}
    </Camera></Stage>
    <DateStamp text="30·09·1938" sub="ACUERDOS DE MÚNICH" from={mun - 10} dur={90} y={250} />
    <NameTag name="Neville Chamberlain" role="Primer ministro británico" from={8} dur={60} y={1540} color="#2a2a30" />
    <Chip text="«PAZ PARA NUESTRO TIEMPO»" from={mun + 5} y={430} size={42} color="#fff" />
    <Amb name="crowd" vol={0.2} dur={d} /><Sfx name="cheer" at={ver} vol={0.4} /><Sfx name="paper" at={mun} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 5. Holocausto (tono solemne) ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const seis = cue.word('seis');
  return <AbsoluteFill>
    <Stage bg="#07060a"><rect width={1080} height={1920} fill="#07060a" />
      <defs><radialGradient id="cg"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.5} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient></defs>
      {Array.from({length: 21}).map((_, i) => { const r = Math.floor(i / 7), c = i % 7; const x = 120 + c * 140 + (r % 2) * 70, y = 1100 + r * 170; const k = clamp((f - i * 3) / 15);
        const fl = 1 + Math.sin(f / 4 + i * 2) * 0.12;
        return <g key={i} opacity={k} transform={`translate(${x},${y})`}><circle cy={-70} r={70} fill="url(#cg)" /><rect x={-14} y={-40} width={28} height={80} rx={4} fill="#efe6d4" />
          <path d={`M0,-44 Q-12,${-60 * fl} 0,${-86 * fl} Q12,${-60 * fl} 0,-44Z`} fill="#ffcf5a" /></g>; })}
    </Stage>
    <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', opacity: clamp((f - seis) / 15)}}>
      <div style={{fontFamily: FONT_TITLE, fontSize: 150, color: '#efe6d4', letterSpacing: 4}}>6.000.000</div>
      <div style={{fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: '#b8ae9c', letterSpacing: 3}}>VÍCTIMAS JUDÍAS DEL HOLOCAUSTO</div></div>
    <Amb name="wind" vol={0.12} dur={d} />
  </AbsoluteFill>;
};

// ---------- 6. Tecnología ----------
const TechIcon: React.FC<{x: number; y: number; at: number; kind: 'radar' | 'jet' | 'pc' | 'pen'; label: string}> = ({x, y, at, kind, label}) => {
  const f = useCurrentFrame(); const k = easeOut(clamp((f - at) / 10)); if (k <= 0) return null;
  return <g transform={`translate(${x},${y}) scale(${k})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <circle r={140} fill="#fffaf0" />
    {kind === 'radar' && <g><path d="M-70,40 Q0,-110 70,40Z" fill="#9aa6b2" transform={`rotate(${Math.sin(f / 15) * 30},0,40)`} /><rect x={-10} y={40} width={20} height={50} fill="#555" /><path d="M-50,90 L50,90" strokeWidth={10} /></g>}
    {kind === 'jet' && <g><rect x={-90} y={-35} width={180} height={70} rx={30} fill="#b8c2cc" /><circle cx={-90} cy={0} r={34} fill="#555" />{Array.from({length: 6}).map((_, i) => <line key={i} x1={-90} y1={0} x2={-90 + Math.cos(f / 2 + i) * 30} y2={Math.sin(f / 2 + i) * 30} strokeWidth={4} />)}<path d="M90,0 L130,0" stroke="#ff8a3a" strokeWidth={16} /></g>}
    {kind === 'pc' && <g><rect x={-100} y={-80} width={200} height={150} fill="#7a8a7a" />{Array.from({length: 18}).map((_, i) => <circle key={i} cx={-80 + (i % 6) * 32} cy={-55 + Math.floor(i / 6) * 40} r={8} fill={Math.sin(f / 3 + i * 7) > 0 ? '#ffd23f' : '#3a3a2a'} strokeWidth={2} />)}</g>}
    {kind === 'pen' && <g><rect x={-30} y={-80} width={60} height={140} rx={10} fill="#e8f4f8" /><rect x={-30} y={-10} width={60} height={70} rx={8} fill="#f2d24a" /><rect x={-36} y={-100} width={72} height={24} fill="#3a6ab0" /></g>}
    <text y={190} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={46} fill="#fff" stroke="#0d0a12" strokeWidth={10} paintOrder="stroke">{label}</text>
  </g>;
};
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const tar = cue.word('tarde'); const rad = cue.word('radar'); const rea = cue.word('reacción'); const ord = cue.word('ordenadores'); const pen = cue.word('penicilina'); const bom = cue.word('bomba');
  const bomb = f > bom - 20;
  return <AbsoluteFill>
    <Stage bg="#1a2230"><rect width={1080} height={1920} fill="#1a2230" />
      {Array.from({length: 20}).map((_, i) => <line key={i} x1={0} x2={1080} y1={i * 100} y2={i * 100} stroke="#22304a" strokeWidth={2} />)}{Array.from({length: 11}).map((_, i) => <line key={'v' + i} y1={0} y2={1920} x1={i * 100} x2={i * 100} stroke="#22304a" strokeWidth={2} />)}
      {!bomb && <g transform="translate(540,1080) scale(0.8)" opacity={clamp((f - tar + 4) / 8)}><circle r={130} fill="#fffaf0" stroke={C.ink} strokeWidth={8} /><line x1={0} y1={0} x2={Math.cos(-f / 6) * 90} y2={Math.sin(-f / 6) * 90} stroke={C.ink} strokeWidth={10} strokeLinecap="round" /><line x1={0} y1={0} x2={Math.cos(-f / 60) * 60} y2={Math.sin(-f / 60) * 60} stroke="#d7263d" strokeWidth={12} strokeLinecap="round" /></g>}
      {!bomb && <><TechIcon x={290} y={720} at={rad} kind="radar" label="RADAR" /><TechIcon x={790} y={720} at={rea} kind="jet" label="REACTORES" /><TechIcon x={290} y={1560} at={ord} kind="pc" label="ORDENADORES" /><TechIcon x={790} y={1560} at={pen} kind="pen" label="PENICILINA" /></>}
      {bomb && <g transform="translate(540,1000)" opacity={clamp((f - bom + 20) / 10)}>
        <ellipse cx={0} cy={-300} rx={260} ry={150} fill="#b8a898" /><ellipse cx={0} cy={-330} rx={200} ry={110} fill="#d8c8b8" /><rect x={-60} y={-200} width={120} height={400} fill="#a89888" /><ellipse cx={0} cy={210} rx={320} ry={60} fill="#a89888" />
        {f > bom + 6 && <path d={`M-300,-450 L300,250 M300,-450 L-300,250`} stroke="#d7263d" strokeWidth={30} strokeLinecap="round" opacity={clamp((f - bom - 6) / 6)} />}</g>}
    </Stage>
    <Chip text="LLEGARÍAN MÁS TARDE" from={tar} dur={bom - 20 - tar} y={240} size={46} />
    {bomb && <Chip text="¿NINGUNA BOMBA ATÓMICA EN GUERRA?" from={bom} y={300} size={40} color="#fff" />}
    <Sfx name="pop" at={rad} /><Sfx name="pop" at={rea} /><Sfx name="pop" at={ord} /><Sfx name="pop" at={pen} /><Sfx name="typing" at={ord} vol={0.3} /><Sfx name="impact" at={bom} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 7. Imperios coloniales ----------
const BRIT = ['United Kingdom', 'Canada', 'Australia', 'New Zealand', 'South Africa', 'India', 'Pakistan', 'Bangladesh', 'Myanmar', 'Sri Lanka', 'Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Tanzania', 'Zambia', 'Zimbabwe', 'Malawi', 'Sudan', 'Egypt', 'Iraq', 'Jordan', 'Malaysia', 'Botswana', 'Sierra Leone', 'Gambia', 'Somaliland', 'Guyana', 'Belize', 'Jamaica', 'Palestine', 'Israel', 'Yemen', 'Brunei', 'Lesotho', 'eSwatini', 'Namibia', 'Papua New Guinea'];
const FREN = ['France', 'Algeria', 'Morocco', 'Tunisia', 'Mauritania', 'Senegal', 'Mali', 'Niger', 'Guinea', "Côte d'Ivoire", 'Burkina Faso', 'Benin', 'Togo', 'Chad', 'Central African Rep.', 'Congo', 'Gabon', 'Cameroon', 'Madagascar', 'Vietnam', 'Laos', 'Cambodia', 'Syria', 'Lebanon', 'Djibouti', 'Suriname'];
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const bri = cue.word('británico'); const fra = cue.word('francés'); const ind = cue.word('india');
  const india = f > ind - 6;
  return <AbsoluteFill>
    <Stage bg="#8fb1b8">
      <MapView proj={{type: 'mercator', center: [40, 15], scale: 190, detail: 110}} theme="vintage" zoom={[[0, 1.0], [ind - 6, 1.0], [ind + 24, 2.4]]} focus={[78, 22]}
        fills={[{names: BRIT, color: '#e0607a', at: bri, dur: 10, stagger: 0.5}, {names: FREN, color: '#3a6ad0', at: fra, dur: 10, stagger: 0.5}, {names: ['India', 'Pakistan', 'Bangladesh'], color: '#ff9a3a', at: ind + 20, dur: 12, glow: true}]}
        labels={[{at: [-30, 52], text: 'IMPERIO BRITÁNICO', from: bri + 6, size: 40, color: '#b0203a', until: ind - 6}, {at: [5, 30], text: 'IMPERIO FRANCÉS', from: fra + 6, size: 40, color: '#1a3a90', until: ind - 6}, {at: [79, 22], text: 'INDIA', sub: '1947', from: ind + 26, size: 48, color: '#fff'}]} />
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {!india && <Character d={CAST.churchill} x={830} y={1900} scale={1.05} pose="victory" expr="smug" facing={-1} look={0.4} />}
      {india && <Character d={CAST.gandhi} x={260} y={1900} scale={1.05} pose="open" expr="neutral" look={0.4} />}
    </svg>
    {!india && <NameTag name="Winston Churchill" role="Defensor del Imperio británico" from={bri + 4} dur={70} y={1360} x={360} color="#e0607a" />}
    {india && <NameTag name="Mahatma Gandhi" role="Líder de la independencia india" from={ind + 20} dur={70} y={1360} x={460} color="#ff9a3a" />}
    <Sfx name="paper" at={bri} vol={0.4} /><Sfx name="pop" at={fra} /><Sfx name="whoosh" at={ind - 4} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 8. Stalin, Berlín y la Guerra Fría ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const ber = cue.word('berlín'); const gue = cue.word('guerra'); const onu = cue.word('onu');
  return <AbsoluteFill>
    <Stage bg="#1c2c3c">
      <MapView proj={{type: 'conic', center: [25, 53], scale: 2000, parallels: [45, 60]}} theme="cold" zoom={[[0, 1.1], [d, 1.0]]} focus={[25, 53]}
        fills={[{names: ['Russia', 'Belarus', 'Ukraine'], color: '#c8202a', at: 0, dur: 1}, {names: ['Germany'], color: '#7a7a7a', at: 0, dur: 1}]}
        arrows={[{from: [37.6, 55.75], to: [13.4, 52.5], at: 10, dur: Math.max(20, ber - 10), color: '#c8202a', width: 26, curve: 0.1}]}
        pins={[{at: [13.4, 52.5], from: 6, label: 'Berlín', big: true}, {at: [37.6, 55.75], from: 2, label: 'Moscú'}]} />
      {f > ber + 6 && <g transform="translate(540,960)" opacity={clamp((f - ber - 6) / 6)}><path d="M-160,-160 L160,160 M160,-160 L-160,160" stroke="#fff" strokeWidth={50} strokeLinecap="round" /><path d="M-160,-160 L160,160 M160,-160 L-160,160" stroke="#d7263d" strokeWidth={30} strokeLinecap="round" /></g>}
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Character d={CAST.stalin} x={260} y={1900} scale={1.15} pose="crossArms" expr={f > ber + 6 ? 'angry' : 'smug'} look={0.5} /></svg>
    <NameTag name="Iósif Stalin" role="Líder de la URSS (1924–1953)" from={4} dur={60} y={1360} x={420} color="#c8202a" />
    <Chip text="SIN GUERRA FRÍA" from={gue} y={300} x={330} size={44} color="#fff" /><Chip text="¿SIN ONU?" from={onu} y={400} x={740} size={44} rot={3} />
    <Sfx name="march" at={10} vol={0.3} dur={ber} /><Sfx name="stamp" at={ber + 6} vol={0.6} /><Sfx name="pop" at={gue} /><Sfx name="pop" at={onu} />
  </AbsoluteFill>;
};

// ---------- 9. Final ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.25, y: 100}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#4a7ab8" mid="#f0b88a" bottom="#ffe4b0" id="skyF2" /><Sun x={540} y={980} r={120} /><LightRays x={540} y={980} n={10} opacity={0.16} /></Layer>
      <Layer depth={0.3}><Skyline y={1150} color="#c88a6a" seed={12} h={380} n={14} windows="#ffe9b0" /></Layer>
      <Layer depth={0.6}><Ground y={1150} color="#b89a7a" /><Crowd y={1220} n={26} s={0.55} seed={20} colors={['#3b4250', '#7a2e3a', '#5a6b7a', '#6b5a3a', '#2a5a4a', '#8a6a9a']} /></Layer>
      <Layer depth={0.85}><Crowd y={1500} n={14} s={0.95} seed={8} cheer colors={['#4a5a8a', '#8a3a3a', '#3a6a5a', '#7a6a3a']} /></Layer>
      <Layer depth={1.1}>{Array.from({length: 8}).map((_, i) => { const k = ((f + i * 25) % 200) / 200; return <g key={i} transform={`translate(${-100 + k * 1300},${700 - k * 400 + i * 40}) scale(0.7)`}>
        <path d={`M0,0 Q-30,${-20 + Math.sin(f / 3 + i) * 20} -60,-10 Q-30,10 0,0 Q30,${-20 + Math.sin(f / 3 + i) * 20} 60,-10 Q30,10 0,0Z`} fill="#fff" stroke={C.ink} strokeWidth={3} /></g>; })}</Layer>
    </Camera></Stage>
    <Amb name="crowd" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

export const ww2Scenes = {s1_viena: S1, s2_guerra: S2, s3_causas: S3, s4_munich: S4, s5_holocausto: S5, s6_tecnologia: S6, s7_imperios: S7, s8_guerrafria: S8, s9_final: S9};
