import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Badge} from '../components/CampNight';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {Boathouse, BOATHOUSE} from '../components/sets/LakeCamp';
import {ForestRun, PASSENGER_Y, Pickup, RoadNight, ROAD_Y} from '../components/sets/Road';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import {StaffPhoto} from './ln3';
import {StayCTA} from './Subscribe';
import tlEs from '../generated/timeline_ln4_es.json';

/** Six survivors now: Carlos is back. */
const SIX: CharId[] = ['alex', 'lucia', 'mateo', 'carlos', 'vera', 'bea'];
const WIN = {x: 190, y: 720};

/* 1 ─ HOOK: out through the window as the door gives way */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const brk = cue('break');
	const D = BOATHOUSE.door;
	const step = (brk - 14) / SIX.length;
	const climbers = SIX.map((id, i) => {
		const t0 = 4 + i * step;
		const walk = kf(frame, [[t0, 0], [t0 + step * 0.7, 1]], EASE);
		const up = kf(frame, [[t0 + step * 0.6, 0], [t0 + step * 1.2, 1]], EASE);
		const startX = 420 + i * 110;
		const x = startX + (WIN.x - startX) * walk;
		const y = 1720 - up * (1720 - (WIN.y + 140));
		const sc = 1.0 - up * 0.45;
		const gone = up >= 1;
		return {id, x, y, sc, gone, moving: walk > 0 && walk < 1, up};
	});
	const doorOpen = kf(frame, [[brk, 0], [brk + 4, 1]], EASE_OUT);
	const cam = useCam([
		{f: 0, x: 600, y: 1150, z: 1.05},
		{f: brk - 20, x: 320, y: 1000, z: 1.35},
		{f: brk, x: 640, y: 1150, z: 1.1, ease: EASE},
		{f: dur, x: 900, y: 1150, z: 1.6},
	], frame > brk ? 8 : 3);
	return (
		<>
			<Stage cam={cam}>
				<Boathouse
					darkness={0.82}
					hook={frame < brk ? 1 : 0}
					doorShake={frame < brk ? 1.2 : 0}
					doorOpen={doorOpen}
					photo={<StaffPhoto />}
					lights={[{x: WIN.x, y: WIN.y + 200, r: 340, color: '#9fb4ff', glow: 0.35}, ...(frame >= brk ? [{x: D.x + D.w / 2, y: D.y + 300, r: 320, color: '#9fb4ff', glow: 0.4}] : [])]}
					front={
						<g>
							{climbers
								.filter((c) => !c.gone)
								.map((c, i) => (
									<Character
										key={c.id}
										id={c.id}
										x={c.x}
										y={c.y}
										scale={c.sc}
										pose={{back: true, ...(c.moving ? walkPose(frame, 0.4, i, 0.9) : {}), armL: c.up > 0 ? [-170, 0] : undefined, armR: c.up > 0 ? [170, 0] : undefined}}
									/>
								))}
						</g>
					}
				>
					{frame >= brk && <Character id="masked" x={D.x + D.w / 2} y={D.y + D.h} scale={1.15} pose={{item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: -10}} />}
				</Boathouse>
			</Stage>
			<Flash at={brk} len={8} color="#ffffff" peak={0.5} />
		</>
	);
};

/* running helpers (six) */
const RX: Record<string, number> = {alex: 830, lucia: 700, mateo: 570, carlos: 450, vera: 330, bea: 210};
const RY: Record<string, number> = {alex: 1500, lucia: 1520, mateo: 1495, carlos: 1515, vera: 1505, bea: 1520};
const runPose = (frame: number, i: number, extra: Pose = {}): Pose => ({
	...walkPose(frame, 0.5, i * 1.3, 1.15),
	turn: 0.7,
	lean: 8,
	lookX: 0.8,
	mouth: 'open',
	brows: 'worried',
	...extra,
});

/* 2 ─ CTA over the escape */
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue} = useScene();
	return (
		<AbsoluteFill>
			<Stage cam={{x: 540, y: 1250, z: 1.05, r: noise2D('c4', frame * 0.05, 0) * 0.4}}>
				<ForestRun scroll={frame * 20}>
					{SIX.map((id, i) => (
						<Character key={id} id={id} x={RX[id]} y={RY[id]} scale={0.78} pose={runPose(frame, i)} />
					))}
				</ForestRun>
			</Stage>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.4))'}} />
			<StayCTA clickAt={cue('click')} />
		</AbsoluteFill>
	);
};

