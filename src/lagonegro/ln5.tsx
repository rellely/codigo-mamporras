import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {PASSENGER_Y, Pickup, RoadNight, ROAD_Y} from '../components/sets/Road';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import {StayCTA} from './Subscribe';
import tlEs from '../generated/timeline_ln5_es.json';

const TRUCK = {x: 40, y: ROAD_Y + 80, s: 0.9};
const BED: {id: CharId; dx: number}[] = [
	{id: 'bea', dx: 30},
	{id: 'carlos', dx: 130},
	{id: 'vera', dx: 230},
	{id: 'mateo', dx: 330},
	{id: 'lucia', dx: 430},
];
const HOOD_DX = -95;
const START = {x: TRUCK.x + TRUCK.s * (-40 + HOOD_DX), y: TRUCK.y + TRUCK.s * PASSENGER_Y};
const LAND = {x: TRUCK.x + TRUCK.s * 1150, y: ROAD_Y + 40};
const HEAD_LYING = {x: LAND.x + 222 * 0.62 * 1.4, y: LAND.y - 20};
const GS = 0.62 * 1.4; // guarda scale on the road

/** Flight of the Guarda: t 0..1 from the truck bed to the road ahead. */
const flight = (t: number) => {
	const x = START.x + (LAND.x - START.x) * t;
	const y = START.y + (LAND.y - START.y) * t - Math.sin(Math.PI * t) * 520;
	return {x, y, rot: t * 450, s: (0.62 + (GS - 0.62) * t) * TRUCK.s};
};

const passengers = (lean: number, extra: (id: CharId) => Pose = () => ({})) =>
	BED.map((b) => ({id: b.id, dx: b.dx, pose: {lean, mouth: 'open', brows: 'worried', lookX: 1, ...extra(b.id)} as Pose}));

const headlightGlow = {x: TRUCK.x + TRUCK.s * 1100, y: ROAD_Y - 60, r: 520, rx: 700, color: '#fff6c8', glow: 0.5};

/** The Guarda lying on the road (rotated), optionally getting up. */
const Fallen: React.FC<{up?: number; pose?: Pose}> = ({up = 0, pose = {}}) => {
	const rot = 90 * (1 - up);
	return (
		<g transform={`rotate(${rot} ${LAND.x} ${LAND.y})`}>
			<Character id="masked" x={LAND.x} y={LAND.y} scale={GS} pose={{glowEyes: 0, ...pose}} />
		</g>
	);
};

/* 1 ─ HOOK: Álex slams the brakes */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const brake = cue('screech');
	const launch = cue('thud') - 6;
	const speed = frame < brake ? 26 : Math.max(0, 26 - (frame - brake) * 2.2);
	let scroll = 0;
	for (let f = 0; f < frame; f++) scroll += f < brake ? 26 : Math.max(0, 26 - (f - brake) * 2.2);
	const dip = frame > brake ? Math.sin(Math.min(1, (frame - brake) / 12) * Math.PI) * 3 : 0;
	const lean = frame > brake ? Math.sin(Math.min(1, (frame - brake) / 14) * Math.PI) * 22 : 0;
	const t = kf(frame, [[launch, 0], [dur, 0.45]], (x) => x);
	const g = flight(t);
	const cam = useCam([
		{f: 0, x: 420, y: 1250, z: 1.35},
		{f: brake, x: 460, y: 1250, z: 1.35},
		{f: dur, x: 640, y: 1100, z: 1.2},
	], frame > brake ? 8 : 3);
	void speed;
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={scroll} darkness={0.8} lights={[headlightGlow, {x: 300, y: 1300, r: 500, color: '#9fc0ff', glow: 0.2}]}>
					<g transform={`rotate(${dip} ${TRUCK.x + TRUCK.s * 620} ${TRUCK.y})`}>
						<Pickup
							x={TRUCK.x}
							y={TRUCK.y}
							s={TRUCK.s}
							wheel={-scroll * 0.6}
							driverId="alex"
							driver={{mouth: frame > brake ? 'open' : 'flat', brows: 'angry', lookX: 0.8}}
							passengers={[...(frame < launch ? [{id: 'masked' as CharId, dx: HOOD_DX, pose: {sit: true, glowEyes: 1, headTilt: -10} as Pose}] : []), ...passengers(lean)]}
						/>
					</g>
					{frame >= launch && (
						<g transform={`rotate(${g.rot} ${g.x} ${g.y - 90})`}>
							<Character id="masked" x={g.x} y={g.y} scale={g.s} pose={{armL: [-150, 0], armR: [150, 0], sit: true}} />
						</g>
					)}
				</RoadNight>
			</Stage>
			<Flash at={launch + 2} len={5} color="#ffffff" peak={0.35} />
		</>
	);
};

