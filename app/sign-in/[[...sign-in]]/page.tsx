'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
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
        <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          Sign in to your PipnexAi Algo account
        </p>
        <SignIn routing="hash" signUpUrl="/sign-up" />
      </div>
    </div>
  );
}
