// EPISODIO 3 — ¿Y si China invadiera Taiwán hoy? (escenario hipotético basado en análisis públicos: CSIS 2023, Bloomberg Economics 2024)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand, lerp} from '../../components/core';
import {Camera, Carrier, Clouds, Crowd, Explosion, Fab, Flag, FlagFace, Flash, Ground, Haze, Jet, LandingCraft, Layer, LightRays, Missile, Mountains, Rain, Sea, Skyline, Sky, Smoke, Stage, Stars, Sun, Taipei101, Warship, Embers, Ridge} from '../../components/World';
import {MapView, projectLL, ProjCfg} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L, fmtNum} from '../../components/i18n';

const PRC = '#d62a2a', TW = '#2f7de0';
const STRAIT: ProjCfg = {type: 'mercator', center: [120.3, 24.2], scale: 9000};

// ---------- 1. El estrecho ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const fut = cue.word('futuro');
  const [ax, ay] = projectLL(STRAIT, [119.6, 25.4]); const [bx, by] = projectLL(STRAIT, [120.95, 24.85]);
  const k = tween(f, 20, 60, 0, 1);
  return <AbsoluteFill>
    <Stage bg="#0f2a44">
      <MapView proj={STRAIT} theme="modern" zoom={[[0, 1.4], [fut, 1.0], [d, 0.85]]} focus={[120.3, 24.6]}
        fills={[{names: ['China'], color: PRC, at: 4, dur: 14}, {names: ['Taiwan'], color: TW, at: 10, dur: 14, glow: true}]}
        labels={[{at: [117.6, 25.6], text: L('CHINA'), from: 6, size: 80, color: '#fff'}, {at: [121.0, 23.4], text: L('TAIWÁN'), from: 12, size: 70, color: '#fff'}]}>
        <g opacity={k}><line x1={ax} y1={ay} x2={lerp(ax, bx, k)} y2={lerp(ay, by, k)} stroke={C.yellow} strokeWidth={8} strokeDasharray="22 14" />
          <circle cx={ax} cy={ay} r={12} fill={C.yellow} /><circle cx={lerp(ax, bx, k)} cy={lerp(ay, by, k)} r={12} fill={C.yellow} /></g>
      </MapView>
    </Stage>
    <BigStat value={130} suffix=" km" from={14} label={L("en su punto más estrecho")} y={1530} hold={fut - 4} />
    <Sfx name="digital" at={10} vol={0.3} /><Sfx name="ding" at={30} vol={0.3} /><Sfx name="impact" at={fut} vol={0.4} /><Amb name="sea" vol={0.15} dur={d} />
  </AbsoluteFill>;
};

