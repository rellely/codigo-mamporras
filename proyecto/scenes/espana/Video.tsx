import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {espanaScenes} from './index';

export const EspanaVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={espanaScenes} hook={{text: 'España nunca hubiera perdido América?', hl: 'América'}}
    question="¿Superpotencia o ruptura?" tint="#b07020" hypo={['s7_giro', 's8_bloque', 's9_final']} whatIf={['s7_giro']} />
);
