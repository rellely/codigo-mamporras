import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {secesionScenes} from './index';

export const SecesionVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={secesionScenes} hook={{text: 'el Sur hubiera ganado la guerra civil de EE. UU.?', hl: 'Sur'}}
    question={'¿Qué habría pasado?'} tint="#3a4a80" hypo={['s6_giro', 's7_dospaises', 's8_superpotencia']} whatIf={['s6_giro']} />
);
