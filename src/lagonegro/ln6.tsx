import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Character, CharId, Pose, walkPose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash, Glitch} from '../components/Overlays';
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
const OTHER = {x: -760, y: 1400, s: 0.85};
const OTHER_HEAD = {x: OTHER.x, y: OTHER.y - 255 * OTHER.s};

/** The five who got out (Álex was driving — and is about to go missing). */
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
/** The new Guarda — with Álex's red cap peeking out under the hood. */
const NewGuarda: React.FC<{seen: number; cap?: number}> = ({seen, cap = 0}) => (
	<g opacity={0.35 + 0.65 * seen}>
		<Character id="masked" x={OTHER.x} y={OTHER.y} scale={OTHER.s} pose={{item: 'hook', armR: [12, -10], glowEyes: 0.3 + 0.7 * seen, headTilt: 14, turn: 0.4}} />
		{cap > 0 && (
			<g opacity={cap} transform={`translate(${OTHER_HEAD.x + 8} ${OTHER_HEAD.y - 48}) rotate(14)`}>
				<path d="M -40 0 Q -36 -16 0 -18 Q 36 -16 40 0 Z" fill="#d63a3a" />
				<path d="M 18 -2 Q 50 -6 62 6 Q 44 10 18 4 Z" fill="#8a1f1f" />
			</g>
		)}
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

/* 3 ─ TRUTH (Tomás's version): "His name is Samuel. He's my son." */
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
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.8} lights={[headlights, {...tomasLight, r: 320}]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'worried', lookX: -1}} />
				<Group pose={() => ({lookX: -1})} />
				<Tomas beam={0.4} pose={{armR: [20, -10], mouth: talkMouth(frame, lineStart(0), lineEnd(1), 'flat', ['o', 'flat', 'open', 'flat']), brows: 'worried', lookY: 0.3}} />
				<Samuel pose={{headTilt: frame > toSam ? 12 : 0, lookY: 0.8, eyeOpen: 0.7}} />
			</RoadNight>
		</Stage>
	);
};

/* Dock flashback shared by the told version (sepia) and the real one (red). */
const BOY = {colors: {jacket: '#d9b32a', jacketDark: '#a8861a', accent: '#d9b32a', hair: '#3a2a1a', skin: '#f0c8a0'}};
const TEEN1 = {colors: {jacket: '#7a6a6a', jacketDark: '#5a4a4a', hair: '#6a4a2a'}};
const TEEN2 = {colors: {jacket: '#5a6a7a', jacketDark: '#3a4a5a', accent: '#6a6a6a'}};
const YOUNG_TOMAS = {colors: {hair: '#5a3a22', skin: '#f0c49a'}};

