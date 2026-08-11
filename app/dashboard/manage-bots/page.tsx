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
  Bot,
  ArrowLeft,
  Check,
  X,
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
        console.error('Response not OK:', res.status, text);
        throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
      }
      
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err: any) {
      console.error('Fetch bots error:', err);
      setError(err.message || 'Failed to load bots');
      // Keep existing bots list to avoid breaking UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [showArchived]);

  // ... rest of the component (same as before, keep handlers)

  return (
    <div className="space-y-6 pb-24">
      {/* Header and form code - unchanged */}
      {/* ... */}
    </div>
  );
}
