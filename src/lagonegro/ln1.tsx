import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAST, Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam, Log} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {CampEntrance, dockAt, LakeCampNight, LakeView, LN_FIRE, LN_SEATS, Shed} from '../components/sets/LakeCamp';
import {aimAngle, Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, pop, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import tlEs from '../generated/timeline_ln1_es.json';

const SIX: CharId[] = ['mateo', 'lucia', 'carlos', 'vera', 'alex', 'bea'];
const S = 0.95;
const head = (id: CharId, standing = false) => ({x: LN_SEATS[id].x, y: LN_SEATS[id].y - (standing ? 255 : 222) * S});

/** The counsellors seated around the fire (each on a log). */
const Seated: React.FC<{ids: CharId[]; poses?: Partial<Record<CharId, Pose>>; standing?: Partial<Record<CharId, boolean>>; emptyLogs?: CharId[]}> = ({ids, poses = {}, standing = {}, emptyLogs = []}) => (
	<g>
		{SIX.map((id) => {
			const st = LN_SEATS[id];
			const here = ids.includes(id);
			return (
				<g key={id}>
					{here && <Character id={id} x={st.x} y={st.y} scale={S} pose={{sit: !standing[id], ...(poses[id] ?? {})}} />}
					{((here && !standing[id]) || emptyLogs.includes(id)) && <Log x={st.x} y={st.y - 20} w={150} color="#4e3220" />}
				</g>
			);
		})}
	</g>
);

const NameTag: React.FC<{x: number; y: number; name: string; p: number; color: string}> = ({x, y, name, p, color}) => {
	if (p <= 0.001) return null;
	const w = name.length * 30 + 56;
	return (
		<g transform={`translate(${x} ${y}) scale(${p})`}>
			<rect x={-w / 2} y={-38} width={w} height={64} rx={32} fill="#fff" stroke="#000" strokeWidth={5} />
			<circle cx={-w / 2 + 26} cy={-6} r={11} fill={color} />
			<text x={12} y={8} textAnchor="middle" fontFamily="InterBlack" fontSize={38} fill="#111">
				{name.toUpperCase()}
			</text>
		</g>
	);
};

/* 1 ─ HOOK: something rises from the lake at the end of the dock */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const rise = cue('rise');
	const sting = cue('sting');
	const end = dockAt(1);
	const fx = end.cx + 70;
	const water = end.y + 6;
	const sc = 0.34;
	const lift = kf(frame, [[rise, 0], [rise + 70, 1]], EASE);
	const feetY = water + (1 - lift) * 300 * sc;
	const cam = useCam([
		{f: 0, x: 700, y: 1420, z: 1.25},
		{f: sting - 4, x: fx - 20, y: water - 60, z: 2.6},
		{f: sting + 5, x: fx, y: water - 70 * sc * 3, z: 4.6, ease: EASE_OUT},
		{f: dur, x: fx, y: water - 70 * sc * 3, z: 4.9},
	], frame > sting ? 6 : 2);
	const drops = new Array(26).fill(0).map((_, i) => {
		const t = frame - rise - rand(i, 1) * 30;
		if (t < 0 || t > 40) return null;
		const x = fx + (rand(i, 2) - 0.5) * 70 + (rand(i, 3) - 0.5) * t * 2;
		const y = water - 40 - t * 3 + t * t * 0.12;
		return <circle key={i} cx={x} cy={Math.min(y, water)} r={2.5} fill="#cfe0ff" opacity={1 - t / 40} />;
	});
	return (
		<Stage cam={cam}>
			<LakeView time="night" darkness={0.78} fog={0.45} lights={[{x: fx, y: water - 60, r: 160, color: '#9fb4ff', glow: 0.4}]}>
				<defs>
					<clipPath id="abovewater">
						<rect x={-500} y={-500} width={3000} height={water + 500} />
					</clipPath>
				</defs>
				<g clipPath="url(#abovewater)">
					<Character id="masked" x={fx} y={feetY} scale={sc} pose={{item: 'hook', armR: [10, -10], glowEyes: frame > sting ? 1 : 0, headTilt: frame > sting ? 8 : 0}} />
				</g>
				{[0, 1, 2].map((k) => {
					const t = (frame - rise - k * 14) / 60;
					if (t < 0 || t > 1) return null;
					return <ellipse key={k} cx={fx} cy={water} rx={20 + t * 120} ry={5 + t * 20} fill="none" stroke="#cfe0ff" strokeWidth={2} opacity={1 - t} />;
				})}
				{drops}
			</LakeView>
		</Stage>
	);
};

