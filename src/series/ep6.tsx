import React from 'react';
import {useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Badge, CampNight, CHAR_SCALE, headOf, ORDER, SEATS, shadowOfFire} from '../components/CampNight';
import {Character, CharId, Pose} from '../components/Character';
import {DawnSet, DAWN_POS, DAWN_SCALE, dawnHead, FRIENDS, LINE_Y, shadowPoint} from '../components/DawnSet';
import {Flash} from '../components/Overlays';
import {aimAngle, Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, pop, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from './Episode';
import {SeriesEnd} from './SeriesEnd';
import tl from '../generated/timeline_ep6_es.json';

const PALE: Pose = {humanEyes: true, colors: {skin: '#e6d0b6', skinShade: '#c9ad8f'}};
const WARM: Pose = {humanEyes: true, colors: {skin: '#efc9a0', skinShade: '#d6a97c', jacket: '#7a7f88'}};
const FIVE: CharId[] = ['leo', 'marta', 'dani', 'sara', 'iker'];

const sil = (id: CharId, x: number, y: number, pose: Pose = {}) => <Character id={id} x={x} y={y} scale={CHAR_SCALE} pose={{...pose, sit: true, silhouette: '#07060c', glowEyes: 0}} />;

const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur} = useScene();
	const cam = useCam([{f: 0, x: 540, y: 1200, z: 1.3}, {f: dur, x: 540, y: 1120, z: 1.05}], 2);
	const poses: Partial<Record<CharId, Pose>> = {sixth: {...PALE, mouth: 'flat', lookX: -0.4}};
	FIVE.forEach((id, i) => (poses[id] = {mouth: 'flat', brows: 'worried', lookX: Math.sin(frame / 25 + i) * 0.6}));
	return (
		<Stage cam={cam}>
			<CampNight present={ORDER} poses={poses} opacities={{iker: 0.2}} shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}} />
		</Stage>
	);
};

const Count: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart} = useScene();
	const cs = [1, 2, 3, 4, 5, 6].map((i) => cue('c' + i));
	const idx = Math.min(5, cs.filter((c) => frame >= c - 3).length - 1);
	const toHugo = frame >= lineStart(1) - 6;
	const target: CharId | null = toHugo ? 'sixth' : idx >= 0 ? ORDER[idx] : null;
	const sh = {x: SEATS.leo.x + 40 * CHAR_SCALE, y: SEATS.leo.y - 177 * CHAR_SCALE};
	let arm: [number, number] = [12, -4];
	if (target === 'leo') arm = [-40, -120];
	else if (target) {
		const h = headOf(target);
		arm = [aimAngle(sh.x, sh.y, h.x, h.y + 60), 0];
	}
	const h6 = headOf('sixth');
	const cam = useCam([
		{f: 0, x: 540, y: 1100, z: 1.05},
		{f: lineStart(1) - 8, x: 600, y: 1080, z: 1.15},
		{f: cs[5], x: 760, y: 1050, z: 1.5, ease: EASE},
		{f: dur, x: h6.x - 60, y: h6.y + 40, z: 2.1},
	], 2);
	const poses: Partial<Record<CharId, Pose>> = {
		leo: {armR: arm, mouth: frame > cs[5] ? 'smile' : 'flat', lookX: target && target !== 'leo' ? 1 : 0},
		sixth: {...PALE, mouth: frame > cs[5] ? 'o' : 'flat', brows: frame > cs[5] ? 'raised' : 'neutral', lookX: -1},
	};
	(['marta', 'dani', 'sara', 'iker'] as CharId[]).forEach((id) => (poses[id] = {mouth: 'flat', lookX: toHugo ? 1 : -1}));
	return (
		<>
			<Stage cam={cam}>
				<CampNight
					present={ORDER}
					standing={{leo: true}}
					poses={poses}
					opacities={{iker: 0.2}}
					shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}}
					over={
						<g>
							{ORDER.map((id, i) => {
								const h = headOf(id, id === 'leo');
								return <Badge key={id} x={h.x} y={h.y - 120} n={i + 1} p={pop(frame, cs[i] - 2)} color={i === 5 ? '#ffcf3a' : '#fff'} />;
							})}
						</g>
					}
				/>
			</Stage>
			<Flash at={cs[5]} len={14} color="#ffd890" peak={0.45} />
		</>
	);
};

