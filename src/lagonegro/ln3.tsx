import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {Boathouse, BOATHOUSE, Cabin, LakeView, Reeds} from '../components/sets/LakeCamp';
import {Pickup, RoadNight, ROAD_Y} from '../components/sets/Road';
import {Sky, Ground, Forest} from '../components/env/Nature';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import {StayCTA} from './Subscribe';
import tlEs from '../generated/timeline_ln3_es.json';

const FIVE: CharId[] = ['mateo', 'lucia', 'vera', 'alex', 'bea'];
const TRUCK = {x: 260, y: ROAD_Y + 80, s: 0.9};
const BED_DX: Record<string, number> = {bea: 0, mateo: 105, vera: 210, lucia: 315, alex: 420};
const GRASS_Y = 1720;

/* 1 ─ HOOK: they jump from the moving pickup */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const j0 = lineStart(1) + 8;
	const jumpAt: Record<string, number> = {alex: j0, lucia: j0 + 9, vera: j0 + 18, mateo: j0 + 26, bea: j0 + 30};
	const scroll = frame * 26;
	const inBed = FIVE.filter((id) => frame < jumpAt[id]).map((id) => ({id, dx: BED_DX[id], pose: {mouth: 'open', brows: 'worried', lookX: -1} as Pose}));
	const jumpers = FIVE.filter((id) => frame >= jumpAt[id]).map((id, i) => {
		const t = frame - jumpAt[id];
		const x0 = TRUCK.x + TRUCK.s * (-40 + BED_DX[id]);
		const y0 = TRUCK.y + TRUCK.s * -60;
		const air = Math.min(t, 16);
		const yAir = y0 - 16 * air + 0.75 * air * air * 2.2;
		const landed = yAir >= GRASS_Y;
		const tl = Math.max(0, t - 16);
		const x = x0 - 14 * Math.min(t, 16) - (26 * tl - 0.45 * tl * tl > 0 ? 26 * tl - 0.45 * tl * tl : 0);
		const y = landed ? GRASS_Y : Math.min(yAir, GRASS_Y);
		const rot = -t * 22;
		return (
			<g key={id} transform={`rotate(${rot} ${x} ${y - 90})`}>
				<Character id={id} x={x} y={y} scale={0.6} pose={{mouth: 'open', brows: 'worried', armL: [-150, 20], armR: [150, -20], sit: true}} />
			</g>
		);
		void i;
	});
	const cam = useCam([
		{f: 0, x: 560, y: 1300, z: 1.35},
		{f: j0, x: 480, y: 1380, z: 1.3},
		{f: dur, x: 260, y: 1520, z: 1.15},
	], 7);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={scroll} darkness={0.8} lights={[{x: 1200, y: ROAD_Y - 150, r: 500, color: '#fff6c8', glow: 0.4}, {x: 400, y: 1500, r: 600, color: '#9fb4ff', glow: 0.2}]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={-scroll * 0.6} driver={{mouth: 'flat', lookX: -0.8}} passengers={inBed} />
				{jumpers}
			</RoadNight>
		</Stage>
	);
};

/* 2 ─ CTA over the roadside: they get up, the truck brakes */
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue} = useScene();
	const brake = kf(frame, [[0, 0], [12, 1]]);
	return (
		<AbsoluteFill>
			<Stage cam={{x: 540, y: 1400, z: 1.0, r: noise2D('c3', frame * 0.03, 0) * 0.3}}>
				<RoadNight scroll={0} darkness={0.8} lights={[{x: 1080, y: 1420, r: 300 * brake, color: '#ff2d1a', glow: 0.7}, {x: 300, y: 1600, r: 600, color: '#9fb4ff', glow: 0.2}]}>
					<Pickup x={1000} y={TRUCK.y} s={TRUCK.s} wheel={0} headlights={1} driver={{mouth: 'open', lookX: -1}} />
					{FIVE.map((id, i) => {
						const up = kf(frame, [[20 + i * 8, 0], [40 + i * 8, 1]]);
						return (
							<g key={id} transform={`rotate(${(1 - up) * -70} ${120 + i * 150} ${GRASS_Y})`}>
								<Character id={id} x={120 + i * 150} y={GRASS_Y} scale={0.75} pose={{sit: up < 0.6, mouth: 'open', brows: 'worried', lookX: 1, armL: [-40, -40]}} />
							</g>
						);
					})}
				</RoadNight>
			</Stage>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.4))'}} />
			<StayCTA clickAt={cue('click')} />
		</AbsoluteFill>
	);
};

