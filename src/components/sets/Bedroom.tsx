import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, Character, Pose} from '../Character';
import {Darkness, Light} from '../env/Camp';
import {Moon, Stars} from '../env/Nature';
import {rand} from '../../lib/anim';

/** Sara's head position when lying in bed (world coords). */
export const BED_HEAD = {x: 300, y: 1225};
export const CORNER = {x: 905, y: 1180};

/**
 * Sara's bedroom at night: window with moon, bed, nightstand with phone,
 * wardrobe in the corner (the door can be ajar).
 */
export const Bedroom: React.FC<{
	phoneGlow?: number;
	saraPose?: Pose;
	saraSitting?: number; // 0 lying, 1 sitting up
	wardrobeAjar?: number;
	darkness?: number;
	sixthInCorner?: number;
	extraLights?: Light[];
	phoneOnStand?: boolean;
	flash?: number;
	over?: React.ReactNode;
	holdPhone?: boolean;
}> = ({holdPhone = false, phoneGlow = 1, saraPose = {}, saraSitting = 0, wardrobeAjar = 0.15, darkness = 0.85, sixthInCorner = 0, extraLights = [], phoneOnStand = false, flash = 0, over}) => {
	const frame = useCurrentFrame();
	const curtain = Math.sin(frame / 30) * 8;
	const sara = CAST.sara;
	const sit = saraSitting;
	return (
		<g>
			{/* walls */}
			<rect x={-800} y={-800} width={2700} height={2200} fill="#2a3150" />
			{new Array(30).fill(0).map((_, i) => (
				<rect key={i} x={-800 + i * 90} y={-800} width={40} height={2200} fill="#323a5e" opacity={0.6} />
			))}
			<rect x={-800} y={1400} width={2700} height={1200} fill="#3a2d2a" />
			{new Array(14).fill(0).map((_, i) => (
				<line key={i} x1={-800} x2={1900} y1={1420 + i * 40 + i * i * 4} y2={1420 + i * 40 + i * i * 4} stroke="#2c211f" strokeWidth={3} />
			))}
			<rect x={-800} y={1390} width={2700} height={22} fill="#20263f" />
			{/* window */}
			<g>
				<rect x={120} y={360} width={420} height={520} rx={10} fill="#0b1030" />
				<svg x={120} y={360} width={420} height={520} viewBox="0 0 420 520">
					<rect width={420} height={520} fill="#0d1238" />
					<Stars count={40} top={0} bottom={400} xMin={0} xMax={420} seed={12} />
					<Moon x={290} y={140} r={46} />
					<path d={`M 0 520 L 0 380 L 60 340 L 90 380 L 150 300 L 210 370 L 260 330 L 330 390 L 420 350 L 420 520 Z`} fill="#070a1c" />
					{new Array(6).fill(0).map((_, i) => (
						<rect key={i} x={20 + i * 70} y={420 + rand(i, 2) * 40} width={10} height={14} fill="#ffd27a" opacity={rand(i, 3) > 0.4 ? 0.8 : 0} />
					))}
				</svg>
				<rect x={120} y={360} width={420} height={520} rx={10} fill="none" stroke="#d8d2c4" strokeWidth={16} />
				<line x1={330} x2={330} y1={360} y2={880} stroke="#d8d2c4" strokeWidth={10} />
				<line x1={120} x2={540} y1={620} y2={620} stroke="#d8d2c4" strokeWidth={10} />
				<path d={`M 90 330 L 210 330 Q ${190 + curtain} 640 ${170 + curtain} 940 L 90 940 Z`} fill="#7d3b5c" />
				<path d={`M 570 330 L 450 330 Q ${470 - curtain} 640 ${490 - curtain} 940 L 570 940 Z`} fill="#7d3b5c" />
				<rect x={70} y={318} width={520} height={20} rx={10} fill="#5a3a2a" />
			</g>
			{/* poster */}
			<g transform="rotate(-3 700 600)">
				<rect x={620} y={460} width={170} height={230} fill="#e9d7b0" />
				<path d="M 640 660 L 705 520 L 770 660 Z" fill="#2c7a5a" />
				<circle cx={745} cy={520} r={18} fill="#e8722e" />
			</g>
			{/* wardrobe */}
			<g>
				<rect x={780} y={700} width={330} height={720} fill="#5b4033" />
				<rect x={796} y={716} width={146} height={688} fill="#6c4c3c" />
				{/* the ajar door reveals black interior */}
				<rect x={950} y={716} width={146} height={688} fill="#050507" />
				{sixthInCorner > 0 && (
					<g opacity={sixthInCorner}>
						<Character id="sixth" x={1020} y={1405} scale={0.95} pose={{mouth: 'creepy', lookX: -0.6, glowEyes: 0.6, blink: 0}} />
					</g>
				)}
				<rect x={950 + 146 * wardrobeAjar} y={716} width={146 * (1 - wardrobeAjar)} height={688} fill="#6c4c3c" />
				<circle cx={930} cy={1060} r={7} fill="#c9a66b" />
				<circle cx={962 + 146 * wardrobeAjar} cy={1060} r={7} fill="#c9a66b" />
			</g>
			{/* nightstand + lamp */}
			<rect x={560} y={1200} width={170} height={210} rx={8} fill="#6b4a36" />
			<rect x={575} y={1260} width={140} height={10} fill="#4a3324" />
			<rect x={632} y={1120} width={14} height={80} fill="#c7c0b0" />
			<path d="M 590 1120 L 690 1120 L 670 1060 L 610 1060 Z" fill="#e6d7b8" />
			{phoneOnStand && (
				<g>
					<rect x={640} y={1188} width={60} height={12} rx={4} fill="#111" />
					<circle cx={690} cy={1194} r={3} fill="#fff" opacity={0.6} />
				</g>
			)}
			{/* bed */}
			<rect x={-120} y={1150} width={140} height={330} rx={20} fill="#4a3324" />
			<rect x={-60} y={1260} width={660} height={160} rx={30} fill="#e8e2f0" />
			<ellipse cx={210} cy={1270} rx={110} ry={44} fill="#f6f3fa" />
			{/* Sara: head on the pillow, body under the blanket (sits up with saraSitting) */}
			<Character id="sara" x={BED_HEAD.x} y={1436 - 60 * sit} scale={0.95} pose={{mouth: 'flat', ...saraPose, sit: true}} />
			{/* blanket */}
			<path d={`M -40 ${1292 + sit * 22} Q 300 ${1270 + sit * 22} 620 1300 L 620 1440 L -40 1440 Z`} fill={sara.accent} />
			<path d={`M -40 ${1292 + sit * 22} Q 300 ${1270 + sit * 22} 620 1300`} stroke="#2a8a85" strokeWidth={10} fill="none" />
			{new Array(5).fill(0).map((_, i) => (
				<circle key={i} cx={60 + i * 120} cy={1390} r={14} fill="#fff" opacity={0.25} />
			))}
			{holdPhone && (
				<g transform={`translate(${BED_HEAD.x + 95} ${BED_HEAD.y + 20 - sit * 30}) rotate(-12)`}>
					<rect x={-24} y={-44} width={48} height={82} rx={8} fill="#111" />
					<rect x={-19} y={-38} width={38} height={68} rx={5} fill="#9fd4ff" opacity={0.85 * phoneGlow} />
					<ellipse cx={-4} cy={36} rx={26} ry={18} fill={sara.skin} />
					<path d="M -20 40 Q -30 90 -50 140 L 10 150 Q 20 90 14 44 Z" fill={sara.jacket} />
				</g>
			)}
			<Darkness
				opacity={darkness}
				color="#04050f"
				lights={[
					{x: 330, y: 620, r: 520, color: '#9fb4ff', glow: 0.35},
					...(phoneGlow > 0 ? [{x: BED_HEAD.x + 40, y: BED_HEAD.y - 60, r: 360 * phoneGlow, color: '#8fc8ff', glow: 0.7 * phoneGlow}] : []),
					...extraLights,
				]}
			/>
			{flash > 0 && <rect x={-800} y={-800} width={2700} height={3000} fill="#fff" opacity={flash * 0.0} />}
			{over}
		</g>
	);
};