/* 2 ─ CTA over the stopped truck */
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue} = useScene();
	return (
		<AbsoluteFill>
			<Stage cam={{x: 640, y: 1250, z: 1.1, r: noise2D('c5', frame * 0.03, 0) * 0.3}}>
				<RoadNight scroll={0} darkness={0.8} lights={[headlightGlow]}>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'open', brows: 'worried'}} passengers={passengers(8)} />
					<Fallen />
				</RoadNight>
			</Stage>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.4))'}} />
			<StayCTA clickAt={cue('click')} />
		</AbsoluteFill>
	);
};

/* 3 ─ FLY: slow-motion replay of the launch over the cab */
const Fly: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const land = cue('land');
	const t = kf(frame, [[0, 0], [land, 1]], (x) => x);
	const g = flight(t);
	const landed = frame >= land;
	const cam = useCam([
		{f: 0, x: START.x + 120, y: START.y - 120, z: 1.9},
		{f: land - 10, x: LAND.x - 120, y: LAND.y - 300, z: 1.5},
		{f: land + 4, x: LAND.x, y: LAND.y - 60, z: 1.9, ease: EASE_OUT},
		{f: dur, x: LAND.x - 40, y: LAND.y - 60, z: 1.75},
	], landed && frame < land + 12 ? 10 : 2);
	const ghosts = [3, 6, 9].map((k) => flight(Math.max(0, t - k * 0.012)));
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={0} darkness={0.8} lights={[headlightGlow]}>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'open', brows: 'worried'}} passengers={passengers(18)} />
					{!landed &&
						ghosts.map((p, i) => (
							<g key={i} opacity={0.18} transform={`rotate(${p.rot} ${p.x} ${p.y - 90})`}>
								<Character id="masked" x={p.x} y={p.y} scale={p.s} pose={{sit: true, silhouette: '#d9b32a'}} />
							</g>
						))}
					{!landed && (
						<g transform={`rotate(${g.rot} ${g.x} ${g.y - 90})`}>
							<Character id="masked" x={g.x} y={g.y} scale={g.s} pose={{armL: [-150, 0], armR: [150, 0], sit: true}} />
						</g>
					)}
					{landed && <Fallen />}
				</RoadNight>
			</Stage>
			<Flash at={land} len={6} color="#ffffff" peak={0.3} />
		</>
	);
};

/* 4 ─ STILL: is he dead? */
const Still: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const breathe = frame > lineStart(2) - 10 ? Math.sin(frame / 9) * 3 : 0;
	const cam = useCam([
		{f: 0, x: 420, y: 1130, z: 1.8},
		{f: lineStart(2) - 10, x: 440, y: 1140, z: 1.8},
		{f: lineStart(2) + 4, x: LAND.x + 60, y: LAND.y - 40, z: 2.3, ease: EASE},
		{f: dur, x: LAND.x + 60, y: LAND.y - 40, z: 2.5},
	], 2);
	const speaker = (id: CharId) =>
		id === 'mateo' ? talkMouth(frame, lineStart(0), lineEnd(0), 'open') : id === 'carlos' ? talkMouth(frame, lineStart(1), lineEnd(1), 'flat') : id === 'lucia' ? talkMouth(frame, lineStart(2), lineEnd(2), 'open') : 'open';
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.82} lights={[headlightGlow]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'open', brows: 'worried', lookX: 1}} passengers={passengers(4, (id) => ({mouth: speaker(id), lookX: 1, lookY: 0.3}))} />
				<g transform={`translate(0 ${breathe})`}>
					<Fallen />
				</g>
			</RoadNight>
		</Stage>
	);
};

/* 5 ─ MASK: it broke... there is a man underneath */
const Mask: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const crack = cue('crack');
	const sting = cue('sting');
	const broken = kf(frame, [[crack + 4, 0], [crack + 10, 1]]);
	const cam = useCam([
		{f: 0, x: HEAD_LYING.x - 30, y: HEAD_LYING.y + 10, z: 2.8, r: -90},
		{f: sting - 2, x: HEAD_LYING.x - 20, y: HEAD_LYING.y + 10, z: 3.2, r: -90},
		{f: sting + 6, x: HEAD_LYING.x - 6, y: HEAD_LYING.y + 6, z: 4.4, r: -90, ease: EASE_OUT},
		{f: dur, x: HEAD_LYING.x - 6, y: HEAD_LYING.y + 6, z: 4.6, r: -90},
	], 2);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={0} darkness={0.78} lights={[headlightGlow, {x: HEAD_LYING.x, y: HEAD_LYING.y, r: 260, color: '#fff6c8', glow: 0.5}]}>
					<Fallen pose={{maskBroken: broken, eyeOpen: 0.06}} />
					{frame > crack && frame < crack + 30 &&
						[0, 1, 2, 3].map((k) => {
							const tt = frame - crack;
							return <rect key={k} x={HEAD_LYING.x + 10 + k * 8 + tt * (1 + k)} y={HEAD_LYING.y - 30 + k * 10 + tt * tt * 0.08} width={10} height={6} fill="#cdb38a" transform={`rotate(${tt * 20 + k * 40} ${HEAD_LYING.x + 10} ${HEAD_LYING.y})`} />;
						})}
				</RoadNight>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.3} />
		</>
	);
};

