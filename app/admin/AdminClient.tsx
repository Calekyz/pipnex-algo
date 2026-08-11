'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  status: string;
  plan: string | null;
  credits: number;
  createdAt: Date;
}

interface AdminClientProps {
  users: User[];
}

export default function AdminClient({ users: initialUsers }: AdminClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredUsers = filter === 'ALL' ? users : users.filter(u => u.status === filter);

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return;
    }

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

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
          size="sm"
        >
          All ({users.length})
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setFilter('PENDING')}
          size="sm"
        >
          Pending ({users.filter(u => u.status === 'PENDING').length})
        </Button>
        <Button
          variant={filter === 'ACTIVE' ? 'default' : 'outline'}
          onClick={() => setFilter('ACTIVE')}
          size="sm"
        >
          Active ({users.filter(u => u.status === 'ACTIVE').length})
        </Button>
        <Button
          variant={filter === 'EXPIRED' ? 'default' : 'outline'}
          onClick={() => setFilter('EXPIRED')}
          size="sm"
        >
          Expired ({users.filter(u => u.status === 'EXPIRED').length})
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No users found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-start">
                  <div>
                    {user.name || user.email}
                    <span className="text-sm font-normal text-gray-500 ml-4">
                      {user.email}
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
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 font-medium ${
                      user.status === 'ACTIVE' ? 'text-green-600' :
                      user.status === 'PENDING' ? 'text-yellow-600' :
                      user.status === 'EXPIRED' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 font-medium">{user.plan || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Credits:</span>
                    <span className="ml-2 font-medium">{user.credits}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <span className="ml-2 font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
