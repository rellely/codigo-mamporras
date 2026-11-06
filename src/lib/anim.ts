import {Easing, interpolate, spring} from 'remotion';
import {noise2D} from '@remotion/noise';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** Keyframed value. keys = [[frame, value], ...] with non-decreasing frames. */
export const kf = (frame: number, keys: [number, number][], easing = EASE): number => {
	if (frame <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [x0, y0] = keys[i];
		const [x1, y1] = keys[i + 1];
		if (frame <= x1) {
			const t = x1 === x0 ? 1 : (frame - x0) / (x1 - x0);
			return y0 + (y1 - y0) * easing(Math.min(1, Math.max(0, t)));
		}
	}
	return keys[keys.length - 1][1];
};

export const lin = (frame: number, a: number, b: number, from = 0, to = 1) =>
	interpolate(frame, [a, b], [from, to], clamp);

export const pop = (frame: number, at: number, fps = 30, damping = 11) =>
	spring({frame: frame - at, fps, config: {damping, stiffness: 170, mass: 0.6}});

export const n1 = (seed: string | number, t: number) => noise2D(String(seed), t, 0);

/** Smooth hand-held camera shake. */
export const shake = (frame: number, amount: number, speed = 0.04, seed = 'cam') => ({
	x: noise2D(seed + 'x', frame * speed, 0) * amount,
	y: noise2D(seed + 'y', frame * speed, 0) * amount,
	r: noise2D(seed + 'r', frame * speed, 0) * amount * 0.02,
});

/** Deterministic pseudo random in [0,1). */
export const rand = (i: number, salt = 0) => {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
};
