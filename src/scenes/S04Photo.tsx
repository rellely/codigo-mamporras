import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CampNight} from '../components/CampNight';
import {Flash} from '../components/Overlays';
import {Stage} from '../components/Stage';
import {kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** Night falls; Sara takes a group selfie. Five people. */
export const S04Photo: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const flash = cue('flash');
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1330, z: 1.9},
			{f: 70, x: 540, y: 1150, z: 1.02},
			{f: flash, x: 560, y: 1130, z: 1.1},
			{f: dur, x: 560, y: 1130, z: 1.12},
		],
		2,
	);
	const raise = kf(frame, [[30, 0], [55, 1]]);
	const lean = kf(frame, [[40, 0], [65, 1]]);
	const after = frame > flash + 3;
	const smile = after ? 'o' : 'grin';
	return (
		<>
			<Stage cam={cam}>
				<CampNight
					present={['leo', 'marta', 'dani', 'sara', 'iker']}
					poses={{
						leo: {mouth: smile, lean: 6 * lean, armL: [-12 - 150 * lean, -10], lookX: 0.5, blink: after ? 1 : 0},
						marta: {mouth: smile, lean: 9 * lean, headTilt: 8 * lean, lookX: 0.5, blink: after ? 1 : 0},
						dani: {mouth: smile, lean: 6 * lean, lookX: 0.6, blink: after ? 1 : 0},
						sara: {mouth: smile, armR: [12 + 150 * raise, -4], item: 'phone', phoneLit: 0.9, lookX: 0.6, lookY: -0.7, blink: after ? 1 : 0},
						iker: {mouth: smile, lean: -8 * lean, headTilt: -8 * lean, lookX: -0.6, armR: [12 + 120 * lean, -40], blink: after ? 1 : 0},
					}}
				/>
			</Stage>
			<Flash at={flash} len={16} />
		</>
	);
};
