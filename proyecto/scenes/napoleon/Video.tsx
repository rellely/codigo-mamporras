import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {napoleonScenes} from './index';

export const NapoleonVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={napoleonScenes} hook={{text: 'Napoleón hubiera ganado?', hl: 'Napoleón'}}
    question="¿Libertador o tirano?" tint="#3050a0" hypo={['s6_giro', 's8_imperio']} whatIf={['s6_giro']} />
);
