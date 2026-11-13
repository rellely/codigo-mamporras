import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {dockAt, LakeView} from '../components/sets/LakeCamp';
import {Pickup, RoadNight, ROAD_Y} from '../components/sets/Road';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene} from '../lib/timeline';
import type {EpisodeDef} from '../series/Episode';
import {ChoiceCard} from './ChoiceCard';
import {StayCTA} from './Subscribe';
import tlEs from '../generated/timeline_ln6_es.json';

/* Same staging as chapter 5: truck stopped, Samuel in the headlights, Tomás behind. */
const TRUCK = {x: 40, y: ROAD_Y + 80, s: 0.9};
const GS = 0.62 * 1.4;
const SAM = {x: TRUCK.x + TRUCK.s * 1150, y: ROAD_Y + 40};
const SAM_HEAD = {x: SAM.x, y: SAM.y - 255 * GS};
const TOMAS = {x: TRUCK.x - 260, y: ROAD_Y + 40};
const TOMAS_HEAD = {x: TOMAS.x, y: TOMAS.y - 255 * 0.85};
const OTHER = {x: -760, y: 1400};
const CAP = {x: -560, y: ROAD_Y + 30};

/** The five who got out (Álex is the driver — and he is about to go missing). */
const GROUP: {id: CharId; x: number}[] = [
	{id: 'lucia', x: -110},
	{id: 'mateo', x: 10},
	{id: 'carlos', x: 130},
	{id: 'vera', x: 250},
	{id: 'bea', x: 370},
];
const GROUP_Y = ROAD_Y + 150;
const headlights = {x: TRUCK.x + TRUCK.s * 1100, y: ROAD_Y - 60, r: 520, rx: 700, color: '#fff6c8', glow: 0.5};
const tomasLight = {x: TOMAS.x, y: TOMAS.y - 200, r: 260, color: '#ffb070', glow: 0.5};

const Samuel: React.FC<{pose?: Pose}> = ({pose = {}}) => (
	<Character id="masked" x={SAM.x} y={SAM.y} scale={GS} pose={{maskBroken: 1, eyeOpen: 1, item: 'hook', armR: [10, -10], turn: -0.5, lookX: -1, ...pose}} />
);
const Tomas: React.FC<{pose?: Pose; beam?: number}> = ({pose = {}, beam = 1}) => (
	<g>
		<Character id="tomas" x={TOMAS.x} y={TOMAS.y} scale={0.85} pose={{turn: 0.5, lookX: 1, item: 'flashlight', phoneLit: beam, armR: [60, -10], ...pose}} />
		{beam > 0 && <Beam x={TOMAS.x + 50} y={TOMAS.y - 160} angle={20} length={360} spread={12} intensity={0.3 * beam} />}
	</g>
);
const Group: React.FC<{pose?: (id: CharId) => Pose}> = ({pose = () => ({})}) => (
	<g>
		{GROUP.map((g) => (
			<Character key={g.id} id={g.id} x={g.x} y={GROUP_Y} scale={0.85} pose={{lookX: 1, mouth: 'worried', brows: 'worried', ...pose(g.id)}} />
		))}
	</g>
);

/* 1 ─ HOOK: they climb down, slowly */
const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const out = frame >= cue('door');
	const cam = useCam([
		{f: 0, x: 460, y: 1430, z: 1.25},
		{f: dur, x: 420, y: 1420, z: 1.1},
	], 2);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.8} lights={[headlights, tomasLight]}>
				<Pickup
					x={TRUCK.x}
					y={TRUCK.y}
					s={TRUCK.s}
					wheel={0}
					driverId="alex"
					driver={{mouth: 'open', brows: 'worried', lookX: -1}}
					passengers={out ? [] : GROUP.map((g, i) => ({id: g.id, dx: 30 + i * 100, pose: {lookX: -1, mouth: 'worried', brows: 'worried'}}))}
				/>
				{out && <Group pose={(id) => ({...walkPose(frame, 0.2, id.length, Math.max(0, 1 - (frame - cue('door')) / 30) * 0.5), lookX: GROUP.findIndex((g) => g.id === id) % 2 ? 1 : -1})} />}
				<Tomas pose={{armR: [kf(frame, [[0, 60], [dur, 20]]), -10], mouth: 'flat'}} />
				<Samuel />
			</RoadNight>
		</Stage>
	);
};