/* 3 ─ TOMÁS gets out with a flashlight and shouts */
const TomasScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const tx = kf(frame, [[0, 900], [lineStart(1), 760]], EASE);
	const sweep = 190 + Math.sin(frame / 14) * 18;
	const handX = tx - 60;
	const handY = ROAD_Y + 20 - 170;
	const cam = useCam([
		{f: 0, x: 800, y: 1300, z: 1.4},
		{f: lineStart(1) + 4, x: tx - 40, y: 1330, z: 1.9},
		{f: lineEnd(1), x: 360, y: 1520, z: 1.6, ease: EASE},
		{f: dur, x: 330, y: 1540, z: 1.7},
	], 2.5);
	return (
		<Stage cam={cam}>
			<RoadNight
				scroll={0}
				darkness={0.84}
				lights={[{x: handX - 300, y: handY + 120, r: 260, color: '#fff6d0', glow: 0.45}, {x: 1080, y: 1420, r: 260, color: '#ff2d1a', glow: 0.6}]}
			>
				<Pickup x={1000} y={TRUCK.y} s={TRUCK.s} wheel={0} headlights={1} driver={{opacity: 0} as Pose} />
				<Character id="tomas" x={tx} y={ROAD_Y + 20} scale={0.95} pose={{...walkPose(frame, 0.2, 0, frame < lineStart(1) ? 0.6 : 0), turn: -0.6, item: 'flashlight', phoneLit: 1, armR: [-100, -10], mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'flat', ['open', 'o', 'open']), brows: 'angry', lookX: -1}} />
				<Beam x={handX} y={handY} angle={sweep} length={520} spread={12} intensity={0.45} />
				{FIVE.map((id, i) => (
					<Character key={id} id={id} x={140 + i * 120} y={1820} scale={0.7} pose={{sit: true, mouth: 'worried', brows: 'worried', lookX: 1, lookY: -0.4}} />
				))}
				<Reeds y0={1760} y1={1900} count={60} seed={3} color="#121a10" x0={0} x1={760} />
			</RoadNight>
		</Stage>
	);
};

/* 4 ─ REEDS: hiding on the shore while Tomás searches */
const ReedsScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const tx = kf(frame, [[0, 1150], [dur, -150]], (x) => x);
	const beamAng = 100 + Math.sin(frame / 12) * 25;
	const near = Math.abs(tx - 540) < 260;
	const v = {x: 620, y: 1700};
	const cam = useCam([
		{f: 0, x: 540, y: 1300, z: 1.05},
		{f: lineStart(1) - 6, x: 560, y: 1450, z: 1.4},
		{f: lineStart(1) + 4, x: v.x, y: v.y - 230, z: 2.5, ease: EASE},
		{f: lineEnd(1) + 10, x: v.x, y: v.y - 230, z: 2.6},
		{f: dur, x: 540, y: 1380, z: 1.3},
	], 2);
	const hid: {id: CharId; x: number}[] = [
		{id: 'mateo', x: 300},
		{id: 'bea', x: 430},
		{id: 'vera', x: v.x},
		{id: 'lucia', x: 760},
		{id: 'alex', x: 890},
	];
	return (
		<Stage cam={cam}>
			<LakeView time="night" darkness={0.84} fog={0.35} canoe={false} lights={[{x: tx + Math.cos((beamAng * Math.PI) / 180) * 300, y: 1260 + Math.sin((beamAng * Math.PI) / 180) * 300, r: 230, color: '#fff6d0', glow: 0.45}]}>
				<Character id="tomas" x={tx} y={1260} scale={0.55} pose={{...walkPose(frame, 0.16, 0, 0.6), turn: -0.6, item: 'flashlight', phoneLit: 1, armR: [40, -10], mouth: 'flat', lookX: -1, lookY: 0.8}} />
				<Beam x={tx + 25} y={1170} angle={beamAng} length={480} spread={13} intensity={0.4} />
				<rect x={-800} y={1640} width={2700} height={600} fill="#141310" />
				{hid.map((h) => (
					<Character
						key={h.id}
						id={h.id}
						x={h.x}
						y={v.y}
						scale={0.95}
						pose={{
							sit: true,
							mouth: h.id === 'vera' ? talkMouth(frame, lineStart(1), lineEnd(1), 'flat', ['o', 'flat']) : 'flat',
							brows: 'worried',
							lookX: tx < h.x ? -0.8 : 0.8,
							lookY: -0.3,
							tremble: near ? 1.5 : 0.4,
							armR: h.id === 'vera' && frame > lineStart(1) - 4 ? [-178, 20] : undefined,
						}}
					/>
				))}
				<Reeds y0={1640} y1={1820} count={90} seed={7} color="#16200f" />
			</LakeView>
		</Stage>
	);
};

