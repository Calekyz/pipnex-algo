'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRealTimePrice } from '@/lib/twelvedata';

interface MarketPulseProps {
  pairs: { label: string; value: string }[];
}

interface PriceData {
  price: string;
  change: string;
  high: string;
  low: string;
  open: string;
  previous_close: string;
  name: string;
}

export default function MarketPulse({ pairs }: MarketPulseProps) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    const results: Record<string, PriceData> = {};
    let hasError = false;

    for (const pair of pairs) {
      try {
        const data = await getRealTimePrice(pair.value);
        if (data) {
          results[pair.value] = data;
        } else {
          hasError = true;
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${pair.value}:`, err);
        hasError = true;
      }
    }

    setPrices(results);
    setLoading(false);
    if (hasError && Object.keys(results).length === 0) {
      setError('Failed to fetch market data');
    } else {
      setError(null);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPrices();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, [pairs]);

  const formatPrice = (price: string, symbol: string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '—';

    const isJPY = symbol.includes('JPY');
    const isMetal = symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('XPT') || symbol.includes('XPD');

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

  const getChangeColor = (change: string) => {
    const num = parseFloat(change);
    if (isNaN(num)) return 'text-gray-400';
    return num >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangePrefix = (change: string) => {
    const num = parseFloat(change);
    if (isNaN(num)) return '';
    return num >= 0 ? '+' : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-blue-600">📊</span> Market Pulse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 text-sm">
            {error}
            <button
              onClick={fetchPrices}
              className="block mx-auto mt-2 text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {pairs.map((pair) => {
              const data = prices[pair.value];
              return (
                <div
                  key={pair.value}
                  className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-3 text-center border border-gray-100"
                >
                  <p className="text-xs text-gray-500 font-medium truncate" title={pair.label}>
                    {pair.label}
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {data?.price ? formatPrice(data.price, pair.value) : '—'}
                  </p>
                  <p className={`text-xs font-medium ${data?.change ? getChangeColor(data.change) : 'text-gray-400'}`}>
                    {data?.change ? `${getChangePrefix(data.change)}${Number(data.change).toFixed(2)}%` : 'N/A'}
                  </p>
                  {data?.high && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      H: {formatPrice(data.high, pair.value)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
