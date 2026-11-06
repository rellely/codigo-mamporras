import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Badge, CampNight, CHAR_SCALE, headOf, ORDER, SEATS, shadowOfFire} from '../components/CampNight';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {Carvings, ForestPath} from '../components/sets/Worlds';
import {aimAngle, Stage, talkMouth} from '../components/Stage';
import {EASE_OUT, kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from './Episode';
import {SeriesEnd} from './SeriesEnd';
import tlEs from '../generated/timeline_ep4_es.json';
import tlEn from '../generated/timeline_ep4_en.json';

const FIVE: CharId[] = ['leo', 'marta', 'dani', 'sara', 'iker'];
const CARVE = {x: 540, y: 660};
const HUGO_CARVE = {x: CARVE.x + 160, y: CARVE.y + 205};

/** Walkers on the forest path. back = seen from behind. */
const Walkers: React.FC<{back: boolean; ikerLag?: number; onAt?: number[]}> = ({back, ikerLag = 0, onAt = [0, 0, 0, 0, 0]}) => {
	const frame = useCurrentFrame();
	const spots = back
		? [
				{id: 'leo', x: 560, y: 1330, s: 0.55},
				{id: 'marta', x: 470, y: 1440, s: 0.65},
				{id: 'dani', x: 640, y: 1540, s: 0.75},
				{id: 'sara', x: 430, y: 1680, s: 0.9},
				{id: 'iker', x: 660, y: 1860, s: 1.05},
		  ]
		: [
				{id: 'leo', x: 520, y: 1800, s: 1.05},
				{id: 'marta', x: 680, y: 1660, s: 0.9},
				{id: 'dani', x: 420, y: 1540, s: 0.78},
				{id: 'sara', x: 610, y: 1430, s: 0.66},
				{id: 'iker', x: 540, y: 1280 - ikerLag * 40, s: 0.5 - ikerLag * 0.06},
		  ];
	return (
		<g>
			{[...spots].sort((a, b) => a.y - b.y).map((sp) => {
				const i = FIVE.indexOf(sp.id as CharId);
				const w = walkPose(frame, 0.22, i * 1.3, 0.5);
				const on = frame >= onAt[i];
				const pose: Pose = {
					...w,
					back,
					armR: [back ? 170 : 40, 0],
					item: 'flashlight',
					phoneLit: on ? 1 : 0,
					mouth: sp.id === 'iker' ? 'flat' : 'worried',
					brows: 'worried',
					lookY: sp.id === 'iker' ? 0.8 : 0,
					lookX: Math.sin(frame / 20 + i) * 0.8,
				};
				return <Character key={sp.id} id={sp.id as CharId} x={sp.x} y={sp.y + w.bob! * 0} scale={sp.s} pose={pose} opacity={sp.id === 'iker' && !back ? 0.85 : 1} />;
			})}
		</g>
	);
};

const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const click = cue('click');
	const onAt = [click, click + 6, click + 11, click + 15, click + 20];
	const beams = [
		{x: 590, y: 1180, angle: -100},
		{x: 505, y: 1270, angle: -84},
		{x: 680, y: 1340, angle: -110},
		{x: 470, y: 1440, angle: -78},
		{x: 710, y: 1590, angle: -96},
	].map((b, i) => ({...b, angle: b.angle + Math.sin(frame / 18 + i) * 6, on: frame >= onAt[i] ? 1 : 0}));
	const cam = useCam([{f: 0, x: 540, y: 1250, z: 1.0}, {f: dur, x: 560, y: 1150, z: 1.18}], 2.5);
	return (
		<Stage cam={cam}>
			<ForestPath beams={beams} scroll={frame * 2} over={<Walkers back onAt={onAt} />} owl={kf(frame, [[dur - 50, 0], [dur - 40, 1]])} />
		</Stage>
	);
};

