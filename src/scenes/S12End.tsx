import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from '../components/Character';
import {Fog} from '../components/env/Nature';
import {Stage} from '../components/Stage';
import {kf, rand} from '../lib/anim';
import {useScene} from '../lib/timeline';

/** End card: title + call to action. */
export const S12End: React.FC<{title: string}> = ({title}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {dur} = useScene();
	const s = spring({frame: frame - 2, fps, config: {damping: 10, stiffness: 120}});
	const flicker = rand(Math.floor(frame / 2), 3) > 0.9 ? 0.4 : 1;
	return (
		<AbsoluteFill style={{background: '#030308'}}>
			<Stage cam={{x: 540, y: 960 - frame * 0.4, z: 1 + frame * 0.002, r: 0}} bg="#030308">
				<g opacity={kf(frame, [[0, 0], [30, 0.55]])}>
					<Character id="sixth" x={540} y={1650} scale={2.2} pose={{silhouette: '#0e0e18', glowEyes: 1, eyeOpen: kf(frame, [[20, 0.05], [30, 1]]), headTilt: -8}} />
				</g>
				<Fog y={1500} color="#6a7090" opacity={0.35} speed={1.2} />
			</Stage>
			<AbsoluteFill style={{alignItems: 'center', top: 330}}>
				<div
					style={{
						fontFamily: 'InterBlack',
						fontSize: 150,
						color: '#fff',
						letterSpacing: kf(frame, [[0, 40], [dur, 6]]),
						transform: `scale(${0.6 + 0.4 * s})`,
						opacity: s * flicker,
						WebkitTextStroke: '10px #000',
						paintOrder: 'stroke fill',
						textShadow: '0 0 40px rgba(255,45,58,0.75)',
						whiteSpace: 'nowrap',
					}}
				>
					{title}
				</div>
				<div style={{width: kf(frame, [[8, 0], [26, 620]]), height: 12, background: '#ff2d3a', borderRadius: 6, marginTop: 10}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
