import React from 'react';
import {useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CampNight, headOf, ORDER} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {Stage} from '../components/Stage';
import {kf, rand} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** The wind kills the fire. Darkness. Eyes. */
export const S09Blackout: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const out = cue('out');
	const eyesAt = cue('eyes');
	const wind = kf(frame, [[0, 0.1], [out - 10, 1], [out + 20, 0.3]]);
	const fire = kf(frame, [[0, 1], [out - 14, 0.75], [out, 0]]);
	const dark = kf(frame, [[out - 6, 0.85], [out + 2, 0.985]]);
	const sixth = headOf('sixth');
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1150, z: 1.15},
			{f: out, x: 540, y: 1160, z: 1.0},
			{f: eyesAt, x: 560, y: 1080, z: 1.05},
			{f: dur, x: sixth.x, y: sixth.y - 6, z: 7.5},
		],
		frame < out ? 5 * wind : 2,
	);
	const poses: Partial<Record<CharId, Pose>> = {};
	ORDER.forEach((id) => {
		poses[id] = id === 'sixth' ? {mouth: 'creepy', lookX: 0} : {mouth: 'open', brows: 'worried', tremble: 2, lookX: -0.4, lookY: -0.6};
	});
	const leaves = new Array(26).fill(0).map((_, i) => {
		const sp = 18 + rand(i, 1) * 22;
		const x = ((frame * sp * wind + rand(i, 2) * 2000) % 1800) - 400;
		const y = 600 + rand(i, 3) * 1100 + noise2D('lf' + i, frame * 0.05, 0) * 60;
		return <ellipse key={i} cx={x} cy={y} rx={12} ry={5} fill={i % 2 ? '#6a4a2a' : '#4a5a2a'} transform={`rotate(${frame * 12 + i * 40} ${x} ${y})`} opacity={wind} />;
	});
	const eyesVisible = frame > out + 8;
	return (
		<Stage cam={cam}>
			<CampNight present={ORDER} poses={poses} fire={fire} wind={wind} darkness={dark} smoke={kf(frame, [[out, 0], [out + 6, 1], [dur, 0.4]])} fireflies={0} over={<g>{leaves}</g>} />
			{eyesVisible &&
				ORDER.filter((id) => id !== 'sixth').map((id, i) => {
					const h = headOf(id);
					const b = (frame + i * 13) % 50 < 3 ? 0.1 : 1;
					return (
						<g key={id} opacity={kf(frame, [[out + 8, 0], [out + 20, 0.9], [eyesAt + 10, 0.9], [eyesAt + 20, 0.25]])}>
							{[-1, 1].map((s) => (
								<ellipse key={s} cx={h.x + s * 22} cy={h.y - 6} rx={13} ry={16 * b} fill="#f3f3f3" />
							))}
						</g>
					);
				})}
			{frame >= eyesAt - 2 && (
				<g opacity={kf(frame, [[eyesAt - 2, 0], [eyesAt + 2, 1]])}>
					{[-1, 1].map((s) => (
						<g key={s}>
							<circle cx={sixth.x + s * 22} cy={sixth.y - 6} r={34} fill="url(#eyeglow)" />
							<ellipse cx={sixth.x + s * 22} cy={sixth.y - 6} rx={12} ry={kf(frame, [[eyesAt - 2, 1], [eyesAt + 4, 15]])} fill="#f6fbff" />
							<circle cx={sixth.x + s * 22} cy={sixth.y - 6} r={3.5} fill="#000" />
						</g>
					))}
				</g>
			)}
		</Stage>
	);
};
