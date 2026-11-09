import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam, Log} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {LakeCampNight, LN_SEATS} from '../components/sets/LakeCamp';
import {ForestRun, Pickup, RoadBack, RoadNight, ROAD_Y} from '../components/sets/Road';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import {StayCTA} from './Subscribe';
import tlEs from '../generated/timeline_ln2_es.json';

/** The five survivors (Carlos is missing since chapter 1). */
const FIVE: CharId[] = ['mateo', 'lucia', 'vera', 'alex', 'bea'];
const GROUND = 1500;
const RS = 0.8;

type Runner = {id: CharId; x: number; y?: number; pose?: Pose; opacity?: number; rot?: number};
const Runners: React.FC<{list: Runner[]}> = ({list}) => (
	<g>
		{[...list].sort((a, b) => (a.y ?? GROUND) - (b.y ?? GROUND)).map((r) => (
			<g key={r.id} transform={r.rot ? `rotate(${r.rot} ${r.x} ${r.y ?? GROUND})` : undefined}>
				<Character id={r.id} x={r.x} y={r.y ?? GROUND} scale={RS} pose={r.pose} opacity={r.opacity} />
			</g>
		))}
	</g>
);

/** Running pose with flashlight pointing forward. */
const runPose = (frame: number, i: number, extra: Pose = {}): Pose => ({
	...walkPose(frame, 0.55, i * 1.3, 1.25),
	turn: 0.7,
	lean: 9,
	lookX: 0.8,
	mouth: 'open',
	brows: 'worried',
	item: i % 2 === 0 ? 'flashlight' : null,
	phoneLit: 1,
	armR: i % 2 === 0 ? [80 + Math.sin(frame * 0.55 + i) * 8, -10] : undefined,
	...extra,
});
const RUN_X: Record<string, number> = {alex: 760, lucia: 620, mateo: 480, vera: 350, bea: 220};
const RUN_Y: Record<string, number> = {alex: 1500, lucia: 1520, mateo: 1495, vera: 1515, bea: 1505};

/** Flashlight beams for the runners holding torches. */
const runnerBeams = (frame: number, ids: CharId[], angle = 8) =>
	ids
		.filter((_, i) => i % 2 === 0)
		.map((id, i) => {
			const x = RUN_X[id] + 70;
			const y = RUN_Y[id] - 175 + Math.sin(frame * 0.55 + i) * 6;
			return {x, y, angle: angle + Math.sin(frame * 0.3 + i) * 6};
		});

/* 1 ─ HOOK: the Guarda steps forward; they run */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, dur} = useScene();
	const sting = cue('sting');
	const go = lineStart(1) - 12;
	const kx = kf(frame, [[0, 70], [go + 10, 190]], EASE);
	const cam = useCam([
		{f: 0, x: 110, y: 1030, z: 2.6},
		{f: sting - 2, x: 120, y: 1030, z: 2.75},
		{f: sting + 8, x: 470, y: 1110, z: 1.1, ease: EASE_OUT},
		{f: go, x: 470, y: 1110, z: 1.1},
		{f: dur, x: 820, y: 1150, z: 1.25},
	], frame > sting ? 6 : 3);
	const list: Runner[] = FIVE.map((id, i) => {
		const run = frame > go + i * 3;
		const t = Math.max(0, frame - go - i * 3);
		return {
			id,
			x: LN_SEATS[id].x + t * 12,
			y: LN_SEATS[id].y,
			pose: run ? runPose(frame, i) : {mouth: frame > sting ? 'open' : 'worried', brows: 'worried', lookX: -1, tremble: 2, armL: [-120, -40]},
		};
	});
	return (
		<>
			<Stage cam={cam}>
				<LakeCampNight
					power={0}
					darkness={0.9}
					lights={[{x: kx, y: 1070, r: 280, color: '#ffb070', glow: 0.5}]}
					under={
						<g>
							{['mateo', 'lucia', 'carlos', 'vera', 'alex', 'bea'].map((id) => (
								<Log key={id} x={LN_SEATS[id].x} y={LN_SEATS[id].y - 20} w={150} color="#4e3220" />
							))}
							<Character id="masked" x={kx} y={1330} scale={1.05} pose={{...walkPose(frame, 0.12, 0, frame < go + 10 ? 0.5 : 0), turn: 0.4, item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: kf(frame, [[0, 0], [sting, -14], [go, 4]])}} />
							<Runners list={list.map((r) => ({...r}))} />
						</g>
					}
				/>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.4} />
		</>
	);
};

