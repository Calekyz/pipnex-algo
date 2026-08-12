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
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Filter
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

type TabType = 'all' | 'news' | 'events';
type ImpactFilter = 'all' | 'High' | 'Medium' | 'Low';

export default function NewsPage() {
  const { user } = useUser();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all');

  const fetchNews = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/news');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
      }
      const data = await res.json();
      setNews(data.news || []);
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('News fetch error:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtering logic
  const filteredNews = news.filter(item =>
    item.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events
    .filter(item => {
      const matchesSearch = item.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesImpact = impactFilter === 'all' || item.impact === impactFilter;
      return matchesSearch && matchesImpact;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // newest first

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getImpactEmoji = (impact: string) => {
    switch (impact) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      default: return '🟢';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const getEventDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">{error}</p>
          <Button variant="outline" onClick={() => fetchNews(true)} className="mt-4">
            <RefreshCw size={16} className="mr-2" /> Retry
          </Button>
        </div>
      );
    }

    const showNews = activeTab === 'all' || activeTab === 'news';
    const showEvents = activeTab === 'all' || activeTab === 'events';

    return (
      <div className="space-y-8">
        {/* News Section */}
        {showNews && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Latest Forex News
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filteredNews.length})
                </span>
              </CardTitle>
              {filteredNews.length > 0 && (
                <span className="text-xs text-gray-400">
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              )}
            </CardHeader>
            <CardContent>
              {filteredNews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'No news match your search' : 'No news available at the moment'}
                </p>
              ) : (
                <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredNews.map((item, idx) => (
                    <li key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-50 transition-colors rounded-lg p-2 -mx-2"
                      >
                        <div className="flex items-start gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.headline}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">
                              {item.headline}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.summary}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="font-medium text-gray-600">{item.source}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(item.datetime)}
                              </span>
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
        {showEvents && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Economic Calendar
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filteredEvents.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'No events match your search' : 'No upcoming economic events'}
                </p>
              ) : (
                <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredEvents.map((event, idx) => (
                    <li key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-700">{event.country}</span>
                            <span className="text-sm font-medium text-gray-800">{event.event}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>📅 {getEventDateDisplay(event.date)}</span>
                            {event.forecast && (
                              <span>Forecast: <span className="font-medium text-gray-700">{event.forecast}</span></span>
                            )}
                            {event.previous && (
                              <span>Previous: <span className="font-medium text-gray-500">{event.previous}</span></span>
                            )}
                            {event.actual && (
                              <span>Actual: <span className="font-medium text-blue-600">{event.actual}</span></span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getImpactColor(event.impact)} whitespace-nowrap`}>
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
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📰 Market News & Economic Calendar</h1>
          <p className="text-gray-500 text-sm">
            Real-time forex news and upcoming economic events
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Search & Filters */}
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
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                activeTab === 'news'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              News
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                activeTab === 'events'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>

          {activeTab !== 'news' && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value as ImpactFilter)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
              >
                <option value="all">All Impact</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {renderTabContent()}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Disclaimer</p>
        <p>The news and economic data displayed are for informational purposes only. Always verify with official sources before making trading decisions.</p>
      </div>
    </div>
  );
}
