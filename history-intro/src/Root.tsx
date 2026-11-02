import {Composition} from 'remotion';
import {HistoryIntro} from './HistoryIntro';
export const Root = () => (
  <Composition id="HistoryIntro" component={HistoryIntro} durationInFrames={600} fps={30} width={1920} height={1080} />
);