// ---------- 2. Contexto: 1949 y Pekín ----------
const S2: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const pek = cue.word('pekín'); const fue = cue.word('fuerza');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0}, {f: pek, z: 1.0, x: 0}, {f: d, z: 1.12, y: 60}]}>
      <Layer depth={0}><Sky top="#1a1630" bottom="#3a2a3a" id="skyT2" /></Layer>
      <Layer depth={0.5}><g transform={`translate(${f < pek ? 0 : tween(f, pek, pek + 20, 0, -1080)},0)`}>
        {/* izquierda: 1949 sepia */}
        <rect x={0} y={0} width={1080} height={1920} fill="#5a4630" />
        <Sea y={1150} color="#6a5a40" color2="#5a4a34" amp={10} />
        <g transform="translate(540,1250)">{[0, 1, 2].map((i) => <g key={i} transform={`translate(${-250 + i * 250},${i * 30}) scale(0.4)`}><path d="M-200,-60 L200,-60 L170,20 L-170,20Z" fill="#3a3020" stroke="#1a140c" strokeWidth={8} /><rect x={-40} y={-160} width={80} height={100} fill="#3a3020" /></g>)}</g>
        <text x={540} y={760} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={180} fill="#f4e4c0" opacity={0.85}>1949</text>
        <text x={540} y={850} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={36} fill="#f4e4c0">{L('EL GOBIERNO NACIONALISTA SE RETIRA A TAIWÁN')}</text>
        {/* derecha: hoy, dos gobiernos */}
        <g transform="translate(1080,0)">
          <rect x={0} y={0} width={1080} height={1920} fill="#14122a" />
          <line x1={540} y1={300} x2={540} y2={1900} stroke="#fff" strokeWidth={6} strokeDasharray="20 16" opacity={0.5} />
          <g transform="translate(270,620)"><svg x={-120} y={-80} width={240} height={160}><FlagFace kind="prc" w={240} h={160} /></svg><text y={140} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={56} fill="#fff">{L('PEKÍN')}</text></g>
          <g transform="translate(810,620)"><svg x={-120} y={-80} width={240} height={160}><FlagFace kind="roc" w={240} h={160} /></svg><text y={140} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={56} fill="#fff">{L('TAIPÉI')}</text></g>
          <Character d={CAST.plaGeneral} x={270} y={1700} scale={1.25} pose={f > fue ? 'point' : 'crossArms'} expr={f > fue ? 'angry' : 'determined'} talking={f > pek && f < fue + 30} look={0.5} />
          <Character d={CAST.twSoldier} x={810} y={1700} scale={1.25} pose="rifle" expr={f > fue ? 'worried' : 'determined'} facing={-1} look={0.5} propOverride="none" />
        </g>
      </g></Layer>
    </Camera></Stage>
    <Chip text={L("NO DESCARTA LA FUERZA")} from={fue} y={330} color="#ff5a5a" textColor="#fff" />
    <Sfx name="whoosh" at={pek} vol={0.4} /><Sfx name="stamp" at={fue} vol={0.5} /><Amb name="wind" vol={0.1} dur={d} />
  </AbsoluteFill>;
};

