import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, kf, shake} from './anim';

export type CamKey = {f: number; x: number; y: number; z: number; r?: number; ease?: (t: number) => number};

/** Virtual camera: (x,y) is the world point at the frame centre, z is zoom. */
export const useCam = (keys: CamKey[], shakeAmt = 0, frameOverride?: number) => {
	const cur = useCurrentFrame();
	const frame = frameOverride ?? cur;
	const pick = (k: 'x' | 'y' | 'z' | 'r') => {
		// segment-wise easing: use the easing of the destination key
		let i = 0;
		while (i < keys.length - 1 && frame > keys[i + 1].f) i++;
		if (frame <= keys[0].f) return keys[0][k] ?? 0;
		if (i >= keys.length - 1) return keys[keys.length - 1][k] ?? 0;
		const a = keys[i];
		const b = keys[i + 1];
		return kf(frame, [[a.f, a[k] ?? 0], [b.f, b[k] ?? 0]], b.ease ?? EASE);
	};
	const s = shake(frame, shakeAmt);
	return {x: pick('x') + s.x, y: pick('y') + s.y, z: pick('z'), r: pick('r') + s.r};
};

export const Camera: React.FC<{
	cam: {x: number; y: number; z: number; r: number};
	children: React.ReactNode;
}> = ({cam, children}) => (
	<g transform={`translate(540 960) rotate(${cam.r}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
		{children}
	</g>
);
