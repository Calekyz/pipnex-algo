'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Sparkles, Target, Shield, Zap } from 'lucide-react';
import { FOREX_PAIRS } from '@/lib/twelvedata';

interface PriceData {
  price: string;
  change: string;
  high: string;
  low: string;
  open: string;
  previous_close: string;
  name: string;
}

interface AnalysisResult {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support_level: string;
  resistance_level: string;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  confidence: number;
  rationale: string;
}

export default function AITradingPage() {
  const { user } = useUser();
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Fetch initial credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits || 0);
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      }
    };
    fetchCredits();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // 1. Fetch market data
      const marketRes = await fetch(`/api/market-data?symbol=${encodeURIComponent(selectedPair)}`);
      if (!marketRes.ok) {
        const errData = await marketRes.json();
        throw new Error(errData.error || 'Failed to fetch market data');
      }
      const marketData = await marketRes.json();
      setPriceData(marketData.price);

      // 2. Generate AI analysis
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedPair }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.error || 'Failed to generate analysis');
      }

      const result = await analyzeRes.json();
      setAnalysis(result);

      // 3. Update credits (the API route deducts 1)
      if (credits !== null) {
        setCredits(prev => (prev !== null ? prev - 1 : 0));
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🤖 AI Trading</h1>
          <p className="text-gray-500 text-sm">
            Get professional AI‑powered setups for any currency pair
          </p>
        </div>
        <div className="flex items-center gap-3">
          {credits !== null && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Credits: {credits}
            </span>
          )}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Controls */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Trading Terminal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pair Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                >
                  <optgroup label="Majors">
                    {FOREX_PAIRS.slice(0, 7).map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Crosses">
                    {FOREX_PAIRS.slice(7, 27).map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Exotics">
                    {FOREX_PAIRS.slice(27, 52).map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Metals">
                    {FOREX_PAIRS.slice(52, 56).map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleAnalyze}
                disabled={loading || (credits !== null && credits <= 0)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg transition-all"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin mr-2" />
                ) : (
                  <Sparkles size={20} className="mr-2" />
                )}
                {loading ? 'Analyzing...' : (credits !== null && credits <= 0) ? 'Insufficient Credits' : 'Generate Setup'}
              </Button>

              {credits !== null && credits <= 0 && (
                <p className="text-sm text-red-500 text-center">
                  You have no credits left. Please upgrade your plan.
                </p>
              )}

              {/* Live Price Snapshot */}
              {priceData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Current Price</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-800">
                        {priceData.price || 'N/A'}
                      </p>
                      <p className={`text-sm font-medium ${parseFloat(priceData.change || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceData.change ? `${priceData.change}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>H: {priceData.high || 'N/A'}</p>
                      <p>L: {priceData.low || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Analysis Results */}
        <div className="lg:col-span-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target size={20} className="text-blue-500" />
                Setup Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-500">Generating your setup...</p>
                  <p className="text-xs text-gray-400">This may take a few seconds</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm text-gray-400 mt-2">Please try again</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Trend & Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Trend</p>
                      <p className={`text-2xl font-bold mt-1 ${
                        analysis.trend === 'Bullish' ? 'text-green-600' :
                        analysis.trend === 'Bearish' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {analysis.trend}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Confidence</p>
                      <p className="text-2xl font-bold mt-1 text-indigo-600">
                        {analysis.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Entry / SL / TP */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-xs text-gray-500 uppercase">Entry</p>
                      <p className="text-xl font-bold text-green-700">{analysis.entry_price}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                      <p className="text-xs text-gray-500 uppercase">Stop Loss</p>
                      <p className="text-xl font-bold text-red-600">{analysis.stop_loss}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                      <p className="text-xs text-gray-500 uppercase">Take Profit</p>
                      <p className="text-xl font-bold text-blue-700">{analysis.take_profit}</p>
                    </div>
                  </div>

                  {/* Support & Resistance */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Support</p>
                      <p className="font-semibold text-gray-800">{analysis.support_level}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Resistance</p>
                      <p className="font-semibold text-gray-800">{analysis.resistance_level}</p>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysis.rationale}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-green-500 text-green-600 hover:bg-green-50">
                      <TrendingUp size={16} className="mr-2" /> Take BUY
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50">
                      <TrendingDown size={16} className="mr-2" /> Take SELL
                    </Button>
                    <Button variant="ghost" className="flex-1 text-gray-500 hover:bg-gray-100" onClick={() => setAnalysis(null)}>
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Target size={48} className="mb-4 opacity-30" />
                  <p className="text-lg font-medium">No setup generated yet</p>
                  <p className="text-sm">Select a pair and click “Generate Setup”</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold flex items-center gap-2">
          <Shield size={16} /> Risk Disclaimer
        </p>
        <p>These AI-generated setups are for informational purposes only. Always conduct your own research and never risk more than you can afford to lose.</p>
      </div>
    </div>
  );
}
