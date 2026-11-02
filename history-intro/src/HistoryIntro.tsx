import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const cinzel = 'Cinzel';
const cormorant = 'Cormorant Garamond';
for (const w of ['400', '700', '900']) loadFont({family: cinzel, url: staticFile(`cinzel-latin-${w}-normal.woff2`), weight: w});
loadFont({family: cormorant, url: staticFile('cormorant-garamond-latin-400-italic.woff2'), style: 'italic'});
const ital = {fontStyle: 'italic'} as const;

const GOLD = 'linear-gradient(180deg,#fff3c4 0%,#e8c56a 35%,#b07d2a 65%,#6e4a12 100%)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const goldText: React.CSSProperties = {
  backgroundImage: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.8)) drop-shadow(0 0 30px rgba(232,180,80,.25))',
};

// ---------- global layers ----------
const Embers: React.FC<{count?: number; tint?: string}> = ({count = 70, tint = '255,170,60'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const speed = 1 + random(`s${i}`) * 3;
        const x = random(`x${i}`) * 1920 + Math.sin((f + i * 20) / 25) * 30;
        const y = 1100 - ((f * speed + random(`y${i}`) * 1200) % 1250);
        const size = 2 + random(`z${i}`) * 5;
        const flicker = 0.4 + 0.6 * Math.abs(Math.sin((f + i * 7) / 6));
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
            background: `rgba(${tint},${flicker})`, boxShadow: `0 0 ${size * 4}px rgba(${tint},${flicker})`}} />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.35}}>
      <svg width="1920" height="1080">
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,.92) 100%)'}} />
);

const Letterbox: React.FC = () => {
  const f = useCurrentFrame();
  const h = interpolate(f, [0, 25], [540, 110], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: h, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: h, background: '#000'}} />
    </>
  );
};

const LightRays: React.FC<{opacity?: number}> = ({opacity = 0.35}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: '50%', top: -600, width: 3000, height: 3000, marginLeft: -1500,
        transform: `rotate(${f * 0.08}deg)`,
        background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,210,140,.18) 0deg 4deg, transparent 4deg 14deg)',
        maskImage: 'radial-gradient(circle at 50% 30%, black 0%, transparent 45%)', WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 0%, transparent 45%)'}} />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 3, at, at + 12], [0, 1, 0], clamp);
  return <AbsoluteFill style={{background: '#fff4dc', opacity: o, mixBlendMode: 'screen'}} />;
};

// ---------- scene 1: the year ----------
const SceneYear: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const year = Math.round(interpolate(f, [10, 95], [753, 27], {...clamp, easing: Easing.inOut(Easing.cubic)}));
  const scale = interpolate(f, [0, 130], [1.25, 1], clamp);
  const s = spring({frame: f - 95, fps, config: {damping: 12}});
  const subO = interpolate(f, [60, 85], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2410 0%, #120a04 60%, #000 100%)', alignItems: 'center', justifyContent: 'center'}}>
      <LightRays />
      <div style={{transform: `scale(${scale})`, textAlign: 'center'}}>
        <div style={{fontFamily: cormorant, ...ital, fontSize: 46, color: '#d9b77a', letterSpacing: 10, opacity: subO}}>IT BEGAN IN</div>
        <div style={{fontFamily: cinzel, fontWeight: 900, fontSize: 300, lineHeight: 1, ...goldText, transform: `scale(${1 + s * 0.06})`}}>
          {year}<span style={{fontSize: 120}}> BC</span>
        </div>
        <div style={{height: 3, margin: '20px auto 0', width: interpolate(f, [20, 90], [0, 900], clamp), background: GOLD}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 2: columns rise ----------
const Column: React.FC<{x: number; delay: number; h: number}> = ({x, delay, h}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - delay, fps, config: {damping: 14, mass: 1.2}});
  const flutes = 7;
  return (
    <div style={{position: 'absolute', left: x, bottom: 110, width: 120, height: h, transform: `translateY(${(1 - p) * (h + 150)}px)`}}>
      <div style={{height: 34, margin: '0 -22px', background: 'linear-gradient(#e9d9b0,#9b8358)', borderRadius: 4, boxShadow: '0 8px 20px rgba(0,0,0,.6)'}} />
      <div style={{height: h - 68, display: 'flex', background: 'linear-gradient(90deg,#5d4c30,#d8c79c 40%,#efe2bd 55%,#7b6640)'}}>
        {new Array(flutes).fill(0).map((_, i) => <div key={i} style={{flex: 1, borderRight: '2px solid rgba(60,45,20,.35)'}} />)}
      </div>
      <div style={{height: 34, margin: '0 -28px', background: 'linear-gradient(#cdb98a,#6f5a36)', borderRadius: 3}} />
    </div>
  );
};

const SceneColumns: React.FC = () => {
  const f = useCurrentFrame();
  const camX = interpolate(f, [0, 150], [60, -60]);
  const t1 = interpolate(f, [40, 60], [0, 1], clamp);
  const t2 = interpolate(f, [70, 90], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1c0f06 0%,#5a2a0e 55%,#c2621c 85%,#f3a33a 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 960 - 260, top: 560, width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle,#ffd98a 0%,#ff8b2b 45%,transparent 70%)', opacity: 0.85}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX}px)`}}>
        {[160, 420, 660, 1140, 1380, 1640].map((x, i) => <Column key={x} x={x} delay={i * 5} h={380 + (i % 2) * 50} />)}
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 420}}>
        <div style={{fontFamily: cinzel, fontWeight: 700, fontSize: 110, letterSpacing: 18, ...goldText, opacity: t1, transform: `translateY(${(1 - t1) * 40}px)`}}>AN EMPIRE ROSE</div>
        <div style={{fontFamily: cormorant, ...ital, fontSize: 52, color: '#f6e2b5', opacity: t2, marginTop: 10, textShadow: '0 4px 20px #000'}}>
          stretching across three continents
        </div>
      </AbsoluteFill>
      <Embers count={50} />
    </AbsoluteFill>
  );
};

