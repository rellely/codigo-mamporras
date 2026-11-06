import React from 'react';
import {Character, CharId, Pose} from './Character';
import {Campfire, Darkness, Fireflies, Light, Log, Smoke, Tent, useFlicker} from './env/Camp';
import {Forest, Ground, GrassTufts, Moon, RockWall, Sky, Stars} from './env/Nature';

export const FIRE = {x: 540, y: 1440};
export const WALL_BASE = 1185;

/** Seat positions around the fire (front view). */
export const SEATS: Record<CharId, {x: number; y: number}> = {
	leo: {x: 135, y: 1335},
	marta: {x: 298, y: 1268},
	dani: {x: 458, y: 1240},
	sara: {x: 622, y: 1240},
	iker: {x: 790, y: 1268},
	sixth: {x: 955, y: 1335},
};
export const ORDER: CharId[] = ['leo', 'marta', 'dani', 'sara', 'iker', 'sixth'];
export const CHAR_SCALE = 0.95;
/** World-space position of a seated character's head centre. */
export const headOf = (id: CharId, standing = false) => ({x: SEATS[id].x, y: SEATS[id].y - (standing ? 255 : 222) * CHAR_SCALE});

export type CampNightProps = {
	present: CharId[];
	poses?: Partial<Record<CharId, Pose>>;
	standing?: Partial<Record<CharId, boolean>>;
	fire?: number;
	wind?: number;
	darkness?: number;
	extraLights?: Light[];
	shadows?: {show: number; exclude?: CharId[]; swap?: Partial<Record<CharId, CharId>>; extra?: React.ReactNode};
	opacities?: Partial<Record<CharId, number>>;
	emptySeat?: boolean;
	under?: React.ReactNode;
	over?: React.ReactNode;
	smoke?: number;
	fireflies?: number;
};

/** Renders the whole night campsite in world coordinates (1080x1920 base). */
export const CampNight: React.FC<CampNightProps> = ({
	present,
	poses = {},
	standing = {},
	fire = 1,
	wind = 0,
	darkness = 0.9,
	extraLights = [],
	shadows,
	under,
	over,
	smoke = 0,
	fireflies = 0.6,
	opacities = {},
	emptySeat = true,
}) => {
	const flick = useFlicker(0.1);
	const lightR = 640 * flick * (0.25 + 0.75 * fire);
	const poseFor = (id: CharId): Pose => ({sit: !standing[id], ...(poses[id] ?? {})});
	const shadowIds = present.filter((id) => !(shadows?.exclude ?? []).includes(id));
	// central projection from the flames onto the rock wall
	const Lx = FIRE.x + (flick - 1) * 60;
	const Ly = FIRE.y - 120;
	const kx = 1.12 * (1 + (flick - 1) * 0.25);
	const ky = 1.5 * (1 + (flick - 1) * 0.3);

	return (
		<g>
			<defs>
				<clipPath id="wallclip">
					<rect x={-800} y={300} width={2700} height={WALL_BASE - 300} />
				</clipPath>
			</defs>
			<Sky stops={[[0, '#05060f'], [0.5, '#0d1030'], [0.62, '#1b1d45'], [1, '#1b1d45']]} />
			<Stars count={140} top={-600} bottom={620} seed={3} />
			<Moon x={830} y={240} r={58} />
			<Forest count={22} y={640} hMin={260} hMax={420} color="#0c1424" seed={11} sway={1.5} />
			<RockWall y={560} base={WALL_BASE} color="#5d5566" shade="#3f3848" light="#7a7186" />
			{shadows && shadows.show > 0 && (
				<g clipPath="url(#wallclip)" opacity={0.8 * shadows.show} filter="url(#blur2)">
					<g transform={`translate(${Lx} ${Ly}) scale(${kx} ${ky}) translate(${-Lx} ${-Ly})`}>
						{shadowIds.map((id) => (
							<Character key={id} id={shadows.swap?.[id] ?? id} x={SEATS[id].x} y={SEATS[id].y} scale={CHAR_SCALE} pose={{...poseFor(id), silhouette: '#07060c', glowEyes: 0}} />
						))}
						{shadows.extra}
					</g>
				</g>
			)}
			<Ground y={WALL_BASE} top="#2f2a2a" bottom="#1d1a1c" />
			<Tent x={-40} y={1215} w={300} h={210} color="#e8722e" dark="#b9531b" />
			<Tent x={1120} y={1215} w={300} h={210} color="#1f9e95" dark="#15736c" />
			<GrassTufts y0={1200} y1={1900} count={46} color="#2d3b2a" seed={5} />
			{under}
			{ORDER.filter((id) => present.includes(id)).map((id) => (
				<g key={id}>
					<Character id={id} x={SEATS[id].x} y={SEATS[id].y} scale={CHAR_SCALE} pose={poseFor(id)} opacity={opacities[id] ?? 1} />
					{!standing[id] && <Log x={SEATS[id].x} y={SEATS[id].y - 20} w={150} rot={id === 'leo' || id === 'sixth' ? 0 : 0} color="#5e3c24" />}
				</g>
			))}
			{/* empty seat on the right keeps the composition consistent */}
			{!present.includes('sixth') && emptySeat && <Log x={SEATS.sixth.x} y={SEATS.sixth.y - 20} w={150} color="#5e3c24" />}
			<Campfire x={FIRE.x} y={FIRE.y} s={1} intensity={fire} wind={wind} />
			<Smoke x={FIRE.x} y={FIRE.y - 120} amount={smoke} wind={wind} />
			<Fireflies area={[-100, 800, 1280, 500]} opacity={fireflies * (1 - darkness * 0.3)} />
			<Darkness
				opacity={darkness}
				lights={[{x: FIRE.x, y: FIRE.y - 160, r: lightR, rx: lightR * 1.15, glow: fire}, ...extraLights]}
			/>
			{over}
		</g>
	);
};

/** Number badge that pops above a head. */
export const Badge: React.FC<{x: number; y: number; n: string | number; p: number; color?: string; text?: string}> = ({x, y, n, p, color = '#ffffff', text = '#111'}) => {
	if (p <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${p})`}>
			<circle r={40} fill={color} stroke="#000" strokeWidth={6} />
			<text y={16} textAnchor="middle" fontFamily="InterBlack" fontWeight={900} fontSize={46} fill={text}>
				{n}
			</text>
		</g>
	);
};

/** Where a world point lands on the rock wall when projected from the fire (no flicker). */
export const shadowOfFire = (x: number, y: number) => ({x: FIRE.x + (x - FIRE.x) * 1.12, y: FIRE.y - 120 + (y - (FIRE.y - 120)) * 1.5});