/* 2 ─ CTA */
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue} = useScene();
	return (
		<AbsoluteFill>
			<Stage cam={{x: 420, y: 1440, z: 1.1, r: noise2D('c6', frame * 0.03, 0) * 0.3}}>
				<RoadNight scroll={0} darkness={0.8} lights={[headlights, tomasLight]}>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'worried', lookX: -1}} />
					<Group />
					<Tomas pose={{armR: [20, -10]}} />
					<Samuel />
				</RoadNight>
			</Stage>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.4))'}} />
			<StayCTA clickAt={cue('click')} />
		</AbsoluteFill>
	);
};

/* 3 ─ TRUTH: "His name is Samuel. He's my son." */
const Truth: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur, scene, f} = useScene();
	const laughed = scene.lines[1].words.find((w) => /rieron/.test(w.w));
	const toSam = laughed ? f(laughed.start) - 10 : dur - 20;
	const cam = useCam([
		{f: 0, x: TOMAS_HEAD.x + 40, y: TOMAS_HEAD.y + 60, z: 2.6},
		{f: toSam, x: TOMAS_HEAD.x + 40, y: TOMAS_HEAD.y + 60, z: 2.8},
		{f: toSam + 12, x: SAM_HEAD.x - 20, y: SAM_HEAD.y + 50, z: 2.4, ease: EASE},
		{f: dur, x: SAM_HEAD.x - 20, y: SAM_HEAD.y + 50, z: 2.6},
	], 2);
	const talking = frame < lineEnd(1);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.8} lights={[headlights, {...tomasLight, r: 320}]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'worried', lookX: -1}} />
				<Group pose={() => ({lookX: -1})} />
				<Tomas beam={0.4} pose={{armR: [20, -10], mouth: talking ? talkMouth(frame, lineStart(0), lineEnd(1), 'flat', ['o', 'flat', 'open', 'flat']) : 'flat', brows: 'worried', lookY: 0.3}} />
				<Samuel pose={{headTilt: frame > toSam ? 12 : 0, lookY: 0.8, eyeOpen: 0.7}} />
			</RoadNight>
		</Stage>
	);
};

/* 4 ─ FLASHBACK 1996: the boy falls in, the counsellors laugh */
const BOY = {colors: {jacket: '#d9b32a', jacketDark: '#a8861a', accent: '#d9b32a', hair: '#3a2a1a', skin: '#f0c8a0'}};
const TEEN1 = {colors: {jacket: '#7a6a6a', jacketDark: '#5a4a4a', hair: '#6a4a2a'}};
const TEEN2 = {colors: {jacket: '#5a6a7a', jacketDark: '#3a4a5a', accent: '#6a6a6a'}};
const Flashback: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, dur} = useScene();
	const fall = cue('splash') - 8;
	const end = dockAt(0.95);
	const near = dockAt(0.8);
	const boyY = kf(frame, [[fall, end.y], [fall + 8, end.y + 50]], (x) => x);
	const inWater = frame > fall + 8;
	const tomasT = kf(frame, [[lineStart(1) - 20, 0.05], [lineStart(1) + 30, 0.88]], (x) => x);
	const tp = dockAt(tomasT);
	const cam = useCam([
		{f: 0, x: 680, y: 1180, z: 1.6},
		{f: fall + 10, x: 700, y: 1130, z: 1.9},
		{f: dur, x: 690, y: 1200, z: 1.5},
	], 1.5);
	const water = end.y + 6;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.75) contrast(1.05) brightness(1.08)'}}>
				<Stage cam={cam}>
					<LakeView time="sunset" fog={0.1} canoe={false}>
						<defs>
							<clipPath id="fbwater">
								<rect x={-500} y={-500} width={3000} height={water + 500} />
							</clipPath>
						</defs>
						<g clipPath="url(#fbwater)">
							<Character id="mateo" x={end.cx + (inWater ? 60 : 30)} y={inWater ? water + 60 + Math.sin(frame / 4) * 6 : boyY} scale={end.s * 1.25} pose={{...BOY, armL: inWater ? [-170, 0] : [-12, 4], armR: inWater ? [170, 0] : [12, -4], mouth: inWater ? 'open' : 'smile', brows: inWater ? 'worried' : 'neutral', lean: frame > fall ? 30 : 0}} />
						</g>
						{inWater &&
							[0, 1].map((k) => {
								const tt = ((frame - fall - k * 15) % 40) / 40;
								return <ellipse key={k} cx={end.cx + 60} cy={water} rx={10 + tt * 60} ry={3 + tt * 10} fill="none" stroke="#fff0d0" strokeWidth={2} opacity={1 - tt} />;
							})}
						<Character id="vera" x={near.cx - 75} y={near.y} scale={near.s * 1.25} pose={{...TEEN1, mouth: frame > fall ? 'grin' : 'smile', armR: frame > fall ? [100, -20] : undefined, headTilt: frame > fall ? Math.sin(frame / 3) * 6 : 0, lookX: 1}} />
						<Character id="alex" x={near.cx - 15} y={near.y + 6} scale={near.s * 1.25} pose={{...TEEN2, mouth: frame > fall ? 'grin' : 'smile', armL: frame > fall ? [-30, -80] : undefined, headTilt: frame > fall ? -Math.sin(frame / 3) * 6 : 0, lookX: 1}} />
						{frame > lineStart(1) - 20 && (
							<Character id="tomas" x={tp.cx} y={tp.y} scale={tp.s * 1.25} pose={{colors: {hair: '#5a3a22', skin: '#f0c49a'}, ...walkPose(frame, 0.6, 0, tomasT < 0.88 ? 1.2 : 0), back: true, armL: tomasT >= 0.88 ? [-120, 0] : undefined}} />
						)}
					</LakeView>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{border: '30px solid rgba(20,12,4,0.5)', boxSizing: 'border-box'}} />
		</AbsoluteFill>
	);
};