// ---------- 3. Chips ----------
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const n90 = cue.word('90'); const mov = cue.word('móvil'); const coc = cue.word('coche'); const ia = cue.word('inteligencia');
  const inLab = f < mov - 6;
  return <AbsoluteFill>
    {inLab && <Stage><Camera k={[{f: 0, z: 1.25, y: 100}, {f: mov, z: 1.0, y: 0}]}>
      <Layer depth={0}><Sky top="#e9f1f8" bottom="#c9d8e6" id="skyLab" /></Layer>
      <Layer depth={0.4}><Fab x={540} y={1050} s={1.1} /></Layer>
      <Layer depth={0.7}><rect x={-400} y={1050} width={1880} height={1200} fill="#dfe8f0" />{Array.from({length: 8}).map((_, i) => <rect key={i} x={-300 + i * 220} y={1050} width={8} height={1200} fill="#c6d4e0" />)}
        <rect x={-400} y={1050} width={1880} height={1200} fill="#ffe99a" opacity={0.12} /></Layer>
      <Layer depth={1}><Character d={CAST.chipEngineer} x={540} y={1760} scale={1.5} pose="holdFront" expr="happy" look={0.1} />
        <g transform={`translate(540,${1180 + Math.sin(f / 10) * 8})`} opacity={clamp((f - 10) / 10)}>{Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2 + f / 40;
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 200} y2={Math.sin(a) * 200} stroke="#4aa3df" strokeWidth={3} opacity={0.4} />; })}</g></Layer>
    </Camera></Stage>}
    {!inLab && <Stage bg="#0f2a44"><Camera k={[{f: mov - 6, z: 1.1}, {f: d, z: 0.95}]}>
      <Layer depth={0}><Sky top="#0b1730" bottom="#1d3560" id="skyN" /><Stars n={50} /></Layer>
      <Layer depth={1}>
        <g transform="translate(540,1050)">
          <rect x={-120} y={-120} width={240} height={240} rx={20} fill="#2b3a4a" stroke={C.ink} strokeWidth={8} /><rect x={-70} y={-70} width={140} height={140} fill="#c9a43a" stroke={C.ink} strokeWidth={5} />
          <text y={18} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={56} fill={C.ink}>{L('3nm')}</text>
          {[-1, 1].map((s) => Array.from({length: 6}).map((_, i) => <g key={s + '' + i}><line x1={-90 + i * 36} y1={s * 120} x2={-90 + i * 36} y2={s * 150} stroke="#c9a43a" strokeWidth={8} /><line y1={-90 + i * 36} x1={s * 120} y2={-90 + i * 36} x2={s * 150} stroke="#c9a43a" strokeWidth={8} /></g>))}
          {[[mov, -330, -420, 'phone'], [coc, 330, -420, 'car'], [ia, 0, 470, 'ai']].map(([at, x, y, kind]: any, i) => {
            const k = easeOut(clamp((f - at) / 12)); if (k <= 0) return null; const pulse = ((f - at) % 30) / 30;
            return <g key={i}><line x1={0} y1={0} x2={x * k} y2={y * k} stroke="#4aa3df" strokeWidth={8} strokeDasharray="16 12" strokeDashoffset={-f * 3} />
              <circle cx={x * k * pulse} cy={y * k * pulse} r={12} fill="#9fe3ff" />
              <g transform={`translate(${x},${y}) scale(${k})`}><circle r={130} fill="#fffaf0" stroke={C.ink} strokeWidth={8} />
                {kind === 'phone' && <g><rect x={-45} y={-80} width={90} height={160} rx={14} fill="#222" stroke={C.ink} strokeWidth={5} /><rect x={-36} y={-66} width={72} height={124} fill="#4aa3df" /></g>}
                {kind === 'car' && <g stroke={C.ink} strokeWidth={5}><path d="M-90,20 L-70,-30 Q-40,-60 30,-60 Q60,-60 80,-20 L100,20 L100,40 L-90,40Z" fill="#e8343a" /><circle cx={-50} cy={44} r={20} fill="#333" /><circle cx={60} cy={44} r={20} fill="#333" /><path d="M-50,-30 L60,-30 L70,-10 L-60,-10Z" fill="#9fd0ff" /></g>}
                {kind === 'ai' && <g><path d="M-70,10 Q-90,-60 -30,-80 Q0,-110 40,-80 Q100,-70 80,0 Q90,60 30,70 Q0,90 -30,70 Q-90,70 -70,10Z" fill="#f2a0c0" stroke={C.ink} strokeWidth={5} /><text y={20} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={60} fill={C.ink}>{L('IA')}</text></g>}
              </g></g>;
          })}
        </g>
      </Layer>
    </Camera></Stage>}
    <BigStat value={90} prefix="+" suffix="%" from={n90} label={L("de los chips más avanzados")} y={260} hold={mov - n90} />
    <Sfx name="digital" at={4} vol={0.3} /><Sfx name="ding" at={n90} vol={0.4} /><Sfx name="pop" at={mov} /><Sfx name="pop" at={coc} /><Sfx name="pop" at={ia} />
  </AbsoluteFill>;
};