const Reaction: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart} = useScene();
	const h6 = headOf('sixth');
	const glow = kf(frame, [[0, 0.3], [40, 1]]);
	const cam = useCam([{f: 0, x: h6.x - 60, y: h6.y + 50, z: 2.3}, {f: dur, x: h6.x - 60, y: h6.y + 40, z: 2.7}], 1.5);
	const warm = frame > lineStart(1);
	return (
		<Stage cam={cam}>
			<CampNight
				present={ORDER}
				poses={{sixth: {...(warm ? WARM : PALE), mouth: frame > 20 ? 'grin' : 'o', brows: 'raised', lookX: -0.6, headTilt: 4}}}
				opacities={{iker: 0.25}}
				shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}}
				extraLights={[{x: h6.x, y: h6.y + 40, r: 300 * glow, color: '#ffd890', glow: 0.8 * glow}]}
			/>
		</Stage>
	);
};

const ShadowsBack: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur, cue} = useScene();
	const move = kf(frame, [[lineStart(0) + 10, 0], [lineStart(0) + 50, 1]], EASE);
	const ikerSolid = kf(frame, [[lineStart(0) + 30, 0.25], [lineStart(0) + 60, 1]]);
	const own = kf(frame, [[lineStart(1), 0], [cue('chime'), 1]]);
	const ix = SEATS.sixth.x + (SEATS.iker.x - SEATS.sixth.x) * move;
	const iy = SEATS.sixth.y + (SEATS.iker.y - SEATS.sixth.y) * move;
	const mid = shadowOfFire((SEATS.iker.x + SEATS.sixth.x) / 2, 1000);
	const cam = useCam([
		{f: 0, x: mid.x - 40, y: mid.y + 120, z: 1.6},
		{f: lineStart(1), x: mid.x, y: mid.y + 120, z: 1.6},
		{f: dur, x: mid.x + 20, y: mid.y + 160, z: 1.45},
	], 1.5);
	return (
		<Stage cam={cam}>
			<CampNight
				present={ORDER}
				poses={{sixth: {...WARM, mouth: 'grin', lookY: -1, lookX: -0.3}, iker: {mouth: ikerSolid > 0.9 ? 'grin' : 'o', lookX: -0.2, lookY: -0.8, armL: [-150, -20], armR: [150, 20]}}}
				opacities={{iker: ikerSolid}}
				shadows={{
					show: 1,
					exclude: ['iker', 'sixth'],
					extra: (
						<g>
							{sil('iker', ix, iy, {armL: [-150, -20], armR: [150, 20]})}
							<g opacity={own}>{sil('sixth', SEATS.sixth.x, SEATS.sixth.y)}</g>
						</g>
					),
				}}
			/>
		</Stage>
	);
};

const Goodbye: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const h6 = headOf('sixth');
	const fade = kf(frame, [[lineStart(1), 1], [lineStart(1) + 45, 0]]);
	const rise = Math.max(0, frame - lineStart(1));
	const cam = useCam([
		{f: 0, x: h6.x - 60, y: h6.y + 50, z: 2.2},
		{f: lineStart(1), x: h6.x - 40, y: h6.y + 40, z: 2.0},
		{f: dur, x: h6.x - 120, y: h6.y - 520, z: 1.2},
	], 1.5);
	const motes = new Array(60).fill(0).map((_, i) => {
		const delay = rand(i, 1) * 30;
		const t = Math.max(0, rise - delay);
		if (t <= 0) return null;
		const x0 = SEATS.sixth.x + (rand(i, 2) - 0.5) * 120;
		const y0 = SEATS.sixth.y - rand(i, 3) * 260;
		const x = x0 + noise2D('m' + i, t * 0.03, 0) * 60;
		const y = y0 - t * (4 + rand(i, 4) * 5);
		const o = Math.max(0, 1 - t / 90);
		return <circle key={i} cx={x} cy={y} r={3 + rand(i, 5) * 5} fill="#ffe7a0" opacity={o} />;
	});
	return (
		<Stage cam={cam}>
			<CampNight
				present={ORDER}
				poses={{sixth: {...WARM, mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'grin', ['smile', 'o', 'smile']), lookX: -0.5, armR: frame > lineEnd(0) ? [150 + Math.sin(frame / 6) * 15, 20] : [12, -4]}}}
				opacities={{sixth: fade}}
				fireflies={1}
				shadows={{show: 1, exclude: ['sixth'], extra: <g opacity={fade}>{sil('sixth', SEATS.sixth.x, SEATS.sixth.y)}</g>}}
				extraLights={[{x: h6.x, y: h6.y + 40, r: 320, color: '#ffd890', glow: 0.6 * fade + 0.2}]}
				over={<g style={{mixBlendMode: 'screen'}}>{motes}</g>}
			/>
		</Stage>
	);
};

