import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {nuclearScenes} from './index';

export const NuclearVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={nuclearScenes} hook={{text: 'estallara una bomba nuclear en medio de Europa?', hl: 'bomba nuclear'}}
    question={'¿Seguirá siendo así?'} tint="#a05030" hypo={['s1_destello', 's4_estallido', 's5_lluvia', 's6_otan', 's7_caos']} whatIf={['s4_estallido']} musicVol={0.28} />
);