/* 2 ─ CTA: stay until the end + subscribe, while the chase goes on */
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue} = useScene();
	const list: Runner[] = FIVE.map((id, i) => ({id, x: RUN_X[id], y: RUN_Y[id], pose: runPose(frame, i)}));
	const beams = runnerBeams(frame, FIVE);
	return (
		<AbsoluteFill>
			<Stage cam={{x: 540, y: 1250, z: 1.05, r: noise2D('cta', frame * 0.05, 0) * 0.4}}>
				<ForestRun
					scroll={frame * 22}
					lights={beams.map((b) => ({x: b.x + 260, y: b.y + 40, r: 200, color: '#fff6d0', glow: 0.35}))}
					front={<g>{beams.map((b, i) => <Beam key={i} x={b.x} y={b.y} angle={b.angle} length={420} spread={12} intensity={0.35} />)}</g>}
				>
					<Runners list={list} />
				</ForestRun>
			</Stage>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.4))'}} />
			<StayCTA clickAt={cue('click')} />
		</AbsoluteFill>
	);
};

/* 3 ─ RUN: through the woods, Lucía shouts */
const Run: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const shout = frame >= lineStart(1);
	const list: Runner[] = FIVE.map((id, i) => ({
		id,
		x: RUN_X[id],
		y: RUN_Y[id],
		pose: runPose(frame, i, id === 'lucia' && shout ? {turn: -0.4, lookX: -1, mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'open', ['open', 'o', 'open'])} : {}),
	}));
	const beams = runnerBeams(frame, FIVE);
	const cam = useCam([
		{f: 0, x: 420, y: 1300, z: 1.5},
		{f: lineStart(1) - 6, x: 560, y: 1290, z: 1.55},
		{f: lineStart(1) + 4, x: RUN_X.lucia, y: RUN_Y.lucia - 220, z: 2.5, ease: EASE},
		{f: dur, x: RUN_X.lucia, y: RUN_Y.lucia - 220, z: 2.6},
	], 7);
	return (
		<Stage cam={cam}>
			<ForestRun
				scroll={frame * 24}
				lights={beams.map((b) => ({x: b.x + 260, y: b.y + 40, r: 200, color: '#fff6d0', glow: 0.35}))}
				front={<g>{beams.map((b, i) => <Beam key={i} x={b.x} y={b.y} angle={b.angle} length={420} spread={12} intensity={0.35} />)}</g>}
			>
				<Runners list={list} />
			</ForestRun>
		</Stage>
	);
};

/* 4 ─ ANKLE: Bea falls; Mateo won't leave her */
const Ankle: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const fall = cue('fall');
	const stop = fall + 14;
	const help = lineStart(2);
	const scroll = kf(frame, [[0, 0], [stop, (stop * 22) / 2]], (x) => x) * 2;
	const running = frame < stop;
	const beaRot = kf(frame, [[fall, 0], [fall + 8, 72]], EASE_OUT) * (frame < help + 10 ? 1 : 0);
	const mateoX = kf(frame, [[lineStart(1), RUN_X.mateo], [help, RUN_X.bea + 120]], EASE);
	const list: Runner[] = FIVE.map((id, i) => {
		if (id === 'bea') {
			const up = frame >= help + 10;
			return {
				id,
				x: RUN_X.bea + (up ? 30 : 0),
				y: RUN_Y.bea,
				rot: beaRot,
				pose: running && frame < fall
					? runPose(frame, i)
					: {mouth: talkMouth(frame, lineStart(1), lineEnd(1), up ? 'worried' : 'open', ['open', 'o', 'open']), brows: 'worried', armL: [-40, -60], armR: up ? [150, 30] : [40, 60], lookX: 1, tremble: 1, lean: up ? 14 : 0},
			};
		}
		if (id === 'mateo') {
			return {id, x: mateoX, y: RUN_Y.mateo, pose: running ? runPose(frame, i) : {turn: -0.5, lookX: -1, mouth: talkMouth(frame, lineStart(2), lineEnd(2), 'flat'), brows: 'angry', armL: frame > help ? [-140, 20] : [-30, 0]}};
		}
		return {id, x: RUN_X[id] + (running ? 0 : 40), y: RUN_Y[id], pose: running ? runPose(frame, i) : {turn: -0.5, lookX: -1, mouth: 'open', brows: 'worried', tremble: 0.8}};
	});
	const cam = useCam([
		{f: 0, x: 420, y: 1300, z: 1.4},
		{f: fall, x: RUN_X.bea + 40, y: 1380, z: 2.2, ease: EASE},
		{f: help - 10, x: RUN_X.bea + 60, y: 1360, z: 2.1},
		{f: dur, x: 420, y: 1280, z: 1.5},
	], running ? 6 : 2.5);
	return (
		<Stage cam={cam}>
			<ForestRun scroll={running ? frame * 22 : scroll} lights={[{x: RUN_X.bea + 100, y: 1360, r: 260, color: '#fff6d0', glow: 0.3}]}>
				<Runners list={list} />
			</ForestRun>
		</Stage>
	);
};

