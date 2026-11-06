import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Badge, CampNight, CHAR_SCALE, headOf, ORDER, SEATS} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {Flash} from '../components/Overlays';
import {aimAngle, Stage} from '../components/Stage';
import {EASE_OUT, kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** Leo counts them one by one... six. */
export const S06Count: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const cs = [1, 2, 3, 4, 5, 6].map((i) => cue('c' + i));
	const idx = cs.filter((c) => frame >= c - 3).length - 1; // current target
	const target: CharId | null = idx >= 0 ? ORDER[idx] : null;
	const leo = SEATS.leo;
	const sh = {x: leo.x + 40 * CHAR_SCALE, y: leo.y - 177 * CHAR_SCALE};
	const counted = frame >= cs[5];
	const standUp = kf(frame, [[0, 0], [24, 1]]);

	let leoArm: [number, number] = [12, -4];
	if (target === 'leo') leoArm = [-40, -120];
	else if (target) {
		const h = headOf(target);
		leoArm = [aimAngle(sh.x, sh.y, h.x, h.y + 60), 0];
	}
	const focus = target ? headOf(target) : {x: 540, y: 1000};
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1150, z: 1.0},
			{f: cs[0] - 4, x: 420, y: 1060, z: 1.2},
			...cs.slice(1, 5).map((c, i) => ({f: c, x: Math.max(380, headOf(ORDER[i + 1]).x), y: 1060, z: 1.2})),
			{f: cs[5] - 2, x: 860, y: 1050, z: 1.25},
			{f: cs[5] + 6, x: SEATS.sixth.x - 20, y: headOf('sixth').y + 40, z: 2.5, ease: EASE_OUT},
			{f: dur, x: SEATS.sixth.x - 20, y: headOf('sixth').y + 40, z: 2.7},
		],
		counted ? 7 : 2,
	);
	const scared: Pose = {mouth: 'open', brows: 'worried', lookX: 1, tremble: 1.5};
	const poses: Partial<Record<CharId, Pose>> = {
		leo: {armR: leoArm, mouth: counted ? 'open' : 'flat', brows: counted ? 'worried' : 'neutral', lookX: target && target !== 'leo' ? 1 : 0, bob: (1 - standUp) * 30},
		sixth: counted
			? {mouth: 'creepy', headTilt: -12, armR: [150 + Math.sin(frame / 6) * 18, 20], lookX: -0.2}
			: {mouth: 'smile', lookX: -1},
	};
	(['marta', 'dani', 'sara', 'iker'] as CharId[]).forEach((id) => {
		poses[id] = counted ? scared : {mouth: 'smile', lookX: -1, brows: 'neutral'};
	});
	return (
		<>
			<Stage cam={cam}>
				<CampNight
					present={ORDER}
					standing={{leo: true}}
					poses={poses}
					extraLights={counted ? [{x: SEATS.sixth.x, y: headOf('sixth').y + 60, r: 260, color: '#9fc0ff', glow: 0.5}] : []}
					over={
						<g>
							{ORDER.map((id, i) => {
								const h = headOf(id, id === 'leo');
								return <Badge key={id} x={h.x} y={h.y - 120} n={i + 1} p={pop(frame, cs[i] - 2)} color={i === 5 ? '#ff2d3a' : '#fff'} text={i === 5 ? '#fff' : '#111'} />;
							})}
						</g>
					}
				/>
			</Stage>
			<Flash at={cs[5]} len={8} color="#ff2d3a" peak={0.35} />
		</>
	);
};
