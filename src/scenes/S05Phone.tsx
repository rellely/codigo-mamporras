import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CampNight} from '../components/CampNight';
import {SharedDefs} from '../components/Character';
import {Tint} from '../components/env/Camp';
import {Glitch} from '../components/Overlays';
import {Stage} from '../components/Stage';
import {EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {CAST} from '../components/Character';
import {useScene} from '../lib/timeline';

/** Close-up of the phone: the photo shows six people. */
export const S05Phone: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const six = cue('glitch');
	// heartbeat pulse
	const hb = Math.pow(Math.max(0, Math.sin(frame / 4.5)), 12);
	const cam = useCam([
		{f: 0, x: 540, y: 960, z: 1.0},
		{f: six - 2, x: 540, y: 960, z: 1.18},
		{f: six + 6, x: 760, y: 900, z: 1.9, ease: EASE_OUT},
		{f: dur, x: 770, y: 900, z: 2.05},
	], frame > six ? 6 : 2.5);
	// inner photo crop zooms into the stranger
	const vx = kf(frame, [[six, 0], [six + 8, 700]], EASE_OUT);
	const vy = kf(frame, [[six, 860], [six + 8, 930]], EASE_OUT);
	const vw = kf(frame, [[six, 1080], [six + 8, 420]], EASE_OUT);
	const vh = vw / 1.8;
	const sara = CAST.sara;
	const phone = (
		<g transform={`translate(540 960) rotate(${-4 + Math.sin(frame / 25) * 1.2}) scale(${1 + hb * 0.02})`}>
			{/* sleeves + hands */}
			<path d="M -560 700 Q -520 300 -470 120 L -330 150 Q -380 400 -360 700 Z" fill={sara.jacket} />
			<path d="M 560 700 Q 520 300 470 120 L 330 150 Q 380 400 360 700 Z" fill={sara.jacket} />
			<rect x={-490} y={-300} width={980} height={560} rx={60} fill="#0d0d12" />
			<rect x={-470} y={-280} width={940} height={520} rx={44} fill="#000" />
			<svg x={-460} y={-270} width={920} height={500} viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
				<SharedDefs />
				<CampNight
					present={['leo', 'marta', 'dani', 'sara', 'iker', 'sixth']}
					darkness={0.25}
					fireflies={0}
					poses={{
						leo: {mouth: 'grin', lean: 6, armL: [-162, -10], lookX: 0.5, blink: 0},
						marta: {mouth: 'grin', lean: 9, headTilt: 8, lookX: 0.5, blink: 0},
						dani: {mouth: 'grin', lean: 6, lookX: 0.6, blink: 0},
						sara: {mouth: 'grin', armR: [162, -4], item: 'phone', phoneLit: 0.9, lookX: 0.6, lookY: -0.7, blink: 0},
						iker: {mouth: 'grin', lean: -8, headTilt: -8, lookX: -0.6, armR: [132, -40], blink: 0},
						sixth: {mouth: 'creepy', lookX: 0, lookY: 0, headTilt: -10},
					}}
				/>
				<rect x={-2000} y={-2000} width={5000} height={5000} fill="#fff" opacity={0.12} />
			</svg>
			{/* phone UI */}
			<rect x={-460} y={-270} width={920} height={60} fill="#000" opacity={0.35} />
			<text x={-430} y={-228} fontFamily="InterBlack" fontSize={30} fill="#fff">23:47</text>
			<circle cx={410} cy={-240} r={12} fill="#fff" opacity={0.8} />
			<rect x={-460} y={170} width={920} height={60} fill="#000" opacity={0.35} />
			<path d="M -30 200 l 20 -14 l 0 28 z M 20 186 h 24 v 28 h -24 z" fill="#fff" opacity={0.8} />
			{/* thumbs */}
			<ellipse cx={-470} cy={80} rx={46} ry={70} fill={sara.skin} />
			<ellipse cx={470} cy={80} rx={46} ry={70} fill={sara.skin} />
			{/* screen glow */}
			<rect x={-470} y={-280} width={940} height={520} rx={44} fill="#a8d8ff" opacity={0.05} />
		</g>
	);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'blur(16px) brightness(0.55)'}}>
				<Stage cam={{x: 540, y: 1200, z: 1.5, r: 0}}>
					<CampNight present={['leo', 'marta', 'dani', 'sara', 'iker']} />
				</Stage>
			</AbsoluteFill>
			<Glitch at={six} len={10}>
				<Stage cam={cam} bg="transparent">
					{phone}
					<Tint color="#3a4a7a" opacity={kf(frame, [[six, 0], [six + 10, 0.25]])} />
				</Stage>
			</Glitch>
			<AbsoluteFill style={{background: 'radial-gradient(circle, transparent 40%, rgba(120,0,0,0.35) 100%)', opacity: hb * (frame > six ? 1 : 0.4)}} />
		</AbsoluteFill>
	);
};
