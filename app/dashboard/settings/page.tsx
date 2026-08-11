'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon, 
  CreditCard, 
  AlertTriangle,
  Check,
  Save,
  Loader2
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  credits: number;
  status: string;
  planExpiry: Date | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'account' | 'danger'>('profile');
  const [displayName, setDisplayName] = useState('');
  const [defaultPair, setDefaultPair] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');
  const [riskPreference, setRiskPreference] = useState('Moderate');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  // Fetch user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.fullName || user.username || '');
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/status');
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaved(false);

    try {
      // Update Clerk user
      await user?.update({
        firstName: displayName.split(' ')[0] || '',
        lastName: displayName.split(' ').slice(1).join(' ') || '',
      });

      // Save preferences (in a real app, store in database)
      // For now, we'll just show a success message

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      return;
    }

    try {
      // Call delete API
      const res = await fetch('/api/user/delete', {
        method: 'POST',
      });

      if (res.ok) {
        alert('Account deleted successfully.');
        await signOut();
        router.push('/');
      } else {
        alert('Failed to delete account. Please contact support.');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Something went wrong.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences and security</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          <User size={16} /> Profile
        </TabButton>
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <Shield size={16} /> Security
        </TabButton>
        <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}>
          <SettingsIcon size={16} /> Preferences
        </TabButton>
        <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
          <CreditCard size={16} /> Account
        </TabButton>
        <TabButton active={activeTab === 'danger'} onClick={() => setActiveTab('danger')}>
          <AlertTriangle size={16} /> Danger
        </TabButton>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'profile' && (
          <ProfileSection
            displayName={displayName}
            setDisplayName={setDisplayName}
            email={user?.emailAddresses[0]?.emailAddress || ''}
            loading={loading}
            saved={saved}
            onSave={handleSaveProfile}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySection />
        )}

        {activeTab === 'preferences' && (
          <PreferencesSection
            defaultPair={defaultPair}
            setDefaultPair={setDefaultPair}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            riskPreference={riskPreference}
            setRiskPreference={setRiskPreference}
            emailAlerts={emailAlerts}
            setEmailAlerts={setEmailAlerts}
            pushNotifications={pushNotifications}
            setPushNotifications={setPushNotifications}
          />
        )}

        {activeTab === 'account' && (
          <AccountSection userData={userData} />
        )}

        {activeTab === 'danger' && (
          <DangerZone onDelete={handleDeleteAccount} />
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function ProfileSection({ displayName, setDisplayName, email, loading, saved, onSave }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User size={20} /> Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
            className="max-w-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <Input value={email} disabled className="max-w-md bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support for assistance.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
          <p className="text-sm text-gray-500">
            Change your profile picture on <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Clerk Dashboard</a>
          </p>
        </div>
        <Button onClick={onSave} disabled={loading} className="flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Check size={16} /> Profile updated successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield size={20} /> Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🔒 Password and security settings are managed by Clerk.
            <br />
            <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Manage your security settings here →
            </a>
          </p>
        </div>
        <div className="grid gap-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Change Password</p>
              <p className="text-xs text-gray-500">Update your password regularly</p>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600">
              <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">Go to Clerk</a>
            </Button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600">
              <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">Configure</a>
            </Button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Active Sessions</p>
              <p className="text-xs text-gray-500">View devices logged into your account</p>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600">
              <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">View Sessions</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesSection({
  defaultPair,
  setDefaultPair,
  timeframe,
  setTimeframe,
  riskPreference,
  setRiskPreference,
  emailAlerts,
  setEmailAlerts,
  pushNotifications,
  setPushNotifications,
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <SettingsIcon size={20} /> Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency Pair</label>
            <select
              value={defaultPair}
              onChange={(e) => setDefaultPair(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="USD/JPY">USD/JPY</option>
              <option value="AUD/USD">AUD/USD</option>
              <option value="XAU/USD">Gold (XAU/USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Preference</label>
            <select
              value={riskPreference}
              onChange={(e) => setRiskPreference(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="Conservative">Conservative (Low Risk)</option>
              <option value="Moderate">Moderate (Balanced)</option>
              <option value="Aggressive">Aggressive (High Risk)</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="font-medium text-sm mb-3">Notification Preferences</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Email Alerts</span>
              <span className="text-xs text-gray-400">Receive trading signals and news via email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Push Notifications</span>
              <span className="text-xs text-gray-400">Receive real-time alerts on your device</span>
            </label>
          </div>
        </div>

        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save size={16} /> Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}

function AccountSection({ userData }: { userData: UserProfile | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard size={20} /> Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Plan</p>
            <p className="font-semibold text-lg">{userData?.plan || 'Free'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Credits</p>
            <p className="font-semibold text-lg">{userData?.credits || 0}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Status</p>
            <p className={`font-semibold ${
              userData?.status === 'ACTIVE' ? 'text-green-600' :
              userData?.status === 'PENDING' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {userData?.status || 'Unknown'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Expiry</p>
            <p className="font-semibold">
              {userData?.planExpiry ? new Date(userData.planExpiry).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button variant="outline" className="text-blue-600 border-blue-300">
            <a href="/dashboard/subscription">Manage Subscription →</a>
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Account Created</p>
          <p className="text-sm">{new Date().toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DangerZone({ onDelete }: { onDelete: () => void }) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <Card className="border-red-200 border-2">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} /> Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-semibold text-red-700">Delete Account</p>
          <p className="text-sm text-red-600 mt-1">
            This action is permanent and cannot be undone. All your data, signals, and preferences will be deleted.
          </p>
          <div className="mt-3 space-y-3">
            <Input
              placeholder='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="max-w-sm border-red-300 focus:border-red-500"
            />
            <Button
              variant="destructive"
              disabled={confirmText !== 'DELETE'}
              onClick={onDelete}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
