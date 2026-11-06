import React from 'react';
import {CAST, Character, CharId} from '../Character';
import {RockWall, Sky, Ground} from '../env/Nature';
import {useTr} from '../../lib/timeline';

const BOYS: {id: CharId; x: number; colors: any}[] = [
	{id: 'leo', x: 150, colors: {jacket: '#7a6a5a', jacketDark: '#5a4a3a', accent: '#6a5040', pants: '#3a3a3a'}},
	{id: 'dani', x: 310, colors: {jacket: '#5a6a7a', jacketDark: '#3a4a5a', pants: '#2a2a2a'}},
	{id: 'iker', x: 470, colors: {jacket: '#8a7a50', jacketDark: '#6a5a30', accent: '#5a5a5a', pants: '#3a3a3a', skin: '#c08a5a', skinShade: '#a07040'}},
	{id: 'marta', x: 630, colors: {jacket: '#6a5a6a', jacketDark: '#4a3a4a', hair: '#3a2a20', pants: '#2a2a2a'}},
	{id: 'leo', x: 790, colors: {jacket: '#506050', jacketDark: '#304030', accent: '#404a40', pants: '#333'}},
];

/** The 2006 group photo (six boys at the rock). Hugo on the right, looking normal. */
export const OldPhoto: React.FC = () => (
	<g>
		<Sky stops={[[0, '#9ab'], [1, '#dde']]} />
		<RockWall y={560} base={1185} color="#9a9090" shade="#7a7070" light="#bab0b0" />
		<Ground y={1185} top="#8a8070" bottom="#6a6050" />
		{BOYS.map((b, i) => (
			<Character key={i} id={b.id} x={b.x} y={1330} scale={0.95} pose={{colors: b.colors, mouth: 'grin', armR: [30, -10], blink: 0}} />
		))}
		<Character id="sixth" x={950} y={1330} scale={0.95} pose={{humanEyes: true, colors: {skin: '#ecc9a2', skinShade: '#d4ac82'}, mouth: 'smile', blink: 0, armL: [-150, 10]}} />
	</g>
);

/** Laptop showing a 2006 local newspaper article. Origin = screen centre (screen 900x560). */
export const Laptop: React.FC<{x: number; y: number; s?: number; photoZoom?: number}> = ({x, y, s = 1, photoZoom = 0}) => {
	const t = useTr();
	// photo viewBox zooms into Hugo
	const vx = 0 + photoZoom * 770;
	const vy = 700 + photoZoom * 300;
	const vw = 1080 - photoZoom * 780;
	const vh = vw * 0.62;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<rect x={-480} y={-310} width={960} height={620} rx={24} fill="#1c1d22" />
			<rect x={-450} y={-280} width={900} height={560} fill="#efe9dc" />
			<text x={-420} y={-232} fontFamily="Georgia, serif" fontWeight={700} fontSize={36} fill="#222">
				{t('EL DIARIO DE LA SIERRA', 'THE SIERRA DAILY')}
			</text>
			<text x={420} y={-232} textAnchor="end" fontFamily="Georgia, serif" fontSize={22} fill="#555">
				{t('14 de agosto de 2006', 'August 14, 2006')}
			</text>
			<line x1={-420} x2={420} y1={-216} y2={-216} stroke="#222" strokeWidth={3} />
			<text x={-420} y={-170} fontFamily="Georgia, serif" fontWeight={700} fontSize={34} fill="#111">
				{t('Desaparece un joven de 15 años', 'Boy, 15, goes missing')}
			</text>
			<text x={-420} y={-130} fontFamily="Georgia, serif" fontWeight={700} fontSize={34} fill="#111">
				{t('durante una acampada', 'on a camping trip')}
			</text>
			<g style={{filter: 'sepia(0.85) contrast(1.05)'}}>
				<svg x={-420} y={-105} width={520} height={322} viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
					<OldPhoto />
				</svg>
			</g>
			<rect x={-420} y={-105} width={520} height={322} fill="none" stroke="#333" strokeWidth={3} />
			<text x={-420} y={248} fontFamily="Georgia, serif" fontStyle="italic" fontSize={20} fill="#333">
				{t('Hugo M. (dcha.), junto a sus amigos en la roca.', 'Hugo M. (right), with his friends at the rock.')}
			</text>
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
				<rect key={i} x={130} y={-100 + i * 32} width={290 - (i % 3) * 40} height={12} fill="#9a9488" />
			))}
			{/* base */}
			<path d="M -560 310 L 560 310 L 600 350 L -600 350 Z" fill="#2a2b31" />
		</g>
	);
};
void CAST;
