import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, staticFile, random} from 'remotion';
import {loadFont} from '@remotion/fonts';

loadFont({family: 'Inter', url: staticFile('inter-latin-900-normal.woff2'), weight: '900'});
loadFont({family: 'Inter', url: staticFile('inter-latin-800-normal.woff2'), weight: '800'});
loadFont({family: 'Serif', url: staticFile('instrument-serif-latin-400-italic.woff2'), style: 'italic'});
loadFont({family: 'Mono', url: staticFile('jetbrains-mono-latin-500-normal.woff2'), weight: '500'});
loadFont({family: 'Mono', url: staticFile('jetbrains-mono-latin-700-normal.woff2'), weight: '700'});

// ---------- tokens ----------
const C = {
  paper: '#F4F5F0', grid: '#E2E5DC', ink: '#111111', red: '#E63946', gold: '#E9B949', goldDark: '#B9862A',
  green: '#3FAE6A', navy: '#14223A', cyan: '#4DE2F8', slate: '#7A8B9E',
};
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SHADOW = '0 4px 6px rgba(0,0,0,.40), 0 20px 35px rgba(0,0,0,.25)';
const mono: React.CSSProperties = {fontFamily: 'Mono', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4};

const slide = (f: number, start: number, dur = 14) => interpolate(f, [start, start + dur], [0, 1], {...clamp, easing: SNAP});
const pop = (f: number, fps: number, start: number) => spring({frame: f - start, fps, config: {damping: 12, stiffness: 180}});
const squash = (f: number, start: number) => {
  const t = f - start;
  const sx = interpolate(t, [0, 6, 12, 20], [1, 1.15, 0.94, 1], clamp);
  const sy = interpolate(t, [0, 6, 12, 20], [1, 0.85, 1.07, 1], clamp);
  return `scale(${sx},${sy})`;
};
const pendulum = (f: number, start: number) => {
  const t = Math.max(0, f - start);
  return 14 * Math.exp(-t / 14) * Math.cos(t / 3.2);
};

// ---------- shared pieces ----------
const GridPaper: React.FC<{dark?: boolean}> = ({dark}) => (
  <AbsoluteFill style={{
    backgroundColor: dark ? C.navy : C.paper,
    backgroundImage: `linear-gradient(${dark ? 'rgba(77,226,248,.10)' : C.grid} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(77,226,248,.10)' : C.grid} 1px, transparent 1px)`,
    backgroundSize: '54px 54px',
  }} />
);

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.18, pointerEvents: 'none'}}>
      <svg width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed={f % 10} /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

const Spotlight: React.FC<{x: number; on: number; color?: string}> = ({x, on, color = '255,246,220'}) => (
  <div style={{position: 'absolute', left: x - 300, top: 380, width: 600, height: 1000, opacity: on * 0.55, mixBlendMode: 'screen',
    background: `linear-gradient(180deg, rgba(${color},.0) 0%, rgba(${color},.55) 100%)`,
    clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(14px)'}} />
);

const Title: React.FC<{a: string; b: string; start?: number; dark?: boolean}> = ({a, b, start = 0, dark}) => {
  const f = useCurrentFrame();
  const p1 = slide(f, start), p2 = slide(f, start + 5);
  return (
    <div style={{position: 'absolute', left: 80, top: 190, lineHeight: 1}}>
      <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 104, letterSpacing: -4, color: dark ? '#fff' : C.ink,
        opacity: p1, transform: `translateY(${(1 - p1) * 40}px)`}}>{a}</div>
      <div style={{fontFamily: 'Serif', fontStyle: 'italic', fontSize: 110, color: dark ? C.cyan : C.red, marginTop: 4,
        opacity: p2, transform: `translateY(${(1 - p2) * 40}px)`}}>{b}</div>
    </div>
  );
};

const Footer: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', bottom: 150, width: '100%', textAlign: 'center'}}>
    <div style={{width: 380, height: 6, margin: '0 auto 22px', background: dark ? C.cyan : C.ink, opacity: 0.8}} />
    <div style={{...mono, fontSize: 30, letterSpacing: 14, color: dark ? C.cyan : C.ink}}>ZONARA</div>
  </div>
);

