'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Play, Square, Bot, Wallet, AlertCircle, RefreshCw } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  color: string;
  isRunning: boolean;
}

interface BrokerAccount {
  id: string;
  name: string;
  broker: string;
  accountId: string;
  isConnected: boolean;
  balance?: number;
}

// ✅ All brokers supported by the trading engine
const SUPPORTED_BROKERS = [
  'IC_MARKETS',
  'VALETAX',
  'EXNESS',
  'JUST_MARKET',
  'HFM',
  'FXPRO',
  'PEPPERSTONE',
];

export default function PromptTradingPage() {
  const { user } = useUser();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    broker: 'IC_MARKETS',
    accountId: '',
    password: '',
    server: '',
  });

  useEffect(() => {
    fetchBots();
    fetchAccounts();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/auto-trading');
      if (res.ok) {
        const data = await res.json();
        setBots(data.bots || []);
        if (data.bots.length > 0) {
          setSelectedBot(data.bots[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/broker-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const testConnection = async (accountId: string) => {
    setTestingConnection(accountId);
    setError(null);
    try {
      const res = await fetch('/api/broker-accounts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchAccounts(); // refresh status
        alert('✅ Connection successful!');
      } else {
        setError(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/broker-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      });

      if (res.ok) {
        setShowAddAccount(false);
        setNewAccount({ name: '', broker: 'IC_MARKETS', accountId: '', password: '', server: '' });
        fetchAccounts();
        // Test connection after adding
        const data = await res.json();
        if (data.account) {
          await testConnection(data.account.id);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add account');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrading = async () => {
    if (!selectedBot || !selectedAccount) {
      setError('Please select both a bot and an account');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prompt-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: selectedBot, accountId: selectedAccount }),
      });

      if (res.ok) {
        setIsRunning(true);
        alert('✅ Trading started successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start trading');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTrading = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/prompt-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount }),
      });

      if (res.ok) {
        setIsRunning(false);
        alert('⛔ Trading stopped successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to stop trading');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedBotData = bots.find(b => b.id === selectedBot);
  const selectedAccountData = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Prompt Trading</h1>
        <p className="text-gray-500 text-sm">
          Connect your broker account and start trading with AI-powered EAs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Select EA & Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot size={20} /> Select Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* EA Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trading Bot (EA)</label>
              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={isRunning}
              >
                {bots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.icon} {bot.name} ({bot.type})
                  </option>
                ))}
              </select>
              {selectedBotData && (
                <p className="text-xs text-gray-500 mt-1">{selectedBotData.description}</p>
              )}
            </div>

            {/* Account Selection */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Broker Account</label>
                <button
                  onClick={() => setShowAddAccount(!showAddAccount)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Account
                </button>
              </div>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={isRunning}
              >
                <option value="">Select an account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.broker.replace('_', ' ')}) - {acc.isConnected ? '✅ Connected' : '🔴 Disconnected'}
                  </option>
                ))}
              </select>
              {selectedAccountData && (
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-xs text-gray-500">
                    Balance: ${selectedAccountData.balance?.toFixed(2) || 'N/A'}
                  </p>
                  <button
                    onClick={() => testConnection(selectedAccountData.id)}
                    disabled={testingConnection === selectedAccountData.id}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {testingConnection === selectedAccountData.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Test Connection
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!isRunning ? (
                <Button
                  onClick={handleStartTrading}
                  disabled={!selectedBot || !selectedAccount || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
                  Start Trading
                </Button>
              ) : (
                <Button
                  onClick={handleStopTrading}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Square size={16} className="mr-2" />}
                  Stop Trading
                </Button>
              )}
            </div>

            {isRunning && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                🟢 Auto Trading Active: {selectedBotData?.name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet size={20} /> Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏦</div>
                <p>No broker accounts connected</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Account" to connect</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-3 border rounded-lg flex justify-between items-center ${
                      acc.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{acc.name}</p>
                      <p className="text-xs text-gray-500">
                        {acc.broker.replace('_', ' ')} · Account: {acc.accountId}
                      </p>
                      {acc.balance !== undefined && (
                        <p className="text-sm font-semibold text-gray-700">
                          Balance: ${acc.balance.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        acc.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {acc.isConnected ? '● Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Account Form */}
      {showAddAccount && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Connect Broker Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="e.g., My Main Account"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Broker</label>
                  <select
                    value={newAccount.broker}
                    onChange={(e) => setNewAccount({ ...newAccount, broker: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {SUPPORTED_BROKERS.map((broker) => (
                      <option key={broker} value={broker}>
                        {broker.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account ID / Login</label>
                  <Input
                    value={newAccount.accountId}
                    onChange={(e) => setNewAccount({ ...newAccount, accountId: e.target.value })}
                    placeholder="e.g., 1234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <Input
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    placeholder="Your MT5 password"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                  <Input
                    value={newAccount.server}
                    onChange={(e) => setNewAccount({ ...newAccount, server: e.target.value })}
                    placeholder="e.g., ICMarkets-Demo, ICMarketsLive01"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                  Connect Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddAccount(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