/* 5 ─ AHEAD: the Guarda is not behind them — he is in front */
const Ahead: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, dur} = useScene();
	const sting = cue('sting');
	const snap = cue('snap');
	const cross = kf(frame, [[snap - 6, 1350], [snap + 10, 760]], (x) => x);
	const peek = {x: 940, y: 1470};
	const list: Runner[] = FIVE.map((id, i) => ({
		id,
		x: RUN_X[id] - 120 + (id === 'bea' ? 90 : 0),
		y: RUN_Y[id],
		pose: {turn: 0.6, lookX: 1, mouth: frame > snap ? 'open' : 'worried', brows: 'worried', tremble: frame > snap ? 2 : 0.6, item: i % 2 === 0 ? 'flashlight' : null, phoneLit: 1, armR: i % 2 === 0 ? [75, -10] : undefined},
	}));
	const beams = FIVE.filter((_, i) => i % 2 === 0).map((id, i) => ({x: RUN_X[id] - 120 + 70, y: RUN_Y[id] - 175, angle: -4 + Math.sin(frame / 9 + i) * 10}));
	const cam = useCam([
		{f: 0, x: 420, y: 1280, z: 1.3},
		{f: lineStart(1) - 10, x: 700, y: 1250, z: 1.35},
		{f: sting - 2, x: 820, y: 1250, z: 1.4},
		{f: sting + 6, x: peek.x - 60, y: peek.y - 310, z: 3.0, ease: EASE_OUT},
		{f: dur, x: peek.x - 60, y: peek.y - 310, z: 3.2},
	], frame > sting ? 6 : 2.5);
	const seen = frame >= sting - 2;
	return (
		<>
			<Stage cam={cam}>
				<ForestRun
					scroll={0}
					darkness={0.82}
					lights={[...beams.map((b) => ({x: b.x + 300, y: b.y + 10, r: 220, color: '#fff6d0', glow: 0.35})), ...(seen ? [{x: peek.x - 40, y: peek.y - 300, r: 200, color: '#fff6d0', glow: 0.5}] : [])]}
					front={<g>{beams.map((b, i) => <Beam key={i} x={b.x} y={b.y} angle={b.angle} length={520} spread={11} intensity={0.35} />)}</g>}
				>
					{frame > snap - 6 && frame < snap + 10 && <Character id="masked" x={cross} y={1430} scale={0.9} pose={{...walkPose(frame, 0.6, 0, 1.2), turn: -0.7, item: 'hook', armR: [12, -10]}} opacity={0.85} />}
					{seen && <Character id="masked" x={peek.x} y={peek.y} scale={1.0} pose={{item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: -16, turn: -0.4}} />}
					{seen && <rect x={peek.x + 10} y={600} width={150} height={1000} fill="#0c111c" />}
					<Runners list={list} />
				</ForestRun>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.45} />
		</>
	);
};

