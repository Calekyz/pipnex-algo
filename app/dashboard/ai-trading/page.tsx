'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface PriceData {
  price: string;
  change: string;
  high: string;
  low: string;
  open: string;
  previous_close: string;
  name: string;
}

const AI_PAIRS = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  { label: 'EUR/GBP', value: 'EUR/GBP' },
  { label: 'XAU/USD', value: 'XAU/USD' },
  { label: 'XAG/USD', value: 'XAG/USD' },
];

export default function AITradingPage() {
  const { user } = useUser();
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/market-data?symbol=${encodeURIComponent(selectedPair)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch price');
      }
      const data = await res.json();
      setPriceData(data.price);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when pair changes
  useEffect(() => {
    fetchPrice();
  }, [selectedPair]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedPair]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'N/A';

    // Determine decimal places based on symbol
    const isJPY = selectedPair.includes('JPY');
    const isMetal = selectedPair.includes('XAU') || selectedPair.includes('XAG');
    let decimals: number;
    if (isMetal) {
      decimals = 2;
    } else if (isJPY) {
      decimals = 3;
    } else {
      decimals = 5;
    }
    return num.toFixed(decimals);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🤖 AI Trading</h1>
        <p className="text-gray-500 text-sm">
          Real-time market data and AI-powered trading insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT: Controls ===== */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trading Terminal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pair Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                >
                  {AI_PAIRS.map((pair) => (
                    <option key={pair.value} value={pair.value}>
                      {pair.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto Refresh Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
                </label>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={fetchPrice}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                {loading ? 'Loading...' : 'Refresh Price'}
              </Button>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {priceData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Open</span>
                  <span className="font-medium">{formatPrice(priceData.open)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">High</span>
                  <span className="font-medium text-green-600">{formatPrice(priceData.high)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Low</span>
                  <span className="font-medium text-red-600">{formatPrice(priceData.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Previous Close</span>
                  <span className="font-medium">{formatPrice(priceData.previous_close)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== RIGHT: Price Display & Chart ===== */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {selectedPair}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {priceData?.name || ''}
                  </span>
                </CardTitle>
                {loading && <Loader2 size={16} className="animate-spin text-blue-600" />}
              </div>
            </CardHeader>
            <CardContent>
              {priceData ? (
                <div className="space-y-6">
                  {/* Large Price Display */}
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold">
                      {formatPrice(priceData.price)}
                    </div>
                    <div className={`flex items-center justify-center gap-2 mt-2 text-lg ${
                      parseFloat(priceData.change || '0') >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {parseFloat(priceData.change || '0') >= 0 ? (
                        <TrendingUp size={24} />
                      ) : (
                        <TrendingDown size={24} />
                      )}
                      <span>
                        {priceData.change || '0'}% today
                      </span>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="relative bg-gray-100 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📈</div>
                      <p>Live chart coming soon</p>
                      <p className="text-xs mt-1">Real-time chart integration in development</p>
                    </div>
                    {/* Mini chart indicator */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="w-full h-12 flex items-end gap-0.5">
                        {[...Array(50)].map((_, i) => {
                          const height = 20 + Math.random() * 80;
                          const isUp = Math.random() > 0.5;
                          return (
                            <div
                              key={i}
                              className={`w-2 rounded-t ${isUp ? 'bg-green-400' : 'bg-red-400'}`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI Quick Insights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">AI Sentiment</p>
                      <p className="font-bold text-blue-700">Neutral</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Signal</p>
                      <p className="font-bold text-green-700">BUY</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="font-bold text-yellow-700">72%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Risk Level</p>
                      <p className="font-bold text-purple-700">Moderate</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
                      📈 Place Buy Order
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg">
                      📉 Place Sell Order
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p>Select a pair to view live prices</p>
                  <p className="text-sm text-gray-400 mt-1">Real-time data from Twelve Data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
