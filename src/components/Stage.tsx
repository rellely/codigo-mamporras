import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera} from '../lib/Camera';
import {SharedDefs} from './Character';

/** Full-frame SVG stage with a virtual camera. */
export const Stage: React.FC<{
	cam: {x: number; y: number; z: number; r: number};
	children: React.ReactNode;
	bg?: string;
	style?: React.CSSProperties;
}> = ({cam, children, bg = '#000', style}) => (
	<AbsoluteFill style={{background: bg, ...style}}>
		<svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
			<SharedDefs />
			<Camera cam={cam}>{children}</Camera>
		</svg>
	</AbsoluteFill>
);

/** Mouth flap while a line is being spoken. */
export const talkMouth = (frame: number, start: number, end: number, rest: any = 'flat', shapes: any[] = ['open', 'o', 'flat', 'open']) => {
	if (frame < start || frame > end) return rest;
	return shapes[Math.floor((frame - start) / 3.2) % shapes.length];
};

/** Angle (deg, Character convention: 0 = down, +90 = right) from a to b. */
export const aimAngle = (ax: number, ay: number, bx: number, by: number) => (Math.atan2(bx - ax, by - ay) * 180) / Math.PI;