/* 2 ─ ARRIVAL: six counsellors, introduced by name */
const Arrival: React.FC = () => {
	const frame = useCurrentFrame();
	const {scene, f, lineStart, dur} = useScene();
	const cam = useCam([
		{f: 0, x: 560, y: 760, z: 1.45},
		{f: lineStart(1) - 10, x: 540, y: 1150, z: 1.0},
		{f: dur, x: 540, y: 1250, z: 1.08},
	], 2);
	const norm = (s: string) => s.replace(/[^\wáéíóúñ]/gi, '').toLowerCase();
	const words = scene.lines[1].words;
	const walkers = SIX.map((id, i) => ({id, x: 900 - i * 150 + frame * 1.2, y: 1600 + (i % 2) * 14}));
	return (
		<Stage cam={cam}>
			<CampEntrance>
				{walkers.map((w, i) => (
					<Character key={w.id} id={w.id} x={w.x} y={w.y} scale={0.82} pose={{...walkPose(frame, 0.3, i * 1.1), turn: 0.6, lookX: 0.6, backpack: true, mouth: i % 2 ? 'grin' : 'smile'}} />
				))}
				{walkers.map((w, i) => {
					const wi = words.findIndex((x) => norm(x.w) === norm(CAST[w.id].name));
					if (wi < 0) return null;
					const next = words.slice(wi + 1).find((x) => SIX.some((id) => norm(CAST[id].name) === norm(x.w)));
					const p = pop(frame, f(words[wi].start) - 2) * kf(frame, [[next ? f(next.start) + 2 : dur - 12, 1], [next ? f(next.start) + 8 : dur - 4, 0]]);
					void i;
					return <NameTag key={w.id} x={w.x} y={w.y - 330} name={CAST[w.id].name} p={p} color={CAST[w.id].jacket} />;
				})}
			</CampEntrance>
		</Stage>
	);
};

