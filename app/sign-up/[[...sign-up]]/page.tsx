'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignUp, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [signUpComplete, setSignUpComplete] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetch(`/api/user/status`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ACTIVE') {
            router.push('/dashboard');
          } else {
            setShowCodeEntry(true);
            setSignUpComplete(true);
          }
        })
        .catch(() => {
          setShowCodeEntry(true);
          setSignUpComplete(true);
        });
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          email: user?.emailAddresses[0]?.emailAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`✅ ${data.message}`);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(data.error || 'Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!signUpComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="flex justify-center mb-6">
            <Image
              src="https://i.postimg.cc/TYFKgV5s/Chat-GPT-Image-Aug-9-2026-05-52-20-PM.png"
              alt="PipnexAi Algo Logo"
              width={60}
              height={60}
              className="rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Create Your Account</h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Sign up to start your AI trading journey
          </p>
          <SignUp routing="hash" signInUrl="/sign-in" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://i.postimg.cc/TYFKgV5s/Chat-GPT-Image-Aug-9-2026-05-52-20-PM.png"
              alt="PipnexAi Algo Logo"
              width={50}
              height={50}
              className="rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl text-white">Welcome to PipnexAi Algo! 🎉</CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Your account has been created. Enter your activation code to get started.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Activation Code
              </label>
              <Input
                type="text"
                placeholder="e.g., pro-john123"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: <span className="font-mono">plan-username</span>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
              {loading ? 'Verifying...' : 'Activate Account'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Don't have a code? Contact us at <span className="text-blue-400">support@pipnexai.com</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