const Caption: React.FC<{text: string; start: number; dur: number}> = ({text, start, dur}) => {
  const f = useCurrentFrame();
  if (f < start || f > start + dur) return null;
  const words = text.split(' ');
  const per = Math.max(2, Math.floor((dur * 0.5) / words.length));
  return (
    <div style={{position: 'absolute', bottom: 300, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#000', borderRadius: 12, padding: '14px 26px', fontFamily: 'Inter', fontWeight: 800, fontSize: 44, color: '#fff', boxShadow: SHADOW}}>
        {words.map((w, i) => (
          <span key={i} style={{opacity: f >= start + i * per ? 1 : 0.15, color: w.startsWith('*') ? C.gold : '#fff'}}>{w.replace('*', '')} </span>
        ))}
      </div>
    </div>
  );
};

// Coin drawn in SVG; wire = blueprint version
const Coin: React.FC<{size: number; worn?: boolean; wire?: boolean}> = ({size, worn, wire}) => {
  const stroke = wire ? C.cyan : '#2a1c05';
  const face = wire ? 'transparent' : worn ? 'url(#worn)' : 'url(#shiny)';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', filter: wire ? `drop-shadow(0 0 8px ${C.cyan})` : undefined}}>
      <defs>
        <radialGradient id="shiny" cx="35%" cy="30%"><stop offset="0" stopColor="#FFF4C2" /><stop offset=".45" stopColor={C.gold} /><stop offset="1" stopColor={C.goldDark} /></radialGradient>
        <radialGradient id="worn" cx="40%" cy="35%"><stop offset="0" stopColor="#F2D98C" /><stop offset=".6" stopColor="#C9973A" /><stop offset="1" stopColor="#7d5a1c" /></radialGradient>
      </defs>
      {worn ? (
        <path d="M100 6 C152 4 196 44 194 98 C197 150 156 194 102 193 C46 196 5 152 7 100 C4 50 46 8 100 6Z" fill={face} stroke={stroke} strokeWidth="5" />
      ) : <circle cx="100" cy="100" r="94" fill={face} stroke={stroke} strokeWidth="5" />}
      <circle cx="100" cy="100" r="76" fill="none" stroke={stroke} strokeWidth="3" strokeDasharray={worn ? '6 5' : '2 4'} opacity=".8" />
      {worn ? (
        // laureate profile
        <path d="M78 140 C70 118 72 96 84 80 C92 66 112 62 124 72 C130 78 128 88 122 92 C130 98 128 108 120 110 C124 120 118 132 106 134 L104 150 M86 76 l-8 -8 M94 70 l-4 -10 M104 66 l0 -11 M114 68 l5 -9"
          fill="none" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <text x="100" y="118" textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize="54" fill={wire ? 'none' : '#6e4a12'} stroke={wire ? C.cyan : 'none'} strokeWidth="2">Au</text>
      )}
    </svg>
  );
};

const Tag: React.FC<{text: string; color: string; swing: number}> = ({text, color, swing}) => (
  <div style={{transformOrigin: '50% -40px', transform: `rotate(${swing}deg)`, marginTop: 40, position: 'relative'}}>
    <div style={{position: 'absolute', left: '50%', top: -40, width: 2, height: 40, background: C.ink}} />
    <div style={{background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 10, padding: '10px 22px', boxShadow: SHADOW,
      fontFamily: 'Inter', fontWeight: 900, fontSize: 52, color}}>{text}</div>
  </div>
);

const Pedestal: React.FC<{label: string}> = ({label}) => (
  <div style={{width: 300, height: 70, background: 'linear-gradient(#fff,#d9dbd3)', border: `3px solid ${C.ink}`, borderRadius: 8, boxShadow: SHADOW,
    display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 34, color: C.ink}}>{label}</div>
);

const Stamp: React.FC<{text: string; at: number; color?: string}> = ({text, at, color = C.red}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 7], [1.8, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [at, at + 3], [0, 1], clamp);
  return (
    <div style={{border: `7px solid ${color}`, color, borderRadius: 10, padding: '6px 28px', fontFamily: 'Inter', fontWeight: 900, fontSize: 86, letterSpacing: 2,
      transform: `rotate(-10deg) scale(${s})`, opacity: o * 0.92, background: 'rgba(255,255,255,.35)'}}>{text}</div>
  );
};

const shakeAt = (f: number, ats: number[]) => {
  for (const a of ats) if (f >= a && f < a + 6) return (random(`k${f}`) - 0.5) * 9;
  return 0;
};

