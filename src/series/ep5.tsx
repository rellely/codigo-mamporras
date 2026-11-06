import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CampNight, headOf, ORDER, SEATS} from '../components/CampNight';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Glitch} from '../components/Overlays';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene, useTr} from '../lib/timeline';
import type {EpisodeDef} from './Episode';
import {SeriesEnd} from './SeriesEnd';
import tlEs from '../generated/timeline_ep5_es.json';
import tlEn from '../generated/timeline_ep5_en.json';

/** Hugo regaining colour (more "real"). */
const HUGO_REAL = {skin: '#e6d0b6', skinShade: '#c9ad8f'};
const HUGO_HUMAN: Pose = {humanEyes: true, colors: {skin: '#ecc9a2', skinShade: '#d4ac82'}};

type Fig = {id: CharId; x: number; y: number; pose?: Pose; opacity?: number; s?: number};
/** Free-positioned figures (+ their silhouettes for the rock shadows). */
const Figures: React.FC<{figs: Fig[]; silhouette?: boolean}> = ({figs, silhouette}) => (
	<g>
		{[...figs].sort((a, b) => a.y - b.y).map((f, i) => (
			<Character key={f.id + i} id={f.id} x={f.x} y={f.y} scale={f.s ?? 0.95} pose={{...(f.pose ?? {}), ...(silhouette ? {silhouette: '#07060c', glowEyes: 0} : {})}} opacity={silhouette ? 1 : f.opacity ?? 1} />
		))}
	</g>
);

const STAND: Record<'leo' | 'marta' | 'dani' | 'sara', {x: number; y: number}> = {
	sara: {x: 210, y: 1330},
	dani: {x: 370, y: 1310},
	marta: {x: 520, y: 1300},
	leo: {x: 670, y: 1320},
};
const HUGO_STOP = {x: 915, y: 1340};

const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, dur} = useScene();
	const ik = headOf('iker');
	const h6 = headOf('sixth');
	const flick = 0.5 + 0.25 * Math.sin(frame * 1.3) * (rand(Math.floor(frame / 3), 2) > 0.5 ? 1 : 0.3);
	const cam = useCam([
		{f: 0, x: ik.x, y: ik.y + 80, z: 2.4},
		{f: lineStart(1) - 6, x: ik.x, y: ik.y + 70, z: 2.6},
		{f: lineStart(1) + 6, x: h6.x - 30, y: h6.y + 70, z: 2.4, ease: EASE},
		{f: dur, x: h6.x - 30, y: h6.y + 60, z: 2.6},
	], 3);
	return (
		<Glitch at={cue('glitch')} len={8}>
			<Stage cam={cam}>
				<CampNight
					present={ORDER}
					poses={{iker: {mouth: 'open', brows: 'worried', lookY: 0.6, armL: [-150, -20], armR: [150, 20]}, sixth: {mouth: 'creepy', colors: HUGO_REAL, lookX: -1}}}
					shadows={{show: 1, exclude: ['iker'], swap: {sixth: 'iker'}}}
					opacities={{iker: flick}}
				/>
			</Stage>
		</Glitch>
	);
};

const Approach: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const t = kf(frame, [[10, 0], [dur - 10, 1]], (x) => x);
	const hx = kf(frame, [[10, SEATS.sixth.x], [dur - 10, HUGO_STOP.x]], (x) => x);
	const hy = SEATS.sixth.y;
	const hugo: Fig = {id: 'sixth', x: hx, y: hy, pose: {...walkPose(frame, 0.2, 0, 0.5 * (t < 1 ? 1 : 0)), turn: -0.6, lookX: -1, mouth: 'flat', colors: HUGO_REAL}};
	const cam = useCam([
		{f: 0, x: 860, y: 1080, z: 1.6},
		{f: lineStart(1) - 4, x: 860, y: 1080, z: 1.7},
		{f: lineStart(1) + 8, x: headOf('iker').x, y: headOf('iker').y + 80, z: 2.6, ease: EASE},
		{f: dur, x: headOf('iker').x, y: headOf('iker').y + 80, z: 2.8},
	], 2.5);
	const friends: Partial<Record<CharId, Pose>> = {iker: {mouth: 'open', brows: 'worried', lookX: 1, tremble: 2}};
	(['leo', 'marta', 'dani', 'sara'] as CharId[]).forEach((id) => (friends[id] = {lookX: 1, mouth: 'open', brows: 'worried', tremble: 1}));
	return (
		<Stage cam={cam}>
			<CampNight
				present={['leo', 'marta', 'dani', 'sara', 'iker']}
				emptySeat
				poses={friends}
				opacities={{iker: kf(frame, [[0, 0.55], [dur, 0.32]])}}
				under={<Figures figs={[hugo]} />}
				shadows={{show: 1, exclude: ['iker'], extra: <Figures figs={[{...hugo, id: 'iker'}]} silhouette />}}
			/>
		</Stage>
	);
};

