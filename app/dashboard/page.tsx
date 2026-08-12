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
  BarChart,
  Radio,
  Wallet,
  Play,
  Square,
  AlertCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bots: true,
      eaInstances: {
        where: { status: { in: ['RUNNING', 'ONLINE'] } },
        include: { bot: true, brokerAccount: true },
      },
      brokerAccounts: {
        where: { isConnected: true },
      },
    },
  });

  if (!user) {
    try {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      });

      if (!clerkRes.ok) {
        return redirect('/sign-in');
      }

      const clerkUser = await clerkRes.json();
      const email = clerkUser.email_addresses?.[0]?.email_address || '';
      const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'User';

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          status: 'PENDING',
          credits: 0,
        },
        include: {
          bots: true,
          eaInstances: {
            where: { status: { in: ['RUNNING', 'ONLINE'] } },
            include: { bot: true, brokerAccount: true },
          },
          brokerAccounts: {
            where: { isConnected: true },
          },
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return redirect('/sign-in');
    }
  }

  if (user.status === 'PENDING' || user.status === 'EXPIRED') {
    return redirect('/sign-up');
  }

  // Real stats from database
  const totalBots = user.bots?.length || 0;
  const runningBots = user.bots?.filter(b => b.isRunning).length || 0;
  const activeEAs = user.eaInstances?.length || 0;

  // Real EA metrics (aggregate from all EA instances)
  let totalTrades = 0;
  let totalProfit = 0;
  let totalBalance = 0;

  for (const ea of user.eaInstances || []) {
    totalTrades += ea.totalTrades || 0;
    totalProfit += ea.profit || 0;
    totalBalance += ea.balance || 0;
  }

  const isAutoTradingActive = runningBots > 0 || activeEAs > 0;
  const connectedBrokers = user.brokerAccounts?.length || 0;

  // Format numbers
  const formattedProfit = totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`;
  const isPositive = totalProfit >= 0;

  // Build activity feed from EA instances
  const activities = [
    ...(user.eaInstances?.map(ea => ({
      id: ea.id,
      type: 'bot',
      message: `${ea.bot?.name || 'EA'} running on ${ea.brokerAccount?.name || ea.brokerAccount?.broker || 'broker'}`,
      time: ea.startedAt ? `${Math.floor((Date.now() - new Date(ea.startedAt).getTime()) / 60000)} min ago` : 'Just now',
      status: 'success',
    })) || []),
  ];

  // If no activities, show a placeholder
  if (activities.length === 0) {
    activities.push({
      id: 0,
      type: 'info',
      message: 'No trading activity yet. Start your first EA!',
      time: 'Now',
      status: 'info',
    });
  }

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back{user.name ? `, ${user.name}` : ''} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
              <Play size={16} className="mr-2" /> Start Trading
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Bots"
          value={runningBots}
          total={totalBots}
          icon={<Bot className="w-5 h-5 text-blue-500" />}
          subtitle={runningBots > 0 ? `${runningBots} running` : 'None running'}
          color="blue"
        />
        <StatCard
          title="Active EAs"
          value={activeEAs}
          icon={<Activity className="w-5 h-5 text-purple-500" />}
          subtitle={`${connectedBrokers} brokers connected`}
          color="purple"
        />
        <StatCard
          title="Total Trades"
          value={totalTrades}
          icon={<BarChart className="w-5 h-5 text-orange-500" />}
          subtitle="All time"
          color="orange"
        />
        <StatCard
          title="Total P&L"
          value={formattedProfit}
          icon={isPositive ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
          subtitle={`Balance: $${totalBalance.toFixed(2)}`}
          color={isPositive ? 'green' : 'red'}
          valueColor={isPositive ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="AI Trading"
          description="Let AI trade for you"
          icon={<Zap className="w-6 h-6 text-white" />}
          href="/dashboard/prompt-trading"
          gradient="from-blue-500 to-indigo-500"
          buttonText="Start AI"
        />
        <QuickActionCard
          title="Connect Broker"
          description="Link your trading account"
          icon={<Wallet className="w-6 h-6 text-white" />}
          href="/dashboard/prompt-trading"
          gradient="from-emerald-500 to-teal-500"
          buttonText="Connect"
        />
        <QuickActionCard
          title="Market Pulse"
          description="Live market insights"
          icon={<BarChart className="w-6 h-6 text-white" />}
          href="/dashboard#market-pulse"
          gradient="from-purple-500 to-pink-500"
          buttonText="View"
        />
      </div>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" /> Activity Feed
          </CardTitle>
          <Link href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className={`mt-0.5 w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  activity.status === 'success' ? 'bg-green-100 text-green-700' :
                  activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.type}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* BOT STATUS OVERVIEW */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-500" /> Your Bots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.bots && user.bots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.bots.slice(0, 4).map((bot) => (
                <div key={bot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bot.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{bot.name}</p>
                      <p className="text-xs text-gray-500">{bot.type} · {bot.strategy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${bot.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className={`text-xs font-medium ${bot.isRunning ? 'text-green-600' : 'text-gray-400'}`}>
                      {bot.isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Bot className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>No bots yet</p>
              <Link href="/dashboard/manage-bots" className="text-sm text-blue-600 hover:text-blue-800">
                Add your first bot →
              </Link>
            </div>
          )}
          {user.bots && user.bots.length > 4 && (
            <Link href="/dashboard/manage-bots" className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-3">
              View all {user.bots.length} bots →
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ 
  title, 
  value, 
  total, 
  icon, 
  subtitle, 
  color = 'blue',
  valueColor 
}: { 
  title: string; 
  value: string | number; 
  total?: number; 
  icon: React.ReactNode; 
  subtitle?: string; 
  color?: 'blue' | 'purple' | 'orange' | 'green' | 'red';
  valueColor?: string;
}) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
    green: 'bg-green-50 border-green-100',
    red: 'bg-red-50 border-red-100',
  };

  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor || 'text-gray-800'}`}>
              {value}
              {total !== undefined && (
                <span className="text-sm font-normal text-gray-400 ml-1">/ {total}</span>
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Quick Action Card Component
// ============================================

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  gradient, 
  buttonText 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string; 
  gradient: string; 
  buttonText: string; 
}) {
  return (
    <Card className={`bg-gradient-to-r ${gradient} border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1`}>
      <CardContent className="p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold">{title}</p>
            <p className="text-sm opacity-90">{description}</p>
            <Link href={href}>
              <Button variant="default" size="sm" className="mt-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0">
                {buttonText} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