/* 6 ─ ROAD: they reach the road; Álex stops a pickup */
const Road: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const screech = cue('screech');
	const out = kf(frame, [[0, -260], [40, 0]], EASE_OUT);
	const tx = kf(frame, [[cue('car'), 2400], [screech + 6, 1180]], EASE_OUT);
	const wheel = frame < screech + 6 ? -frame * 14 : -(screech + 6) * 14;
	const headl = frame > cue('car') - 10 ? 1 : 0;
	const wave = frame > lineStart(1) - 6;
	const list: Runner[] = FIVE.map((id, i) => {
		if (id === 'alex') {
			return {id, x: 620, y: ROAD_Y + 20, pose: wave ? {turn: 0.6, mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'open', ['open', 'o', 'open']), armL: [-160 + Math.sin(frame / 3) * 20, 0], armR: [160 - Math.sin(frame / 3) * 20, 0], lookX: 1, brows: 'raised'} : runPose(frame, i)};
		}
		return {id, x: 200 + i * 70 + out, y: 1430 + (i % 2) * 14, pose: frame < 40 ? runPose(frame, i) : {turn: 0.6, lookX: 1, mouth: 'open', brows: 'worried'}};
	});
	const cam = useCam([
		{f: 0, x: 420, y: 1250, z: 1.2},
		{f: lineStart(1), x: 620, y: 1260, z: 1.4},
		{f: screech, x: 760, y: 1300, z: 1.15},
		{f: dur, x: 760, y: 1300, z: 1.1},
	], frame > screech && frame < screech + 15 ? 8 : 2);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.85} lights={headl ? [{x: tx - 500, y: ROAD_Y - 150, r: 520, rx: 700, color: '#fff6c8', glow: 0.5}] : []}>
				<Runners list={list} />
				<Pickup x={tx} y={ROAD_Y + 80} s={-0.9} wheel={wheel} headlights={headl} driver={{mouth: 'flat', lookX: 0.5}} />
			</RoadNight>
		</Stage>
	);
};

/* 7 ─ TRUCK: Tomás picks them up; the Guarda shrinks in the distance */
const Truck: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const drive = cue('car');
	const back = lineStart(1) - 6;
	const moving = frame > drive;
	const scroll = moving ? (frame - drive) * kf(frame, [[drive, 0], [drive + 30, 26]]) : 0;
	const passengers = [
		{id: 'bea' as CharId, dx: 0, pose: {mouth: 'worried', lookX: -1, brows: 'worried'} as Pose},
		{id: 'mateo' as CharId, dx: 120, pose: {mouth: 'flat', lookX: -1} as Pose},
		{id: 'vera' as CharId, dx: 230, pose: {mouth: 'open', lookX: -1, brows: 'worried'} as Pose},
		{id: 'lucia' as CharId, dx: 330, pose: {mouth: 'worried', lookX: 1} as Pose},
		{id: 'alex' as CharId, dx: 430, pose: {mouth: 'smile', lookX: 1} as Pose},
	];
	if (frame >= back) {
		const t = (frame - back) / 30;
		const fig = kf(frame, [[back, 0.85], [dur, 0.12]], (x) => Math.pow(x, 0.7));
		return (
			<Stage cam={{x: 540, y: 1180 + Math.sin(frame / 3) * 4, z: 1.0, r: Math.sin(frame / 7) * 0.5}}>
				<RoadBack t={t} figure={fig}>
					<rect x={-300} y={1740} width={1700} height={400} fill="#2f4a3a" />
					<rect x={-300} y={1730} width={1700} height={26} fill="#3d5c49" />
					<Character id="vera" x={360} y={1980} scale={1.6} pose={{back: true, sit: true}} />
					<Character id="lucia" x={720} y={2000} scale={1.6} pose={{back: true, sit: true}} />
				</RoadBack>
			</Stage>
		);
	}
	return (
		<Stage cam={{x: 640, y: 1250, z: 1.25, r: 0}}>
			<RoadNight scroll={scroll} darkness={0.82} lights={[{x: 880, y: 1240, r: 420, color: '#9fc0ff', glow: 0.25}, {x: 1300, y: ROAD_Y - 150, r: 500, color: '#fff6c8', glow: 0.4}]}>
				<Pickup x={300} y={ROAD_Y + 80} s={0.9} wheel={-scroll * 0.6} driver={{mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'flat'), lookX: -0.6, brows: 'neutral'}} passengers={passengers} />
			</RoadNight>
		</Stage>
	);
};