const protectFigs = (frame: number, at: number, extra: Partial<Record<CharId, Pose>> = {}): Fig[] => {
	const k = kf(frame, [[at, 0], [at + 14, 1]], EASE_OUT);
	return (['sara', 'dani', 'marta', 'leo'] as const).map((id) => ({
		id,
		x: SEATS[id].x + (STAND[id].x - SEATS[id].x) * k,
		y: SEATS[id].y + (STAND[id].y - SEATS[id].y) * k,
		pose: {sit: k < 0.5, armL: [-70, 0], armR: [70, 0], brows: 'angry', mouth: 'flat', lookX: 1, ...(extra[id] ?? {})} as Pose,
	}));
};

const Protect: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const figs = protectFigs(frame, 0, {leo: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'flat', ['open', 'open', 'o']), brows: 'angry', armL: [-80, 0], armR: [80, 0], lookX: 1}});
	const hugo: Fig = {id: 'sixth', ...HUGO_STOP, pose: {mouth: 'flat', lookX: -1, colors: HUGO_REAL}};
	const cam = useCam([{f: 0, x: 640, y: 1080, z: 1.9}, {f: lineStart(1), x: 560, y: 1100, z: 1.2}, {f: dur, x: 560, y: 1100, z: 1.15}], 3);
	return (
		<Stage cam={cam}>
			<CampNight
				present={['iker']}
				poses={{iker: {mouth: 'open', brows: 'worried', lookX: 1}}}
				opacities={{iker: 0.32}}
				under={<Figures figs={[...figs, hugo]} />}
				shadows={{show: 1, exclude: ['iker'], extra: <Figures figs={[...figs, {...hugo, id: 'iker'}]} silhouette />}}
			/>
		</Stage>
	);
};

const Sad: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const human = kf(frame, [[lineStart(0) + 10, 0], [lineStart(0) + 30, 1]]);
	const hugo: Fig = {
		id: 'sixth',
		...HUGO_STOP,
		pose: human > 0.5
			? {...HUGO_HUMAN, mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'worried', ['worried', 'o', 'flat']), brows: 'worried', lookX: -0.8, lookY: 0.4, headTilt: 6}
			: {mouth: 'flat', lookX: -1, colors: HUGO_REAL},
	};
	const figs = protectFigs(frame, -100);
	const h = {x: HUGO_STOP.x, y: HUGO_STOP.y - 242};
	const cam = useCam([{f: 0, x: h.x - 60, y: h.y + 70, z: 2.4}, {f: dur, x: h.x - 60, y: h.y + 60, z: 2.8}], 2);
	return (
		<Stage cam={cam}>
			<CampNight
				present={['iker']}
				opacities={{iker: 0.3}}
				under={<Figures figs={[...figs, hugo]} />}
				shadows={{show: 1, exclude: ['iker'], extra: <Figures figs={[...figs, {...hugo, id: 'iker'}]} silhouette />}}
				extraLights={[{x: h.x, y: h.y + 80, r: 240, color: '#ffc890', glow: 0.5}]}
			/>
		</Stage>
	);
};

const BOYS: {id: CharId; colors: any}[] = [
	{id: 'leo', colors: {jacket: '#7a6a5a', jacketDark: '#5a4a3a', accent: '#6a5040', pants: '#3a3a3a'}},
	{id: 'dani', colors: {jacket: '#5a6a7a', jacketDark: '#3a4a5a', pants: '#2a2a2a'}},
	{id: 'iker', colors: {jacket: '#8a7a50', jacketDark: '#6a5a30', accent: '#5a5a5a', pants: '#3a3a3a', skin: '#c08a5a', skinShade: '#a07040'}},
	{id: 'marta', colors: {jacket: '#6a5a6a', jacketDark: '#4a3a4a', hair: '#3a2a20', pants: '#2a2a2a'}},
	{id: 'leo', colors: {jacket: '#506050', jacketDark: '#304030', accent: '#404a40', pants: '#333'}},
];

/** 2006: his friends leave in a hurry; Hugo stays by the fire. */
const Flashback: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const leave = lineStart(0) + 40;
	const walkers: Fig[] = BOYS.map((b, i) => {
		const t = Math.max(0, frame - leave - i * 4);
		return {id: b.id, x: 200 + i * 130 - t * 7, y: 1380 + (i % 2) * 30, pose: {colors: b.colors, ...walkPose(frame, 0.32, i, 0.9), turn: -0.7, back: false, mouth: 'smile', backpack: true}};
	});
	const fire = kf(frame, [[lineStart(1), 1], [dur, 0.25]]);
	const cam = useCam([
		{f: 0, x: 540, y: 1150, z: 1.05},
		{f: lineStart(1), x: 700, y: 1120, z: 1.25},
		{f: dur, x: SEATS.sixth.x - 60, y: headOf('sixth').y + 60, z: 2.3},
	], 1.5);
	const scratches = new Array(3).fill(0).map((_, i) => (
		<div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: `${rand(Math.floor(frame / 2) + i * 13, 4) * 100}%`, width: 2, background: 'rgba(255,240,210,0.25)'}} />
	));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.85) contrast(1.05) brightness(1.3)'}}>
				<Stage cam={cam}>
					<CampNight
						present={['sixth']}
						fire={fire}
						darkness={0.82}
						poses={{sixth: {...HUGO_HUMAN, mouth: frame > lineStart(1) ? 'worried' : 'smile', brows: frame > lineStart(1) ? 'worried' : 'neutral', lookX: -1, armL: frame > leave && frame < leave + 50 ? [-150 + Math.sin(frame / 4) * 15, 10] : [-12, 4]}}}
						under={<Figures figs={walkers} />}
					/>
				</Stage>
			</AbsoluteFill>
			{scratches}
			<AbsoluteFill style={{border: '30px solid rgba(20,12,4,0.5)', boxSizing: 'border-box'}} />
		</AbsoluteFill>
	);
};

