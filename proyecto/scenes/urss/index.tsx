// EPISODIO 1 — ¿Y si la URSS no hubiera caído?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CAST} from '../../components/cast';
import {C, FONT_TITLE, FONT_UI, clamp, easeOut, tween, rand} from '../../components/core';
import {Army, BerlinWall, Camera, Clouds, Crowd, Explosion, Flag, FlagFace, Flash, Ground, Haze, Kremlin, Layer, LightRays, Moon, Mountains, RussianWhiteHouse, Shuttle, Skyline, Sky, Smoke, Snow, Stage, Stars, Tank, Embers, Ridge} from '../../components/World';
import {MapView} from '../../components/MapView';
import {Amb, BigStat, Chip, DateStamp, NameTag, Sfx} from '../../components/Overlays';
import {SceneFC} from '../../components/Episode';
import {L} from '../../components/i18n';

export const USSR = ['Russia', 'Ukraine', 'Belarus', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Georgia', 'Armenia', 'Azerbaijan', 'Moldova', 'Lithuania', 'Latvia', 'Estonia'];
const RED = '#c8202a';

// ---------- 1. Kremlin, 25-12-1991 ----------
const S1: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame();
  const a = cue.word('arría'), b = cue.word('nunca');
  const lower = f < b ? tween(f, a - 10, a + 70, 0, 0.92) : tween(f, b, b + 25, 0.92, 0, easeOut);
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.55, x: 260, y: -330}, {f: a + 10, z: 1.25, x: 160, y: -180}, {f: b, z: 1.05, x: 0, y: 0}, {f: d, z: 1.12, x: 30, y: -40}]}>
        <Layer depth={0}><Sky top="#07091c" mid="#1b1f45" bottom="#4a2a4a" /><Stars n={80} h={900} /><Moon x={190} y={330} r={60} /></Layer>
        <Layer depth={0.3}><Clouds n={5} y0={200} y1={600} color="#2e2f55" speed={0.4} opacity={0.6} /></Layer>
        <Layer depth={0.6}><Kremlin x={540} y={1240} s={0.95} night /></Layer>
        <Layer depth={0.6}><Haze y={1230} color="#6a3a5a" h={260} opacity={0.5} /></Layer>
        <Layer depth={0.8}><Ground y={1240} color="#3a3440" color2="#4a4452" /><Crowd y={1380} n={22} s={0.55} colors={['#2a2830', '#3a3440', '#2f2c38']} seed={3} /></Layer>
        <Layer depth={1}>
          <Flag kind={f < b ? 'ussr' : 'ussr'} x={830} y={1420} pole={980} w={300} h={190} lower={lower} wave={1.2} />
          {f >= b && f < b + 20 && <rect x={-500} y={-500} width={2080} height={2920} fill="#ffd60a" opacity={0.18 * (1 - (f - b) / 20)} />}
        </Layer>
        <Layer depth={1.4}><Snow n={120} wind={0.8} /></Layer>
      </Camera>
    </Stage>
    <DateStamp text={L("25·12·1991")} sub={L("MOSCÚ, KREMLIN")} from={8} dur={a + 40} y={640} />
    <Amb name="wind" vol={0.22} dur={d} /><Sfx name="bell" at={4} vol={0.5} /><Sfx name="bell" at={60} vol={0.35} /><Sfx name="riser" at={b - 40} vol={0.3} /><Sfx name="impact" at={b} vol={0.5} />
  </AbsoluteFill>;
};