// ---------- 4. Bloqueo ----------
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const inv = cue.word('invadir'); const blo = cue.word('bloqueo'); const det = cue.word('detiene');
  const ships = Array.from({length: 14}).map((_, i) => { const a = (i / 14) * Math.PI * 2; return [121 + Math.cos(a) * 1.55, 23.7 + Math.sin(a) * 2.0] as [number, number]; });
  const ring = tween(f, blo, blo + 40, 0, 1);
  return <AbsoluteFill>
    <Stage bg="#0f2a44">
      <MapView proj={{type: 'mercator', center: [120.6, 23.8], scale: 7200}} theme="modern" zoom={[[0, 1.15], [d, 1.0]]} focus={[121, 23.8]}
        fills={[{names: ['China'], color: PRC, at: 0, dur: 1}, {names: ['Taiwan'], color: TW, at: 0, dur: 1}]}
        labels={[{at: [121, 23.6], text: L('TAIWÁN'), from: 0, size: 60, color: '#fff'}]}>
        {ships.map((ll, i) => { if (i / ships.length > ring) return null; const [x, y] = projectLL({type: 'mercator', center: [120.6, 23.8], scale: 7200}, ll);
          return <g key={i} transform={`translate(${x},${y}) scale(0.16) rotate(${(i / ships.length) * 360 + 90})`}><Warship x={0} y={0} color="#b8434a" /></g>; })}
        {Array.from({length: 4}).map((_, i) => { const [x0, y0] = projectLL({type: 'mercator', center: [120.6, 23.8], scale: 7200}, [118.5, 25 - i * 0.6]); const [x1, y1] = projectLL({type: 'mercator', center: [120.6, 23.8], scale: 7200}, [121.2 + (i % 2) * 0.4, 24.6 - i * 0.6]);
          return <Missile key={i} x0={x0} y0={y0} x1={x1} y1={y1} at={inv + i * 10} dur={40} arc={140} />; })}
        {Array.from({length: 4}).map((_, i) => { const [x1, y1] = projectLL({type: 'mercator', center: [120.6, 23.8], scale: 7200}, [121.2 + (i % 2) * 0.4, 24.6 - i * 0.6]); return <Explosion key={'e' + i} x={x1} y={y1} at={inv + i * 10 + 40} s={0.18} />; })}
      </MapView>
      {f > det && Array.from({length: 6}).map((_, i) => <g key={i} transform={`translate(${200 + i * 140},${1500 + (i % 2) * 60})`} opacity={clamp((f - det) / 10)}>
        <rect x={-50} y={-30} width={100} height={60} rx={8} fill="#8a6a3a" stroke={C.ink} strokeWidth={4} /><path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="#ff3a3a" strokeWidth={10} /></g>)}
    </Stage>
    <Chip text={L("BLOQUEO")} from={blo} y={300} size={80} color="#ff5a5a" textColor="#fff" />
    {f > det && <Chip text={L("COMERCIO DETENIDO")} from={det} y={1380} size={44} />}
    {Array.from({length: 4}).map((_, i) => <Sfx key={i} name="boom" at={inv + i * 10 + 40} vol={0.3} />)}<Amb name="siren" vol={0.12} from={inv} dur={d - inv} /><Sfx name="jet" at={inv - 10} vol={0.4} />
  </AbsoluteFill>;
};

// ---------- 5. Desembarco ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const nor = cue.word('normandía'); const bu = cue.word('buques');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.25, y: -100}, {f: bu, z: 1.0, y: 0}, {f: d, z: 0.95, y: 30}]} shake={4}>
      <Layer depth={0}><Sky top="#2a2a3a" mid="#6a5a5a" bottom="#c88a6a" id="skyD" /><Sun x={850} y={980} r={70} color="#ffd0a0" glow="#ff8a5a" /></Layer>
      <Layer depth={0.2}><Clouds n={6} y0={200} y1={800} color="#5a5060" speed={1.2} opacity={0.8} /></Layer>
      <Layer depth={0.4}><Mountains y={1080} color="#3a4a5a" snow="#5a6a7a" h={260} n={7} seed={3} /><Skyline y={1080} color="#2a3442" windows="#ffcf7a" h={120} n={20} seed={8} /></Layer>
      <Layer depth={0.55}><Sea y={1080} color="#2a4a62" color2="#1e3a52" amp={18} rough={1.6} /></Layer>
      <Layer depth={0.7}>{Array.from({length: 7}).map((_, i) => <Warship key={i} x={-200 + i * 220 + f * 0.4} y={1170 + (i % 2) * 30} s={0.25} color="#8a8f96" flag="prc" />)}</Layer>
      <Layer depth={0.85}>{Array.from({length: 9}).map((_, i) => <LandingCraft key={i} x={-150 + i * 150 + f * (1 + (i % 3) * 0.3)} y={1350 + (i % 3) * 90} s={0.55 + (i % 3) * 0.1} />)}
        <Explosion x={420} y={1330} at={30} s={0.35} color="#fff" /><Explosion x={760} y={1420} at={70} s={0.4} color="#fff" /><Explosion x={240} y={1500} at={110} s={0.4} color="#fff" /></Layer>
      <Layer depth={1.1}><LandingCraft x={-300 + f * 2.4} y={1750} s={1.3} /></Layer>
      <Layer depth={0.3}>{Array.from({length: 3}).map((_, i) => <Jet key={i} x={-300 + ((f * 9 + i * 400) % 1800)} y={500 + i * 120} s={0.35} color="#7f8a94" />)}</Layer>
      <Layer depth={1.3}><Smoke x={900} y={1900} color="#555" n={8} opacity={0.4} /></Layer>
    </Camera></Stage>
    <div style={{position: 'absolute', top: 260, left: 60, right: 60, textAlign: 'center', opacity: clamp((f - nor) / 10)}}>
      <span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 38, color: '#fff', background: 'rgba(13,10,18,0.8)', padding: '10px 20px', borderRadius: 10}}>{L('NORMANDÍA 1944 · LA REFERENCIA')}</span></div>
    <Amb name="sea" vol={0.35} dur={d} /><Sfx name="boom" at={30} vol={0.3} /><Sfx name="boom" at={70} vol={0.35} /><Sfx name="boom" at={110} vol={0.35} /><Sfx name="jet" at={20} vol={0.35} /><Sfx name="gunfire" at={50} vol={0.25} />
  </AbsoluteFill>;
};