/** The 1996 staff photo: young Tomás and a boy in a yellow raincoat. */
export const StaffPhoto: React.FC = () => (
	<g>
		<Sky stops={[[0, '#9ab'], [1, '#dde']]} />
		<Forest count={20} y={560} hMin={200} hMax={320} color="#5a6a5a" seed={3} sway={0} />
		<Ground y={560} top="#9a9070" bottom="#7a7050" />
		<Cabin x={180} y={600} s={0.7} />
		<Character id="vera" x={360} y={760} scale={1.0} pose={{colors: {hair: '#6a4a2a', jacket: '#7a6a6a'}, mouth: 'smile', blink: 0}} />
		<Character id="tomas" x={540} y={760} scale={1.0} pose={{colors: {hair: '#5a3a22', skin: '#f0c49a'}, mouth: 'grin', blink: 0, armL: [-60, 20]}} />
		<Character id="mateo" x={720} y={760} scale={0.85} pose={{colors: {jacket: '#d9b32a', jacketDark: '#a8861a', accent: '#d9b32a', hair: '#3a2a1a'}, mouth: 'flat', blink: 0, lookX: 0}} />
		<Character id="alex" x={900} y={760} scale={1.0} pose={{colors: {jacket: '#5a6a7a', accent: '#6a6a6a'}, mouth: 'smile', blink: 0}} />
	</g>
);
const PHOTO_BOY = {x: BOATHOUSE.photo.x + (720 / 1080) * BOATHOUSE.photo.w, y: BOATHOUSE.photo.y + (560 / 794) * BOATHOUSE.photo.h};
const PHOTO_TOMAS = {x: BOATHOUSE.photo.x + (540 / 1080) * BOATHOUSE.photo.w, y: BOATHOUSE.photo.y + (530 / 794) * BOATHOUSE.photo.h};

const IN: {id: CharId; x: number}[] = [
	{id: 'lucia', x: 470},
	{id: 'mateo', x: 620},
	{id: 'vera', x: 760},
	{id: 'alex', x: 900},
	{id: 'bea', x: 340},
];
const IN_Y = 1720;
const torchBeams = (frame: number, target: {x: number; y: number}, ids: CharId[] = ['mateo', 'alex', 'lucia']) =>
	ids.map((id, i) => {
		const p = IN.find((q) => q.id === id)!;
		const x = p.x + 40;
		const y = IN_Y - 260;
		const ang = (Math.atan2(target.y - y, target.x - x) * 180) / Math.PI + Math.sin(frame / 15 + i) * 4;
		return {x, y, ang};
	});

