'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import BottomNav from '@/components/dashboard/BottomNav';
import { 
  Menu, 
  X,
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  Bot, 
  Image, 
  Activity, 
  Radio, 
  CreditCard, 
  Phone, 
  Settings,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'Prompt Trading', href: '/dashboard/prompt-trading', icon: <MessageSquare size={18} /> },
  { name: 'Auto Trading', href: '/dashboard/auto-trading', icon: <Zap size={18} /> },
  { name: 'AI Trading', href: '/dashboard/ai-trading', icon: <Bot size={18} /> },
  { name: 'Upload Chart', href: '/dashboard/upload-chart', icon: <Image size={18} /> },
  { name: 'Manage Bots', href: '/dashboard/manage-bots', icon: <Activity size={18} /> },
  { name: 'Pulse Signals', href: '/dashboard/pulse-signals', icon: <Radio size={18} /> },
  { name: 'Subscription', href: '/dashboard/subscription', icon: <CreditCard size={18} /> },
  { name: 'Contact Support', href: '/dashboard/contact-support', icon: <Phone size={18} /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const pathname = usePathname();
  const { user } = useUser();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toggle Button - Always Visible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (for mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 mt-12">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <span className="font-bold text-gray-800">PipnexAi</span>
              <span className="text-blue-600 font-bold"> Algo</span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <UserButton />
          <div>
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.fullName || user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">v2.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 pb-24">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
