import React from 'react';
import {Composition, Still} from 'remotion';
import {Gallery} from './Gallery';
import {episodeFrames, Timing} from '../components/Episode';
import {UrssVideo} from '../scenes/urss/Video';
import tUrss from '../scenes/urss/timing.json';
import {NapoleonVideo} from '../scenes/napoleon/Video';
import tNap from '../scenes/napoleon/timing.json';
import {TaiwanVideo} from '../scenes/taiwan/Video';
import tTw from '../scenes/taiwan/timing.json';
import {EspanaVideo} from '../scenes/espana/Video';
import tEs from '../scenes/espana/timing.json';
import {Ww2Video} from '../scenes/ww2/Video';
import tWw from '../scenes/ww2/timing.json';

const comp = (id: string, C: React.FC, t: any) => <Composition id={id} component={C} durationInFrames={episodeFrames(t as Timing)} fps={30} width={1080} height={1920} />;

export const Root: React.FC = () => (
  <>
    <Still id="Gallery" component={Gallery} width={1080} height={1920} defaultProps={{page: 0}} />
    {comp('urss', UrssVideo, tUrss)}
    {comp('napoleon', NapoleonVideo, tNap)}
    {comp('taiwan', TaiwanVideo, tTw)}
    {comp('espana', EspanaVideo, tEs)}
    {comp('ww2', Ww2Video, tWw)}
  </>
);
