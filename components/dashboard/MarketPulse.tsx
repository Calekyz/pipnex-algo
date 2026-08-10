'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRealTimePrice } from '@/lib/twelvedata';

interface MarketPulseProps {
  pairs: { label: string; value: string }[];
}

export default function MarketPulse({ pairs }: MarketPulseProps) {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const results: Record<string, any> = {};
      for (const pair of pairs) {
        const data = await getRealTimePrice(pair.value);
        if (data) {
          results[pair.value] = data;
        }
      }
      setPrices(results);
      setLoading(false);
    };
    fetchPrices();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [pairs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-blue-600">📊</span> Market Pulse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {pairs.map((pair) => {
              const data = prices[pair.value];
              return (
                <div key={pair.value} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium">{pair.label}</p>
                  <p className="text-sm font-bold text-gray-800">
                    {data?.price ? Number(data.price).toFixed(4) : '—'}
                  </p>
                  <p className={`text-xs font-medium ${
                    data?.change ? (Number(data.change) >= 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'
                  }`}>
                    {data?.change ? (Number(data.change) >= 0 ? '+' : '') + Number(data.change).toFixed(2) + '%' : 'N/A'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