/* 3 ─ LAKE: first day, Álex jumps off the dock (someone watches from the far shore) */
const Lake: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const splash = cue('splash');
	const jump = splash - 18;
	const t = kf(frame, [[8, 0.05], [jump, 0.92]], (x) => x);
	const p = dockAt(t);
	const air = Math.max(0, Math.min(1, (frame - jump) / 18));
	const ax = p.cx + air * 40;
	const ay = p.y - Math.sin(Math.PI * air) * 120 * p.s + air * 40;
	const inWater = frame >= splash;
	const cam = useCam([{f: 0, x: 620, y: 1300, z: 1.0}, {f: splash, x: 690, y: 1180, z: 1.45}, {f: dur, x: 690, y: 1170, z: 1.5}], 2);
	return (
		<Stage cam={cam}>
			<LakeView time="sunset" fog={0.15} farFigure={{x: 230, y: 1000, s: 0.14}}>
				{!inWater && (
					<Character id="alex" x={ax} y={ay} scale={p.s * 1.15} pose={{...walkPose(frame, 0.55, 0, frame < jump ? 1 : 0), back: true, armL: frame > jump ? [-160, 0] : undefined, armR: frame > jump ? [160, 0] : undefined}} />
				)}
				{inWater &&
					[0, 1, 2].map((k) => {
						const tt = (frame - splash - k * 8) / 40;
						if (tt < 0 || tt > 1) return null;
						return <ellipse key={k} cx={ax} cy={ay + 30} rx={20 + tt * 140} ry={6 + tt * 26} fill="none" stroke="#ffe0c0" strokeWidth={3} opacity={1 - tt} />;
					})}
				{inWater &&
					new Array(30).fill(0).map((_, i) => {
						const tt = frame - splash;
						const vx = (rand(i, 1) - 0.5) * 6;
						const vy = -6 - rand(i, 2) * 6;
						const y = ay + 20 + vy * tt + 0.35 * tt * tt;
						if (y > ay + 30) return null;
						return <circle key={i} cx={ax + vx * tt} cy={y} r={3 + rand(i, 3) * 3} fill="#ffe8d0" opacity={0.9} />;
					})}
				{/* friends on the shore (foreground) */}
				<Character id="lucia" x={160} y={1900} scale={1.3} pose={{mouth: talkMouth(frame, lineStart(1), lineEnd(1), inWater ? 'grin' : 'open', ['open', 'o', 'open']), armR: [150, 10], lookX: 1, lookY: -0.5, brows: 'raised'}} />
				<Character id="mateo" x={360} y={1950} scale={1.3} pose={{mouth: inWater ? 'grin' : 'smile', lookX: 1, lookY: -0.5, armL: inWater ? [-160, 0] : [-12, 4], armR: inWater ? [160, 0] : [12, -4]}} />
				<Character id="bea" x={880} y={1930} scale={1.3} pose={{mouth: 'grin', lookX: -1, lookY: -0.5, armR: [40, -100]}} />
				<Character id="vera" x={1040} y={1880} scale={1.3} pose={{mouth: inWater ? 'grin' : 'o', lookX: -1, lookY: -0.5}} />
			</LakeView>
		</Stage>
	);
};

/* 4 ─ LEGEND: Vera tells the story by the fire */
const Legend: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const v = head('vera');
	const l2 = lineStart(2);
	const cam = useCam([
		{f: 0, x: v.x - 20, y: v.y + 70, z: 2.4},
		{f: l2 - 6, x: v.x - 20, y: v.y + 60, z: 2.7},
		{f: l2 + 4, x: 540, y: 1130, z: 1.05, ease: EASE},
		{f: dur, x: 540, y: 1120, z: 1.12},
	], 2);
	const laugh = frame > l2;
	const poses: Partial<Record<CharId, Pose>> = {
		vera: {mouth: talkMouth(frame, lineStart(0), lineEnd(1), laugh ? 'grin' : 'creepy', ['o', 'creepy', 'open', 'flat']), armR: [172, 4], item: 'flashlight', phoneLit: 1, lookX: 0, brows: laugh ? 'neutral' : 'angry'},
		mateo: {mouth: talkMouth(frame, lineStart(2), lineEnd(2), 'grin'), lookX: 1, armL: [-30, -60]},
	};
	(['lucia', 'carlos', 'alex', 'bea'] as CharId[]).forEach((id, i) => (poses[id] = {mouth: laugh ? 'grin' : 'flat', lookX: id === 'alex' || id === 'bea' ? -1 : 1, headTilt: laugh ? Math.sin(frame / 5 + i) * 6 : 0}));
	return (
		<Stage cam={cam}>
			<LakeCampNight power={1} lights={[{x: v.x, y: v.y + 20, r: 150, color: '#ffffff', glow: 0.7}]} under={<Seated ids={SIX} poses={poses} />} />
		</Stage>
	);
};

