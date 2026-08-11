'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

// ✅ User interface – includes supportTickets (optional)
interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  status: string;
  plan: string | null;
  credits: number;
  planExpiry: Date | null;
  createdAt: Date;
  supportTickets?: any[]; // Optional, may not be included in all queries
}

// ✅ Ticket interface – user does NOT need supportTickets
interface Ticket {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    // Only fields needed for display
  };
  messages: {
    id: string;
    sender: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  }[];
  status: string;
  createdAt: Date;
}

interface AdminClientProps {
  users: User[];
  openTickets: Ticket[];
}

export default function AdminClient({ users: initialUsers, openTickets }: AdminClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editCredits, setEditCredits] = useState('');
  const [editDays, setEditDays] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredUsers = filter === 'ALL' ? users : users.filter(u => u.status === filter);

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user "${email}"?`)) return;
    setDeleting(userId);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          credits: editCredits ? parseInt(editCredits) : undefined,
          plan: editPlan || undefined,
          daysToAdd: editDays ? parseInt(editDays) : 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data.user } : u));
        setSelectedUser({ ...selectedUser, ...data.user });
        alert('User updated successfully!');
        setEditCredits('');
        setEditDays('');
        setEditPlan('');
      } else {
        const data = await res.json();
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      {/* Open Tickets Banner */}
      {openTickets.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-700">
            📩 <strong>{openTickets.length}</strong> open support ticket(s) waiting for reply.
            <a href="/admin/chat" className="ml-2 text-blue-600 hover:underline">Go to Chat</a>
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')} size="sm">
          All ({users.length})
        </Button>
        <Button variant={filter === 'PENDING' ? 'default' : 'outline'} onClick={() => setFilter('PENDING')} size="sm">
          Pending ({users.filter(u => u.status === 'PENDING').length})
        </Button>
        <Button variant={filter === 'ACTIVE' ? 'default' : 'outline'} onClick={() => setFilter('ACTIVE')} size="sm">
          Active ({users.filter(u => u.status === 'ACTIVE').length})
        </Button>
        <Button variant={filter === 'EXPIRED' ? 'default' : 'outline'} onClick={() => setFilter('EXPIRED')} size="sm">
          Expired ({users.filter(u => u.status === 'EXPIRED').length})
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500">No users found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-start flex-wrap gap-2">
                  <div>
                    {user.name || user.email}
                    <span className="text-sm font-normal text-gray-500 ml-4">{user.email}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deleting === user.id}
                  >
                    {deleting === user.id ? 'Deleting...' : '🗑 Delete'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{user.plan || 'Free'}</span></div>
                  <div><span className="text-gray-500">Credits:</span> <span className="font-medium">{user.credits}</span></div>
                  <div>
                    <span className="text-gray-500">Expiry:</span>
                    <span className="font-medium">
                      {user.planExpiry ? formatDate(new Date(user.planExpiry)) : 'N/A'}
                    </span>
                  </div>
                  <div><span className="text-gray-500">Joined:</span> <span className="font-medium">{formatDate(user.createdAt)}</span></div>
                </div>

                {/* Edit User Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedUser?.id === user.id ? 'Hide Edit' : '✏️ Edit User'}
                  </button>

                  {selectedUser?.id === user.id && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Credits</label>
                          <input
                            type="number"
                            value={editCredits}
                            onChange={(e) => setEditCredits(e.target.value)}
                            placeholder={String(user.credits)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Plan</label>
                          <select
                            value={editPlan}
                            onChange={(e) => setEditPlan(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Keep Current</option>
                            <option value="PRO">Pro</option>
                            <option value="GOLD">Gold</option>
                            <option value="PLATINUM">Platinum</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Add Days</label>
                          <input
                            type="number"
                            value={editDays}
                            onChange={(e) => setEditDays(e.target.value)}
                            placeholder="e.g., 30"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <Button onClick={handleUpdateUser} disabled={updating} size="sm">
                        {updating ? 'Updating...' : 'Update User'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