/* 8 ─ TWIST: "thirty years ago I worked at that camp" — and they're heading back to the lake */
const Twist: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const sting = cue('sting');
	const scroll = frame * 26;
	const signX = 640 + sting * 26 - 40;
	const cab = {x: 300 + 0.9 * 510, y: ROAD_Y + 80 - 0.9 * 300};
	const noticed = frame > lineStart(1) + 20;
	const passengers = [
		{id: 'bea' as CharId, dx: 0, pose: {mouth: noticed ? 'open' : 'flat', lookX: noticed ? 0.6 : -1, brows: 'worried'} as Pose},
		{id: 'mateo' as CharId, dx: 120, pose: {mouth: noticed ? 'open' : 'flat', lookX: 0.6, brows: 'worried'} as Pose},
		{id: 'vera' as CharId, dx: 230, pose: {mouth: 'worried', lookX: 1} as Pose},
		{id: 'lucia' as CharId, dx: 330, pose: {mouth: noticed ? 'open' : 'flat', lookX: noticed ? -1 : 1, brows: 'worried', tremble: noticed ? 1.5 : 0} as Pose},
		{id: 'alex' as CharId, dx: 430, pose: {mouth: 'flat', lookX: 1, brows: 'worried'} as Pose},
	];
	const cam = useCam([
		{f: 0, x: cab.x, y: cab.y + 10, z: 2.6},
		{f: lineStart(1) - 8, x: cab.x - 40, y: cab.y + 20, z: 2.4},
		{f: lineStart(1) + 6, x: 620, y: 1250, z: 1.15, ease: EASE},
		{f: sting - 4, x: 640, y: 1150, z: 1.05},
		{f: sting + 6, x: 640, y: 1040, z: 1.6, ease: EASE_OUT},
		{f: dur, x: 640, y: 1040, z: 1.7},
	], frame > sting ? 5 : 2);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight
					scroll={scroll}
					darkness={0.82}
					sign={{x: signX, text: 'LAGO NEGRO 1 km'}}
					lights={[{x: cab.x, y: cab.y, r: 200, color: '#7CFFB0', glow: 0.35}, {x: 1300, y: ROAD_Y - 150, r: 500, color: '#fff6c8', glow: 0.4}, {x: signX - scroll, y: 1060, r: 260, color: '#fff6c8', glow: 0.3}]}
				>
					<Pickup x={300} y={ROAD_Y + 80} s={0.9} wheel={-scroll * 0.6} driver={{mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'smile', ['o', 'smile', 'flat']), lookX: frame > lineStart(1) ? 0 : -0.8, brows: 'neutral'}} passengers={passengers} />
				</RoadNight>
			</Stage>
			<Flash at={sting} len={8} color="#ff2d3a" peak={0.3} />
		</>
	);
};

/* 9 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	const chapter = part.split('·')[0].trim();
	const z = kf(frame, [[0, 1.1], [dur, 1.3]], (x) => x);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.85) brightness(0.45) contrast(1.2)'}}>
				<Stage cam={{x: 640, y: 1150, z, r: 0}}>
					<RoadNight scroll={frame * 2} darkness={0.82} sign={{x: 640, text: 'LAGO NEGRO 1 km'}} lights={[{x: 760, y: 1060, r: 300, color: '#fff6c8', glow: 0.3}]}>
						<Pickup x={300} y={ROAD_Y + 80} s={0.9} wheel={-frame * 2} driver={{mouth: 'smile', lookX: 0}} passengers={FIVE.map((id, i) => ({id, dx: i * 105, pose: {mouth: 'open', brows: 'worried', lookX: 0.6}}))} />
					</RoadNight>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={chapter}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Saltar de la camioneta en marcha', at: lineStart(1), icon: 'jump'},
					{key: 'B', text: 'Quedarse y descubrir quién es Tomás', at: lineStart(2), icon: 'question'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
				subscribeAt={cue('bell') - 9}
			/>
		</AbsoluteFill>
	);
};

export const LN2: EpisodeDef = {
	slug: 'ln2',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.85},
		cta: {C: CTA, vignette: 0.7},
		run: {C: Run, vignette: 0.8},
		ankle: {C: Ankle, vignette: 0.8},
		ahead: {C: Ahead, vignette: 0.85},
		road: {C: Road, fadeIn: 6, vignette: 0.8},
		truck: {C: Truck, vignette: 0.75},
		twist: {C: Twist, vignette: 0.8},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
void rand;
