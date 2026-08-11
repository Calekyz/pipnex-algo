'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Signal {
  pair: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  pips: number;
  confidence: number;
  rationale: string;
  currentPrice: string;
  change: string;
  error?: string;
}

const PULSE_PAIRS = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  { label: 'EUR/GBP', value: 'EUR/GBP' },
];

export default function PulseSignalsPage() {
  const { user } = useUser();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pulse-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs: PULSE_PAIRS }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch signals');
      }

      const data = await res.json();
      setSignals(data.signals || []);
    } catch (err: any) {
      console.error('Pulse signals error:', err);
      setError(err.message || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch signals on mount
  useEffect(() => {
    fetchSignals();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📡 Pulse Signals</h1>
          <p className="text-gray-500 text-sm">
            Real-time AI-generated trading signals for 8 major pairs
          </p>
        </div>
        <Button
          onClick={fetchSignals}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Generating...' : 'Next Setup'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          <AlertCircle size={18} className="inline mr-2" />
          {error}
        </div>
      )}

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {signals.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p>No signals yet. Click "Next Setup" to generate signals.</p>
          </div>
        ) : loading && signals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Generating signals for all pairs...</p>
          </div>
        ) : (
          signals.map((signal, index) => (
            <SignalCard
              key={index}
              signal={signal}
              isExpanded={expandedCard === signal.pair}
              onToggle={() => setExpandedCard(expandedCard === signal.pair ? null : signal.pair)}
            />
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Disclaimer</p>
        <p>These signals are AI-generated and for educational purposes only. Always do your own research before trading. Past performance does not guarantee future results.</p>
      </div>
    </div>
  );
}

// ============================================
// Signal Card Component
// ============================================

function SignalCard({ signal, isExpanded, onToggle }: { signal: Signal; isExpanded: boolean; onToggle: () => void }) {
  if (signal.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-center">
          <p className="text-red-500">{signal.pair}</p>
          <p className="text-xs text-red-400">{signal.error}</p>
        </CardContent>
      </Card>
    );
  }

  const isBuy = signal.direction === 'BUY';
  const confidenceColor = signal.confidence >= 70 ? 'text-green-500' : signal.confidence >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card className={`border-l-4 ${isBuy ? 'border-green-500' : 'border-red-500'} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{signal.pair}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Price:</span>
              <span className="text-sm font-medium">{signal.currentPrice || 'N/A'}</span>
              <span className={`text-xs font-medium ${parseFloat(signal.change || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {signal.change || '0'}%
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}>
            {isBuy ? 'BUY' : 'SELL'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
          <div>
            <p className="text-gray-500">Entry</p>
            <p className="font-mono font-bold">{signal.entry_price || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">SL</p>
            <p className="font-mono font-bold text-red-600">{signal.stop_loss || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">TP</p>
            <p className="font-mono font-bold text-green-600">{signal.take_profit || 'N/A'}</p>
          </div>
        </div>

        {/* Pips and Confidence */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Pips</span>
            <span className="ml-2 font-bold text-indigo-600">{signal.pips || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Confidence</span>
            <span className={`font-bold ${confidenceColor}`}>{signal.confidence || 'N/A'}%</span>
          </div>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={onToggle}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 w-full justify-center border-t pt-2"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Hide rationale' : 'Show rationale'}
        </button>

        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold text-gray-700 text-xs">Rationale:</p>
            <p>{signal.rationale || 'No rationale provided'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
