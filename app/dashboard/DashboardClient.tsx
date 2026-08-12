'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Pair {
  label: string;
  value: string;
}

interface DashboardClientProps {
  pairs: Pair[];
  initialCredits: number;
}

export default function DashboardClient({ pairs, initialCredits }: DashboardClientProps) {
  const [selectedPair, setSelectedPair] = useState<string>(pairs[0]?.value || 'EUR/USD');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Step 1: Fetch market data (price + indicators)
      const marketRes = await fetch(`/api/market-data?symbol=${encodeURIComponent(selectedPair)}`);
      if (!marketRes.ok) {
        const errData = await marketRes.json();
        throw new Error(errData.error || 'Failed to fetch market data');
      }
      const marketData = await marketRes.json();
      setPriceData(marketData.price);

      // Step 2: Generate AI analysis
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Controls */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Pair</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              disabled={loading}
            >
              <optgroup label="Major Pairs">
                {pairs.slice(0, 7).map((pair) => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cross Pairs">
                {pairs.slice(7, 14).map((pair) => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Metals">
                {pairs.slice(14, 18).map((pair) => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Commodities">
                {pairs.slice(18, 21).map((pair) => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </optgroup>
            </select>

            <Button
              onClick={handleAnalyze}
              disabled={loading || initialCredits <= 0}
              className="w-full"
            >
              {loading ? 'Analyzing...' : initialCredits <= 0 ? 'Insufficient Credits' : 'Analyze Now'}
            </Button>

            {initialCredits <= 0 && (
              <p className="text-sm text-red-500 text-center">
                You've used all your credits. Please upgrade your subscription.
              </p>
            )}

            {priceData && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">Current Price</div>
                <div className="text-2xl font-bold">
                  {priceData.price || 'Loading...'}
                </div>
                <div className={`text-sm ${
                  parseFloat(priceData?.change || '0') >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {priceData?.change ? priceData.change + '%' : 'N/A'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Analysis Results */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Generating analysis...</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">Trend</div>
                    <div className={`font-bold text-lg ${
                      analysis.trend === 'Bullish' ? 'text-green-600' :
                      analysis.trend === 'Bearish' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {analysis.trend}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="font-bold text-lg">{analysis.confidence}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="text-sm text-gray-600">Support</div>
                    <div className="font-bold">{analysis.support_level}</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-md">
                    <div className="text-sm text-gray-600">Resistance</div>
                    <div className="font-bold">{analysis.resistance_level}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <div className="text-sm text-gray-600">Entry</div>
                    <div className="font-bold">{analysis.entry_price}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <div className="text-sm text-gray-600">Stop Loss</div>
                    <div className="font-bold text-red-600">{analysis.stop_loss}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <div className="text-sm text-gray-600">Take Profit</div>
                    <div className="font-bold text-green-600">{analysis.take_profit}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">Rationale</div>
                  <p className="text-gray-800">{analysis.rationale}</p>
                </div>
              </div>
            )}

            {!loading && !analysis && !error && (
              <div className="text-center py-12 text-gray-500">
                Select a pair and click "Analyze Now" to get AI-powered insights.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