/* 5 ─ WHY: Samuel's human eye — and a tear */
const Why: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur} = useScene();
	const tear = kf(frame, [[40, 0], [dur - 10, 1]], (x) => x);
	const eye = {x: SAM_HEAD.x + 26 * GS - 0.5 * 20 * GS, y: SAM_HEAD.y - 6 * GS};
	const cam = useCam([{f: 0, x: SAM_HEAD.x, y: SAM_HEAD.y + 10, z: 4.2}, {f: dur, x: SAM_HEAD.x + 6, y: SAM_HEAD.y + 6, z: 5.0}], 1.5);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.75} lights={[headlights, {x: SAM_HEAD.x, y: SAM_HEAD.y, r: 240, color: '#fff6c8', glow: 0.45}]}>
				<Samuel pose={{lookY: 0.6, eyeOpen: 0.75, headTilt: 0}} />
				{tear > 0 && <ellipse cx={eye.x + 2} cy={eye.y + 14 + tear * 60} rx={3.5} ry={5} fill="#bfe3ff" opacity={0.9} />}
			</RoadNight>
		</Stage>
	);
};

/* 6 ─ MISSING: where is Álex? The driver's seat is empty */
const Missing: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const sting = cue('sting');
	const cab = {x: TRUCK.x + TRUCK.s * 510, y: TRUCK.y - TRUCK.s * 300};
	const cam = useCam([
		{f: 0, x: 140, y: 1480, z: 1.6},
		{f: lineStart(1) - 4, x: 160, y: 1480, z: 1.6},
		{f: lineStart(1) + 10, x: cab.x, y: cab.y + 40, z: 2.2, ease: EASE},
		{f: sting - 2, x: cab.x, y: cab.y + 40, z: 2.3},
		{f: sting + 6, x: cab.x, y: cab.y + 30, z: 3.2, ease: EASE_OUT},
		{f: dur, x: cab.x, y: cab.y + 30, z: 3.3},
	], 2);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={0} darkness={0.8} lights={[headlights, tomasLight, {x: cab.x, y: cab.y, r: 200, color: '#9fc0ff', glow: 0.35}]}>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId={null} />
					<Group pose={(id) => ({lookX: id === 'carlos' ? 0 : -0.6, mouth: id === 'carlos' ? talkMouth(frame, lineStart(0), lineEnd(0), 'open') : frame > lineStart(1) ? 'open' : 'worried', tremble: frame > sting ? 1.5 : 0})} />
					<Tomas pose={{armR: [20, -10]}} beam={0.5} />
					<Samuel />
				</RoadNight>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.3} />
		</>
	);
};