/* 5 ─ BLACKOUT: the generator dies; Carlos goes to check */
const Blackout: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const off = cue('off');
	const flicker = frame > off - 8 && frame < off ? (Math.floor(frame / 2) % 2 ? 0.2 : 1) : 1;
	const power = frame < off ? flicker : 0;
	const up = lineStart(1) - 10;
	const leave = lineEnd(1) + 4;
	const standing = frame > up;
	const cx = kf(frame, [[leave, LN_SEATS.carlos.x], [dur, -160]], (x) => x);
	const cy = kf(frame, [[leave, LN_SEATS.carlos.y], [dur, 1330]], (x) => x);
	const cam = useCam([
		{f: 0, x: 540, y: 1050, z: 1.0},
		{f: off + 10, x: 540, y: 1100, z: 1.05},
		{f: up, x: LN_SEATS.carlos.x, y: 1060, z: 1.5},
		{f: dur, x: 250, y: 1080, z: 1.3},
	], 2);
	const poses: Partial<Record<CharId, Pose>> = {};
	SIX.forEach((id) => (poses[id] = {mouth: frame > off ? 'o' : 'smile', lookY: frame > off ? -0.8 : 0, lookX: frame > up ? (LN_SEATS[id].x < cx ? 1 : -1) * 0.6 : 0}));
	const carlosPose: Pose = {
		...(frame > leave ? {...walkPose(frame, 0.3, 0), turn: -0.6} : {}),
		mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'flat'),
		item: 'flashlight',
		phoneLit: standing ? 1 : 0,
		armR: [70, -10],
		lookX: -0.6,
	};
	return (
		<Stage cam={cam}>
			<LakeCampNight
				power={power}
				darkness={frame > off ? 0.92 : 0.86}
				lights={standing ? [{x: cx - 220, y: cy - 60, r: 200, color: '#fff6d0', glow: 0.5}] : []}
				under={
					<g>
						<Seated ids={SIX.filter((id) => id !== 'carlos' || !standing)} poses={poses} emptyLogs={standing ? ['carlos'] : []} />
						{standing && <Character id="carlos" x={cx} y={cy} scale={S} pose={carlosPose} />}
					</g>
				}
				over={standing ? <Beam x={cx + 70} y={cy - 150} angle={160} length={420} spread={12} intensity={0.45} /> : null}
			/>
		</Stage>
	);
};

/* 6 ─ SHED: Carlos alone at the generator */
const ShedScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const pull = cue('pull');
	const scrape = cue('scrape');
	const turn = cue('turn');
	const drop = cue('drop');
	const turned = frame >= turn && frame < turn + 30;
	const figure = kf(frame, [[scrape, 0], [scrape + 6, 1], [turn - 2, 1], [turn, 0]]);
	const pulling = frame >= pull && frame < pull + 20;
	const carlos = {x: 620, y: 1440};
	const cam = useCam([
		{f: 0, x: 600, y: 1100, z: 1.15},
		{f: scrape, x: 520, y: 1080, z: 1.3},
		{f: turn, x: 520, y: 1060, z: 1.45},
		{f: turn + 4, x: 560, y: 1080, z: 2.0, ease: EASE_OUT},
		{f: drop, x: 640, y: 1100, z: 1.6},
		{f: dur, x: 640, y: 1350, z: 2.4},
	], frame > scrape ? 4 : 2);
	const gone = frame >= drop;
	const beamAng = gone ? 170 + (frame - drop) * 9 : turned ? 200 : 10;
	const torch = gone ? {x: 680 + Math.min(40, (frame - drop) * 3), y: 1410} : turned ? {x: carlos.x - 60, y: carlos.y - 160} : {x: carlos.x + 70, y: carlos.y - 150};
	const ang = gone ? beamAng : turned ? 190 : 20;
	return (
		<AbsoluteFill>
			<Stage cam={cam}>
				<Shed
					generatorOn={frame > pull && frame < pull + 25 ? 0.6 : 0}
					figure={figure}
					darkness={0.8}
					lights={[{x: carlos.x, y: carlos.y - 220, r: gone ? 0 : 260, color: '#9fb4ff', glow: 0.2}, {x: torch.x + Math.cos((ang * Math.PI) / 180) * 260, y: torch.y + Math.sin((ang * Math.PI) / 180) * 260, r: 240, color: '#fff6d0', glow: 0.5}]}
				>
					{!gone && (
						<Character
							id="carlos"
							x={carlos.x}
							y={carlos.y}
							scale={1.05}
							pose={{
								turn: turned ? -0.7 : 0.7,
								item: 'flashlight',
								phoneLit: 1,
								armR: turned ? [-60, -20] : [70, -10],
								armL: pulling ? [-40 + (frame - pull) * 6, 30] : [-12, 4],
								mouth: turned ? 'open' : 'flat',
								brows: frame > scrape ? 'worried' : 'neutral',
								lookX: turned ? -1 : 1,
								tremble: frame > scrape ? 1.2 : 0,
							}}
						/>
					)}
					{gone && (
						<g transform={`translate(${torch.x} ${torch.y}) rotate(${(frame - drop) * 9})`}>
							<rect x={-8} y={-26} width={16} height={46} rx={5} fill="#2b2f36" />
						</g>
					)}
					<Beam x={torch.x} y={torch.y} angle={ang} length={gone ? 300 : 520} spread={12} intensity={gone ? 0.35 : 0.5} />
				</Shed>
			</Stage>
			{gone && <AbsoluteFill style={{background: '#000', opacity: kf(frame, [[drop, 0.3], [dur, 0.75]])}} />}
		</AbsoluteFill>
	);
};