const Dawn: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart, scene, f} = useScene();
	const ws = scene.lines[0].words;
	const start = f(ws[2].start);
	const end = f(ws[ws.length - 1].end);
	const step = (end - start) / 5;
	const cam = useCam([{f: 0, x: 540, y: 1150, z: 1.05}, {f: lineStart(0) + 30, x: 540, y: 980, z: 1.1}, {f: dur, x: 540, y: 1040, z: 1.0}], 1.5);
	const poses: Partial<Record<CharId, Pose>> = {};
	FRIENDS.forEach((id, i) => (poses[id] = {mouth: 'grin', armL: [-60, 10], armR: [60, -10], lookX: Math.sin(i * 1.7), bob: Math.sin(frame / 5 + i) * 2}));
	return (
		<Stage cam={cam}>
			<DawnSet
				poses={poses}
				shadowOpacity={0.5}
				sixthShadowOpacity={0}
				over={
					<g>
						{FRIENDS.map((id, i) => {
							const h = dawnHead(id);
							const sp = shadowPoint(h.x, h.y);
							return <Badge key={id} x={sp.x} y={sp.y - 130} n={i + 1} p={pop(frame, start + step * i) * kf(frame, [[lineStart(1), 1], [lineStart(1) + 10, 0]])} color={i === 4 ? '#7CFF8A' : '#fff'} />;
						})}
					</g>
				}
			/>
			{void DAWN_POS}
			{void DAWN_SCALE}
			{void LINE_Y}
		</Stage>
	);
};

const Epilogue: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const ghost = kf(frame, [[lineStart(1), 0], [lineStart(1) + 30, 0.9]]);
	const s6 = shadowOfFire(headOf('sixth').x, headOf('sixth').y);
	const cam = useCam([
		{f: 0, x: 540, y: 1150, z: 1.05},
		{f: lineStart(1) - 10, x: 820, y: 1120, z: 1.5},
		{f: dur, x: s6.x - 60, y: s6.y + 160, z: 1.75},
	], 1.5);
	const poses: Partial<Record<CharId, Pose>> = {};
	FIVE.forEach((id, i) => (poses[id] = {mouth: talkMouth(frame, i * 20, dur, 'grin', ['grin', 'smile', 'grin', 'o']), lookX: Math.sin(frame / 18 + i * 2), headTilt: Math.sin(frame / 12 + i) * 5}));
	return (
		<Stage cam={cam}>
			<CampNight
				present={FIVE}
				poses={poses}
				shadows={{show: 1, extra: <g opacity={ghost}>{sil('sixth', SEATS.sixth.x, SEATS.sixth.y, {armR: [150 + Math.sin(frame / 6) * 15, 20]})}</g>}}
				under={
					<g>
						{/* a mug left on the free seat */}
						<rect x={SEATS.sixth.x - 18} y={SEATS.sixth.y - 92} width={36} height={44} rx={6} fill="#d94a3a" />
						<path d={`M ${SEATS.sixth.x + 18} ${SEATS.sixth.y - 82} q 18 4 0 22`} stroke="#d94a3a" strokeWidth={6} fill="none" />
					</g>
				}
			/>
		</Stage>
	);
};

const End: React.FC<{title: string; part: string}> = (p) => {
	const frame = useCurrentFrame();
	return <SeriesEnd title={p.title} part={p.part} next="FIN" warm figure={{...WARM, mouth: 'smile', armR: [150 + Math.sin(frame / 6) * 15, 20], colors: {...WARM.colors, jacket: '#3a3d44', jacketDark: '#2a2c32', skin: '#6a5a4a', skinShade: '#5a4a3a', pants: '#1a1a1e'}}} />;
};

export const EP6: EpisodeDef = {
	slug: 'ep6',
	timeline: tl as unknown as Timeline,
	scenes: {
		hook: {C: Hook, vignette: 0.75},
		count: {C: Count, vignette: 0.75},
		reaction: {C: Reaction, vignette: 0.7},
		shadows: {C: ShadowsBack, vignette: 0.7},
		goodbye: {C: Goodbye, vignette: 0.7},
		dawn: {C: Dawn, fadeIn: 16, vignette: 0.4},
		epilogue: {C: Epilogue, fadeIn: 12, vignette: 0.65},
		end: {C: End, fadeIn: 8, fadeOut: 14},
	},
};
void EASE_OUT;
