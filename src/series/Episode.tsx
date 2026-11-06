import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Fade, Grain} from '../components/Overlays';
import {Vignette} from '../components/env/Camp';
import {Subtitles} from '../components/Subtitles';
import {Lang, SceneProvider, sceneFrames, Timeline} from '../lib/timeline';

export type SceneDef = {C: React.FC<any>; fadeIn?: number; fadeOut?: number; vignette?: number};
export type EpisodeDef = {slug: string; timelines: Record<Lang, Timeline>; scenes: Record<string, SceneDef>; next?: Record<Lang, string>};

const useFont = () => {
	const [handle] = useState(() => delayRender('font'));
	useEffect(() => {
		const font = new FontFace('InterBlack', `url(${staticFile('fonts/Inter-Black.otf')}) format('opentype')`, {weight: '900'});
		font
			.load()
			.then((f) => {
				document.fonts.add(f);
				continueRender(handle);
			})
			.catch(() => continueRender(handle));
	}, [handle]);
};

/** Series badge shown during the first seconds (continuity between parts). */
const PartBadge: React.FC<{part: string; title: string}> = ({part, title}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [4, 14, 95, 110], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					fontFamily: 'InterBlack',
					fontSize: 40,
					color: '#fff',
					background: 'rgba(0,0,0,0.55)',
					border: '4px solid #ff2d3a',
					borderRadius: 40,
					padding: '12px 34px',
					letterSpacing: 3,
					transform: `translateY(${(1 - o) * -20}px)`,
				}}
			>
				{title} · {part.split('·')[0].trim()}
			</div>
		</div>
	);
};

export const Episode: React.FC<{ep: EpisodeDef; lang: Lang}> = ({ep, lang}) => {
	useFont();
	const tl = ep.timelines[lang];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Audio src={staticFile(`audio/mix_${ep.slug}_${lang}.wav`)} />
			{tl.scenes.map((s) => {
				const def = ep.scenes[s.id];
				if (!def) return null;
				const {from, duration} = sceneFrames(s);
				return (
					<Sequence key={s.id} from={from} durationInFrames={duration} name={s.id}>
						<SceneProvider value={{scene: s, lang}}>
							<def.C title={tl.title} part={tl.part ?? ''} next={ep.next?.[lang]} />
							<Vignette strength={def.vignette ?? 0.65} />
							<Fade dur={duration} inF={def.fadeIn} outF={def.fadeOut} />
						</SceneProvider>
					</Sequence>
				);
			})}
			<Grain opacity={0.1} />
			<PartBadge part={tl.part ?? ''} title={tl.title} />
			<Subtitles tl={tl} />
		</AbsoluteFill>
	);
};