/* 7 ─ WAITING: the walkie-talkie answers with breathing */
const Waiting: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const breath = cue('breath');
	const m = head('mateo');
	const cam = useCam([
		{f: 0, x: 540, y: 1120, z: 1.05},
		{f: lineStart(1) - 6, x: 520, y: 1100, z: 1.15},
		{f: lineStart(1) + 4, x: m.x + 60, y: m.y + 110, z: 2.3, ease: EASE},
		{f: breath + 30, x: m.x + 70, y: m.y + 100, z: 2.6},
		{f: lineStart(2), x: 480, y: 1060, z: 1.5, ease: EASE},
		{f: dur, x: 500, y: 1050, z: 1.7},
	], 2.5);
	const scared = frame > breath;
	const poses: Partial<Record<CharId, Pose>> = {
		mateo: {item: 'walkie', armR: [150, 30], phoneLit: scared ? 1 : 0.5, mouth: talkMouth(frame, lineStart(1), lineEnd(1), scared ? 'open' : 'flat'), brows: 'worried', lookX: 0.6, lookY: -0.4, tremble: scared ? 1.5 : 0},
	};
	(['lucia', 'vera', 'alex', 'bea'] as CharId[]).forEach((id, i) => (poses[id] = {mouth: scared ? 'open' : 'worried', brows: 'worried', lookX: -1, lean: -6, tremble: scared ? 1 : 0, lookY: Math.sin(frame / 30 + i) * 0.3}));
	return (
		<Stage cam={cam}>
			<LakeCampNight power={0} darkness={0.92} under={<Seated ids={['mateo', 'lucia', 'vera', 'alex', 'bea']} poses={poses} emptyLogs={['carlos']} />} />
		</Stage>
	);
};

