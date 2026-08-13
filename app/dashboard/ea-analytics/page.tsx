'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  Target,
  RefreshCw,
  Circle,
  DollarSign,
  BarChart,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Position {
  ticket: number;
  direction: 'BUY' | 'SELL';
  openPrice: number;
  currentPrice: number;
  pips: number;
  volume: number;
}

interface Analytics {
  id: string;
  clientId: string;
  accountType: 'Live' | 'Demo';
  balance: number;
  equity: number;
  profit: number;
  openPositions: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  sequencesCompleted: number;
  currentSequence: number;
  tradesInSequence: number;
  tradesPerSequence: number;
  inRecoveryMode: boolean;
  currentLot: number;
  drawdown: number;
  dailyLoss: number;
  gridActive: boolean;
  gridAdditions: number;
  maxGridAdditions: number;
  positions: Position[];
  updatedAt: string;
}

export default function EAAnalyticsPage() {
  const { user } = useUser();
  const [clientId, setClientId] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    if (!clientId.trim()) {
      setError('Please enter a Client ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ea-analytics?clientId=${encodeURIComponent(clientId.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setAnalytics(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch analytics. Make sure the EA is running and sending data.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchAnalytics();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 EA Analytics</h1>
          <p className="text-gray-500 text-sm">
            Live trading performance from your PipNex AI EA
          </p>
        </div>
        {lastUpdate && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Enter Client ID (e.g., 54961570_HFMarketsK)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              onClick={fetchAnalytics}
              disabled={loading || !clientId.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Connect'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Find your Client ID in the MT5 Experts tab (e.g., <span className="font-mono">54961570_HFMarketsK</span>)
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Analytics Display */}
      {analytics && !loading && (
        <div className="space-y-6">
          {/* Account Type Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analytics.accountType === 'Live'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <Circle className="inline w-2 h-2 mr-1 fill-current" />
              {analytics.accountType || 'Demo'} Account
            </span>
            {analytics.inRecoveryMode && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                🔴 Recovery Mode
              </span>
            )}
            {analytics.gridActive && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                📐 Grid: {analytics.gridAdditions}/{analytics.maxGridAdditions}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={fetchAnalytics} className="ml-auto">
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Balance"
              value={`$${analytics.balance.toFixed(2)}`}
              icon={<Wallet className="w-5 h-5 text-blue-500" />}
              color="blue"
            />
            <StatCard
              label="Equity"
              value={`$${analytics.equity.toFixed(2)}`}
              icon={<DollarSign className="w-5 h-5 text-green-500" />}
              color="green"
            />
            <StatCard
              label="P&L"
              value={`$${analytics.profit.toFixed(2)}`}
              icon={analytics.profit >= 0 ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
              color={analytics.profit >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Win Rate"
              value={`${analytics.winRate.toFixed(1)}%`}
              icon={<Target className="w-5 h-5 text-purple-500" />}
              color="purple"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SmallStat label="Total Trades" value={analytics.totalTrades} />
            <SmallStat label="Wins" value={analytics.winningTrades} color="text-green-600" />
            <SmallStat label="Losses" value={analytics.losingTrades} color="text-red-600" />
            <SmallStat label="Open Positions" value={analytics.openPositions} />
          </div>

          {/* Sequence Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" />
                EA Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Current Sequence</p>
                  <p className="text-lg font-bold text-gray-800">#{analytics.currentSequence}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trades in Sequence</p>
                  <p className="text-lg font-bold text-gray-800">
                    {analytics.tradesInSequence} / {analytics.tradesPerSequence}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sequences Completed</p>
                  <p className="text-lg font-bold text-gray-800">{analytics.sequencesCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Lot</p>
                  <p className="text-lg font-bold text-blue-600">{analytics.currentLot.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="w-5 h-5 text-gray-500" />
                Open Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.positions && analytics.positions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-500">Ticket</th>
                        <th className="text-left py-2 px-3 text-gray-500">Direction</th>
                        <th className="text-left py-2 px-3 text-gray-500">Entry</th>
                        <th className="text-left py-2 px-3 text-gray-500">Current</th>
                        <th className="text-left py-2 px-3 text-gray-500">Pips</th>
                        <th className="text-left py-2 px-3 text-gray-500">Volume</th>
                        <th className="text-left py-2 px-3 text-gray-500">P/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.positions.map((pos, idx) => {
                        const pl = (pos.currentPrice - pos.openPrice) * (pos.direction === 'BUY' ? 1 : -1) * pos.volume * 10000;
                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-3 font-mono text-xs">{pos.ticket}</td>
                            <td className={`py-2 px-3 font-medium ${pos.direction === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                              {pos.direction}
                            </td>
                            <td className="py-2 px-3 font-mono">{pos.openPrice.toFixed(5)}</td>
                            <td className="py-2 px-3 font-mono">{pos.currentPrice.toFixed(5)}</td>
                            <td className={`py-2 px-3 font-medium ${pos.pips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pos.pips.toFixed(1)}
                            </td>
                            <td className="py-2 px-3">{pos.volume.toFixed(2)}</td>
                            <td className={`py-2 px-3 font-medium ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${pl.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No open positions</p>
              )}
            </CardContent>
          </Card>

          {/* Live Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live data from EA – last update: {new Date(analytics.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ label, value, icon, color = 'blue' }: { label: string; value: string; icon: React.ReactNode; color?: 'blue' | 'green' | 'red' | 'purple' }) {
  const colorMap = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50',
  };

  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Small Stat Component
// ============================================

function SmallStat({ label, value, color = 'text-gray-800' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