// ---------- 2. Mapa: el país más grande ----------
const S2: SceneFC = ({d, cue}) => {
  const w15 = cue.word('15'), w22 = cue.word('22'), w290 = cue.word('290');
  return <AbsoluteFill>
    <Stage bg="#0b0f1e">
      <Sky top="#05070f" bottom="#141b33" /><Stars n={70} h={1920} />
      <MapView proj={{type: 'ortho', center: [70, 50], scale: 640}} theme="cold"
        rotateKeys={[[0, 10, 25], [60, 62, 48], [d, 78, 52]]}
        fills={[{names: USSR, color: RED, at: 18, dur: 14, stagger: 3, glow: true}]}
        pins={[{at: [37.6, 55.75], from: 40, label: L('Moscú'), color: C.yellow}]}
        labels={[{at: [90, 62], text: L('URSS'), from: 50, size: 120, color: '#fff'}]} hideGrid={false} />
    </Stage>
    <BigStat value={15} from={w15} label={L("repúblicas")} y={250} hold={w22 - w15} />
    <BigStat value={22.4} decimals={1} suffix=" M km²" from={w22} label={L("la sexta parte de la tierra firme")} y={250} hold={w290 - w22} />
    <BigStat value={290} suffix=" M" from={w290} label={L("de habitantes (aprox.)")} y={250} />
    <Sfx name="whoosh" at={10} vol={0.4} /><Sfx name="ding" at={w15} vol={0.35} /><Sfx name="ding" at={w22} vol={0.35} /><Sfx name="ding" at={w290} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 3. Gorbachov ----------
const Hall: React.FC = () => (
  <g>
    <rect x={-600} y={-600} width={2280} height={3120} fill="#5a1a1e" />
    {Array.from({length: 16}).map((_, i) => <rect key={i} x={-600 + i * 150} y={-600} width={70} height={2400} fill="#4a1418" />)}
    <rect x={-600} y={1250} width={2280} height={900} fill="#6b4a32" /><rect x={-600} y={1250} width={2280} height={20} fill="#3a2a1a" />
    <g transform="translate(540,520)"><circle r={170} fill="#c8202a" stroke={C.ink} strokeWidth={8} /><circle r={150} fill="none" stroke="#e8b33b" strokeWidth={6} />
      <g transform="translate(4,6) scale(3.2)" fill="#ffd23f"><path d="M-6,-22 A24,24 0 1,1 -20,14 L-15,11 A18,18 0 1,0 -6,-16Z" /><path d="M-18,13 L-27,23 L-23,27 L-14,17Z" /><path d="M-15,-13 L17,19 L13,23 L-19,-9Z" /><path d="M-25,-15 L-9,-31 L-3,-25 L-19,-9Z" /></g></g>
  </g>
);
const ProblemCard: React.FC<{x: number; y: number; at: number; kind: 'shop' | 'oil' | 'afg'; label: string}> = ({x, y, at, kind, label}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null; const k = easeOut(clamp(f / 12));
  return <g transform={`translate(${x},${y}) scale(${k}) rotate(${(1 - k) * 20 + (kind === 'oil' ? 3 : -3)})`}>
    <rect x={-170} y={-170} width={340} height={360} rx={18} fill="#fffaf0" stroke={C.ink} strokeWidth={8} />
    <rect x={-150} y={-150} width={300} height={250} fill={kind === 'afg' ? '#e8c88a' : '#cfd8e0'} stroke={C.ink} strokeWidth={5} />
    {kind === 'shop' && <g>{[0, 1, 2].map((r) => <rect key={r} x={-140} y={-110 + r * 75} width={280} height={10} fill="#8a6a4a" />)}
      <rect x={-60} y={-60} width={30} height={40} fill="#c0392b" stroke={C.ink} strokeWidth={3} /><text x={0} y={80} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={50} fill="#c0392b">{L('VACÍO')}</text></g>}
    {kind === 'oil' && <g><rect x={-60} y={-110} width={120} height={170} rx={14} fill="#2a2a2a" stroke={C.ink} strokeWidth={5} /><rect x={-60} y={-60} width={120} height={14} fill="#555" /><rect x={-60} y={0} width={120} height={14} fill="#555" />
      <path d={`M60,-120 L130,${-120 + Math.min(f, 30) * 6}`} stroke={RED} strokeWidth={14} strokeLinecap="round" /><path d={`M110,${-80 + Math.min(f, 30) * 6} l30,0 l-10,30Z`} fill={RED} /></g>}
    {kind === 'afg' && <g><path d="M-150,100 L-70,-60 L0,40 L60,-90 L150,100Z" fill="#b08a5a" stroke={C.ink} strokeWidth={4} /><g transform="translate(0,70) scale(0.28)"><Tank x={0} y={0} color="#6b6b3c" moving={false} /></g></g>}
    <text x={0} y={160} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={48} fill={C.ink}>{label}</text>
  </g>;
};
const S3: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame();
  const per = cue.word('perestroika'), gla = cue.word('glásnost'), est = cue.word('estancada'), pet = cue.word('petróleo'), afg = cue.word('afganistán');
  const worried = f > est - 10;
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.25, x: 0, y: 80}, {f: est - 20, z: 1.1, x: 0, y: 40}, {f: est + 10, z: 0.95, x: 140, y: 0}, {f: d, z: 0.92, x: 150, y: 0}]}>
        <Layer depth={0.4}><Hall /></Layer>
        <Layer depth={1}>
          <Character d={CAST.gorbachov} x={worried ? 300 : 540} y={1600} scale={1.7} pose={worried ? 'think' : 'talkA'} pose2={worried ? 'think' : 'open'} mix={Math.abs(Math.sin(f / 30))} expr={worried ? 'worried' : 'determined'} talking={f < est - 15 || f > afg + 30} look={worried ? 0.6 : 0.2} />
          {!worried && <g transform="translate(540,1610)"><rect x={-230} y={-280} width={460} height={300} fill="#6b3a24" stroke={C.ink} strokeWidth={8} /><rect x={-240} y={-300} width={480} height={30} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
            <circle cx={0} cy={-150} r={60} fill="#c8202a" stroke="#e8b33b" strokeWidth={6} /><rect x={-14} y={-370} width={8} height={80} fill="#333" /><circle cx={-10} cy={-376} r={14} fill="#555" /></g>}
          <ProblemCard x={790} y={620} at={est} kind="shop" label={L("ECONOMÍA")} />
          <ProblemCard x={760} y={1040} at={pet} kind="oil" label={L("PETRÓLEO")} />
          <ProblemCard x={800} y={1460} at={afg} kind="afg" label={L("AFGANISTÁN")} />
        </Layer>
      </Camera>
    </Stage>
    <NameTag name={L("Mijaíl Gorbachov")} role={L("Secretario General del PCUS (1985–1991)")} from={cue.word('mijaíl') - 4} dur={95} y={1560} />
    <Chip text={L("PERESTROIKA · reestructuración")} from={per} dur={est - per - 10} y={330} color={C.yellow} />
    <Chip text={L("GLÁSNOST · transparencia")} from={gla} dur={est - gla - 10} y={440} color="#fff" rot={2} />
    <DateStamp text={L("1985")} sub={L("URSS")} from={0} dur={70} y={250} />
    <Sfx name="pop" at={per} /><Sfx name="pop" at={gla} /><Sfx name="stamp" at={est} vol={0.6} /><Sfx name="stamp" at={pet} vol={0.6} /><Sfx name="stamp" at={afg} vol={0.6} /><Sfx name="crowd" at={0} vol={0.08} dur={est} />
  </AbsoluteFill>;
};

