'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  Play, 
  Square, 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Zap,
  Bot,
  Sparkles,
  Shield,
  Target,
  Clock
} from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  description: string;
  type: string;
  strategy: string;
  riskLevel: string;
  performance: string;
  icon: string;
  color: string;
  isActive: boolean;
  isRunning: boolean;
  userId: string | null;
}

export default function AutoTradingPage() {
  const { user } = useUser();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/auto-trading');
      if (!res.ok) {
        throw new Error('Failed to fetch bots');
      }
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const toggleBot = async (botId: string, currentStatus: boolean) => {
    setToggling(botId);
    try {
      const res = await fetch('/api/auto-trading/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, action: currentStatus ? 'stop' : 'start' }),
      });
      if (!res.ok) {
        throw new Error('Failed to toggle bot');
      }
      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle bot');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🤖 Auto Trading</h1>
          <p className="text-gray-500 text-sm">
            Deploy and manage your AI-powered trading bots
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/manage-bots">
            <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Settings size={16} className="mr-2" />
              Manage Bots
            </Button>
          </Link>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            <Plus size={16} className="mr-2" />
            Deploy New Bot
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Bots"
          value={bots.filter(b => b.isRunning).length}
          total={bots.length}
          icon={<Activity size={20} className="text-blue-600" />}
        />
        <StatCard
          label="Total Profit"
          value="+142%"
          icon={<TrendingUp size={20} className="text-green-500" />}
          trend="up"
        />
        <StatCard
          label="Win Rate"
          value="78%"
          icon={<Target size={20} className="text-purple-500" />}
        />
        <StatCard
          label="Uptime"
          value="99.9%"
          icon={<Clock size={20} className="text-orange-500" />}
        />
      </div>

      {/* Bot Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      ) : bots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500">No bots available</p>
          <p className="text-sm text-gray-400 mt-1">Deploy a bot to start auto trading</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onToggle={() => toggleBot(bot.id, bot.isRunning)}
              toggling={toggling === bot.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function StatCard({ label, value, total, icon, trend }: any) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">
            {value}
            {total !== undefined && (
              <span className="text-sm font-normal text-gray-400 ml-1">/ {total}</span>
            )}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function BotCard({ bot, onToggle, toggling }: { bot: Bot; onToggle: () => void; toggling: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    teal: 'from-teal-500 to-cyan-600',
  };

  const gradient = colorMap[bot.color] || colorMap.blue;

  return (
    <Card className={`border-l-4 ${bot.isRunning ? 'border-l-green-500' : 'border-l-gray-300'} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-md`}>
              {bot.icon}
            </div>
            <div>
              <CardTitle className="text-base font-bold">{bot.name}</CardTitle>
              <p className="text-xs text-gray-500">{bot.type}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${bot.isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {bot.isRunning ? '● Running' : '● Stopped'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{bot.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">Strategy</p>
            <p className="font-semibold">{bot.strategy}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">Risk</p>
            <p className={`font-semibold ${
              bot.riskLevel === 'LOW' ? 'text-green-600' :
              bot.riskLevel === 'MODERATE' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {bot.riskLevel}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Performance</p>
            <p className="text-sm font-bold text-green-600">{bot.performance}</p>
          </div>
          <Button
            onClick={onToggle}
            disabled={toggling}
            variant={bot.isRunning ? 'destructive' : 'default'}
            size="sm"
            className="flex items-center gap-1"
          >
            {toggling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : bot.isRunning ? (
              <>
                <Square size={14} /> Stop
              </>
            ) : (
              <>
                <Play size={14} /> Start
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