const Dock1996: React.FC<{mode: 'told' | 'real'; fall: number; tomasAt: number; teensFade?: number}> = ({mode, fall, tomasAt, teensFade = 1}) => {
	const frame = useCurrentFrame();
	const end = dockAt(0.95);
	const near = dockAt(0.8);
	const behind = dockAt(0.9);
	const water = end.y + 6;
	const boyY = kf(frame, [[fall, end.y], [fall + 8, end.y + 50]], (x) => x);
	const inWater = frame > fall + 8;
	const real = mode === 'real';
	// real: Tomás walks up behind the boy and pushes; told: Tomás runs in afterwards to rescue
	const tomasT = real ? kf(frame, [[0, 0.6], [fall - 4, 0.9]], (x) => x) : kf(frame, [[tomasAt - 20, 0.05], [tomasAt + 30, 0.88]], (x) => x);
	const tp = dockAt(tomasT);
	const showTomas = real || frame > tomasAt - 20;
	const laughing = !real && frame > fall;
	const horrified = real && frame > fall;
	return (
		<LakeView time="sunset" fog={0.1} canoe={false}>
			<defs>
				<clipPath id={`fb${mode}`}>
					<rect x={-500} y={-500} width={3000} height={water + 500} />
				</clipPath>
			</defs>
			<g clipPath={`url(#fb${mode})`}>
				<Character id="mateo" x={end.cx + (inWater ? 60 : 30)} y={inWater ? water + 60 + Math.sin(frame / 4) * 6 : boyY} scale={end.s * 1.25} pose={{...BOY, armL: inWater ? [-170, 0] : [-12, 4], armR: inWater ? [170, 0] : [12, -4], mouth: inWater ? 'open' : 'smile', brows: inWater ? 'worried' : 'neutral', lean: frame > fall ? 30 : 0}} />
			</g>
			{inWater &&
				[0, 1].map((k) => {
					const tt = ((frame - fall - k * 15) % 40) / 40;
					return <ellipse key={k} cx={end.cx + 60} cy={water} rx={10 + tt * 60} ry={3 + tt * 10} fill="none" stroke="#fff0d0" strokeWidth={2} opacity={1 - tt} />;
				})}
			<g opacity={teensFade}>
				<Character id="vera" x={near.cx - 75} y={near.y} scale={near.s * 1.25} pose={{...TEEN1, mouth: laughing ? 'grin' : horrified ? 'open' : 'smile', brows: horrified ? 'worried' : 'neutral', armR: laughing ? [100, -20] : horrified ? [150, 20] : undefined, headTilt: laughing ? Math.sin(frame / 3) * 6 : 0, lookX: 1, tremble: horrified ? 1.5 : 0}} />
				<Character id="alex" x={near.cx - 15} y={near.y + 6} scale={near.s * 1.25} pose={{...TEEN2, mouth: laughing ? 'grin' : horrified ? 'open' : 'smile', brows: horrified ? 'worried' : 'neutral', armL: laughing ? [-30, -80] : horrified ? [-150, -20] : undefined, headTilt: laughing ? -Math.sin(frame / 3) * 6 : 0, lookX: 1, tremble: horrified ? 1.5 : 0}} />
			</g>
			{showTomas && (
				<Character
					id="tomas"
					x={real ? behind.cx + 10 : tp.cx}
					y={real ? Math.min(tp.y, behind.y) : tp.y}
					scale={(real ? behind.s : tp.s) * 1.25}
					pose={{...YOUNG_TOMAS, ...(real ? (frame < fall - 4 ? walkPose(frame, 0.3, 0, 0.6) : {}) : walkPose(frame, 0.6, 0, tomasT < 0.88 ? 1.2 : 0)), back: !real, turn: real ? 0.4 : 0, armR: real && frame > fall - 6 ? [120, -10] : undefined, armL: !real && tomasT >= 0.88 ? [-120, 0] : undefined, mouth: real ? 'flat' : 'open', brows: real ? 'angry' : 'worried'}}
				/>
			)}
		</LakeView>
	);
};

/* 4 ─ TOLD: Tomás's version — the counsellors laughed, he saved him */
const Told: React.FC = () => {
	const {cue, lineStart, dur} = useScene();
	const fall = cue('splash') - 8;
	const cam = useCam([
		{f: 0, x: 680, y: 1180, z: 1.6},
		{f: fall + 10, x: 700, y: 1130, z: 1.9},
		{f: dur, x: 690, y: 1200, z: 1.5},
	], 1.5);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.75) contrast(1.05) brightness(1.08)'}}>
				<Stage cam={cam}>
					<Dock1996 mode="told" fall={fall} tomasAt={lineStart(1)} />
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{border: '30px solid rgba(20,12,4,0.5)', boxSizing: 'border-box'}} />
		</AbsoluteFill>
	);
};

/* 5 ─ SIGNAL: Samuel shakes his head and points the hook at his father */
const Signal: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const raise = cue('raise');
	const point = kf(frame, [[raise, 0], [raise + 14, 1]], EASE);
	const shake = frame < raise ? Math.sin(frame / 3) * 10 : 0;
	const cam = useCam([
		{f: 0, x: SAM_HEAD.x - 20, y: SAM_HEAD.y + 60, z: 2.6},
		{f: raise - 4, x: SAM_HEAD.x - 30, y: SAM_HEAD.y + 70, z: 2.5},
		{f: raise + 12, x: 430, y: 1430, z: 0.74, ease: EASE},
		{f: lineStart(2) - 6, x: 430, y: 1430, z: 0.76},
		{f: lineStart(2) + 6, x: 300, y: GROUP_Y - 220, z: 2.2, ease: EASE},
		{f: dur, x: 320, y: GROUP_Y - 220, z: 2.3},
	], 2);
	return (
		<Stage cam={cam}>
			<RoadNight scroll={0} darkness={0.8} lights={[headlights, tomasLight]}>
				<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId="alex" driver={{mouth: 'worried', lookX: 1}} />
				<Group pose={(id) => ({lookX: 1, mouth: id === 'bea' ? talkMouth(frame, lineStart(2), lineEnd(2), 'open') : frame > raise ? 'open' : 'worried', tremble: frame > raise ? 1 : 0})} />
				<Tomas beam={0.4} pose={{armR: [20, -10], mouth: 'flat', brows: frame > raise ? 'angry' : 'neutral'}} />
				<Samuel pose={{headTilt: shake, armR: [10 + (-115 - 10) * point, -10 + 10 * point], lookY: 0.2, turn: -0.6}} />
			</RoadNight>
		</Stage>
	);
};

