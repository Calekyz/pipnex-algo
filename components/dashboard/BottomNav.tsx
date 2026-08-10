'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Image, CreditCard, Headphones } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isUpload?: boolean;
}

export default function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Home', href: '/dashboard', icon: <Home size={24} /> },
    { name: 'Auto Trade', href: '/dashboard/auto-trading', icon: <Zap size={24} /> },
    { 
      name: 'Upload', 
      href: '/dashboard/upload-chart', 
      icon: <Image size={28} />,
      isUpload: true 
    },
    { name: 'Subscription', href: '/dashboard/subscription', icon: <CreditCard size={24} /> },
    { name: 'Support', href: '/dashboard/contact-support', icon: <Headphones size={24} /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);

          if (item.isUpload) {
            // Upload button – Bigger with Orange/Gradient
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -mt-6 flex flex-col items-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-2xl shadow-lg shadow-orange-500/40 flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50 active:scale-95">
                  <span className="text-white drop-shadow-md">{item.icon}</span>
                </div>
                <span className="text-xs font-medium text-orange-600 mt-1">
                  {item.name}
                </span>
              </Link>
            );
          }

          // Normal buttons
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-0.5 group relative py-1 px-3"
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  active
                    ? 'text-blue-600 bg-blue-50 shadow-inner'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="drop-shadow-md">{item.icon}</span>
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              >
                {item.name}
              </span>
              {active && (
                <div className="absolute -top-0.5 w-6 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