/* 7 ─ SECOND: Álex's cap... and another yellow raincoat */
const Second: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const boom = cue('boom');
	const seen = frame >= boom - 2;
	const cam = useCam([
		{f: 0, x: TOMAS.x + 100, y: 1250, z: 1.4},
		{f: lineStart(0) + 40, x: CAP.x + 40, y: CAP.y - 80, z: 2.6, ease: EASE},
		{f: boom - 4, x: CAP.x - 40, y: CAP.y - 140, z: 2.2},
		{f: boom + 6, x: OTHER.x + 20, y: OTHER.y - 230, z: 3.0, ease: EASE_OUT},
		{f: lineStart(2) - 4, x: OTHER.x + 30, y: OTHER.y - 230, z: 3.1},
		{f: lineStart(2) + 8, x: TOMAS_HEAD.x + 40, y: TOMAS_HEAD.y + 60, z: 2.6, ease: EASE},
		{f: dur, x: TOMAS_HEAD.x + 40, y: TOMAS_HEAD.y + 60, z: 2.8},
	], frame > boom ? 6 : 2);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight
					scroll={0}
					darkness={0.82}
					lights={[headlights, tomasLight, {x: CAP.x, y: CAP.y - 20, r: 180, color: '#fff6c8', glow: 0.35}, ...(seen ? [{x: OTHER.x, y: OTHER.y - 220, r: 220, color: '#ffb070', glow: 0.4}] : [])]}
				>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId={null} />
					<Group pose={() => ({lookX: -1, mouth: seen ? 'open' : 'worried', tremble: seen ? 1.5 : 0.5})} />
					<Tomas pose={{turn: -0.5, lookX: -1, mouth: talkMouth(frame, lineStart(2), lineEnd(2), seen ? 'open' : 'flat'), brows: 'worried', armR: [-70, -10]}} beam={0} />
					<Beam x={TOMAS.x - 50} y={TOMAS.y - 160} angle={175} length={520} spread={10} intensity={0.35} />
					<Samuel pose={{lookX: -1, turn: -0.6}} />
					{/* Álex's red cap on the asphalt */}
					<g transform={`translate(${CAP.x} ${CAP.y}) rotate(-12)`}>
						<path d="M -40 0 Q -38 -40 0 -42 Q 38 -40 40 0 Z" fill="#d63a3a" />
						<path d="M 30 -6 Q 70 -10 84 4 Q 60 8 30 4 Z" fill="#8a1f1f" />
					</g>
					<g opacity={seen ? 1 : 0.35}>
						<Character id="masked" x={OTHER.x} y={OTHER.y} scale={0.85} pose={{item: 'hook', armR: [12, -10], glowEyes: seen ? 1 : 0.3, headTilt: 14, turn: 0.4}} />
					</g>
				</RoadNight>
			</Stage>
			<Flash at={boom} len={8} color="#ff2d3a" peak={0.35} />
		</>
	);
};

/* 8 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.7) brightness(0.65) contrast(1.15)'}}>
				<Stage cam={{x: OTHER.x + 160, y: OTHER.y - 300, z: kf(frame, [[0, 1.9], [dur, 2.2]], (x) => x), r: 0}}>
					<RoadNight scroll={0} darkness={0.75} lights={[tomasLight, {x: OTHER.x, y: OTHER.y - 220, r: 260, color: '#ffb070', glow: 0.5}, {x: CAP.x, y: CAP.y - 20, r: 180, color: '#fff6c8', glow: 0.35}]}>
						<Tomas pose={{turn: -0.5, lookX: -1, mouth: 'open', brows: 'worried'}} beam={0} />
						<g transform={`translate(${CAP.x} ${CAP.y}) rotate(-12)`}>
							<path d="M -40 0 Q -38 -40 0 -42 Q 38 -40 40 0 Z" fill="#d63a3a" />
						</g>
						<Character id="masked" x={OTHER.x} y={OTHER.y} scale={0.85} pose={{item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: 14, turn: 0.4}} />
					</RoadNight>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={part.split('·')[0].trim()}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Ir a buscar a Álex al bosque', at: lineStart(1), icon: 'road'},
					{key: 'B', text: 'Quedarse con Tomás y Samuel', at: lineStart(2), icon: 'question'},
				]}
				ctaAt={lineStart(3)}
				ctaText="COMENTA  A  o  B"
				subscribeAt={cue('bell') - 9}
			/>
		</AbsoluteFill>
	);
};

export const LN6: EpisodeDef = {
	slug: 'ln6',
	timelines: {es: tlEs as unknown as Timeline},
	scenes: {
		hook: {C: Hook, vignette: 0.8},
		cta: {C: CTA, vignette: 0.7},
		truth: {C: Truth, vignette: 0.8},
		flashback: {C: Flashback, fadeIn: 10, fadeOut: 10, vignette: 0.8},
		why: {C: Why, vignette: 0.85},
		missing: {C: Missing, vignette: 0.8},
		second: {C: Second, vignette: 0.85},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