/* 6 ─ LIE: what really happened in 1996 (red flashback) */
const Lie: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, dur} = useScene();
	const fall = cue('push') - 8;
	const fade = kf(frame, [[lineStart(2), 1], [lineStart(2) + 40, 0]]);
	const cam = useCam([
		{f: 0, x: 680, y: 1150, z: 1.7},
		{f: fall - 10, x: 700, y: 1110, z: 2.1},
		{f: fall + 10, x: 700, y: 1120, z: 2.3},
		{f: dur, x: 680, y: 1160, z: 1.7},
	], frame > fall && frame < fall + 15 ? 6 : 1.5);
	return (
		<AbsoluteFill>
			<Glitch at={0} len={8}>
				<AbsoluteFill style={{filter: 'sepia(0.6) hue-rotate(-35deg) saturate(2.2) contrast(1.15) brightness(0.9)'}}>
					<Stage cam={cam}>
						<Dock1996 mode="real" fall={fall} tomasAt={0} teensFade={fade} />
					</Stage>
				</AbsoluteFill>
			</Glitch>
			<AbsoluteFill style={{border: '30px solid rgba(60,0,0,0.55)', boxSizing: 'border-box'}} />
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 64, letterSpacing: 10, color: '#ff3b30', opacity: kf(frame, [[4, 0], [12, 1], [60, 1], [75, 0]]), WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>LA VERDAD</div>
			<Flash at={fall + 2} len={6} color="#ff2d3a" peak={0.3} />
		</AbsoluteFill>
	);
};

/* 7 ─ COLD: Tomás's mask drops — "Samuel always talked too much." */
const Cold: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const off = frame >= cue('click');
	const cam = useCam([
		{f: 0, x: TOMAS_HEAD.x + 30, y: TOMAS_HEAD.y + 70, z: 2.4},
		{f: dur, x: TOMAS_HEAD.x + 10, y: TOMAS_HEAD.y + 40, z: 3.3},
	], 1.5);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight scroll={0} darkness={0.86} lights={[headlights, ...(off ? [{x: TOMAS.x, y: TOMAS.y - 120, r: 230, color: '#ff2a1a', glow: 0.7}] : [tomasLight])]}>
					<Group pose={() => ({lookX: -1, mouth: 'open', tremble: 1.2})} />
					<Tomas
						beam={off ? 0 : 0.5}
						pose={{
							armR: off ? [12, -4] : [20, -10],
							item: off ? null : 'flashlight',
							mouth: talkMouth(frame, lineStart(0), lineEnd(0), off ? 'creepy' : 'flat', ['flat', 'o', 'flat']),
							brows: 'angry',
							lookX: 0,
							headTilt: off ? -6 : 0,
						}}
					/>
				</RoadNight>
			</Stage>
			<Flash at={cue('sting')} len={6} color="#ff2d3a" peak={0.3} />
		</>
	);
};

/* 8 ─ MISSING: where is Álex? The driver's seat is empty */
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
				<RoadNight scroll={0} darkness={0.82} lights={[headlights, {x: TOMAS.x, y: TOMAS.y - 120, r: 230, color: '#ff2a1a', glow: 0.5}, {x: cab.x, y: cab.y, r: 200, color: '#9fc0ff', glow: 0.35}]}>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId={null} />
					<Group pose={(id) => ({lookX: id === 'carlos' ? 0 : -0.6, mouth: id === 'carlos' ? talkMouth(frame, lineStart(0), lineEnd(0), 'open') : frame > lineStart(1) ? 'open' : 'worried', tremble: frame > sting ? 1.5 : 0})} />
					<Tomas beam={0} pose={{armR: [12, -4], item: null, mouth: 'creepy', brows: 'angry'}} />
					<Samuel />
				</RoadNight>
			</Stage>
			<Flash at={sting} len={6} color="#ffffff" peak={0.3} />
		</>
	);
};