const Path: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const lag = kf(frame, [[lineStart(1), 0], [dur, 1]]);
	const beams = [
		{x: 560, y: 1640, angle: 80},
		{x: 712, y: 1520, angle: 100},
		{x: 448, y: 1430, angle: 70},
		{x: 632, y: 1340, angle: 95},
	].map((b, i) => ({...b, angle: b.angle + Math.sin(frame / 16 + i) * 8}));
	const cam = useCam([
		{f: 0, x: 540, y: 1450, z: 1.1},
		{f: lineStart(1), x: 540, y: 1420, z: 1.05},
		{f: dur, x: 540, y: 1180, z: 2.3},
	], 2.5);
	return (
		<Stage cam={cam}>
			<ForestPath beams={beams} owl={kf(frame, [[lineStart(1), 0], [lineStart(1) + 10, 1]])} over={<Walkers back={false} ikerLag={lag} />} />
		</Stage>
	);
};

const standingBack = (extra: Partial<Record<CharId, Pose>> = {}) => {
	const p: Partial<Record<CharId, Pose>> = {};
	FIVE.forEach((id) => (p[id] = {back: true, item: 'flashlight', phoneLit: 1, armR: [160, 0], ...(extra[id] ?? {})}));
	return p;
};
const allStanding = {leo: true, marta: true, dani: true, sara: true, iker: true} as Partial<Record<CharId, boolean>>;

const CarvingsScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart} = useScene();
	const sting = cue('sting');
	const strike = kf(frame, [[sting - 4, 0], [sting + 6, 1]]);
	const sweep = Math.sin(frame / 25) * 120;
	const beamsTo = FIVE.map((id, i) => {
		const sx = SEATS[id].x + 38 * CHAR_SCALE;
		const sy = SEATS[id].y - 260 * CHAR_SCALE;
		const tx = CARVE.x + sweep * (i % 2 ? 1 : -1) + (i - 2) * 60;
		const ty = CARVE.y + 120;
		return {sx, sy, ang: (Math.atan2(ty - sy, tx - sx) * 180) / Math.PI, tx, ty};
	});
	const cam = useCam([
		{f: 0, x: 540, y: 1120, z: 1.0},
		{f: 40, x: 540, y: 950, z: 1.35},
		{f: sting - 2, x: 540, y: 950, z: 1.45},
		{f: sting + 6, x: HUGO_CARVE.x, y: HUGO_CARVE.y, z: 2.6, ease: EASE_OUT},
		{f: lineStart(2) - 4, x: HUGO_CARVE.x, y: HUGO_CARVE.y, z: 2.7},
		{f: dur, x: 540, y: 1000, z: 1.25},
	], 2);
	return (
		<Stage cam={cam}>
			<CampNight
				present={FIVE}
				standing={allStanding}
				poses={standingBack()}
				fire={0}
				darkness={0.94}
				fireflies={0}
				emptySeat={false}
				under={<Carvings x={CARVE.x} y={CARVE.y} strike={strike} />}
				extraLights={beamsTo.map((b) => ({x: b.tx, y: b.ty, r: 260, color: '#fff6d0', glow: 0.4}))}
				over={<g>{beamsTo.map((b, i) => <Beam key={i} x={b.sx} y={b.sy} angle={b.ang} length={560} spread={9} intensity={0.35} />)}</g>}
			/>
		</Stage>
	);
};

const FireScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur} = useScene();
	const fire = kf(frame, [[10, 0], [45, 1]]);
	const cam = useCam([{f: 0, x: 540, y: 1380, z: 2.0}, {f: dur, x: 540, y: 1150, z: 1.05}], 2);
	const poses: Partial<Record<CharId, Pose>> = {};
	FIVE.forEach((id, i) => (poses[id] = {mouth: 'flat', lookX: Math.sin(i * 2) * 0.5, lookY: 0.4}));
	return (
		<Stage cam={cam}>
			<CampNight present={FIVE} poses={poses} fire={fire} darkness={kf(frame, [[0, 0.96], [45, 0.9]])} smoke={0.4} />
		</Stage>
	);
};

