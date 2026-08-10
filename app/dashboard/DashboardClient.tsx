'use client';

import { useState, useEffect } from 'react';
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

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: string;
  url: string;
  image?: string;
}

interface EventItem {
  country: string;
  event: string;
  date: string;
  actual?: string;
  previous?: string;
  forecast?: string;
  impact: string;
}

export default function DashboardClient({ pairs, initialCredits }: DashboardClientProps) {
  const [selectedPair, setSelectedPair] = useState<string>(pairs[0].value);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setNews(data.news || []);
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const marketRes = await fetch(`/api/market-data?symbol=${encodeURIComponent(selectedPair)}`);
      if (!marketRes.ok) throw new Error('Failed to fetch market data');
      const marketData = await marketRes.json();
      setPriceData(marketData.price);

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedPair }),
      });

      if (!analyzeRes.ok) throw new Error('Failed to generate analysis');

      const result = await analyzeRes.json();
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {pairs.map((pair) => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
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
                  You've used all your credits. Please contact support.
                </p>
              )}

              {priceData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600">Current Price</div>
                  <div className="text-2xl font-bold">
                    {priceData.price || 'N/A'}
                  </div>
                  <div className={`text-sm ${parseFloat(priceData?.change || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceData?.change || 'N/A'}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                      <div className={`font-bold text-lg ${analysis.trend === 'Bullish' ? 'text-green-600' : analysis.trend === 'Bearish' ? 'text-red-600' : 'text-yellow-600'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📰 Forex News</CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : news.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No news available</p>
            ) : (
              <ul className="space-y-4 max-h-80 overflow-y-auto">
                {news.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition"
                    >
                      <h4 className="font-medium text-sm">{item.headline}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.source} · {new Date(item.datetime).toLocaleString()}
                      </p>
                      {item.summary && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📅 Economic Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {events.map((event, idx) => (
                  <li key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-gray-500">{event.country}</span>
                        <h4 className="text-sm font-medium">{event.event}</h4>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.impact}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-3">
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      {event.forecast && <span>Forecast: {event.forecast}</span>}
                      {event.previous && <span>Previous: {event.previous}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
