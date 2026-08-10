'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';

interface StatsCardsProps {
  credits: number;
}

export default function StatsCards({ credits }: StatsCardsProps) {
  const { user } = useUser();

  const stats = [
    { label: 'AI Analyses Today', value: 0, icon: '📊' },
    { label: 'Signals Generated', value: 0, icon: '📈' },
    { label: 'Charts Analyzed', value: 0, icon: '📉' },
    { label: 'Preferred Strategy', value: 'Not Selected', icon: '🎯' },
    { label: 'AI Confidence (Avg)', value: '—', icon: '🎯' },
    { label: 'Auto-Trading', value: 'OFF', icon: '⚡', highlight: true },
    { label: 'Copy Trading', value: 'Not Configured', icon: '📋' },
    { label: 'Credits', value: credits, icon: '💰' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-lg font-bold mt-1 ${stat.highlight && stat.value === 'OFF' ? 'text-red-500' : 'text-gray-800'}`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-xl">{stat.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