/* 3 ─ SECRET: Carlos tells them about Tomás's son */
const Secret: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const memory = kf(frame, [[lineStart(1) - 4, 0], [lineStart(1) + 6, 1], [dur - 6, 1], [dur, 0]]);
	const cam = useCam([
		{f: 0, x: RX.carlos + 40, y: RY.carlos - 200, z: 2.3},
		{f: dur, x: RX.carlos + 60, y: RY.carlos - 200, z: 2.5},
	], 3);
	return (
		<AbsoluteFill>
			<Stage cam={cam}>
				<ForestRun scroll={frame * 9}>
					{SIX.map((id, i) => (
						<Character
							key={id}
							id={id}
							x={RX[id]}
							y={RY[id]}
							scale={0.78}
							pose={{
								...walkPose(frame, 0.32, i * 1.3, 0.8),
								turn: id === 'carlos' ? -0.3 : 0.6,
								lookX: id === 'carlos' ? 0.4 : -0.6,
								mouth: id === 'carlos' ? talkMouth(frame, lineStart(0), lineEnd(0), 'worried') : 'worried',
								brows: 'worried',
							}}
						/>
					))}
				</ForestRun>
			</Stage>
			{memory > 0 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: memory}}>
					<div style={{width: 760, height: 560, border: '14px solid #e8e0cc', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', transform: `rotate(-4deg) scale(${0.9 + 0.1 * memory})`, overflow: 'hidden', marginTop: -380, filter: 'sepia(0.45) contrast(1.05)'}}>
						<svg viewBox="560 380 340 250" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
							<StaffPhoto />
						</svg>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

/* 4 ─ HELPING: "Tomás isn't chasing him... he's helping him" */
const Helping: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const snap = cue('snap');
	const cam = useCam([
		{f: 0, x: RX.carlos + 40, y: RY.carlos - 200, z: 2.5},
		{f: cue('sting'), x: RX.carlos + 40, y: RY.carlos - 200, z: 2.9},
		{f: snap + 4, x: 540, y: 1250, z: 1.3, ease: EASE},
		{f: dur, x: 540, y: 1250, z: 1.3},
	], frame > snap ? 5 : 2);
	return (
		<Stage cam={cam}>
			<ForestRun scroll={0}>
				{SIX.map((id) => (
					<Character
						key={id}
						id={id}
						x={RX[id]}
						y={RY[id]}
						scale={0.78}
						pose={{
							turn: frame > snap ? 0 : 0.5,
							lookX: frame > snap ? Math.sin(frame / 4 + RX[id]) : id === 'carlos' ? 0 : -0.6,
							mouth: id === 'carlos' ? talkMouth(frame, lineStart(0), lineEnd(0), 'open') : frame > snap ? 'open' : 'worried',
							brows: 'worried',
							tremble: frame > snap ? 1.5 : 0.4,
						}}
					/>
				))}
			</ForestRun>
		</Stage>
	);
};

const TRUCK = {x: 300, y: ROAD_Y + 80, s: 0.9};
const BED: {id: CharId; dx: number}[] = [
	{id: 'bea', dx: 30},
	{id: 'carlos', dx: 130},
	{id: 'vera', dx: 230},
	{id: 'mateo', dx: 330},
	{id: 'lucia', dx: 430},
];
const bedHead = (dx: number) => ({x: TRUCK.x + TRUCK.s * (-40 + dx), y: TRUCK.y + TRUCK.s * (PASSENGER_Y - 222 * 0.62)});
const HOOD_DX = -95;

/* 5 ─ ROAD: the empty pickup, keys in the ignition */
const RoadScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const cab = {x: TRUCK.x + TRUCK.s * 510, y: TRUCK.y - TRUCK.s * 300};
	const arrive = kf(frame, [[0, 0], [60, 1]], EASE_OUT);
	const cam = useCam([
		{f: 0, x: 620, y: 1250, z: 1.15},
		{f: lineStart(1) - 6, x: cab.x, y: cab.y + 60, z: 1.7},
		{f: dur, x: cab.x, y: cab.y + 60, z: 1.8},
	], 2);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.82} lights={[{x: 1250, y: ROAD_Y - 150, r: 480, color: '#fff6c8', glow: 0.4}, {x: cab.x, y: cab.y, r: 220, color: '#9fc0ff', glow: 0.3}]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId={null} />
				{SIX.map((id, i) => {
					const x = -200 + i * 120 + arrive * 400 + (id === 'alex' ? arrive * 260 : 0);
					return (
						<Character
							key={id}
							id={id}
							x={x}
							y={ROAD_Y + 40 + (i % 2) * 14}
							scale={0.8}
							pose={{
								...(arrive < 1 ? walkPose(frame, 0.45, i, 1) : {}),
								turn: 0.6,
								lookX: 1,
								mouth: id === 'alex' ? talkMouth(frame, lineStart(1), lineEnd(1), 'grin', ['open', 'o', 'grin']) : 'worried',
								brows: id === 'alex' && frame > lineStart(1) ? 'raised' : 'worried',
								armR: id === 'alex' && frame > lineStart(1) ? [160, 10] : undefined,
							}}
						/>
					);
				})}
			</RoadNight>
		</Stage>
	);
};

const bedPassengers = (frame: number, extra: (id: CharId) => Pose) => BED.map((b) => ({id: b.id, dx: b.dx, pose: extra(b.id)}));