// ---------- 6. Fortaleza natural ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mon = cue.word('montañas'); const pla = cue.word('playas'); const bra = cue.word('bravo');
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.0, x: 0}, {f: bra, z: 1.05, x: 40}, {f: d, z: 1.15, x: 60, y: 80}]} shake={f > bra ? 3 : 0}>
      <Layer depth={0}><Sky top="#3a4a6a" bottom="#9ab0c4" id="skyF" /><Clouds n={6} y0={150} y1={600} color="#6a7a90" speed={1.4} /></Layer>
      <Layer depth={0.35}><Mountains y={1200} color="#3e6a4a" snow="#e8f0f4" h={720} n={6} seed={9} /></Layer>
      <Layer depth={0.5}><Mountains y={1250} color="#2f5a3a" snow="#cfe0d8" h={420} n={8} seed={4} /><Taipei101 x={860} y={1250} s={0.55} color="#6a9a8a" /></Layer>
      <Layer depth={0.7}><path d="M-600,1260 L400,1260 Q520,1300 600,1260 L1700,1260 L1700,1400 L-600,1400Z" fill="#d8c48a" /><Sea y={1330} color="#2a4a6a" amp={28 * (f > bra ? 1.8 : 1)} rough={2.2} /></Layer>
      <Layer depth={1}><Character d={CAST.twSoldier} x={260} y={1820} scale={1.25} pose="rifle" expr="determined" look={0.3} /></Layer>
      <Layer depth={1.4}><Rain n={f > bra ? 120 : 30} angle={20} opacity={0.45} /></Layer>
    </Camera></Stage>
    <Chip text={L("MONTAÑAS")} from={mon} y={300} x={300} /><Chip text={L("POCAS PLAYAS")} from={pla} y={400} x={700} color="#fff" rot={2} /><Chip text={L("VENTANAS: ABRIL Y OCTUBRE")} from={bra + 20} y={500} x={540} color="#9fd0ff" size={36} />
    <Amb name="sea" vol={0.4} dur={d} /><Amb name="wind" vol={0.3} dur={d} /><Sfx name="thunder" at={bra} vol={0.45} />
  </AbsoluteFill>;
};