// ---------- 4. Muro de Berlín y efecto dominó ----------
const DOMINO: {name: string; cols: string[]; vert?: boolean}[] = [
  {name: 'POLONIA', cols: ['#fff', '#dc143c']}, {name: 'R. D. ALEMANA', cols: ['#111', '#dd0000', '#ffce00']},
  {name: 'HUNGRÍA', cols: ['#ce2939', '#fff', '#477050']}, {name: 'CHECOSLOVAQUIA', cols: ['#fff', '#d7141a']},
  {name: 'BULGARIA', cols: ['#fff', '#00966e', '#d62612']}, {name: 'RUMANÍA', cols: ['#002b7f', '#fcd116', '#ce1126'], vert: true},
];
const S4: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const muro = cue.word('muro'); const nai = cue.word('castillo');
  const broken = tween(f, muro + 10, muro + 30, 0, 1);
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.15, y: 60}, {f: nai - 10, z: 1.0, y: 0}, {f: nai + 5, z: 0.9, y: -40}, {f: d, z: 0.88, y: -40}]} shake={f > muro + 8 && f < muro + 30 ? 8 : 0}>
        <Layer depth={0}><Sky top="#0a0f2a" bottom="#3a2f5a" /><Stars n={60} h={900} /></Layer>
        <Layer depth={0.3}><Skyline y={1150} color="#1f1d36" seed={4} windows="#ffd27a" h={350} /></Layer>
        <Layer depth={0.5}>{[0, 1, 2, 3].map((i) => { const k = ((f + i * 25) % 100) / 100; return <g key={i}>{k < 0.5 && <circle cx={200 + i * 230} cy={700 - k * 300} r={6} fill="#fff" />}{k >= 0.5 && Array.from({length: 12}).map((_, j) => <circle key={j} cx={200 + i * 230 + Math.cos(j / 2) * (k - 0.5) * 300} cy={550 + Math.sin(j / 2) * (k - 0.5) * 300 + (k - 0.5) * 80} r={6} fill={['#ffd60a', '#ff5a5a', '#5ad1ff'][i % 3]} opacity={1 - (k - 0.5) * 2} />)}</g>; })}</Layer>
        <Layer depth={0.8}><Ground y={1300} color="#3a3a46" /><BerlinWall y={1320} broken={broken} /></Layer>
        <Layer depth={0.85}><Crowd y={1000} n={9} x0={-80} x1={1150} s={0.7} cheer colors={['#5a6b7a', '#7a2e3a', '#3b4250', '#8a6a3a']} seed={6} /></Layer>
        <Layer depth={1}><Crowd y={1560} n={14} s={1} cheer={f > muro} seed={2} flags={['germany1871']} /></Layer>
        <Layer depth={1}>{f >= nai - 5 && <g>{DOMINO.map((c, i) => {
          const t0 = nai + i * 7; const fall = tween(f, t0, t0 + 14, 0, 82); const appear = easeOut(clamp((f - nai + 5 - i * 2) / 8));
          return <g key={i} transform={`translate(${110 + i * 170},1230) rotate(${fall},60,0) scale(${appear})`}>
            <rect x={-70} y={-300} width={140} height={300} rx={12} fill="#fffaf0" stroke={C.ink} strokeWidth={6} />
            <g transform="translate(-55,-280)">{c.cols.map((col, j) => c.vert
              ? <rect key={j} x={(j * 110) / c.cols.length} y={0} width={110 / c.cols.length} height={90} fill={col} stroke={C.ink} strokeWidth={2} />
              : <rect key={j} x={0} y={(j * 90) / c.cols.length} width={110} height={90 / c.cols.length} fill={col} stroke={C.ink} strokeWidth={2} />)}</g>
            <text x={0} y={-120} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={L(c.name).length > 10 ? 18 : 24} fill={C.ink}>{L(c.name)}</text>
            <text x={0} y={-60} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={50} fill={RED}>★</text>
          </g>;
        })}</g>}</Layer>
      </Camera>
    </Stage>
    <DateStamp text={L("9·11·1989")} sub={L("BERLÍN")} from={0} dur={muro + 40} y={250} />
    <Amb name="crowd" vol={0.25} dur={d} /><Sfx name="crumble" at={muro + 8} vol={0.7} /><Sfx name="cheer" at={muro + 18} vol={0.5} />
    {DOMINO.map((_, i) => <Sfx key={i} name="stamp" at={nai + i * 7 + 12} vol={0.35} />)}
  </AbsoluteFill>;
};

