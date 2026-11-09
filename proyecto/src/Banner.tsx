// Banner del canal (YouTube): 2048x1152; zona segura central 1235x338 (en 1024x576: 618x169)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Character} from '../components/Character';
import {CAST} from '../components/cast';
import {MapView} from '../components/MapView';
import {useFonts, C, FONT_TITLE, FONT_UI} from '../components/core';

export const Banner: React.FC = () => {
  useFonts();
  const cast: [keyof typeof CAST, number, number, 1 | -1, any][] = [
    ['napoleon', 150, 'handInCoat' as any, 1, 'smug'], ['lincoln', 340, 'crossArms' as any, 1, 'determined'], ['churchill', 530, 'crossArms' as any, 1, 'smug'],
    ['bolivar', 1520, 'crossArms' as any, -1, 'determined'], ['gorbachov', 1710, 'open' as any, -1, 'happy'], ['neanderthal', 1900, 'holdFront' as any, -1, 'neutral'],
  ];
  return <AbsoluteFill style={{background: '#14101c'}}>
    <svg viewBox="0 0 2048 1152" width={2048} height={1152} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(1024,576) scale(1.9) translate(-540,-960)"><MapView proj={{type: 'mercator', center: [10, 25], scale: 260}} theme="vintage" hideGrid={false} /></g>
      <rect width={2048} height={1152} fill="#14101c" opacity={0.55} />
      <defs><radialGradient id="vg" cx="50%" cy="50%" r="70%"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
      <rect width={2048} height={1152} fill="url(#vg)" />
      {cast.map(([k, x, pose, facing, expr]) => <Character key={k} d={CAST[k]} x={x} y={1010} scale={0.78} pose={pose} facing={facing} expr={expr} look={0.3} />)}
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 432, height: 288, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: C.yellow, color: C.ink, fontFamily: FONT_UI, fontWeight: 900, fontSize: 132, letterSpacing: 12, padding: '6px 54px', borderRadius: 34, border: `16px solid ${C.ink}`, boxShadow: '0 22px 0 #0d0a12', transform: 'rotate(-2deg)', lineHeight: 1.15}}>¿Y SI…?</div>
      <div style={{marginTop: 34, fontFamily: FONT_TITLE, fontSize: 64, color: '#fff', letterSpacing: 4, WebkitTextStroke: '10px #0d0a12', paintOrder: 'stroke fill', textTransform: 'uppercase'}}>Historia alternativa animada</div>
    </div>
  </AbsoluteFill>;
};
