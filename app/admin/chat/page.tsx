'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Message {
  id: string;
  ticketId: string;
  sender: 'USER' | 'ADMIN';
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  messages: Message[];
  status: string;
  createdAt: string;
}

export default function AdminChatPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = data.tickets.find((t: Ticket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: reply,
        }),
      });
      if (res.ok) {
        setReply('');
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    if (!confirm('Close this ticket?')) return;
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      if (res.ok) {
        fetchTickets();
        setSelectedTicket(null);
        alert('Ticket closed successfully!');
      }
    } catch (err) {
      console.error('Failed to close ticket:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            <ArrowLeft size={20} className="mr-2" /> Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">💬 Support Chat</h1>
          <span className="text-sm text-gray-500">
            {tickets.filter(t => t.status === 'OPEN').length} open tickets
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Ticket List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tickets</div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 border-b hover:bg-gray-50 transition ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{ticket.user.name || ticket.user.email}</p>
                        <p className="text-xs text-gray-500">{ticket.user.email}</p>
                      </div>
                      {ticket.messages.filter(m => m.sender === 'USER' && !m.isRead).length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {ticket.messages.filter(m => m.sender === 'USER' && !m.isRead).length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {ticket.messages.length} messages · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col h-full">
            {selectedTicket ? (
              <>
                <CardHeader className="border-b flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-sm">
                      {selectedTicket.user.name || selectedTicket.user.email}
                    </CardTitle>
                    <p className="text-xs text-gray-500">{selectedTicket.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeTicket(selectedTicket.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-1" /> Close Ticket
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.sender === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800 self-start'
                          : 'bg-gray-200 text-gray-800 self-end ml-auto'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-gray-500">
                          {msg.sender === 'ADMIN' ? '👤 Admin' : '👤 User'} · {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                        {msg.sender === 'USER' && msg.isRead && (
                          <span className="text-[10px] text-green-500">✓ Read</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t">
                  <form onSubmit={sendReply} className="flex gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending}>
                      {sending ? 'Sending...' : <Send size={20} />}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Select a ticket to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
