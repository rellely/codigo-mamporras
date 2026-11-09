import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {sinhumanosScenes} from './index';

export const SinHumanosVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={sinhumanosScenes} hook={{text: 'el ser humano nunca hubiera existido?', hl: 'nunca'}}
    question={'¿Mejor sin nosotros?'} tint="#3a8050" hypo={['s2_megafauna', 's3_bosques', 's5_perros', 's7_neandertales', 's8_noche', 's9_final']} whatIf={['s2_megafauna']} />
);
