'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Bot,
  ArrowLeft,
  Save,
  AlertCircle
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

const BOT_TYPES = ['EA', 'AI', 'SCALPER', 'SWING', 'GRID', 'MARTINGALE'];
const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'];
const COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'teal'];
const ICONS = ['🤖', '🧠', '⚡', '📈', '🎯', '🔥', '💎', '🚀'];

export default function ManageBotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);

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
    try {
      const res = await fetch('/api/auto-trading');
      if (!res.ok) throw new Error('Failed to fetch bots');
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

  const handleRemoveBot = async (botId: string, botName: string) => {
    if (!confirm(`Remove "${botName}" from your bots? This will not delete the bot template.`)) {
      return;
    }

    try {
      const res = await fetch('/api/auto-trading/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove bot');
      }

      fetchBots();
    } catch (err: any) {
      alert(err.message || 'Failed to remove bot');
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
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Add New Bot
        </Button>
      </div>

      {/* Error */}
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
              <Bot size={20} /> Add New Trading Bot
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
                    placeholder="e.g., Pipnex Algo EA"
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
                    placeholder="e.g., +156% in 2024"
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
            <p>No bots added yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add New Bot" to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bots.map((bot) => (
            <ManageBotCard
              key={bot.id}
              bot={bot}
              onRemove={() => handleRemoveBot(bot.id, bot.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Manage Bot Card
// ============================================

function ManageBotCard({ bot, onRemove }: { bot: Bot; onRemove: () => void }) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    teal: 'border-l-teal-500',
  };

  return (
    <Card className={`border-l-4 ${colorMap[bot.color] || colorMap.blue}`}>
      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{bot.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{bot.name}</p>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                {bot.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                bot.isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {bot.isRunning ? '● Running' : 'Stopped'}
              </span>
            </div>
            <p className="text-sm text-gray-500">{bot.description}</p>
            <p className="text-xs text-gray-400">Strategy: {bot.strategy} · Risk: {bot.riskLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-600 mr-2">{bot.performance}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} /> Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