/* 9 ─ SECOND: "That's my new Guarda" — and a red cap under the hood */
const Second: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, lineStart, lineEnd, dur} = useScene();
	const boom = cue('boom');
	const sting = cue('sting');
	const seen = kf(frame, [[lineStart(0) + 30, 0], [lineStart(0) + 50, 1]]);
	const cap = kf(frame, [[lineStart(2) + 20, 0], [sting, 1]]);
	const cam = useCam([
		{f: 0, x: TOMAS.x + 100, y: 1300, z: 1.2},
		{f: lineStart(0) + 50, x: OTHER.x + 160, y: OTHER.y - 220, z: 1.8, ease: EASE},
		{f: lineStart(1) - 4, x: OTHER.x + 220, y: OTHER.y - 200, z: 1.5},
		{f: lineStart(1) + 8, x: TOMAS_HEAD.x + 20, y: TOMAS_HEAD.y + 50, z: 2.6, ease: EASE},
		{f: lineEnd(1) + 6, x: TOMAS_HEAD.x + 20, y: TOMAS_HEAD.y + 50, z: 2.7},
		{f: lineStart(2) + 10, x: OTHER_HEAD.x + 10, y: OTHER_HEAD.y + 10, z: 2.8, ease: EASE},
		{f: sting - 2, x: OTHER_HEAD.x + 10, y: OTHER_HEAD.y - 10, z: 3.0},
		{f: sting + 6, x: OTHER_HEAD.x + 14, y: OTHER_HEAD.y - 30, z: 4.2, ease: EASE_OUT},
		{f: dur, x: OTHER_HEAD.x + 14, y: OTHER_HEAD.y - 30, z: 4.4},
	], frame > sting ? 6 : 2);
	return (
		<>
			<Stage cam={cam}>
				<RoadNight
					scroll={0}
					darkness={0.82}
					lights={[headlights, {x: TOMAS.x, y: TOMAS.y - 120, r: 230, color: '#ff2a1a', glow: 0.6}, {x: OTHER.x, y: OTHER.y - 220, r: 260 * Math.max(0.4, seen), color: '#ffb070', glow: 0.45}]}
				>
					<Pickup x={TRUCK.x} y={TRUCK.y} s={TRUCK.s} wheel={0} driverId={null} />
					<Group pose={() => ({lookX: -1, mouth: seen > 0.5 ? 'open' : 'worried', tremble: seen > 0.5 ? 1.5 : 0.5})} />
					<Tomas beam={0} pose={{turn: -0.3, lookX: -0.4, item: null, armL: frame > lineStart(1) ? [-110, 0] : undefined, mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'creepy', ['o', 'creepy', 'flat']), brows: 'angry'}} />
					<Samuel pose={{lookX: -1, turn: -0.6, brows: 'worried'}} />
					<NewGuarda seen={seen} cap={cap} />
				</RoadNight>
			</Stage>
			<Flash at={boom} len={6} color="#ff2d3a" peak={0.3} />
			<Flash at={sting} len={8} color="#ff2d3a" peak={0.35} />
		</>
	);
};

/* 10 ─ CHOICE */
const Choice: React.FC<{title: string; part: string}> = ({title, part}) => {
	const frame = useCurrentFrame();
	const {lineStart, cue, dur} = useScene();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.7) brightness(0.65) contrast(1.15)'}}>
				<Stage cam={{x: OTHER.x + 330, y: OTHER.y - 260, z: kf(frame, [[0, 1.6], [dur, 1.8]], (x) => x), r: 0}}>
					<RoadNight scroll={0} darkness={0.75} lights={[{x: TOMAS.x, y: TOMAS.y - 120, r: 230, color: '#ff2a1a', glow: 0.6}, {x: OTHER.x, y: OTHER.y - 220, r: 260, color: '#ffb070', glow: 0.5}]}>
						<Tomas beam={0} pose={{turn: -0.3, lookX: -0.4, item: null, armL: [-110, 0], mouth: 'creepy', brows: 'angry'}} />
						<NewGuarda seen={1} cap={1} />
					</RoadNight>
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75))'}} />
			<ChoiceCard
				title={title}
				chapter={part.split('·')[0].trim()}
				question="¿QUÉ HACEN?"
				options={[
					{key: 'A', text: 'Ayudar a Samuel contra Tomás', at: lineStart(1), icon: 'hook'},
					{key: 'B', text: 'Correr hacia Álex y quitarle la máscara', at: lineStart(2), icon: 'mask'},
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
		told: {C: Told, fadeIn: 10, fadeOut: 10, vignette: 0.8},
		signal: {C: Signal, vignette: 0.8},
		lie: {C: Lie, fadeOut: 10, vignette: 0.85},
		cold: {C: Cold, vignette: 0.9},
		missing: {C: Missing, vignette: 0.8},
		second: {C: Second, vignette: 0.85},
		choice: {C: Choice, fadeOut: 12, vignette: 0.5},
	},
};