/* 6 ─ DRIVE: Álex drives off; a moment of relief */
const Drive: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur} = useScene();
	const speed = kf(frame, [[0, 4], [40, 26]]);
	const scroll = frame * speed;
	const cam = useCam([{f: 0, x: 640, y: 1250, z: 1.2}, {f: dur, x: 560, y: 1200, z: 1.35}], 2);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={scroll} darkness={0.78} lights={[{x: 1300, y: ROAD_Y - 150, r: 500, color: '#fff6c8', glow: 0.4}, {x: 520, y: 1300, r: 500, color: '#9fc0ff', glow: 0.2}]}>
				<Pickup
					x={TRUCK.x}
					y={TRUCK.y}
					s={TRUCK.s}
					wheel={-scroll * 0.6}
					driverId="alex"
					driver={{mouth: 'grin', lookX: 0.6}}
					passengers={bedPassengers(frame, (id) => ({mouth: frame > 60 ? 'grin' : 'smile', lookX: id === 'lucia' ? -0.6 : 0.6, headTilt: Math.sin(frame / 12 + id.length) * 4}))}
				/>
			</RoadNight>
		</Stage>
	);
};

/* 7 ─ COUNT: Lucía counts... and there is a yellow hood at the back of the bed */
const Count: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const cs = [1, 2, 3, 4, 5].map((i) => cue('c' + i));
	const six = cue('c6');
	const scroll = frame * 26;
	const hood = bedHead(HOOD_DX);
	const seen = frame >= six - 2;
	const cam = useCam([
		{f: 0, x: 520, y: 1260, z: 1.6},
		{f: six - 4, x: 470, y: 1250, z: 1.7},
		{f: six + 6, x: hood.x + 20, y: hood.y + 30, z: 3.2, ease: EASE_OUT},
		{f: dur, x: hood.x + 20, y: hood.y + 30, z: 3.4},
	], frame > six ? 7 : 3);
	const order: CharId[] = ['lucia', 'mateo', 'vera', 'carlos', 'bea'];
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={scroll} darkness={0.8} lights={[{x: 1300, y: ROAD_Y - 150, r: 500, color: '#fff6c8', glow: 0.4}, {x: 520, y: 1250, r: 460, color: '#9fc0ff', glow: 0.25}, ...(seen ? [{x: hood.x, y: hood.y, r: 200, color: '#ffb070', glow: 0.5}] : [])]}>
					<Pickup
						x={TRUCK.x}
						y={TRUCK.y}
						s={TRUCK.s}
						wheel={-scroll * 0.6}
						driverId="alex"
						driver={{mouth: 'smile', lookX: 0.6}}
						passengers={[
							{id: 'masked', dx: HOOD_DX, pose: {sit: true, glowEyes: seen ? 1 : 0, headTilt: seen ? -12 : 0, item: null} as Pose},
							...bedPassengers(frame, (id) => ({
								mouth: seen ? 'open' : id === 'lucia' ? 'flat' : 'smile',
								brows: seen ? 'worried' : 'neutral',
								lookX: seen ? -1 : id === 'lucia' ? -0.8 : 0.4,
								tremble: seen ? 2 : 0,
								armR: id === 'lucia' && !seen ? [-100, -20] : undefined,
							})),
						]}
					/>
					{order.map((id, i) => {
						const b = BED.find((q) => q.id === id)!;
						const h = bedHead(b.dx);
						return <Badge key={id} x={h.x} y={h.y - 85} n={i + 1} p={pop(frame, cs[i] - 2) * 0.75} />;
					})}
					<Badge x={hood.x} y={hood.y - 95} n={6} p={pop(frame, six - 2) * 0.85} color="#ff2d3a" text="#fff" />
				</RoadNight>
			</Stage>
			<Flash at={six} len={8} color="#ff2d3a" peak={0.35} />
		</>
	);
};

/* 8 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	const hood = bedHead(HOOD_DX);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.7) brightness(0.65) contrast(1.15)'}}>
				<Stage cam={{x: hood.x + 120, y: hood.y + 40, z: kf(frame, [[0, 2.3], [dur, 2.6]], (x) => x), r: 0}}>
					<RoadNight scroll={frame * 3} darkness={0.75} lights={[{x: hood.x, y: hood.y, r: 260, color: '#ffb070', glow: 0.5}]}>
						<Pickup
							x={TRUCK.x}
							y={TRUCK.y}
							s={TRUCK.s}
							wheel={-frame * 2}
							driverId="alex"
							passengers={[{id: 'masked', dx: HOOD_DX, pose: {sit: true, glowEyes: 1, headTilt: -12} as Pose}, ...bedPassengers(frame, () => ({mouth: 'open', brows: 'worried', lookX: -1}))]}
						/>
					</RoadNight>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={part.split('·')[0].trim()}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Frenar en seco para lanzarlo fuera', at: lineStart(1), icon: 'brake'},
					{key: 'B', text: 'Saltar todos y dejarle la camioneta', at: lineStart(2), icon: 'jump'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
				subscribeAt={cue('bell') - 9}
			/>
		</AbsoluteFill>
	);
};

export const LN4: EpisodeDef = {
	slug: 'ln4',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.85},
		cta: {C: CTA, vignette: 0.7},
		secret: {C: Secret, vignette: 0.8},
		helping: {C: Helping, vignette: 0.85},
		road: {C: RoadScene, fadeIn: 8, vignette: 0.8},
		drive: {C: Drive, vignette: 0.7},
		count: {C: Count, vignette: 0.8},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
void Beam;
