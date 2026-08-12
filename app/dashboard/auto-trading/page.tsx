import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Activity, 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  ChevronRight,
  Play,
  Square,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AutoTradingPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return redirect('/sign-in');
  }

  // Fetch all EA instances for this user, including bot and brokerAccount info
  const eaInstances = await prisma.eAInstance.findMany({
    where: { userId: user.id },
    include: {
      bot: true,
      brokerAccount: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all bots (global + user-owned) for reference
  const allBots = await prisma.bot.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  // Separate running vs stopped instances
  const runningInstances = eaInstances.filter(ea => ea.status === 'RUNNING' || ea.status === 'ONLINE');
  const stoppedInstances = eaInstances.filter(ea => ea.status !== 'RUNNING' && ea.status !== 'ONLINE');

  // Compute overall auto-trading status
  const isAutoTradingActive = runningInstances.length > 0;

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
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isAutoTradingActive 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAutoTradingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isAutoTradingActive ? 'Auto Trading Active' : 'Auto Trading Off'}
          </div>
          <Link href="/dashboard/prompt-trading">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <Play size={16} className="mr-2" /> Deploy New EA
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Bots"
          value={allBots.length}
          icon={<Bot className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label="Running EAs"
          value={runningInstances.length}
          icon={<Activity className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          label="Stopped EAs"
          value={stoppedInstances.length}
          icon={<Square className="w-5 h-5 text-gray-500" />}
        />
        <StatCard
          label="Total Trades"
          value={eaInstances.reduce((acc, ea) => acc + (ea.totalTrades || 0), 0)}
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Running Instances */}
      {runningInstances.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">🟢 Running EAs</h2>
          {runningInstances.map((ea) => (
            <EAInstanceCard key={ea.id} instance={ea} status="running" />
          ))}
        </div>
      )}

      {/* Stopped Instances */}
      {stoppedInstances.length > 0 && (
        <div className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold text-gray-500">⏹️ Stopped EAs</h2>
          {stoppedInstances.map((ea) => (
            <EAInstanceCard key={ea.id} instance={ea} status="stopped" />
          ))}
        </div>
      )}

      {/* No instances */}
      {eaInstances.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg font-medium">No EAs deployed yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Go to <Link href="/dashboard/prompt-trading" className="text-blue-600 hover:underline">Prompt Trading</Link> to deploy your first EA.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Disclaimer</p>
        <p>Trading involves risk. Past performance does not guarantee future results. Always use proper risk management.</p>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </CardContent>
    </Card>
  );
}

// ============================================
// EA Instance Card Component
// ============================================

function EAInstanceCard({ instance, status }: { instance: any; status: 'running' | 'stopped' }) {
  const bot = instance.bot;
  const broker = instance.brokerAccount;

  const isRunning = status === 'running';

  return (
    <Card className={`border-l-4 ${isRunning ? 'border-l-green-500' : 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{bot?.icon || '🤖'}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800">{bot?.name || 'Unknown EA'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isRunning ? '● Running' : '● Stopped'}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {bot?.type || 'EA'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {broker?.name || broker?.broker || 'Unknown Broker'} · Account: {broker?.accountId || 'N/A'}
              </p>
              <p className="text-xs text-gray-400">
                Strategy: {bot?.strategy || 'N/A'} · Risk: {bot?.riskLevel || 'N/A'}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">{bot?.performance || ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Balance</p>
              <p className="font-medium text-gray-800">${instance.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-500">Equity</p>
              <p className="font-medium text-gray-800">${instance.equity?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-500">Trades</p>
              <p className="font-medium text-gray-800">{instance.totalTrades || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">P&L</p>
              <p className={`font-medium ${(instance.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(instance.profit || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {isRunning ? (
              <Button variant="destructive" size="sm" className="flex items-center gap-1">
                <Square size={14} /> Stop
              </Button>
            ) : (
              <Button variant="default" size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                <Play size={14} /> Start
              </Button>
            )}
            <Link href={`/dashboard/auto-trading/${instance.id}`}>
              <Button variant="outline" size="sm">View</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
