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
  Trash2, 
  Archive, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Bot,
  ArrowLeft,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

// ... (interfaces and constants same as before)

export default function ManageBotsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // ... rest of state and handlers

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

  // ... rest of component

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

      {/* Add Bot Form (unchanged) */}

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
        // ... rest of the list (unchanged)
        <div>...</div>
      )}
    </div>
  );
}
