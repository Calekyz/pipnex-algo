'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Phone, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================
// Inner component that uses useSearchParams
// ============================================
function SupportContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [sent, setSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-fill message from URL param
  useEffect(() => {
    const prefill = searchParams.get('message');
    if (prefill) {
      setNewMessage(decodeURIComponent(prefill));
    }
  }, [searchParams]);

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

    setSending(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setSent(true);
        if (newMessage.includes('upgrade my subscription') || newMessage.includes('subscription')) {
          setTimeout(() => {
            setSent(false);
            setNewMessage('');
          }, 5000);
        } else {
          setNewMessage('');
          fetchMessages();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📞 Contact Support</h1>
        <p className="text-gray-500 text-sm">
          Get help from our support team or request a subscription upgrade
        </p>
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
            {sent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Request sent successfully!</p>
                  <p className="text-green-600">
                    Our team will review your request and get back to you within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {messages.length === 0 && !sent ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">💬</p>
                <p>No messages yet. Start a conversation!</p>
                <p className="text-sm text-gray-400 mt-1">Support team will respond within 24 hours</p>
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
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={searchParams.get('message') ? 'Edit your request...' : 'Type your message...'}
                className="flex-1"
                disabled={sending || sent}
              />
              <Button type="submit" disabled={sending || sent || !newMessage.trim()}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              {searchParams.get('message') ? (
                <span className="text-blue-600">💡 Your subscription request has been pre-filled. Send it to our team!</span>
              ) : (
                'Need to upgrade? Click "Get Plan" from the Subscription page to auto-fill your request.'
              )}
            </p>
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

// ============================================
// Default export with Suspense boundary
// ============================================
export default function SupportPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>}>
      <SupportContent />
    </Suspense>
  );
}
