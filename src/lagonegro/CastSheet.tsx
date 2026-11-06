import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, CharId, SharedDefs, walkPose} from '../components/Character';

export const LN_CAST: CharId[] = ['mateo', 'lucia', 'carlos', 'vera', 'alex', 'bea'];

/** Model sheet for the LAGO NEGRO cast (design consistency reference). */
export const CastSheet: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#3b4250'}}>
			<svg viewBox="0 0 1080 1920" width="100%" height="100%">
				<SharedDefs />
				{LN_CAST.map((id, i) => (
					<Character key={id} id={id} x={110 + i * 172} y={560} scale={0.9} pose={{mouth: 'smile'}} />
				))}
				{LN_CAST.map((id, i) => (
					<Character key={id + 'w'} id={id} x={110 + i * 172} y={960} scale={0.9} pose={{...walkPose(f, 0.3, i), turn: 0.6, mouth: i % 2 ? 'open' : 'worried', brows: 'worried', item: i === 2 ? 'flashlight' : i === 0 ? 'walkie' : null}} />
				))}
				<Character id="masked" x={300} y={1820} scale={1.35} pose={{item: 'hook', armR: [10, -10], glowEyes: 0}} />
				<Character id="masked" x={760} y={1820} scale={1.35} pose={{...walkPose(f, 0.18, 0, 0.5), turn: -0.4, item: 'hook', glowEyes: 1, headTilt: 10}} />
			</svg>
		</AbsoluteFill>
	);
};