const Count: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart} = useScene();
	const cs = [1, 2, 3, 4, 5].map((i) => cue('c' + i));
	const idx = cs.filter((c) => frame >= c - 3).length - 1;
	const target: CharId | null = idx >= 0 ? FIVE[idx] : null;
	const sh = {x: SEATS.leo.x + 40 * CHAR_SCALE, y: SEATS.leo.y - 177 * CHAR_SCALE};
	let arm: [number, number] = [12, -4];
	if (target === 'leo') arm = [-40, -120];
	else if (target) {
		const h = headOf(target);
		arm = [aimAngle(sh.x, sh.y, h.x, h.y + 60), 0];
	}
	const ok = frame >= lineStart(1);
	const cam = useCam([{f: 0, x: 540, y: 1100, z: 1.05}, {f: dur, x: 520, y: 1080, z: 1.15}], 2);
	const poses: Partial<Record<CharId, Pose>> = {leo: {armR: ok ? [12, -4] : arm, mouth: ok ? 'smile' : 'flat', lookX: target && target !== 'leo' ? 1 : 0}};
	(['marta', 'dani', 'sara', 'iker'] as CharId[]).forEach((id) => (poses[id] = {mouth: ok ? 'smile' : 'flat', lookX: -1, opacity: 1} as Pose));
	return (
		<Stage cam={cam}>
			<CampNight
				present={FIVE}
				standing={{leo: true}}
				poses={poses}
				over={
					<g>
						{FIVE.map((id, i) => {
							const h = headOf(id, id === 'leo');
							return <Badge key={id} x={h.x} y={h.y - 120} n={i + 1} p={pop(frame, cs[i] - 2)} color={i === 4 ? '#7CFF8A' : '#fff'} />;
						})}
					</g>
				}
			/>
		</Stage>
	);
};

const Shadows: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart, lineEnd} = useScene();
	const sting = cue('sting');
	const shown = FIVE.filter((id) => id !== 'iker');
	const cam = useCam([
		{f: 0, x: 540, y: 1100, z: 1.05},
		{f: lineStart(1), x: 540, y: 880, z: 1.3},
		{f: sting - 2, x: 560, y: 860, z: 1.35},
		{f: dur, x: 600, y: 860, z: 1.45},
	], 2.5);
	const poses: Partial<Record<CharId, Pose>> = {sara: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'open'), armR: [165, 0], lookY: -1, brows: 'worried'}};
	(['leo', 'marta', 'dani', 'iker'] as CharId[]).forEach((id) => (poses[id] = {lookY: -1, mouth: frame > sting ? 'open' : 'flat', brows: 'worried'}));
	return (
		<Stage cam={cam}>
			<CampNight
				present={FIVE}
				poses={poses}
				shadows={{show: 1, exclude: ['iker']}}
				over={
					<g>
						{shown.map((id, i) => {
							const h = headOf(id);
							const sp = shadowOfFire(h.x, h.y);
							return <Badge key={id} x={sp.x} y={sp.y - 140} n={i + 1} p={pop(frame, sting - 24 + i * 6)} color={i === 3 ? '#ff2d3a' : '#fff'} text={i === 3 ? '#fff' : '#111'} />;
						})}
					</g>
				}
			/>
		</Stage>
	);
};

const IkerScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart, lineEnd} = useScene();
	const ik = headOf('iker');
	const flick = 0.75 + 0.15 * Math.sin(frame * 0.9);
	const cam = useCam([
		{f: 0, x: ik.x, y: 880, z: 1.7},
		{f: lineStart(1) - 10, x: ik.x, y: 960, z: 1.8},
		{f: dur, x: ik.x - 20, y: ik.y + 60, z: 2.5},
	], 2.5);
	const poses: Partial<Record<CharId, Pose>> = {
		iker: {mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'worried'), brows: 'worried', armL: [-150, -20], armR: [150, 20], lookY: 0.2, lookX: -0.6},
	};
	(['leo', 'marta', 'dani', 'sara'] as CharId[]).forEach((id) => (poses[id] = {lookX: 1, mouth: 'open', brows: 'worried', tremble: 1}));
	return (
		<Stage cam={cam}>
			<CampNight present={FIVE} poses={poses} shadows={{show: 1, exclude: ['iker']}} opacities={{iker: flick}} />
		</Stage>
	);
};

const HugoScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const sh = cue('sting');
	const boom = cue('boom');
	const h6 = headOf('sixth');
	const s6 = shadowOfFire(h6.x, h6.y);
	const cam = useCam([
		{f: 0, x: 540, y: 1100, z: 1.05},
		{f: 25, x: 860, y: 1050, z: 1.7},
		{f: sh - 4, x: 900, y: 1050, z: 1.9},
		{f: sh + 8, x: s6.x - 60, y: s6.y + 80, z: 1.5, ease: EASE_OUT},
		{f: boom - 2, x: s6.x - 60, y: s6.y + 80, z: 1.6},
		{f: boom + 6, x: s6.x - 30, y: s6.y + 60, z: 2.3, ease: EASE_OUT},
		{f: dur, x: s6.x - 30, y: s6.y + 60, z: 2.4},
	], frame > boom ? 6 : 2);
	const poses: Partial<Record<CharId, Pose>> = {sixth: {mouth: 'creepy', lookX: -0.4, headTilt: -8}, iker: {mouth: 'open', brows: 'worried', lookX: 1}};
	(['leo', 'marta', 'dani', 'sara'] as CharId[]).forEach((id) => (poses[id] = {lookX: 1, mouth: 'open', brows: 'worried', tremble: 1.2}));
	return (
		<>
			<Stage cam={cam}>
				<CampNight present={ORDER} poses={poses} shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}} opacities={{iker: 0.7}} />
			</Stage>
			<Flash at={boom} len={8} color="#ff2d3a" peak={0.3} />
		</>
	);
};

const Talk: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart, lineEnd} = useScene();
	const h6 = headOf('sixth');
	const cam = useCam([{f: 0, x: h6.x - 40, y: h6.y + 60, z: 2.3}, {f: dur, x: h6.x - 40, y: h6.y + 40, z: 2.8}], 2.5);
	return (
		<Stage cam={cam}>
			<CampNight
				present={ORDER}
				poses={{sixth: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'creepy', ['creepy', 'o', 'creepy', 'flat']), lookX: -0.2, headTilt: kf(frame, [[0, -8], [dur, 6]]), colors: {skin: '#e2d6c8'}}, iker: {mouth: 'open', brows: 'worried'}}}
				shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}}
				opacities={{iker: 0.6}}
				extraLights={[{x: h6.x, y: h6.y + 80, r: 220, color: '#ffb070', glow: 0.6}]}
			/>
		</Stage>
	);
};

const End: React.FC<{title: string; part: string; next?: string}> = (p) => <SeriesEnd title={p.title} part={p.part} next={p.next} />;

export const EP4: EpisodeDef = {
	slug: 'ep4',
	timelines: {es: tlEs as unknown as Timeline, en: tlEn as unknown as Timeline},
	next: {es: 'Sigue en la PARTE 5', en: 'Continues in PART 5'},
	scenes: {
		hook: {C: Hook, vignette: 0.8},
		path: {C: Path, vignette: 0.8},
		carvings: {C: CarvingsScene, fadeIn: 8, vignette: 0.8},
		fire: {C: FireScene, vignette: 0.75},
		count: {C: Count, vignette: 0.75},
		shadows: {C: Shadows, vignette: 0.8},
		iker: {C: IkerScene, vignette: 0.8},
		hugo: {C: HugoScene, vignette: 0.8},
		talk: {C: Talk, vignette: 0.85},
		end: {C: End, fadeIn: 6, fadeOut: 12},
	},
};