// ---------- 5. Golpe de agosto de 1991 ----------
const S5: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const tq = cue.word('tanques'); const yel = cue.word('borís'); const tres = cue.word('tres');
  const tankX = tween(f, tq - 30, tq + 40, -500, 380);
  const onTank = f > yel + 8; const climb = tween(f, yel, yel + 20, 0, 1, easeOut);
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.0, x: 0, y: 0}, {f: yel - 10, z: 1.0, x: -60, y: 0}, {f: yel + 20, z: 1.35, x: -60, y: 180}, {f: tres, z: 1.25, x: -60, y: 140}, {f: d, z: 1.05, x: 0, y: 40}]}>
        <Layer depth={0}><Sky top="#6f8fb3" bottom="#d9d3c4" /><Clouds n={6} y0={150} y1={600} color="#eef1f4" speed={0.5} /></Layer>
        <Layer depth={0.4}><RussianWhiteHouse x={540} y={1150} s={0.85} /><Flag kind="russia" x={540} y={500} pole={150} w={130} h={86} /></Layer>
        <Layer depth={0.7}><Ground y={1150} color="#8a8a86" color2="#7a7a76" /><Crowd y={1210} n={22} s={0.6} cheer={f > tres} flags={['russia']} seed={9} /></Layer>
        <Layer depth={1}>
          <Tank x={tankX} y={1560} s={0.95} color="#5d6b3c" moving={f < tq + 40} turret={f > tres ? tween(f, tres, tres + 20, 0, -8) : 0} />
          {f > yel - 20 && <Character d={CAST.yeltsin} x={onTank ? 330 : 120 + climb * 200} y={onTank ? 1360 : 1560 - climb * 200} scale={1.0} facing={1}
            pose={f > tres ? 'victory' : 'fist'} pose2="talkA" mix={f > tres ? 0 : Math.abs(Math.sin(f / 18)) * 0.5} expr={f > tres ? 'happy' : 'shout'} talking={onTank} walking={!onTank && climb < 1} />}
        </Layer>
        <Layer depth={1.3}>{f > tres && <Crowd y={1900} n={10} s={1.4} cheer flags={['russia']} seed={11} />}</Layer>
      </Camera>
    </Stage>
    <DateStamp text={L("19–21 AGO 1991")} sub={L("MOSCÚ")} from={0} dur={tq + 20} y={250} />
    <NameTag name={L("Borís Yeltsin")} role={L("Presidente de Rusia (RSFS)")} from={yel + 6} dur={90} y={1580} color="#1c57a5" />
    <Chip text={L("3 DÍAS")} from={tres} y={340} size={80} color={C.yellow} />
    <Amb name="tank" vol={0.35} from={tq - 30} dur={90} /><Amb name="crowd" vol={0.22} dur={d} /><Sfx name="cheer" at={tres + 6} vol={0.6} /><Sfx name="impact" at={yel + 10} vol={0.35} />
  </AbsoluteFill>;
};