// ---------- scenes ----------
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dropA = interpolate(f, [8, 22], [-900, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const dropB = interpolate(f, [14, 28], [-900, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const lights = interpolate(f, [0, 2, 3, 6, 7], [0, 0, 1, 0.3, 1], clamp);
  const tagIn = pop(f, fps, 40);
  const push = interpolate(f, [0, 200], [1, 1.05]);
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <GridPaper />
      <Spotlight x={290} on={lights} /><Spotlight x={790} on={lights} />
      <Title a="Same gold." b="1,000× the price." />
      {[{x: 290, d: dropA, at: 22, worn: false, label: 'A', tag: '$2,400', c: C.ink}, {x: 790, d: dropB, at: 28, worn: true, label: 'B', tag: '$2.4M', c: C.red}].map((o) => (
        <div key={o.label} style={{position: 'absolute', left: o.x - 150, top: 820, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{transform: `translateY(${o.d}px) ${squash(f, o.at)}`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4)) drop-shadow(0 20px 30px rgba(0,0,0,.25))',
            marginBottom: -6, translate: `0 ${Math.sin(f / 14 + o.x) * 2}px`}}>
            <Coin size={240} worn={o.worn} />
          </div>
          <Pedestal label={o.label} />
          <div style={{opacity: tagIn, transform: `scale(${tagIn})`}}><Tag text={o.tag} color={o.c} swing={pendulum(f, 40 + (o.worn ? 4 : 0))} /></div>
        </div>
      ))}
      <Caption text="Both are *7.9 grams of gold." start={60} dur={45} />
      <Footer />
    </AbsoluteFill>
  );
};

const SceneCompare: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [['WEIGHT', '7.9 g', '7.9 g'], ['PURITY', '99%', '98%'], ['SIZE', '20 mm', '20 mm'], ['MELT VALUE', '$2,400', '$2,400']];
  const cardIn = slide(f, 0, 15);
  return (
    <AbsoluteFill>
      <GridPaper />
      <Title a="Side by side." b="almost identical." />
      <div style={{position: 'absolute', left: 80, right: 80, top: 600, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 18, boxShadow: SHADOW,
        padding: '40px 50px', transform: `translateY(${(1 - cardIn) * 300}px)`, opacity: cardIn}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 28, color: C.slate, paddingBottom: 20, borderBottom: `2px dashed ${C.grid}`}}>
          <span>SPEC</span><span style={{marginLeft: 180}}>A</span><span />
          <span>B</span>
        </div>
        {rows.map((r, i) => {
          const p = slide(f, 14 + i * 4, 12);
          const eq = pop(f, fps, 24 + i * 4);
          return (
            <div key={r[0]} style={{display: 'flex', alignItems: 'center', height: 130, borderBottom: i < 3 ? `2px solid ${C.grid}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{...mono, fontSize: 28, width: 260, color: C.slate}}>{r[0]}</div>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 58, width: 220}}>{r[1]}</div>
              <div style={{width: 110, textAlign: 'center', fontFamily: 'Inter', fontWeight: 900, fontSize: 64, color: C.green, transform: `scale(${eq})`}}>=</div>
              <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 58}}>{r[2]}</div>
            </div>
          );
        })}
      </div>
      <Caption text="So why does *B cost a fortune?" start={50} dur={60} />
      <Footer />
    </AbsoluteFill>
  );
};

const SceneXray: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(f, [10, 28], [0, 1], clamp);
  const n = Math.round(interpolate(f, [40, 80], [0, 1000000], {...clamp, easing: Easing.out(Easing.exp)}));
  const barA = interpolate(f, [40, 75], [0, 500], {...clamp, easing: SNAP});
  const barB = interpolate(f, [52, 70], [0, 6], {...clamp, easing: SNAP});
  const lbl = pop(f, fps, 90);
  return (
    <AbsoluteFill>
      <GridPaper dark />
      <div style={{position: 'absolute', left: 80, top: 120, ...mono, fontSize: 26, color: C.cyan, opacity: 0.8}}>ZONARA // X-RAY</div>
      <Title a="X-ray:" b="how many exist?" dark />
      <div style={{position: 'absolute', left: 130, top: 470, opacity: draw, clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}}><Coin size={200} wire /></div>
      <div style={{position: 'absolute', left: 750, top: 470, opacity: draw, clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}}><Coin size={200} wire worn /></div>
      {/* bars */}
      <div style={{position: 'absolute', left: 150, bottom: 520, width: 160, height: barA, border: `3px solid ${C.cyan}`, background: 'rgba(77,226,248,.15)', boxShadow: `0 0 18px ${C.cyan}`}} />
      <div style={{position: 'absolute', left: 770, bottom: 520, width: 160, height: barB, border: `3px solid ${C.red}`, background: C.red, boxShadow: `0 0 18px ${C.red}`}} />
      <div style={{position: 'absolute', left: 60, width: 340, bottom: 440, textAlign: 'center', ...mono, fontSize: 40, color: '#fff'}}>{n.toLocaleString('en-US')}+</div>
      <div style={{position: 'absolute', left: 680, width: 340, bottom: 440, textAlign: 'center', ...mono, fontSize: 40, color: C.red}}>{f > 60 ? '2 KNOWN' : ''}</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${lbl})`, border: `2px solid ${C.cyan}`, borderRadius: 40, padding: '14px 34px', ...mono, fontSize: 32, color: C.cyan, background: 'rgba(20,34,58,.8)',
          boxShadow: `0 0 20px rgba(77,226,248,.5)`}}>SAME METAL · DIFFERENT SUPPLY</div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const SceneInsight: React.FC = () => {
  const f = useCurrentFrame();
  const dome = interpolate(f, [20, 34], [-1100, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const bounce = f > 34 ? Math.abs(Math.sin((f - 34) / 3)) * 18 * Math.exp(-(f - 34) / 6) : 0;
  const sheen = interpolate(f, [44, 62], [-300, 400], clamp);
  return (
    <AbsoluteFill>
      <GridPaper />
      <Spotlight x={540} on={1} />
      <Title a="It's not gold." b="It's the story." />
      <div style={{position: 'absolute', left: 540 - 170, top: 830, transform: squash(f, 34), transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4)) drop-shadow(0 20px 30px rgba(0,0,0,.25))'}}>
        <Coin size={340} worn />
      </div>
      {/* glass dome */}
      <div style={{position: 'absolute', left: 540 - 260, top: 660 + dome - bounce, width: 520, height: 560, borderRadius: '260px 260px 12px 12px',
        border: '4px solid rgba(17,17,17,.7)', background: 'rgba(200,230,240,.18)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, left: sheen, width: 90, height: '100%', transform: 'skewX(-20deg)', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)'}} />
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 1210}}><div style={{width: 600, height: 60, background: C.ink, borderRadius: 8, boxShadow: SHADOW}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center'}}><Stamp text="PROVENANCE" at={80} /></div>
      <Caption text="Minted by *Caesar's assassins, 42 BC." start={40} dur={70} />
      <Footer />
    </AbsoluteFill>
  );
};

const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(f, fps, 6), b = pop(f, fps, 12), btn = pop(f, fps, 40);
  const typed = 'A or B?'.slice(0, Math.max(0, Math.floor((f - 55) / 2)));
  return (
    <AbsoluteFill>
      <GridPaper />
      <Title a="Your pick." b="A or B?" />
      <div style={{position: 'absolute', top: 640, width: '100%', display: 'flex', justifyContent: 'center', gap: 60}}>
        {[{s: a, worn: false, l: 'A'}, {s: b, worn: true, l: 'B'}].map((o) => (
          <div key={o.l} style={{transform: `scale(${o.s})`, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 18, padding: 40, boxShadow: SHADOW, textAlign: 'center'}}>
            <Coin size={220} worn={o.worn} />
            <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 80, marginTop: 10}}>{o.l}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1230, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${btn})`, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 50, padding: '18px 40px', boxShadow: SHADOW,
          fontFamily: 'Inter', fontWeight: 800, fontSize: 44, minWidth: 420, textAlign: 'center'}}>
          {typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1360, width: '100%', textAlign: 'center', ...mono, fontSize: 30, color: C.red, opacity: slide(f, 80)}}>COMMENT ↓ · FOLLOW ZONARA</div>
      <Footer />
    </AbsoluteFill>
  );
};

// X-ray scan: dark layer revealed top→bottom (or reversed)
const Scan: React.FC<{from: number; dur: number; reverse?: boolean; children: React.ReactNode}> = ({from, dur, reverse, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const y = p * 1920;
  const clip = reverse ? `inset(${y}px 0 0 0)` : `inset(0 0 ${1920 - y}px 0)`;
  return (
    <>
      <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>
      {p > 0 && p < 1 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: y - 2, height: 4, background: '#fff',
          boxShadow: `0 0 20px 6px ${C.cyan}, 0 0 60px 14px rgba(77,226,248,.6)`}} />
      )}
    </>
  );
};

export const CoinExplainer: React.FC = () => {
  const f = useCurrentFrame();
  const sh = shakeAt(f, [440 + 80]);
  return (
    <AbsoluteFill style={{background: C.paper, transform: `translate(${sh}px,${sh * 0.6}px)`}}>
      <Sequence durationInFrames={120}><SceneHook /></Sequence>
      <Sequence from={120} durationInFrames={122}><SceneCompare /></Sequence>
      <Sequence from={220} durationInFrames={242}><Scan from={0} dur={22}><SceneXray /></Scan></Sequence>
      <Sequence from={440} durationInFrames={160}><Scan from={0} dur={22}><SceneInsight /></Scan></Sequence>
      <Sequence from={600} durationInFrames={120}><SceneCTA /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
