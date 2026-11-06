import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Badge} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {DawnSet, dawnHead, FRIENDS} from '../components/DawnSet';
import {Stage} from '../components/Stage';
import {kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** Morning: they count again. Five. Relief. */
export const S10Dawn: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart} = useScene();
	const relief = cue('relief');
	const countStart = lineStart(0) + 30;
	const step = (relief - countStart) / 5;
	const cam = useCam([
		{f: 0, x: 540, y: 1180, z: 1.12},
		{f: dur, x: 540, y: 1130, z: 1.0},
	], 2);
	const relieved = frame >= relief;
	const stretch = kf(frame, [[0, 1], [25, 0]]);
	const poses: Partial<Record<CharId, Pose>> = {};
	FRIENDS.forEach((id, i) => {
		poses[id] = {
			mouth: relieved ? 'grin' : stretch > 0.3 ? 'o' : 'flat',
			brows: relieved ? 'raised' : 'neutral',
			armL: [-12 - 160 * stretch, 4],
			armR: [12 + 160 * stretch, -4],
			lookX: relieved ? Math.sin(i * 2) : 0,
			bob: relieved ? Math.sin(frame / 4 + i) * 3 : 0,
		};
	});
	return (
		<Stage cam={cam}>
			<DawnSet
				poses={poses}
				shadowOpacity={0.16}
				over={
					<g>
						{FRIENDS.map((id, i) => {
							const h = dawnHead(id);
							return <Badge key={id} x={h.x} y={h.y - 120} n={i + 1} p={pop(frame, countStart + step * i) * kf(frame, [[dur - 15, 1], [dur - 5, 0]])} color={i === 4 ? '#7CFF8A' : '#fff'} />;
						})}
					</g>
				}
			/>
		</Stage>
	);
};