// ---------- 6. Giro: el golpe triunfa ----------
const S6: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const bal = cue.word('bálticas'); const plo = cue.line(1);
  const mapK = tween(f, plo + 10, plo + 30, 0, 1);
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.3, y: 100}, {f: plo, z: 1.1, y: 40}]} shake={f < 20 ? 6 : 0}>
        <Layer depth={0}><Sky top="#12060a" bottom="#5a1414" /><LightRays x={540} y={-100} color="#ffe2b0" n={6} opacity={0.12} /></Layer>
        <Layer depth={0.4}><Kremlin x={540} y={1150} s={0.7} night /><Smoke x={200} y={1100} color="#2a1a1a" n={8} opacity={0.5} /><Smoke x={900} y={1100} color="#2a1a1a" n={8} opacity={0.5} /></Layer>
        <Layer depth={0.7}><Ground y={1150} color="#2a2228" /><Army x={-80} y={1200} rows={3} cols={13} dx={80} s={0.9} soldier={{coat: '#6a6c47', pants: '#5a5c3a', hat: 'helmet', hatColor: '#4a5a32', marching: false}} /></Layer>
        <Layer depth={1}><Tank x={850} y={1580} s={0.8} moving={false} turret={-6} facing={-1} /><Character d={CAST.sovietGeneral} x={420} y={1720} scale={1.55} pose="crossArms" expr="smug" talking={false} look={0.3} /></Layer>
      </Camera>
      <g opacity={mapK} transform={`translate(0,${(1 - mapK) * 80})`}>
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.4} />
        <g transform="translate(90,330) scale(0.83)" clipPath="url(#mapclip)">
          <defs><clipPath id="mapclip"><rect x={0} y={0} width={1080} height={1080} rx={30} /></clipPath></defs>
          <g transform="translate(0,-420)">
            <MapView proj={{type: 'mercator', center: [24, 57], scale: 2600}} theme="cold"
              fills={[{names: ['Russia', 'Belarus', 'Ukraine'], color: RED, at: 0}, {names: ['Estonia', 'Latvia', 'Lithuania'], color: RED, at: bal, dur: 12, stagger: 8, glow: true}]}
              labels={[{at: [25.5, 58.7], text: L('ESTONIA'), from: bal, size: 50}, {at: [25, 56.9], text: L('LETONIA'), from: bal + 8, size: 50}, {at: [23.8, 55.3], text: L('LITUANIA'), from: bal + 16, size: 50}]} />
          </g>
          <rect x={0} y={0} width={1080} height={1080} rx={30} fill="none" stroke="#fff" strokeWidth={10} />
        </g>
      </g>
    </Stage>
    <Amb name="siren" vol={0.12} dur={d} /><Sfx name="stamp" at={bal + 10} vol={0.5} /><Sfx name="stamp" at={bal + 18} vol={0.5} /><Sfx name="stamp" at={bal + 26} vol={0.5} />
  </AbsoluteFill>;
};