// ---------- 7. Intervención y simulación CSIS ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const eu = cue.word('estados'); const csis = cue.word('csis'); const n24 = cue.word('24'); const fra = cue.word('fracasaba'); const per = cue.word('perdidos');
  const sim = f >= csis - 10;
  return <AbsoluteFill>
    {!sim && <Stage><Camera k={[{f: 0, z: 1.1}, {f: csis, z: 1.0, x: 60}]}>
      <Layer depth={0}><Sky top="#5a8ac0" bottom="#d8e6f0" id="skyC" /><Clouds n={5} y0={150} y1={600} speed={0.6} /></Layer>
      <Layer depth={0.6}><Sea y={1100} color="#2a5a8a" /></Layer>
      <Layer depth={0.75}><Carrier x={tween(f, 0, csis, 300, 520)} y={1250} s={0.65} /><Warship x={900} y={1180} s={0.3} color="#8a95a0" flag="japan" /></Layer>
      <Layer depth={0.4}>{Array.from({length: 4}).map((_, i) => <Jet key={i} x={-300 + ((f * 10 + i * 300) % 1700)} y={420 + i * 90} s={0.4} color="#8a95a0" />)}</Layer>
      <Layer depth={1}><Character d={CAST.usAdmiral} x={300} y={1820} scale={1.3} pose="point" expr="determined" talking look={0.4} /></Layer>
    </Camera></Stage>}
    {sim && <Stage bg="#081322">
      <rect width={1080} height={1920} fill="#081322" />
      {Array.from({length: 24}).map((_, i) => { const r = Math.floor(i / 4), c = i % 4; const appear = n24 + i * 2; const fail = rand(i, 5) > 0.2; const resolved = f > fra + i;
        if (f < appear) return null;
        return <g key={i} transform={`translate(${190 + c * 233},${420 + r * 125})`}>
          <rect x={-100} y={-60} width={200} height={120} rx={14} fill="#10243c" stroke={resolved ? (fail ? '#3ddc84' : '#ffd60a') : '#4a6a8a'} strokeWidth={5} />
          <text y={-14} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={24} fill="#9fb8d0">SIM #{i + 1}</text>
          {resolved && <text y={34} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={30} fill={fail ? '#3ddc84' : '#ffd60a'}>{fail ? L('FRACASA') : L('INCIERTO')}</text>}
        </g>; })}
      <g transform="translate(0,1450)" opacity={clamp((f - per + 6) / 10)}>
        {[['DECENAS', 'de buques'], ['CIENTOS', 'de aviones'], ['MILES', 'de bajas']].map(([a, b], i) => <g key={i} transform={`translate(${200 + i * 340},0)`}>
          <text textAnchor="middle" fontFamily={FONT_TITLE} fontSize={72} fill="#ff5a5a">{L(a)}</text><text y={50} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={32} fill="#fff">{L(b)}</text></g>)}
      </g>
    </Stage>}
    {sim && <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center'}}><span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, color: '#9fd0ff', letterSpacing: 3}}>{L('CSIS · ENERO 2023 · 24 SIMULACIONES')}</span></div>}
    {!sim && <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, opacity: clamp((f - eu) / 10)}}>
      <svg width={180} height={110}><FlagFace kind="usa" w={180} h={110} /></svg><svg width={180} height={110}><FlagFace kind="japan" w={180} h={110} /></svg><svg width={180} height={110}><FlagFace kind="roc" w={180} h={110} /></svg></div>}
    {!sim && <NameTag name={L("Almirante (ficticio)")} role={L("Armada de EE. UU.")} from={eu} dur={60} y={1560} color="#1f3a8a" />}
    {!sim && <Sfx name="jet" at={eu} vol={0.5} />}{sim && <><Sfx name="typing" at={n24} vol={0.4} /><Sfx name="digital" at={fra} vol={0.3} /><Sfx name="impact" at={per} vol={0.4} /></>}
  </AbsoluteFill>;
};