/* 6 ─ RISE: he opens his eye, gets up... and Tomás is right behind them */
const Rise: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const eyes = cue('eyes');
	const up = kf(frame, [[lineEnd(0) + 4, 0], [lineStart(1) + 4, 1]], EASE);
	const tomas = {x: TRUCK.x - 260, y: ROAD_Y + 40};
	const tomasIn = kf(frame, [[lineStart(2) - 30, 0], [lineStart(2) - 4, 1]]);
	const boom = cue('boom2');
	const cam = useCam([
		{f: 0, x: HEAD_LYING.x - 6, y: HEAD_LYING.y + 6, z: 4.4, r: -90},
		{f: eyes + 6, x: HEAD_LYING.x - 6, y: HEAD_LYING.y + 6, z: 4.6, r: -90},
		{f: lineEnd(0) + 6, x: LAND.x - 80, y: LAND.y - 260, z: 1.7, r: 0, ease: EASE},
		{f: lineEnd(1), x: LAND.x - 60, y: LAND.y - 280, z: 2.0},
		{f: lineStart(2) - 4, x: 240, y: 1250, z: 1.05, ease: EASE},
		{f: boom - 2, x: tomas.x + 120, y: tomas.y - 220, z: 1.6},
		{f: boom + 6, x: tomas.x + 20, y: tomas.y - 240, z: 2.6, ease: EASE_OUT},
		{f: dur, x: tomas.x + 20, y: tomas.y - 240, z: 2.8},
	], frame > boom ? 6 : 2);
	const handX = tomas.x + 50;
	const handY = tomas.y - 160;
	return (
		<>
			<Stage cam={cam}>
				<RoadNight
					scroll={0}
					darkness={0.8}
					lights={[headlightGlow, ...(tomasIn > 0 ? [{x: tomas.x, y: tomas.y - 200, r: 260 * tomasIn, color: '#ffb070', glow: 0.5}] : [])]}
				>
					<Pickup
						x={TRUCK.x}
						y={TRUCK.y}
						s={TRUCK.s}
						wheel={0}
						driverId="alex"
						driver={{mouth: 'open', brows: 'worried', lookX: frame > lineStart(2) ? -1 : 1}}
						passengers={passengers(0, () => ({lookX: frame > lineStart(2) ? -1 : 1, tremble: 1.5}))}
					/>
					<Fallen
						up={up}
						pose={{
							maskBroken: 1,
							eyeOpen: frame >= eyes ? 1 : 0.06,
							item: up > 0.8 ? 'hook' : null,
							armR: [12, -10],
							turn: up > 0.5 ? -0.5 : 0,
							lookX: -1,
						}}
					/>
					{tomasIn > 0 && (
						<g opacity={tomasIn}>
							<Character id="tomas" x={tomas.x} y={tomas.y} scale={0.85} pose={{turn: 0.5, lookX: 1, mouth: talkMouth(frame, lineStart(2), lineEnd(2), 'flat'), brows: 'neutral', item: 'flashlight', phoneLit: 1, armR: [60, -10]}} />
							<Beam x={handX} y={handY} angle={-5} length={420} spread={12} intensity={0.35} />
						</g>
					)}
				</RoadNight>
			</Stage>
			<Flash at={boom} len={8} color="#ff2d3a" peak={0.3} />
		</>
	);
};

/* 7 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.7) brightness(0.65) contrast(1.15)'}}>
				<Stage cam={{x: 480, y: 1200, z: kf(frame, [[0, 0.95], [dur, 1.05]], (x) => x), r: 0}}>
					<RoadNight scroll={0} darkness={0.75} lights={[headlightGlow, {x: TRUCK.x - 260, y: ROAD_Y - 160, r: 260, color: '#ffb070', glow: 0.5}]}>
						<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" passengers={passengers(0, () => ({lookX: -1}))} />
						<Fallen up={1} pose={{maskBroken: 1, eyeOpen: 1, item: 'hook', armR: [12, -10], turn: -0.5, lookX: -1}} />
						<Character id="tomas" x={TRUCK.x - 260} y={ROAD_Y + 40} scale={0.85} pose={{turn: 0.5, lookX: 1, item: 'flashlight', phoneLit: 1, armR: [60, -10]}} />
					</RoadNight>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={part.split('·')[0].trim()}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Acelerar y pasar a su lado sin parar', at: lineStart(1), icon: 'brake'},
					{key: 'B', text: 'Bajar y hablar con Tomás', at: lineStart(2), icon: 'question'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
				subscribeAt={cue('bell') - 9}
			/>
		</AbsoluteFill>
	);
};

export const LN5: EpisodeDef = {
	slug: 'ln5',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.8},
		cta: {C: CTA, vignette: 0.7},
		fly: {C: Fly, vignette: 0.8},
		still: {C: Still, vignette: 0.85},
		mask: {C: Mask, vignette: 0.85},
		rise: {C: Rise, vignette: 0.85},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
void walkPose;