// ---------- 7. La receta china ----------
const S7: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const mer = cue.word('mercado'); const man = cue.word('mano');
  const rise = tween(f, mer - 10, mer + 40, 0.15, 1, easeOut);
  const slam = tween(f, man, man + 8, -900, 0);
  return <AbsoluteFill>
    <Stage>
      <Camera k={[{f: 0, z: 1.0}, {f: d, z: 1.12, y: -30}]} shake={f > man + 6 && f < man + 20 ? 14 : 0}>
        <Layer depth={0}><Sky top="#1a0b2a" mid="#5a1a3a" bottom="#f08a4a" /><Stars n={30} h={600} /></Layer>
        <Layer depth={0.5}><g transform={`translate(0,${(1 - rise) * 700})`}><Skyline y={1350} color="#2a2040" seed={7} windows="#ff5a6a" h={620} n={12} tall={5} /></g>
          <g transform={`translate(540,${520 + (1 - rise) * 600})`}><path d="M0,-90 l22,48 52,4 -40,34 14,52 -48,-30 -48,30 14,-52 -40,-34 52,-4Z" fill="#ff2a3a" stroke="#ffd6a0" strokeWidth={6} /></g></Layer>
        <Layer depth={0.8}><Ground y={1350} color="#1a1426" /></Layer>
        <Layer depth={1}><g transform={`translate(540,${1180 + slam}) scale(1.1)`} stroke={C.ink} strokeWidth={10} strokeLinejoin="round">
          <rect x={-120} y={20} width={240} height={600} fill="#5d6874" /><rect x={-134} y={10} width={268} height={70} rx={10} fill="#7d8894" />
          <rect x={-190} y={-250} width={380} height={290} rx={70} fill="#9aa6b2" />
          {[-142, -71, 0, 71].map((x, i) => <rect key={x} x={x - 2} y={-300 + (i === 0 ? 12 : 0)} width={75} height={150} rx={34} fill="#aeb9c4" />)}
          {[-142, -71, 0, 71].map((x) => <path key={'k' + x} d={`M${x + 14},-250 q22,-14 44,0`} fill="none" strokeWidth={6} />)}
          <path d="M-200,-120 Q-220,-40 -150,-20 L60,-40 Q100,-60 70,-100 L-140,-110Z" fill="#b8c2cc" />
          <path d="M-60,40 L60,40" strokeWidth={6} />
          <path d="M-170,-190 q30,-40 70,-30" stroke="#e6edf3" strokeWidth={8} fill="none" />
        </g>{f > man + 6 && <Explosion x={540} y={1230} at={man + 6} s={0.6} color="#9aa" />}</Layer>
      </Camera>
    </Stage>
    <Chip text={L("MERCADO")} from={mer} y={300} x={300} color="#3ddc84" />
    <Chip text={L("MANO DE HIERRO")} from={man} y={420} x={700} color="#ff5a5a" textColor="#fff" rot={3} />
    <div style={{position: 'absolute', top: 1580, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, opacity: clamp((f - 5) / 10)}}>
      <svg width={120} height={80}><FlagFace kind="prc" w={120} h={80} /></svg><span style={{fontFamily: FONT_TITLE, fontSize: 60, color: '#fff'}}>→</span><svg width={120} height={80}><FlagFace kind="ussr" w={120} h={80} /></svg>
    </div>
    <Sfx name="riser" at={mer - 20} vol={0.3} /><Sfx name="boom" at={man + 6} vol={0.6} />
  </AbsoluteFill>;
};