/* 5 ─ BOATHOUSE: the old photo */
const BoathouseScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const sting = cue('sting');
	const enter = kf(frame, [[0, 0], [45, 1]], EASE);
	const target = frame < lineStart(1) ? {x: 540 + Math.sin(frame / 20) * 300, y: 900} : frame < lineStart(2) ? PHOTO_TOMAS : PHOTO_BOY;
	const beams = torchBeams(frame, target);
	const cam = useCam([
		{f: 0, x: 900, y: 1150, z: 1.2},
		{f: lineStart(1) - 10, x: 560, y: 1050, z: 1.05},
		{f: lineStart(1) + 10, x: PHOTO_TOMAS.x, y: PHOTO_TOMAS.y + 20, z: 2.6, ease: EASE},
		{f: sting - 6, x: PHOTO_TOMAS.x + 40, y: PHOTO_TOMAS.y + 20, z: 2.7},
		{f: sting + 4, x: PHOTO_BOY.x, y: PHOTO_BOY.y, z: 4.2, ease: EASE_OUT},
		{f: dur, x: PHOTO_BOY.x, y: PHOTO_BOY.y, z: 4.4},
	], 2);
	return (
		<Stage cam={cam}>
			<Boathouse
				doorOpen={kf(frame, [[0, 0.2], [30, 1]])}
				darkness={0.88}
				photo={<StaffPhoto />}
				lights={beams.map((b) => ({x: target.x, y: target.y, r: 200, color: '#fff6d0', glow: 0.35}))}
				front={
					<g>
						{IN.map((p, i) => (
							<Character
								key={p.id}
								id={p.id}
								x={p.x + (1 - enter) * (500 - i * 40)}
								y={IN_Y}
								scale={1.05}
								pose={{
									back: true,
									item: ['mateo', 'alex', 'lucia'].includes(p.id) ? 'flashlight' : null,
									phoneLit: 1,
									armR: ['mateo', 'alex', 'lucia'].includes(p.id) ? [170, 0] : undefined,
									armL: p.id === 'mateo' && frame > lineStart(1) ? [-165, 0] : undefined,
									...(enter < 1 ? walkPose(frame, 0.25, i, 0.6) : {}),
								}}
							/>
						))}
						{beams.map((b, i) => (
							<Beam key={i} x={b.x} y={b.y} angle={b.ang} length={900} spread={6} intensity={0.3} />
						))}
					</g>
				}
			/>
			{void lineEnd}
		</Stage>
	);
};

/* 6 ─ CARLOS is alive, hiding behind the boat */
const CarlosScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const sting = cue('sting');
	const rise = kf(frame, [[cue('thud') * 1 + 6, 0], [lineStart(1) - 6, 1]], EASE);
	const c = {x: 330, y: 1700 - rise * 230};
	const target = {x: c.x, y: c.y - 230};
	const beams = torchBeams(frame, target);
	const cam = useCam([
		{f: 0, x: 600, y: 1200, z: 1.1},
		{f: lineStart(1), x: 420, y: 1250, z: 1.5},
		{f: lineStart(2), x: c.x + 40, y: c.y - 230, z: 2.6, ease: EASE},
		{f: sting - 2, x: c.x + 40, y: c.y - 230, z: 2.7},
		{f: sting + 5, x: c.x + 20, y: c.y - 245, z: 3.6, ease: EASE_OUT},
		{f: dur, x: c.x + 20, y: c.y - 245, z: 3.8},
	], frame > sting ? 5 : 2);
	return (
		<>
			<Stage cam={cam}>
				<Boathouse
					darkness={0.86}
					doorOpen={0}
					photo={<StaffPhoto />}
					lights={[{x: target.x, y: target.y + 40, r: 300, color: '#fff6d0', glow: 0.5}]}
					front={
						<g>
							{IN.map((p) => (
								<Character
									key={p.id}
									id={p.id}
									x={p.id === 'lucia' ? kf(frame, [[lineStart(1), p.x], [lineStart(1) + 20, 560]], EASE) : p.x}
									y={IN_Y}
									scale={1.05}
									pose={{back: true, item: ['mateo', 'alex', 'lucia'].includes(p.id) ? 'flashlight' : null, phoneLit: 1, armR: ['mateo', 'alex', 'lucia'].includes(p.id) ? [170, 0] : undefined, headTilt: Math.sin(frame / 10) * 3}}
								/>
							))}
							{beams.map((b, i) => (
								<Beam key={i} x={b.x} y={b.y} angle={b.ang} length={700} spread={7} intensity={0.3} />
							))}
						</g>
					}
				>
					<Character
						id="carlos"
						x={c.x}
						y={c.y}
						scale={0.95}
						pose={{mouth: talkMouth(frame, lineStart(2), lineEnd(2), 'worried', ['open', 'o', 'flat']), brows: 'worried', lookX: 0.6, lookY: 0.2, tremble: 1.5, armL: [-150, -30]}}
					/>
				</Boathouse>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.35} />
		</>
	);
};

