import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CampNight, headOf, ORDER, SEATS} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {Stage, talkMouth} from '../components/Stage';
import {EASE, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** "Who are you?" — "I've always been here." */
export const S07Talk: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart, lineEnd, scene, f} = useScene();
	const l1 = lineStart(1);
	const l2 = lineStart(2);
	const marta = headOf('marta');
	const sixth = headOf('sixth');
	const whip = (x: number) => x; // linear for whip pans
	const cam = useCam(
		[
			{f: 0, x: marta.x + 60, y: marta.y + 70, z: 2.25},
			{f: l1 - 8, x: marta.x + 80, y: marta.y + 70, z: 2.4},
			{f: l1 + 2, x: sixth.x - 60, y: sixth.y + 70, z: 2.4, ease: EASE},
			{f: l2 - 10, x: sixth.x - 70, y: sixth.y + 60, z: 2.7},
			{f: l2 + 4, x: 540, y: 1110, z: 1.05, ease: EASE},
			{f: dur, x: 600, y: 1080, z: 1.22},
		],
		3,
	);
	void whip;
	const knowWord = scene.lines[2].words[scene.lines[2].words.length - 1];
	const knew = frame >= f(knowWord.start);
	const dart = (seed: number) => Math.sin(frame / 7 + seed) > 0 ? 1 : -1;
	const poses: Partial<Record<CharId, Pose>> = {
		marta: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'worried'), brows: 'worried', lookX: frame < l2 ? 1 : dart(1), tremble: 1},
		sixth: {
			mouth: talkMouth(frame, l1, lineEnd(1), 'creepy', ['creepy', 'o', 'creepy', 'flat']),
			headTilt: kf(frame, [[l1, 0], [l1 + 20, -12], [l2 + 40, 6]]),
			lookX: frame < l2 ? -1 : knew ? 0 : -0.5,
		},
	};
	(['leo', 'dani', 'sara', 'iker'] as CharId[]).forEach((id, i) => {
		poses[id] = {mouth: 'worried', brows: 'worried', lookX: frame < l2 ? 1 : dart(i * 2.3), tremble: 0.6};
	});
	return (
		<Stage cam={cam}>
			<CampNight
				present={ORDER}
				poses={poses}
				extraLights={[{x: SEATS.sixth.x, y: sixth.y + 80, r: 200, color: '#ffb070', glow: 0.6}]}
			/>
		</Stage>
	);
};
