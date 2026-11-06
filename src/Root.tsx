import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {TIMELINES} from './lib/timeline';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="ElSexto-ES" component={Video} durationInFrames={TIMELINES.es.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'es' as const}} />
		<Composition id="TheSixthOne-EN" component={Video} durationInFrames={TIMELINES.en.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'en' as const}} />
	</>
);
