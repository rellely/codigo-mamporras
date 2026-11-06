import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character, Pose} from '../components/Character';
import {Fog} from '../components/env/Nature';
import {Stage} from '../components/Stage';
import {kf, rand} from '../lib/anim';
import {useScene} from '../lib/timeline';

/** Series end card: title, part label and a background figure. */
export const SeriesEnd: React.FC<{title: string; part: string; next?: string; figure?: Pose; warm?: boolean}> = ({title, part, next, figure, warm}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {dur} = useScene();
	const s = spring({frame: frame - 2, fps, config: {damping: 10, stiffness: 120}});
	const flicker = !warm && rand(Math.floor(frame / 2), 3) > 0.9 ? 0.4 : 1;
	const accent = warm ? '#ffcf5a' : '#ff2d3a';
	const long = title.length > 9;
	return (
		<AbsoluteFill style={{background: warm ? '#0a0806' : '#030308'}}>
			<Stage cam={{x: 540, y: 960 - frame * 0.4, z: 1 + frame * 0.002, r: 0}} bg="transparent">
				<g opacity={kf(frame, [[0, 0], [30, 0.6]])}>
					<Character id="sixth" x={540} y={1650} scale={2.2} pose={figure ?? {silhouette: '#0e0e18', glowEyes: 1, eyeOpen: kf(frame, [[20, 0.05], [30, 1]]), headTilt: -8}} />
				</g>
				<Fog y={1500} color={warm ? '#a08a60' : '#6a7090'} opacity={0.35} speed={1.2} />
			</Stage>
			<AbsoluteFill style={{alignItems: 'center', top: 300}}>
				<div
					style={{
						fontFamily: 'InterBlack',
						fontSize: long ? 104 : 150,
						color: '#fff',
						letterSpacing: long ? kf(frame, [[0, 16], [dur, 2]]) : kf(frame, [[0, 40], [dur, 6]]),
						transform: `scale(${0.6 + 0.4 * s})`,
						opacity: s * flicker,
						WebkitTextStroke: '10px #000',
						paintOrder: 'stroke fill',
						textShadow: `0 0 40px ${accent}aa`,
						whiteSpace: 'nowrap',
					}}
				>
					{title}
				</div>
				<div style={{width: kf(frame, [[8, 0], [26, 620]]), height: 12, background: accent, borderRadius: 6, marginTop: 10}} />
				<div style={{marginTop: 26, fontFamily: 'InterBlack', fontSize: 54, color: accent, opacity: kf(frame, [[10, 0], [24, 1]]), letterSpacing: 4, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>
					{part}
				</div>
				{next && (
					<div style={{marginTop: 40, fontFamily: 'InterBlack', fontSize: 40, color: '#ddd', opacity: kf(frame, [[30, 0], [44, 0.9]]), letterSpacing: 2}}>
						{next}
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