// ---------- 8. Economía mundial ----------
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const pct = cue.word('10%'); const cri = cue.word('2008'); const pan = cue.word('pandemia');
  const bars: [string, number, number, string][] = [['Crisis 2008', 5, cri, '#9fb8d0'], ['Pandemia 2020', 7, pan, '#9fb8d0'], ['Guerra por Taiwán', 10.2, pct, '#ff4a4a']];
  return <AbsoluteFill>
    <Stage bg="#0b1220">
      <rect width={1080} height={1920} fill="#0b1220" />
      {Array.from({length: 10}).map((_, i) => <line key={i} x1={100} x2={1000} y1={700 + i * 90} y2={700 + i * 90} stroke="#1c2a40" strokeWidth={3} />)}
      {bars.map(([lab, v, at, col], i) => { const k = easeOut(clamp((f - at) / 20)); const h = v * 60 * k;
        return <g key={i} transform={`translate(${250 + i * 290},620)`}>
          <rect x={-90} y={0} width={180} height={h} fill={col} stroke={C.ink} strokeWidth={6} />
          {k > 0 && i === 2 && <text y={h + 80} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={70} fill={col}>≈ -{fmtNum(v * k, 1)}%</text>}
          {k > 0 && i < 2 && <text y={h + 60} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={46} fill={col}>{L('MENOR')}</text>}
          <text y={-30} textAnchor="middle" fontFamily={FONT_UI} fontWeight={800} fontSize={30} fill="#fff" opacity={k > 0 ? 1 : 0.3}>{L(lab)}</text>
        </g>; })}
      <text x={540} y={1530} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={24} fill="#7f93ad">{L('Impacto estimado en el PIB mundial · Bloomberg Economics (2024)')}</text><text x={540} y={1566} textAnchor="middle" fontFamily={FONT_UI} fontWeight={600} fontSize={24} fill="#7f93ad">{L('Barras grises: comparación ilustrativa')}</text>
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Character d={CAST.analyst} x={540} y={1900} scale={0.7} pose="point" expr="worried" facing={-1} talking /></svg>
    <BigStat value={10} prefix="≈ -" suffix=" %" from={pct} label={L("PIB MUNDIAL")} y={260} hold={cri - pct + 10} color="#ff5a5a" />
    <Sfx name="impact" at={pct} vol={0.4} /><Sfx name="pop" at={cri} /><Sfx name="pop" at={pan} />
  </AbsoluteFill>;
};

// ---------- 9. Nadie ganaría ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Stage><Camera k={[{f: 0, z: 1.2, y: 100}, {f: d, z: 1.0}]}>
      <Layer depth={0}><Sky top="#1a1a2a" mid="#5a3a4a" bottom="#d88a5a" id="skyZ" /><Sun x={540} y={1060} r={90} color="#ffd8a0" glow="#ff7a4a" /></Layer>
      <Layer depth={0.5}><Sea y={1080} color="#3a3a5a" /></Layer>
      <Layer depth={0.8}><Warship x={240} y={1250} s={0.5} color="#6a6f76" flag="prc" /><Warship x={860} y={1290} s={0.5} color="#6a6f76" flag="usa" facing={-1} /></Layer>
      <Layer depth={1}><Character d={CAST.plaGeneral} x={250} y={1820} scale={1.15} pose="crossArms" expr="worried" look={0.6} /><Character d={CAST.twSoldier} x={540} y={1840} scale={1.15} pose="relaxed" expr="sad" propOverride="none" /><Character d={CAST.usAdmiral} x={830} y={1820} scale={1.15} pose="crossArms" expr="worried" facing={-1} look={0.6} /></Layer>
      <Layer depth={1.2}><Smoke x={540} y={1300} color="#3a3a3a" n={10} opacity={0.35} spread={300} /></Layer>
    </Camera></Stage>
    <Amb name="sea" vol={0.3} dur={d} />
  </AbsoluteFill>;
};

export const taiwanScenes = {s1_estrecho: S1, s2_contexto: S2, s3_chips: S3, s4_bloqueo: S4, s5_desembarco: S5, s6_fortaleza: S6, s7_simulacion: S7, s8_economia: S8, s9_final: S9};