// ---------- scene 3: timeline of decline ----------
const EVENTS = [
  {y: 'AD 117', t: 'Height of power'},
  {y: 'AD 235', t: 'Fifty years of crisis'},
  {y: 'AD 410', t: 'Rome is sacked'},
  {y: 'AD 476', t: 'The last emperor falls'},
];
const SceneTimeline: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lineW = interpolate(f, [0, 110], [0, 1520], {...clamp, easing: Easing.out(Easing.quad)});
  const red = interpolate(f, [80, 140], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgb(${40 + red * 50},${22 - red * 10},10) 0%, #050302 75%)`}}>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: cinzel, fontSize: 64, letterSpacing: 14, color: '#c9a868'}}>
        BUT CRACKS BEGAN TO FORM
      </div>
      <div style={{position: 'absolute', left: 200, top: 560, height: 4, width: lineW, background: GOLD, boxShadow: '0 0 20px #e8b450'}} />
      {EVENTS.map((e, i) => {
        const d = 12 + i * 26;
        const p = spring({frame: f - d, fps, config: {damping: 11}});
        const x = 280 + i * 460;
        const last = i === EVENTS.length - 1;
        return (
          <div key={e.y} style={{position: 'absolute', left: x - 180, top: 450, width: 360, textAlign: 'center', opacity: p}}>
            <div style={{fontFamily: cinzel, fontWeight: 700, fontSize: 58, transform: `translateY(${(1 - p) * -40}px)`,
              ...(last ? {color: '#ff4a2a', textShadow: '0 0 30px #ff2a00'} : goldText)}}>{e.y}</div>
            <div style={{width: 26, height: 26, margin: '30px auto', transform: `rotate(45deg) scale(${p})`, background: last ? '#ff3b1a' : '#e8c56a',
              boxShadow: `0 0 25px ${last ? '#ff3b1a' : '#e8b450'}`}} />
            <div style={{fontFamily: cormorant, ...ital, fontSize: 40, color: '#f1dfb6'}}>{e.t}</div>
          </div>
        );
      })}
      <Embers count={40} tint="255,90,40" />
    </AbsoluteFill>
  );
};

// ---------- scene 4: title ----------
const SceneTitle: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = ['THE', 'FALL', 'OF', 'ROME'];
  const shake = f < 20 ? (random(`sh${f}`) - 0.5) * interpolate(f, [0, 20], [40, 0]) : 0;
  const zoom = interpolate(f, [0, 180], [1.08, 1]);
  const crack = interpolate(f, [40, 70], [0, 1], clamp);
  const tag = interpolate(f, [75, 100], [0, 1], clamp);
  const sub = spring({frame: f - 115, fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3b1606 0%, #0a0402 70%)', transform: `translate(${shake}px,${shake * 0.6}px) scale(${zoom})`}}>
      <LightRays opacity={0.5} />
      <Embers count={90} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', gap: 40, alignItems: 'baseline'}}>
          {words.map((w, i) => {
            const p = spring({frame: f - i * 6, fps, config: {damping: 9, stiffness: 160}});
            const big = w.length > 2;
            return (
              <span key={w} style={{fontFamily: cinzel, fontWeight: 900, fontSize: big ? 165 : 95, ...goldText,
                display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 120}px) scale(${2 - p})`}}>{w}</span>
            );
          })}
        </div>
        <svg width="1400" height="40" style={{marginTop: -10}}>
          <path d="M0 20 L300 14 L340 30 L420 8 L520 26 L700 18 L760 32 L900 12 L1040 24 L1100 6 L1400 20"
            stroke="#ff5a2a" strokeWidth="4" fill="none" strokeDasharray="1600" strokeDashoffset={1600 * (1 - crack)}
            style={{filter: 'drop-shadow(0 0 10px #ff3000)'}} />
        </svg>
        <div style={{fontFamily: cormorant, ...ital, fontSize: 54, color: '#f3dcab', opacity: tag, letterSpacing: 4, marginTop: 20, textShadow: '0 4px 20px #000'}}>
          How the greatest empire on Earth collapsed
        </div>
        <div style={{marginTop: 50, transform: `scale(${sub})`, display: 'flex', alignItems: 'center', gap: 18,
          padding: '16px 40px', border: '2px solid #e8c56a', borderRadius: 6, background: 'rgba(20,10,4,.6)'}}>
          <div style={{width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '24px solid #e8c56a'}} />
          <span style={{fontFamily: cinzel, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: '#f6e2b5'}}>ZONARA</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const HistoryIntro: React.FC = () => {
  const f = useCurrentFrame();
  const end = interpolate(f, [580, 600], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', opacity: end}}>
      <Sequence durationInFrames={135}><Fade dur={135}><SceneYear /></Fade></Sequence>
      <Sequence from={130} durationInFrames={150}><Fade dur={150}><SceneColumns /></Fade></Sequence>
      <Sequence from={275} durationInFrames={150}><Fade dur={150}><SceneTimeline /></Fade></Sequence>
      <Sequence from={420} durationInFrames={180}><SceneTitle /></Sequence>
      <Flash at={130} /><Flash at={420} />
      <Vignette />
      <Grain />
      <Letterbox />
      <div style={{position: 'absolute', top: 130, right: 70, fontFamily: cinzel, fontWeight: 700, fontSize: 30, letterSpacing: 10,
        color: '#e8c56a', opacity: interpolate(f, [20, 40], [0, 0.75], clamp)}}>ZONARA</div>
    </AbsoluteFill>
  );
};