/* 8 ─ REVEAL: Carlos's flashlight rolls into the light... and they see him */
const Reveal: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const boom = cue('boom');
	const roll = cue('roll');
	const tx = kf(frame, [[roll, -120], [roll + 40, 300]], EASE_OUT);
	const ty = 1600;
	const spin = kf(frame, [[roll, 0], [roll + 40, 540]], EASE_OUT);
	const killer = {x: 70, y: 1330};
	const stand = frame > roll + 45;
	const cam = useCam([
		{f: 0, x: 420, y: 1300, z: 1.4},
		{f: roll + 45, x: 300, y: 1420, z: 1.6},
		{f: boom - 10, x: 200, y: 1150, z: 1.15},
		{f: boom + 5, x: killer.x + 40, y: killer.y - 300, z: 2.4, ease: EASE_OUT},
		{f: dur, x: killer.x + 40, y: killer.y - 310, z: 2.6},
	], frame > boom ? 7 : 2);
	const seen = frame >= boom - 2;
	const poses: Partial<Record<CharId, Pose>> = {};
	(['mateo', 'lucia', 'vera', 'alex', 'bea'] as CharId[]).forEach((id) => (poses[id] = {mouth: seen ? 'open' : 'worried', brows: 'worried', lookX: -1, lookY: frame > roll + 40 ? 0.6 : 0, tremble: seen ? 2 : 0.5, armL: seen ? [-120, -40] : [-12, 4]}));
	const standing: Partial<Record<CharId, boolean>> = stand ? {mateo: true, lucia: true, vera: true, alex: true, bea: true} : {};
	const torchAng = spin + 180;
	return (
		<>
			<Stage cam={cam}>
				<LakeCampNight
					power={0}
					darkness={0.92}
					lights={[{x: tx + Math.cos((torchAng * Math.PI) / 180) * 200, y: ty + Math.sin((torchAng * Math.PI) / 180) * 80, r: 180, color: '#fff6d0', glow: 0.4}, ...(seen ? [{x: killer.x, y: killer.y - 260, r: 260, color: '#ffb070', glow: 0.5}] : [])]}
					under={
						<g>
							<Seated ids={['mateo', 'lucia', 'vera', 'alex', 'bea']} poses={poses} standing={standing} emptyLogs={['carlos']} />
							<Character id="masked" x={killer.x} y={killer.y} scale={1.05} pose={{item: 'hook', armR: [12, -10], glowEyes: seen ? 1 : 0, headTilt: seen ? -8 : 0}} opacity={seen ? 1 : 0.25} />
						</g>
					}
					over={
						<g>
							<g transform={`translate(${tx} ${ty}) rotate(${spin})`}>
								<rect x={-10} y={-30} width={20} height={56} rx={6} fill="#2b2f36" />
								<rect x={-13} y={20} width={26} height={16} rx={4} fill="#4a515c" />
							</g>
							<Beam x={tx} y={ty} angle={torchAng} length={300} spread={14} intensity={0.4} />
						</g>
					}
				/>
			</Stage>
			<Flash at={boom} len={10} color="#ffffff" peak={0.55} />
		</>
	);
};

/* 9 ─ CHOICE: the audience decides how chapter 2 begins */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const killer = {x: 70, y: 1330};
	const z = kf(frame, [[0, 2.2], [dur, 2.6]], (x) => x);
	const poses: Partial<Record<CharId, Pose>> = {};
	(['mateo', 'lucia', 'vera', 'alex', 'bea'] as CharId[]).forEach((id) => (poses[id] = {mouth: 'open', brows: 'worried', lookX: -1}));
	const chapter = part.split('·')[0].trim();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.85) brightness(0.45) contrast(1.2)'}}>
				<Stage cam={{x: killer.x + 60, y: killer.y - 300 + noise2D('c', frame * 0.01, 0) * 6, z, r: 0}}>
					<LakeCampNight
						power={0}
						darkness={0.9}
						lights={[{x: killer.x, y: killer.y - 260, r: 300, color: '#ffb070', glow: 0.5}]}
						under={
							<g>
								<Seated ids={['mateo', 'lucia', 'vera', 'alex', 'bea']} poses={poses} standing={{mateo: true, lucia: true, vera: true, alex: true, bea: true}} emptyLogs={['carlos']} />
								<Character id="masked" x={killer.x} y={killer.y} scale={1.05} pose={{item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: -8}} />
							</g>
						}
					/>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.7))'}} />
			<ChoiceCard
				title={title}
				chapter={chapter}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Huir por el bosque hasta la carretera', at: lineStart(1), icon: 'road'},
					{key: 'B', text: 'Encerrarse en la cabaña principal', at: lineStart(2), icon: 'cabin'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
			/>
		</AbsoluteFill>
	);
};

export const LN1: EpisodeDef = {
	slug: 'ln1',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.85},
		arrival: {C: Arrival, fadeIn: 10, vignette: 0.35},
		lake: {C: Lake, vignette: 0.45},
		legend: {C: Legend, fadeIn: 12, vignette: 0.75},
		blackout: {C: Blackout, vignette: 0.8},
		shed: {C: ShedScene, fadeIn: 6, vignette: 0.85},
		waiting: {C: Waiting, fadeIn: 10, vignette: 0.85},
		reveal: {C: Reveal, vignette: 0.85},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
void aimAngle;
void LN_FIRE;