const Realize: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur, cue} = useScene();
	const figs = protectFigs(frame, -100, {
		dani: {mouth: frame < lineStart(1) ? 'o' : talkMouth(frame, lineStart(1), lineEnd(1), 'flat'), brows: 'raised', lookX: frame < lineStart(1) ? 0 : 1, armL: [-70, 0], armR: frame > lineStart(1) ? [120, 10] : [70, 0]},
	});
	const hugo: Fig = {id: 'sixth', ...HUGO_STOP, pose: {...HUGO_HUMAN, mouth: 'worried', brows: 'worried', lookX: -0.6}};
	const d = STAND.dani;
	const cam = useCam([{f: 0, x: d.x, y: d.y - 180, z: 2.3}, {f: lineStart(1) + 10, x: d.x + 40, y: d.y - 170, z: 2.2}, {f: dur, x: 560, y: 1100, z: 1.3}], 2);
	void cue;
	return (
		<Stage cam={cam}>
			<CampNight
				present={['iker']}
				opacities={{iker: 0.27}}
				under={<Figures figs={[...figs, hugo]} />}
				shadows={{show: 1, exclude: ['iker'], extra: <Figures figs={[...figs, {...hugo, id: 'iker'}]} silhouette />}}
			/>
		</Stage>
	);
};

const Hurry: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const sitAt = lineStart(2);
	const k = kf(frame, [[sitAt, 0], [sitAt + 22, 1]], EASE);
	const figs: Fig[] = (['sara', 'dani', 'marta', 'leo'] as const).map((id) => ({
		id,
		x: STAND[id].x + (SEATS[id].x - STAND[id].x) * k,
		y: STAND[id].y + (SEATS[id].y - STAND[id].y) * k,
		pose: {
			sit: k > 0.9,
			mouth: id === 'marta' ? talkMouth(frame, lineStart(1), lineEnd(1), 'open', ['open', 'o', 'open']) : id === 'dani' ? talkMouth(frame, lineStart(2), lineEnd(2), 'flat') : 'worried',
			brows: 'worried',
			lookX: id === 'marta' ? -0.6 : 1,
			...(k > 0 && k < 1 ? walkPose(frame, 0.4, 1, 0.8) : {}),
		} as Pose,
	}));
	const hugo: Fig = {id: 'sixth', ...HUGO_STOP, pose: {...HUGO_HUMAN, mouth: 'worried', brows: 'worried', lookX: -0.6}};
	const ik = headOf('iker');
	const cam = useCam([
		{f: 0, x: ik.x, y: ik.y + 90, z: 2.5},
		{f: lineStart(1) - 4, x: ik.x, y: ik.y + 80, z: 2.6},
		{f: lineStart(1) + 8, x: 520, y: 1080, z: 1.4, ease: EASE},
		{f: dur, x: 560, y: 1120, z: 1.05},
	], 3);
	return (
		<Stage cam={cam}>
			<CampNight
				present={['iker']}
				poses={{iker: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'worried'), brows: 'worried', armL: [-150, -20], armR: [150, 20], lookY: 0.2, tremble: 1}}}
				opacities={{iker: 0.18 + 0.08 * Math.sin(frame)}}
				under={<Figures figs={[...figs, hugo]} />}
				shadows={{show: 1, exclude: ['iker'], extra: <Figures figs={[...figs, {...hugo, id: 'iker'}]} silhouette />}}
			/>
		</Stage>
	);
};

const End: React.FC<{title: string; part: string}> = (p) => {
	const t = useTr();
	return <SeriesEnd title={p.title} part={p.part} next={t('Último capítulo: PARTE 6', 'Final chapter: PART 6')} />;
};

export const EP5: EpisodeDef = {
	slug: 'ep5',
	timelines: {es: tlEs as unknown as Timeline, en: tlEn as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.8},
		approach: {C: Approach, vignette: 0.8},
		protect: {C: Protect, vignette: 0.8},
		sad: {C: Sad, vignette: 0.75},
		flashback: {C: Flashback, fadeIn: 10, fadeOut: 10, vignette: 0.85},
		realize: {C: Realize, vignette: 0.75},
		hurry: {C: Hurry, vignette: 0.8},
		end: {C: End, fadeIn: 6, fadeOut: 12},
	},
};
