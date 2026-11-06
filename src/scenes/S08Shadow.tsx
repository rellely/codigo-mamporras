import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CampNight, CHAR_SCALE, headOf, ORDER, SEATS} from '../components/CampNight';
import {CharId, Pose} from '../components/Character';
import {Beam} from '../components/env/Camp';
import {Flash} from '../components/Overlays';
import {aimAngle, Stage} from '../components/Stage';
import {EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

/** Dani's flashlight: everyone has a shadow on the rock... except him. */
export const S08Shadow: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur, lineStart, scene, f} = useScene();
	const click = cue('click');
	const reveal = cue('reveal');
	const l1 = lineStart(1);
	const dani = SEATS.dani;
	const sh = {x: dani.x + 40 * CHAR_SCALE, y: dani.y - 144 * CHAR_SCALE};
	const tgt = {x: SEATS.sixth.x, y: SEATS.sixth.y - 150};
	const aim = aimAngle(sh.x, sh.y, tgt.x, tgt.y);
	const raise = kf(frame, [[6, 0], [click - 4, 1]]);
	const armA = 12 + (aim - 12) * raise;
	// hand position (world) for the beam origin
	const rad = (armA * Math.PI) / 180;
	const hand = {x: sh.x + Math.sin(rad) * 88 * CHAR_SCALE, y: sh.y + Math.cos(rad) * 88 * CHAR_SCALE};
	const beamAng = (Math.atan2(tgt.y - hand.y, tgt.x - hand.x) * 180) / Math.PI;
	const on = frame >= click ? 1 : 0;
	const flick = on * (frame < click + 6 ? (frame % 2 ? 0.4 : 1) : 1);

	const shadowWordIdx = scene.lines[1].words.findIndex((w) => /sombra|shadow/i.test(w.w));
	const panEnd = f(scene.lines[1].words[Math.max(0, shadowWordIdx)].end) + 6;
	const cam = useCam(
		[
			{f: 0, x: 540, y: 1100, z: 1.0},
			{f: click, x: 640, y: 1080, z: 1.12},
			{f: l1 - 4, x: 660, y: 1040, z: 1.12},
			{f: l1 + 8, x: 200, y: 900, z: 1.55},
			{f: panEnd, x: 760, y: 880, z: 1.55},
			{f: reveal - 4, x: 900, y: 880, z: 1.6},
			{f: reveal + 5, x: SEATS.sixth.x - 30, y: headOf('sixth').y + 40, z: 2.5, ease: EASE_OUT},
			{f: dur, x: SEATS.sixth.x - 30, y: headOf('sixth').y + 40, z: 2.7},
		],
		frame > reveal ? 7 : 2.5,
	);
	const revealed = frame >= reveal;
	const poses: Partial<Record<CharId, Pose>> = {
		dani: {armR: [armA, 0], item: 'flashlight', phoneLit: on, mouth: 'flat', brows: 'angry', lookX: 1},
		sixth: {mouth: revealed ? 'creepy' : 'smile', lookX: revealed ? 0 : -0.6, headTilt: revealed ? -10 : 0, blink: 0},
	};
	(['leo', 'marta', 'sara', 'iker'] as CharId[]).forEach((id) => {
		poses[id] = {mouth: frame > l1 ? 'open' : 'worried', brows: 'worried', lookX: 1, tremble: frame > l1 ? 1.2 : 0.5};
	});
	return (
		<>
			<Stage cam={cam}>
				<CampNight
					present={ORDER}
					poses={poses}
					shadows={{show: 1, exclude: ['sixth']}}
					extraLights={
						on
							? [
									{x: tgt.x, y: tgt.y - 40, r: 260 * flick, color: '#fff6d0', glow: 0.8},
									{x: tgt.x + 30, y: 820, r: 300 * flick, color: '#fff6d0', glow: 0.6},
							  ]
							: []
					}
					over={on ? <Beam x={hand.x} y={hand.y} angle={beamAng} length={620} spread={11} intensity={0.55 * flick} /> : null}
				/>
			</Stage>
			<Flash at={reveal} len={6} color="#ffffff" peak={0.5} />
		</>
	);
};
