import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Character, PoseName, Expr} from '../components/Character';
import {CAST} from '../components/cast';
import {useFonts} from '../components/core';

export const Gallery: React.FC<{page: number}> = ({page}) => {
  useFonts();
  const keys = Object.keys(CAST).slice(page * 9, page * 9 + 9);
  const poses: PoseName[] = ['idle', 'point', 'handInCoat', 'talkA', 'fist', 'crossArms', 'think', 'victory', 'open'];
  const exprs: Expr[] = ['neutral', 'happy', 'determined', 'angry', 'surprised', 'sad', 'smug', 'worried', 'shout'];
  return (
    <AbsoluteFill style={{background: '#d9d2c3'}}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {keys.map((k, i) => {
          const x = 180 + (i % 3) * 360, y = 600 + Math.floor(i / 3) * 620;
          return <g key={k}>
            <Character d={CAST[k]} x={x} y={y} scale={0.95} pose={k === 'napoleon' ? 'handInCoat' : poses[i]} expr={exprs[i]} talking={i % 2 === 0} />
            <text x={x} y={y + 50} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={26}>{CAST[k].name}</text>
          </g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
