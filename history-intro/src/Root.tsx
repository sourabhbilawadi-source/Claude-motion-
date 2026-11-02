import {Composition} from 'remotion';
import {HistoryIntro} from './HistoryIntro';
import {CoinExplainer} from './CoinExplainer';
export const Root = () => (
  <>
    <Composition id="HistoryIntro" component={HistoryIntro} durationInFrames={600} fps={30} width={1920} height={1080} />
    <Composition id="CoinExplainer" component={CoinExplainer} durationInFrames={720} fps={30} width={1080} height={1920} />
  </>
);
