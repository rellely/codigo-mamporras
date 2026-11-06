import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, Character, CharId, walkPose} from '../components/Character';
import {Badge} from '../components/CampNight';
import {Fireflies, Tent, Tint} from '../components/env/Camp';
import {Forest, Ground, GrassTufts, RockWall, Sky, Stars} from '../components/env/Nature';
import {aimAngle, Stage} from '../components/Stage';
import {kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

export const TENTS: {owner: CharId; x: number; y: number}[] = [
	{owner: 'leo', x: 120, y: 1250},
	{owner: 'marta', x: 320, y: 1215},
	{owner: 'dani', x: 540, y: 1200},
	{owner: 'sara', x: 760, y: 1215},
	{owner: 'iker', x: 960, y: 1250},
];

/** Dusk: five tents are pitched and counted. */
export const S03Tents: React.FC = () => {
	const frame = useCurrentFrame();
	const {scene, cue, dur, f} = useScene();
	const cam = useCam([
		{f: 0, x: 540, y: 1200, z: 0.98},
		{f: dur, x: 545, y: 1170, z: 1.05},
	], 2);
	const pops = [1, 2, 3, 4, 5].map((i) => pop(frame, cue('tent' + i), 30, 9));
	// second count: driven by the word "Sara" onward
	const words = scene.lines[0].words;
	const saraW = words.findIndex((w) => /sara/i.test(w.w));
	const recountStart = f(words[Math.max(0, saraW)].start);
	const recountStep = Math.max(5, (f(scene.lines[0].end) - recountStart) / 6);
	const target = Math.min(4, Math.max(0, Math.floor((frame - recountStart) / recountStep)));
	const sara = {x: 900, y: 1760, s: 1.32};
	const shoulder = {x: sara.x + 40 * sara.s, y: sara.y - 177 * sara.s};
	const t = TENTS[target];
	const aim = frame >= recountStart ? aimAngle(shoulder.x, shoulder.y, t.x, t.y - 120) : 20;
	const aimS = kf(frame, [[recountStart - 8, 20], [recountStart, aim]]);
	const pointA = frame >= recountStart ? aim : aimS;
	return (
		<Stage cam={cam}>
			<Sky stops={[[0, '#141433'], [0.48, '#2a2558'], [0.56, '#7b4d8c'], [0.62, '#d0839a'], [1, '#d0839a']]} />
			<Stars count={60} top={-600} bottom={400} seed={7} opacity={0.6} />
			<Forest count={22} y={640} hMin={260} hMax={420} color="#2a2448" seed={11} />
			<RockWall y={560} base={1185} color="#8a7590" shade="#62506d" light="#a493aa" />
			<Ground y={1185} top="#5d4a55" bottom="#3a2c36" />
			{TENTS.map((tt, i) => (
				<Tent key={i} x={tt.x} y={tt.y} w={230} h={175} color={CAST[tt.owner].jacket} dark={CAST[tt.owner].jacketDark} pop={pops[i]} />
			))}
			<GrassTufts y0={1200} y1={1900} count={50} color="#3b2c3a" seed={6} />
			{/* friends busy in the camp */}
			<Character id="leo" x={250} y={1500} scale={0.82} pose={{armR: [150 + Math.sin(frame / 3) * 30, -20], armL: [-20, 10], mouth: 'smile', lookX: 0.4, lookY: 0.6}} />
			<Character id="marta" x={kf(frame, [[0, -120], [dur, 420]], (x) => x)} y={1430} scale={0.72} pose={{...walkPose(frame, 0.3, 0), turn: 0.6, mouth: 'smile'}} />
			<Character id="dani" x={kf(frame, [[0, -280], [dur, 260]], (x) => x)} y={1440} scale={0.72} pose={{...walkPose(frame, 0.3, 2), turn: 0.6, mouth: 'grin'}} />
			<Character id="iker" x={600} y={1520} scale={0.86} pose={{armL: [-40, 30], armR: [40, -30], mouth: 'grin', headTilt: Math.sin(frame / 20) * 4}} />
			{TENTS.map((tt, i) => {
				const pulse = frame >= recountStart && target === i ? 1 + 0.25 * Math.max(0, 1 - ((frame - recountStart) % recountStep) / recountStep) : 1;
				return <Badge key={i} x={tt.x} y={tt.y - 240} n={i + 1} p={pops[i] * pulse} />;
			})}
			<Character id="sara" x={sara.x} y={sara.y} scale={sara.s} pose={{armR: [pointA, 0], turn: -0.5, lookX: -0.8, lookY: -0.4, mouth: frame >= recountStart ? 'o' : 'smile', brows: 'raised'}} />
			<Fireflies area={[-100, 900, 1280, 700]} opacity={kf(frame, [[0, 0], [60, 0.8]])} />
			<Tint color="#8a6bc9" opacity={0.25} />
		</Stage>
	);
};
