'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Plus, 
  Archive, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Bot as BotIcon,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Trash2
} from 'lucide-react';

// ✅ Define the Bot interface
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
  isArchived: boolean;
  userId: string | null;
}

const BOT_TYPES = ['EA', 'AI', 'SCALPER', 'SWING', 'GRID', 'MARTINGALE'];
const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'];
const COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'teal'];
const ICONS = ['🤖', '🧠', '⚡', '📈', '🎯', '🔥', '💎', '🚀'];

export default function ManageBotsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'EA',
    strategy: '',
    riskLevel: 'MODERATE',
    performance: '',
    icon: '🤖',
    color: 'blue',
  });

  const fetchBots = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = showArchived ? '/api/auto-trading?includeArchived=true' : '/api/auto-trading';
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
      }
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err: any) {
      console.error('Fetch bots error:', err);
      setError(err.message || 'Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [showArchived]);

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auto-trading/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add bot');
      }
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        type: 'EA',
        strategy: '',
        riskLevel: 'MODERATE',
        performance: '',
        icon: '🤖',
        color: 'blue',
      });
      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to add bot');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (botId: string, botName: string) => {
    if (!confirm(`Archive "${botName}"? It will be hidden from your main list. You can restore it later.`)) return;
    try {
      const res = await fetch('/api/bots/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to archive');
    }
  };

  const handleRestore = async (botId: string, botName: string) => {
    if (!confirm(`Restore "${botName}" to your active list?`)) return;
    try {
      const res = await fetch('/api/bots/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      if (!res.ok) throw new Error('Failed to restore');
      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to restore');
    }
  };

  const handleRemove = async (botId: string, botName: string) => {
    if (!confirm(`Delete "${botName}" permanently? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/auto-trading/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading && bots.length === 0) {
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
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Manage Bots</h1>
          <p className="text-gray-500 text-sm">
            Add or remove trading bots from your collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-1"
          >
            {showArchived ? <EyeOff size={16} /> : <Eye size={16} />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Add New Bot
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Add Bot Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BotIcon size={20} /> Add New Trading Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBot} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Custom EA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {BOT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the bot's trading strategy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
                  <Input
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    placeholder="e.g., Trend Following, Mean Reversion"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {RISK_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                  <Input
                    value={formData.performance}
                    onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
                    placeholder="e.g., +156% in 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xl"
                  >
                    {ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                  Add Bot
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={16} className="mr-2" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bot List */}
      {bots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg font-medium">No bots available</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add New Bot" to create one, or check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Bots */}
          {bots.filter(b => !b.isArchived).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700">Active Bots</h2>
              {bots.filter(b => !b.isArchived).map((bot) => (
                <ManageBotCard
                  key={bot.id}
                  bot={bot}
                  onArchive={() => handleArchive(bot.id, bot.name)}
                  onRemove={() => handleRemove(bot.id, bot.name)}
                  showArchiveButton={bot.userId !== null}
                />
              ))}
            </div>
          )}

          {/* Archived Bots */}
          {showArchived && bots.filter(b => b.isArchived).length > 0 && (
            <div className="space-y-3 mt-6">
              <h2 className="text-lg font-semibold text-gray-500">Archived Bots</h2>
              {bots.filter(b => b.isArchived).map((bot) => (
                <ManageBotCard
                  key={bot.id}
                  bot={bot}
                  onRestore={() => handleRestore(bot.id, bot.name)}
                  onRemove={() => handleRemove(bot.id, bot.name)}
                  isArchived={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Manage Bot Card Component
// ============================================

function ManageBotCard({ 
  bot, 
  onArchive, 
  onRestore, 
  onRemove, 
  isArchived = false,
  showArchiveButton = true,
}: { 
  bot: Bot; 
  onArchive?: () => void; 
  onRestore?: () => void; 
  onRemove: () => void; 
  isArchived?: boolean;
  showArchiveButton?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    teal: 'border-l-teal-500',
  };

  return (
    <Card className={`border-l-4 ${colorMap[bot.color] || colorMap.blue} ${isArchived ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{bot.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{bot.name}</p>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                {bot.type}
              </span>
              {isArchived && (
                <span className="text-xs px-2 py-0.5 bg-gray-300 rounded-full text-gray-600">
                  Archived
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{bot.description}</p>
            <p className="text-xs text-gray-400">Strategy: {bot.strategy} · Risk: {bot.riskLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-green-600 mr-2">{bot.performance}</span>
          
          {isArchived ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRestore}
              className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <RotateCcw size={14} /> Restore
            </Button>
          ) : (
            <>
              {showArchiveButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  className="flex items-center gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <Archive size={14} /> Archive
                </Button>
              )}
            </>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
