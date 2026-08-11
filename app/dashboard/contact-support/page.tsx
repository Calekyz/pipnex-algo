'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, Send } from 'lucide-react';

export default function SupportPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/admin/status');
        if (res.ok) {
          const data = await res.json();
          setAdminOnline(data.isOnline);
        }
      } catch (err) {
        console.error('Failed to fetch admin status:', err);
      }
    };
    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat history
  useEffect(() => {
    if (activeTab === 'chat' && user) {
      fetchMessages();
    }
  }, [activeTab, user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/support/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setTicketId(data.ticketId || null);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Contact Support</h1>
        <p className="text-gray-500 text-sm">Get help from our support team</p>
      </div>

      {/* Tab Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-4 rounded-xl text-center transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageCircle className="w-6 h-6 mx-auto mb-2" />
          <span className="font-medium">Chat with Agent</span>
          {adminOnline && activeTab === 'chat' && (
            <span className="block text-xs text-green-300">● Online</span>
          )}
          {!adminOnline && activeTab === 'chat' && (
            <span className="block text-xs text-yellow-300">● Away</span>
          )}
        </button>

        <a
          href="https://wa.me/254101606189?text=Hello%20PipnexAi%20Algo%20Support%2C%20I%20need%20assistance%20with%20my%20account."
          target="_blank"
          rel="noopener noreferrer"
          className={`p-4 rounded-xl text-center transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Phone className="w-6 h-6 mx-auto mb-2" />
          <span className="font-medium">Contact via WhatsApp</span>
          <span className="block text-xs text-gray-400">Click to open WhatsApp</span>
        </a>
      </div>

      {/* Chat Section */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Chat</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-500">
                  {adminOnline ? 'Admin Online' : 'Admin Offline'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">💬</p>
                <p>No messages yet. Start a conversation!</p>
                <p className="text-sm text-gray-400">Support team will respond within 24 hours</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800 self-start'
                      : 'bg-gray-200 text-gray-800 self-end ml-auto'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : <Send size={20} />}
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* WhatsApp Info */}
      {activeTab === 'whatsapp' && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-xl font-bold text-gray-800">WhatsApp Support</h2>
            <p className="text-gray-500 text-sm mt-2">
              Click the button below to start a WhatsApp chat with our support team.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Number: <span className="font-mono">+254 101 606 189</span>
            </p>
            <a
              href="https://wa.me/254101606189?text=Hello%20PipnexAi%20Algo%20Support%2C%20I%20need%20assistance%20with%20my%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              <MessageCircle className="inline mr-2" size={20} />
              Open WhatsApp
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
