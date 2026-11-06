import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Badge} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {DawnSet, DAWN_POS, DAWN_SCALE, FRIENDS, LINE_Y, shadowPoint} from '../components/DawnSet';
import {Flash} from '../components/Overlays';
import {Stage, talkMouth} from '../components/Stage';
import {EASE_OUT, kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

const ALL: CharId[] = ['leo', 'marta', 'dani', 'sara', 'sixth', 'iker'];

/** Twist: five people, six shadows. */
export const S11Twist: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart, lineEnd, scene, f} = useScene();
	const reveal = cue('reveal');
	const eyes = cue('eyes');
	const words = scene.lines[0].words;
	const habia = words.findIndex((w) => /había|were/i.test(w.w));
	const countStart = f(words[Math.max(0, habia)].start) - 18;
	const step = (reveal - countStart) / 6;
	const sHead = (id: CharId) => shadowPoint(DAWN_POS[id], LINE_Y - 255 * DAWN_SCALE);
	const s6 = sHead('sixth');
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1130, z: 1.0},
			{f: 22, x: 540, y: 1100, z: 1.02},
			{f: countStart - 6, x: 540, y: 900, z: 1.12},
			{f: reveal - 2, x: 560, y: 880, z: 1.16},
			{f: reveal + 7, x: s6.x, y: s6.y + 130, z: 1.95, ease: EASE_OUT},
			{f: dur, x: s6.x, y: s6.y + 110, z: 2.25},
		],
		frame > reveal ? 4 : 2,
	);
	const eyesOn = kf(frame, [[eyes, 0], [eyes + 8, 1]]);
	const poses: Partial<Record<CharId, Pose>> = {};
	FRIENDS.forEach((id, i) => {
		poses[id] = {mouth: talkMouth(frame, 0, dur, 'grin', ['grin', 'smile', 'grin', 'o']), lookX: Math.sin(frame / 20 + i * 2), headTilt: Math.sin(frame / 15 + i) * 6, armR: [20 + Math.max(0, Math.sin(frame / 10 + i)) * 40, -20]};
	});
	const sixthShadow: Pose = {
		headTilt: -14 * eyesOn,
		glowEyes: eyesOn,
		armR: [12 + 150 * kf(frame, [[eyes + 10, 0], [eyes + 26, 1]]) + Math.sin(frame / 6) * 12 * eyesOn, 20],
		mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'creepy'),
	};
	return (
		<>
			<Stage cam={cam}>
				<DawnSet
					poses={poses}
					sixthShadow={sixthShadow}
					shadowOpacity={kf(frame, [[0, 0.16], [countStart, 0.6]])}
					over={
						<g>
							{ALL.map((id, i) => {
								const h = sHead(id);
								const p = pop(frame, countStart + step * i) * kf(frame, [[eyes - 6, 1], [eyes + 2, 0]]);
								return <Badge key={id} x={h.x} y={h.y - 130} n={i + 1} p={p} color={i === 5 ? '#ff2d3a' : '#fff'} text={i === 5 ? '#fff' : '#111'} />;
							})}
						</g>
					}
				/>
			</Stage>
			<Flash at={reveal} len={8} color="#ff2d3a" peak={0.3} />
		</>
	);
};
