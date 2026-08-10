'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignUp, useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetch('/api/user/status')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ACTIVE') {
            router.push('/dashboard');
          }
          // If not ACTIVE, stay on sign-up page (to enter code)
        })
        .catch(() => {});
    }
  }, [isLoaded, isSignedIn, user, router]);

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
          {isSignedIn ? 'Enter your activation code below' : 'Sign up to start your AI trading journey'}
        </p>
        {!isSignedIn ? (
          <SignUp routing="hash" signInUrl="/sign-in" />
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm text-center">
              Your account is pending activation. Please enter your code below.
            </p>
            <CodeEntryForm />
          </div>
        )}
      </div>
    </div>
  );
}

function CodeEntryForm() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSuccess('✅ ' + data.message);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="e.g., pro-john123"
        value={code}
        onChange={(e) => setCode(e.target.value.toLowerCase())}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
        required
      />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">{success}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Activate Account'}
      </button>
    </form>
  );
}
