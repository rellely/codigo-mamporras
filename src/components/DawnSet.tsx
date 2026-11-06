import React from 'react';
import {Character, CharId, Pose, CAST} from './Character';
import {Campfire, Dust, Smoke, Tent, Tint} from './env/Camp';
import {Bird, Fog, Forest, Ground, GrassTufts, RockWall, Sky} from './env/Nature';
import {useCurrentFrame} from 'remotion';

export const LINE_Y = 1330;
export const DAWN_SCALE = 0.95;
/** Standing line at dawn. Note the slightly larger gap where nobody stands... */
export const DAWN_POS: Record<CharId, number> = {leo: 130, marta: 290, dani: 450, sara: 615, sixth: 790, iker: 955};
export const FRIENDS: CharId[] = ['leo', 'marta', 'dani', 'sara', 'iker'];
/** Sun behind camera: projection about a far point below the frame. */
export const SUN = {x: 470, y: 2700, k: 1.12};
export const shadowPoint = (x: number, y: number) => ({x: SUN.x + (x - SUN.x) * SUN.k, y: SUN.y + (y - SUN.y) * SUN.k});
export const dawnHead = (id: CharId) => ({x: DAWN_POS[id], y: LINE_Y - 255 * DAWN_SCALE});

export const DawnSet: React.FC<{poses?: Partial<Record<CharId, Pose>>; sixthShadow?: Pose; shadowOpacity?: number; over?: React.ReactNode; sixthShadowOpacity?: number}> = ({
	sixthShadowOpacity = 1,
	poses = {},
	sixthShadow = {},
	shadowOpacity = 0.5,
	over,
}) => {
	const frame = useCurrentFrame();
	return (
		<g>
			<defs>
				<clipPath id="dawnwall">
					<rect x={-800} y={300} width={2700} height={1185 - 300} />
				</clipPath>
			</defs>
			<Sky stops={[[0, '#6f93c9'], [0.45, '#a9b9de'], [0.55, '#f2b9c4'], [0.62, '#ffd9a8'], [1, '#ffd9a8']]} />
			{[0, 1].map((i) => (
				<Bird key={i} x={((frame * (4 + i) + i * 500) % 1700) - 300} y={300 + i * 90} s={0.9} phase={i * 2} color="#3a3550" />
			))}
			<Forest count={22} y={640} hMin={260} hMax={420} color="#3d5a5a" seed={11} highlight="#ffd9a8" />
			<RockWall y={560} base={1185} color="#b09a96" shade="#8a7470" light="#d4bfb5" />
			{/* shadows cast on the rock by the low sun */}
			<g clipPath="url(#dawnwall)" opacity={shadowOpacity}>
				<g transform={`translate(${SUN.x} ${SUN.y}) scale(${SUN.k}) translate(${-SUN.x} ${-SUN.y})`} filter="url(#blur2)">
					{FRIENDS.map((id) => (
						<Character key={id} id={id} x={DAWN_POS[id]} y={LINE_Y} scale={DAWN_SCALE} pose={{...(poses[id] ?? {}), silhouette: '#3a2a35'}} />
					))}
					<g opacity={sixthShadowOpacity}>
						<Character id="sixth" x={DAWN_POS.sixth} y={LINE_Y} scale={DAWN_SCALE} pose={{...sixthShadow, silhouette: '#3a2a35'}} />
					</g>
				</g>
			</g>
			<Ground y={1185} top="#8a7a6a" bottom="#5a4a40" />
			<Tent x={-40} y={1215} w={300} h={210} color={CAST.leo.jacket} dark={CAST.leo.jacketDark} />
			<Tent x={1120} y={1215} w={300} h={210} color={CAST.iker.jacket} dark={CAST.iker.jacketDark} />
			<Fog y={1200} color="#fff3e8" opacity={0.45} speed={0.8} />
			<GrassTufts y0={1200} y1={1900} count={46} color="#5a6a3a" seed={5} />
			{FRIENDS.map((id) => (
				<Character key={id} id={id} x={DAWN_POS[id]} y={LINE_Y} scale={DAWN_SCALE} pose={poses[id] ?? {}} />
			))}
			<Campfire x={540} y={1470} s={0.85} intensity={0} />
			<Smoke x={540} y={1440} amount={0.5} color="#e8e0e0" />
			<Fog y={1560} color="#fff6ee" opacity={0.35} speed={1.2} seed={9} />
			{over}
			<Tint color="#ffb98a" opacity={0.12} />
			<Dust count={40} color="#fff2cc" opacity={0.5} drift={0.3} />
		</g>
	);
};
