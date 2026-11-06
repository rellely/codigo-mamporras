import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Character, CharId, Pose} from '../components/Character';
import {Campfire, Darkness, Log, useFlicker} from '../components/env/Camp';
import {Forest, Ground, Moon, RockWall, Sky, Stars} from '../components/env/Nature';
import {Stage} from '../components/Stage';
import {EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

const ROW: {id: CharId; x: number}[] = [
	{id: 'leo', x: 100},
	{id: 'marta', x: 278},
	{id: 'dani', x: 456},
	{id: 'sara', x: 634},
	{id: 'iker', x: 812},
	{id: 'sixth', x: 990},
];
const Y = 1790;
const S = 1.25;

/** HOOK: six backs around the fire. The sixth one turns. */
export const S01Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const turn = cue('turn');
	const flick = useFlicker(0.12);
	const headY = Y - 222 * S;
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1380, z: 1.3},
			{f: turn - 2, x: 620, y: 1400, z: 1.42},
			{f: turn + 7, x: 990, y: headY + 40, z: 2.3, ease: EASE_OUT},
			{f: dur, x: 990, y: headY + 30, z: 2.45},
		],
		frame > turn ? 9 : 3,
	);
	const turned = kf(frame, [[turn - 4, 0], [turn + 4, 1]]);
	const rim = (id: CharId, x: number, pose: Pose) => (
		<g key={id}>
			<g transform={`translate(${x} ${Y - 8})`}>
				<Character id={id} x={0} y={0} scale={S * 1.025} pose={{...pose, silhouette: '#ff9b4a'}} opacity={0.75 * flick} />
			</g>
			<Character id={id} x={x} y={Y} scale={S} pose={{...pose, silhouette: '#0a0810'}} />
		</g>
	);
	return (
		<Stage cam={cam}>
			<Sky stops={[[0, '#05060f'], [0.5, '#0d1030'], [0.62, '#1b1d45'], [1, '#1b1d45']]} />
			<Stars count={140} top={-600} bottom={620} seed={3} />
			<Moon x={250} y={260} r={50} />
			<Forest count={22} y={640} hMin={260} hMax={420} color="#0c1424" seed={11} />
			<RockWall y={560} base={1185} color="#5d5566" shade="#3f3848" light="#7a7186" />
			<Ground y={1185} top="#2f2a2a" bottom="#1d1a1c" />
			<Campfire x={540} y={1330} s={0.85} intensity={1} />
			<Darkness opacity={0.9} lights={[{x: 540, y: 1220, r: 520 * flick, rx: 640 * flick}]} />
			{ROW.map(({id, x}) => {
				const isSixth = id === 'sixth';
				const pose: Pose = {
					sit: true,
					back: true,
					headTilt: isSixth ? -14 * turned : Math.sin(frame / 30 + x) * 3,
					glowEyes: isSixth ? turned : 0,
					lookX: isSixth ? -0.3 : 0,
				};
				return rim(id, x, pose);
			})}
			<Log x={540} y={Y - 10} w={1300} color="#120c0a" />
		</Stage>
	);
};
