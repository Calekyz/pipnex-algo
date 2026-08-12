'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Play, Square, Bot, Wallet, AlertCircle, Settings2 } from 'lucide-react';

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

// ✅ All supported brokers
const SUPPORTED_BROKERS = [
  'IC_MARKETS',
  'VALETAX',
  'EXNESS',
  'JUST_MARKET',
  'HFM',
  'FXPRO',
  'PEPPERSTONE',
];

// ✅ EA configuration fields for each bot type
interface ConfigField {
  key: string;
  label: string;
  type: 'number' | 'text';
  default: string | number;
  step?: number;
}

const getEAConfigFields = (botType: string): ConfigField[] => {
  const baseFields: ConfigField[] = [
    { key: 'initialLot', label: 'Initial Lot Size', type: 'number', default: 0.05, step: 0.01 },
    { key: 'martingaleMultiplier', label: 'Martingale Multiplier', type: 'number', default: 2.0, step: 0.1 },
    { key: 'tradesPerSequence', label: 'Trades Per Sequence', type: 'number', default: 3, step: 1 },
    { key: 'recoveryTarget', label: 'Recovery Target (pips)', type: 'number', default: 20, step: 1 },
    { key: 'initialSL', label: 'Initial Stop Loss (pips)', type: 'number', default: 70, step: 1 },
  ];

  const scalperFields: ConfigField[] = [
    { key: 'initialLot', label: 'Initial Lot Size', type: 'number', default: 0.03, step: 0.01 },
    { key: 'martingaleMultiplier', label: 'Martingale Multiplier', type: 'number', default: 2.0, step: 0.1 },
    { key: 'tradesPerSequence', label: 'Trades Per Sequence', type: 'number', default: 3, step: 1 },
    { key: 'recoveryTarget', label: 'Recovery Target (pips)', type: 'number', default: 10, step: 1 },
    { key: 'initialSL', label: 'Initial Stop Loss (pips)', type: 'number', default: 30, step: 1 },
  ];

  const swingFields: ConfigField[] = [
    { key: 'lotSize', label: 'Lot Size', type: 'number', default: 0.05, step: 0.01 },
    { key: 'rewardRiskRatio', label: 'Reward/Risk Ratio', type: 'number', default: 3.0, step: 0.1 },
    { key: 'swingStrength', label: 'Swing Strength', type: 'number', default: 30, step: 1 },
    { key: 'maxOpenPositions', label: 'Max Open Positions', type: 'number', default: 5, step: 1 },
    { key: 'fibLevels', label: 'Fibonacci Levels', type: 'text', default: '0.236,0.382,0.5,0.618,0.786' },
  ];

  const aiFields: ConfigField[] = [
    { key: 'lotSize', label: 'Lot Size', type: 'number', default: 0.04, step: 0.01 },
    { key: 'rewardRiskRatio', label: 'Reward/Risk Ratio', type: 'number', default: 3.0, step: 0.1 },
    { key: 'swingStrength', label: 'Swing Strength', type: 'number', default: 30, step: 1 },
    { key: 'maxOpenPositions', label: 'Max Open Positions', type: 'number', default: 4, step: 1 },
  ];

  switch (botType) {
    case 'SCALPER':
      return scalperFields;
    case 'SWING':
      return swingFields;
    case 'AI':
      return aiFields;
    default:
      return baseFields;
  }
};

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
  const [eaConfig, setEaConfig] = useState<Record<string, any>>({});

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

  useEffect(() => {
    // When bot changes, load default config
    const bot = bots.find(b => b.id === selectedBot);
    if (bot) {
      const fields = getEAConfigFields(bot.type);
      const config: Record<string, any> = {};
      fields.forEach(f => {
        config[f.key] = f.default;
      });
      setEaConfig(config);
    }
  }, [selectedBot, bots]);

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
        fetchAccounts();
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
        body: JSON.stringify({
          botId: selectedBot,
          accountId: selectedAccount,
          config: eaConfig,
        }),
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

  const handleConfigChange = (key: string, value: any) => {
    setEaConfig({ ...eaConfig, [key]: value });
  };

  const selectedBotData = bots.find(b => b.id === selectedBot);
  const selectedAccountData = accounts.find(a => a.id === selectedAccount);
  const configFields = selectedBotData ? getEAConfigFields(selectedBotData.type) : [];

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
                      'Test Connection'
                    )}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: EA Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 size={20} /> EA Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configFields.length === 0 ? (
              <p className="text-sm text-gray-500">Select a bot to configure settings</p>
            ) : (
              configFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'text' ? (
                    <Input
                      type="text"
                      value={(eaConfig[field.key] as string) || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      className="w-full"
                      placeholder={String(field.default)}
                    />
                  ) : (
                    <Input
                      type="number"
                      step={field.step || 0.01}
                      value={eaConfig[field.key] !== undefined ? eaConfig[field.key] : field.default}
                      onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
                      className="w-full"
                      placeholder={String(field.default)}
                    />
                  )}
                </div>
              ))
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
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