/* 7 ─ DOOR: something scratches... and the hook breaks through */
const Door: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const hit = cue('hit');
	const D = BOATHOUSE.door;
	const hook = kf(frame, [[hit - 1, 0], [hit + 3, 1]], EASE_OUT);
	const cam = useCam([
		{f: 0, x: 700, y: 1250, z: 1.15},
		{f: hit - 4, x: D.x + 100, y: D.y + 320, z: 1.9},
		{f: hit + 4, x: D.x + 80, y: D.y + 300, z: 2.6, ease: EASE_OUT},
		{f: dur, x: D.x + 80, y: D.y + 300, z: 2.7},
	], frame > hit ? 9 : 3);
	const beams = torchBeams(frame, {x: D.x + 100, y: D.y + 320});
	return (
		<>
			<Stage cam={cam}>
				<Boathouse
					darkness={0.86}
					doorShake={frame < hit ? 0.6 + 0.4 * Math.max(0, Math.sin(frame / 3)) : 1.5}
					hook={hook}
					photo={<StaffPhoto />}
					lights={[{x: D.x + 100, y: D.y + 320, r: 300, color: '#fff6d0', glow: 0.5}]}
					front={
						<g>
							{IN.map((p) => (
								<Character key={p.id} id={p.id} x={p.x - 120} y={IN_Y} scale={1.05} pose={{back: true, item: ['mateo', 'alex', 'lucia'].includes(p.id) ? 'flashlight' : null, phoneLit: 1, armR: ['mateo', 'alex', 'lucia'].includes(p.id) ? [150, 0] : undefined, tremble: 2}} />
							))}
							{beams.map((b, i) => (
								<Beam key={i} x={b.x - 120} y={b.y} angle={b.ang - 3} length={700} spread={7} intensity={0.3} />
							))}
						</g>
					}
				>
					<Character id="carlos" x={330} y={1470} scale={0.95} pose={{mouth: 'open', brows: 'worried', lookX: 1, tremble: 2}} />
				</Boathouse>
			</Stage>
			<Flash at={hit} len={8} color="#ffffff" peak={0.5} />
		</>
	);
};

/* 8 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	const D = BOATHOUSE.door;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.85) brightness(0.45) contrast(1.2)'}}>
				<Stage cam={{x: D.x + 60, y: D.y + 320, z: kf(frame, [[0, 2.2], [dur, 2.5]], (x) => x), r: 0}}>
					<Boathouse darkness={0.8} hook={1} doorShake={0.3} photo={<StaffPhoto />} lights={[{x: D.x + 100, y: D.y + 320, r: 320, color: '#fff6d0', glow: 0.5}]} />
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={part.split('·')[0].trim()}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Escapar en barca cruzando el lago', at: lineStart(1), icon: 'boat'},
					{key: 'B', text: 'Salir por la ventana y volver a la carretera', at: lineStart(2), icon: 'window'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
				subscribeAt={cue('bell') - 9}
			/>
		</AbsoluteFill>
	);
};

export const LN3: EpisodeDef = {
	slug: 'ln3',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.8},
		cta: {C: CTA, vignette: 0.7},
		tomas: {C: TomasScene, vignette: 0.8},
		reeds: {C: ReedsScene, fadeIn: 8, vignette: 0.85},
		boathouse: {C: BoathouseScene, fadeIn: 10, vignette: 0.85},
		carlos: {C: CarlosScene, vignette: 0.85},
		door: {C: Door, vignette: 0.85},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
void rand;
