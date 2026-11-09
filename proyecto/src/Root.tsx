import React from 'react';
import {Composition, Still} from 'remotion';
import {Gallery} from './Gallery';
import {Banner} from './Banner';
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

const comp = (id: string, C: React.FC<any>, t: any, lang: 'es' | 'en' = 'es') => <Composition id={id} component={C} defaultProps={{lang}} durationInFrames={episodeFrames(t as Timing)} fps={30} width={1080} height={1920} />;

import turssEn from '../scenes/urss/timing.en.json';
import tnapoleonEn from '../scenes/napoleon/timing.en.json';
import ttaiwanEn from '../scenes/taiwan/timing.en.json';
import tespanaEn from '../scenes/espana/timing.en.json';
import tww2En from '../scenes/ww2/timing.en.json';

import {NuclearVideo} from '../scenes/nuclear/Video';
import t_nuclear from '../scenes/nuclear/timing.json';
import {SinHumanosVideo} from '../scenes/sinhumanos/Video';
import t_sinhumanos from '../scenes/sinhumanos/timing.json';
import {RepublicaVideo} from '../scenes/republica/Video';
import t_republica from '../scenes/republica/timing.json';
import {SecesionVideo} from '../scenes/secesion/Video';
import t_secesion from '../scenes/secesion/timing.json';

export const Root: React.FC = () => (
  <>
    <Still id="Banner" component={Banner} width={2048} height={1152} />
    <Still id="Gallery" component={Gallery} width={1080} height={1920} defaultProps={{page: 0}} />
    {comp('urss', UrssVideo, tUrss)}
    {comp('napoleon', NapoleonVideo, tNap)}
    {comp('taiwan', TaiwanVideo, tTw)}
    {comp('espana', EspanaVideo, tEs)}
    {comp('ww2', Ww2Video, tWw)}
    {comp('urss-en', UrssVideo, turssEn, 'en')}
    {comp('napoleon-en', NapoleonVideo, tnapoleonEn, 'en')}
    {comp('taiwan-en', TaiwanVideo, ttaiwanEn, 'en')}
    {comp('espana-en', EspanaVideo, tespanaEn, 'en')}
    {comp('ww2-en', Ww2Video, tww2En, 'en')}
    {comp('nuclear', NuclearVideo, t_nuclear)}
    {comp('sinhumanos', SinHumanosVideo, t_sinhumanos)}
    {comp('republica', RepublicaVideo, t_republica)}
    {comp('secesion', SecesionVideo, t_secesion)}
  </>
);
