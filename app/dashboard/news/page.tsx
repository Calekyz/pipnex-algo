'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Search, 
  Calendar, 
  Globe, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: string;
  url: string;
  image?: string;
  category?: string;
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

// ✅ Correct default export – no props, valid React component
export default function NewsPage() {
  const { user } = useUser();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events'>('all');

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/news');
      if (!res.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await res.json();
      setNews(data.news || []);
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('News fetch error:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item =>
    item.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(item =>
    item.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactColor = (impact: string) => {
    if (impact === 'High') return 'bg-red-100 text-red-700 border-red-200';
    if (impact === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const getImpactEmoji = (impact: string) => {
    if (impact === 'High') return '🔴';
    if (impact === 'Medium') return '🟡';
    return '🟢';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📰 Forex News & Economic Calendar</h1>
        <p className="text-gray-500 text-sm">
          Real-time market news and upcoming economic events
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search news or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={activeTab === 'news' ? 'default' : 'outline'}
            onClick={() => setActiveTab('news')}
            size="sm"
          >
            News
          </Button>
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            onClick={() => setActiveTab('events')}
            size="sm"
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            onClick={fetchNews}
            disabled={loading}
            size="sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-6">
          {/* News Section */}
          {(activeTab === 'all' || activeTab === 'news') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe size={20} className="text-blue-500" />
                  Latest Forex News
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm ? 'No matching news found' : 'No news available at the moment'}
                  </p>
                ) : (
                  <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {filteredNews.map((item, idx) => (
                      <li key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 transition-colors rounded-lg p-2 -mx-2"
                        >
                          <div className="flex items-start gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.headline}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 hover:text-blue-600 transition">
                                {item.headline}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.summary}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="font-medium text-gray-500">{item.source}</span>
                                <span>·</span>
                                <span>{new Date(item.datetime).toLocaleString()}</span>
                                {item.category && (
                                  <>
                                    <span>·</span>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">{item.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Economic Calendar Section */}
          {(activeTab === 'all' || activeTab === 'events') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  Economic Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm ? 'No matching events found' : 'No upcoming economic events'}
                  </p>
                ) : (
                  <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredEvents.map((event, idx) => (
                      <li key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700">{event.country}</span>
                              <span className="text-xs font-medium">{event.event}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>📅 {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}</span>
                              {event.forecast && <span>Forecast: <span className="font-medium text-gray-700">{event.forecast}</span></span>}
                              {event.previous && <span>Previous: <span className="font-medium text-gray-500">{event.previous}</span></span>}
                              {event.actual && <span>Actual: <span className="font-medium text-blue-600">{event.actual}</span></span>}
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getImpactColor(event.impact)}`}>
                            {getImpactEmoji(event.impact)} {event.impact} Impact
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Disclaimer</p>
        <p>The news and economic data displayed are for informational purposes only. Always verify with official sources before making trading decisions.</p>
      </div>
    </div>
  );
}
