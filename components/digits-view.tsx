'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/custom/footer';
import { Header } from '@/components/custom/header';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTickDisplay } from './current-tick-display';
import { DigitStatsBar } from './digit-stats-bar';
import { TradeControls } from './trade-controls';
import { TradeTypeChips } from '@/components/custom/trade-type-chips';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import type { AuthState, DerivAccount, ActiveSymbol, Tick, ProposalInfo, DurationLimits, BuyResult } from '@deriv/core';
import type { ContractMode, TradeType, DigitStats } from '../lib/types';

const DIGIT_TRADE_TYPE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: 'matches-differs', label: 'Matches/Differs' },
  { value: 'over-under', label: 'Over/Under' },
  { value: 'even-odd', label: 'Even/Odd' },
];

export interface DigitsViewProps {
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => void;
  onSignUp: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;
  lastDigit: number | null;
  digitStats: DigitStats;
  pipSize: number;
  tradeType: TradeType;
  setTradeType: (type: TradeType) => void;
  contractMode: ContractMode;
  setContractMode: (mode: ContractMode) => void;
  selectedDigit: number;
  setSelectedDigit: (digit: number) => void;
  stake: string;
  setStake: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  durationLimits: DurationLimits;
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  buyContract: () => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  clearBuyResult: () => void;
  logoSrc?: string;
  appName?: string;
}

export function DigitsView(props: DigitsViewProps) {
  if (props.error) {
    return (
      <main className="flex flex-col bg-background items-center justify-center px-4 min-h-dvh">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{props.error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Pure mathematical safe scanner calculation to handle live layout rendering
  let scannerMessage = "📊 Market pattern stable. Scanning live volatility ticks...";
  if (props.digitStats && props.digitStats.percentages) {
    const percentages = props.digitStats.percentages;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const hotIdx = percentages.indexOf(highest);
    const coldIdx = percentages.indexOf(lowest);
    
    if (highest > 18) {
      scannerMessage = `⚠️ AI ALERT: Digit ${hotIdx} is over-represented (${highest.toFixed(1)}%). Recommended: DIFFERS.`;
    } else if (lowest < 4) {
      scannerMessage = `⚠️ AI ALERT: Digit ${coldIdx} is under-represented (${lowest.toFixed(1)}%). Recommended: MATCHES.`;
    }
  }

  return (
    <main className="flex flex-col bg-background max-lg:h-dvh max-lg:overflow-y-auto lg:overflow-visible">
      <Header
        authState={props.authState}
        accounts={props.accounts}
        activeAccount={props.activeAccount}
        onLogin={props.onLogin}
        onSignUp={props.onSignUp}
        onLogout={props.onLogout}
        onSwitchAccount={props.onSwitchAccount}
        logoSrc={props.logoSrc}
        appName={props.appName}
        actions={<ThemeToggle />}
      />

      <div className={props.authState === 'authenticated' ? 'h-[76px] shrink-0' : 'h-[66px] shrink-0'} />

      <div className="flex w-full max-w-7xl mx-auto flex-col px-3 py-2 md:px-6 md:py-4 gap-2 sm:gap-3 lg:flex-none">
        {props.isLoading ? (
          <>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="w-full h-[420px] rounded-xl" />
          </>
        ) : (
          <>
            <div className="shrink-0 overflow-x-auto pb-0.5">
              <TradeTypeChips
                value={props.tradeType}
                options={DIGIT_TRADE_TYPE_OPTIONS}
                onValueChange={props.setTradeType}
              />
            </div>

            <Card className="shrink-0 border shadow-sm mb-12">
              <CardContent className="flex flex-col p-3 sm:p-6 pb-2">
                <div className={`lg:grid ${props.tradeType !== 'even-odd' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                  
                  {/* Column 1 */}
                  <div className="flex flex-col pb-4 pt-1 sm:pb-6 sm:pt-2 lg:py-0 lg:pr-6">
                    <SymbolSelector
                      symbols={props.symbols}
                      activeSymbol={props.activeSymbol}
                      onSymbolChange={props.selectSymbol}
                    />
                    <div className="flex items-center justify-center min-h-24 sm:min-h-32 lg:flex-1">
                      <CurrentTickDisplay
                        tick={props.currentTick}
                        lastDigit={props.lastDigit}
                        activeSymbol={props.activeSymbol}
                        pipSize={props.pipSize}
                      />
                    </div>

                    {/* LIVE INLINE SCANNER COMPONENT */}
                    <div className="mt-4 p-3 bg-gray-900 border border-gray-800 border-l-4 border-l-blue-500 rounded-lg text-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-blue-400 tracking-wider">🤖 CLYDEX AI SCANNER</span>
                        <span className="text-emerald-500 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>LIVE
                        </span>
                      </div>
                      <p className="m-0 text-sm font-medium text-gray-300">{scannerMessage}</p>
                    </div>

                  </div>

                  {/* Columns 2 & 3 */}
                  <div className="max-lg:border-t max-lg:divide-y divide-border lg:contents">
                    {props.tradeType !== 'even-odd' && (
                      <div className="py-4 sm:py-6 lg:py-0 lg:px-6 lg:border-l lg:border-r">
                        <DigitStatsBar
                          digitStats={props.digitStats}
                          selectedDigit={props.selectedDigit}
                          onDigitSelect={props.setSelectedDigit}
                        />
                      </div>
                    )}

                    <div className="pt-4 sm:pt-6 lg:pt-0 lg:pl-6 lg:border-l lg:border-none">
                      <TradeControls
                        tradeType={props.tradeType}
                        contractMode={props.contractMode}
                        onContractModeChange={props.setContractMode}
                        selectedDigit={props.selectedDigit}
                        isConnected={props.isConnected}
                        stake={props.stake}
                        onStakeChange={props.setStake}
                        duration={props.duration}
                        onDurationChange={props.setDuration}
                        durationLimits={props.durationLimits}
                        proposal={props.proposal}
                        isProposalLoading={props.isProposalLoading}
                        onBuy={props.buyContract}
                        isBuying={props.isBuying}
                        buyResult={props.buyResult}
                        buyError={props.buyError}
                        onClearBuyResult={props.clearBuyResult}
                        isAuthenticated={props.authState === 'authenticated'}
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 py-2 text-center bg-background/80 backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
  }
  
