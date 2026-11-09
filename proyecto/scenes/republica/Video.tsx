import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {republicaScenes} from './index';

export const RepublicaVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={republicaScenes} hook={{text: 'nunca hubiera habido una dictadura en España?', hl: 'dictadura'}}
    question={'¿Cómo sería España hoy?'} tint="#7a3a8a" hypo={['s5_giro', 's6_aliados', 's7_europa']} whatIf={['s5_giro']} />
);