// ---------- 8. El mundo: Guerra Fría eterna y Burán ----------
const NATO91 = ['United States of America', 'Canada', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Belgium', 'Netherlands', 'Luxembourg', 'Denmark', 'Norway', 'Iceland', 'Greece', 'Turkey'];
const S8: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const ucr = cue.word('ucrania'); const ota = cue.word('otan'); const bur = cue.word('burán');
  const showBuran = f >= bur - 8;
  return <AbsoluteFill>
    {!showBuran && <Stage bg="#0b1220">
      <MapView proj={{type: 'conic', center: [22, 52], scale: 1650, parallels: [40, 60]}} theme="cold"
        zoom={[[0, 1], [ucr, 1.0], [ucr + 30, 1.25], [ota, 1.25], [ota + 30, 0.95]]} focus={[30, 50]}
        fills={[{names: USSR, color: RED, at: 0, dur: 1}, {names: ['Ukraine'], color: '#ff4a4a', at: ucr, dur: 10, glow: true},
          {names: NATO91, color: '#2a6fd6', at: ota, dur: 12, stagger: 2},
          {names: ['Poland', 'Czechia', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria'], color: '#9a9a9a', at: ota + 10, dur: 12}]}
        labels={[{at: [31, 49], text: L('RSS DE UCRANIA'), from: ucr + 5, size: 46, color: '#fff'}, {at: [5, 49], text: L('OTAN'), from: ota + 8, size: 80, color: '#fff'}, {at: [45, 56], text: L('URSS'), from: 0, size: 90, color: '#fff'}]}
        arrows={[{from: [8, 52], to: [21, 52], at: ota + 20, dur: 20, color: '#2a6fd6', label: L('✕')}]}>
      </MapView>
      <TitleBand text={L("TELÓN DE ACERO")} at={8} />
    </Stage>}
    {showBuran && <Stage>
      <Camera k={[{f: bur - 8, z: 1.25, y: 120}, {f: d, z: 1.0, y: -260}]} shake={f > bur + 30 ? 5 : 0}>
        <Layer depth={0}><Sky top="#3a7ab8" bottom="#f4d7a8" /><Clouds n={5} y0={150} y1={500} speed={0.4} /></Layer>
        <Layer depth={0.4}><Ridge y={1250} amp={40} color="#c9a873" seed={3} /></Layer>
        <Layer depth={0.8}><Ground y={1350} color="#b8955f" />
          <g transform="translate(320,1360)"><rect x={-40} y={-900} width={80} height={900} fill="#c43a2a" stroke={C.ink} strokeWidth={6} />{Array.from({length: 10}).map((_, i) => <path key={i} d={`M-40,${-i * 90} L40,${-i * 90 - 90} M40,${-i * 90} L-40,${-i * 90 - 90}`} stroke={C.ink} strokeWidth={4} />)}</g>
          <Shuttle x={560} y={1340} s={1.3} launch={bur + 25} />
          {f > bur + 20 && <Smoke x={560} y={1360} n={14} color="#e8e4dc" spread={260} rise={200} size={1.6} opacity={0.8} />}
        </Layer>
      </Camera>
    </Stage>}
    {showBuran && <DateStamp text={L("15·11·1988")} sub={L("BAIKONUR · ÚNICO VUELO")} from={bur - 8} dur={120} y={250} />}
    <Sfx name="whoosh" at={ucr - 6} vol={0.3} /><Sfx name="stamp" at={ota + 22} vol={0.4} />{showBuran && <><Sfx name="rocket" at={bur + 20} vol={0.6} /><Sfx name="boom" at={bur + 25} vol={0.35} /></>}
  </AbsoluteFill>;
};
const TitleBand: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame() - at; const k = easeOut(clamp(f / 12));
  return <g opacity={k}><rect x={0} y={250} width={1080 * k} height={110} fill="#0d0a12" opacity={0.8} /><text x={540} y={330} textAnchor="middle" fontFamily={FONT_TITLE} fontSize={78} fill={C.yellow} letterSpacing={6}>{text}</text></g>;
};

// ---------- 9. Final: un planeta partido en dos ----------
const S9: SceneFC = ({d, cue}) => {
  const f = useCurrentFrame(); const crack = cue.word('partido');
  return <AbsoluteFill>
    <Stage bg="#05060c">
      <Sky top="#05060c" bottom="#121a33" /><Stars n={120} h={1920} />
      <g transform={`translate(0,${-120})`}>
        <MapView proj={{type: 'ortho', center: [0, 40], scale: 470}} theme="cold" rotateKeys={[[0, -40, 45], [d, 120, 40]]}
          fills={[{names: USSR, color: RED, at: 0, dur: 1, glow: true}, {names: ['United States of America', 'Canada'], color: '#2a6fd6', at: 0, dur: 1, glow: true},
            {names: ['China', 'Mongolia', 'North Korea', 'Vietnam', 'Cuba'], color: '#e0605a', at: crack, dur: 15}, {names: ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Japan', 'Australia', 'South Korea'], color: '#5a8fe0', at: crack, dur: 15}]} />
        {f > crack && <path d={`M540,${470} L520,620 L570,760 L510,900 L560,1050 L530,1200 L550,${1450}`} fill="none" stroke="#fff" strokeWidth={10 * clamp((f - crack) / 10)} />}
      </g>
      <Embers n={30} color="#ff6a5a" />
    </Stage>
    <div style={{position: 'absolute', top: 1020, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', opacity: clamp((f - 10) / 15)}}>
      <svg width={180} height={120}><FlagFace kind="ussr" w={180} h={120} /></svg><span style={{fontFamily: FONT_TITLE, fontSize: 90, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>{L('VS')}</span><svg width={180} height={120}><FlagFace kind="usa" w={180} h={120} /></svg>
    </div>
    <Sfx name="impact" at={crack} vol={0.5} /><Sfx name="crumble" at={crack} vol={0.3} />
  </AbsoluteFill>;
};

export const urssScenes = {s1_kremlin: S1, s2_mapa: S2, s3_gorbachov: S3, s4_muro: S4, s5_golpe: S5, s6_giro: S6, s7_china: S7, s8_mundo: S8, s9_final: S9};
