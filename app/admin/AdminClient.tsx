'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: Date;
}

interface AdminClientProps {
  users: User[];
}

export default function AdminClient({ users }: AdminClientProps) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          No pending users. All users are verified.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {user.name || user.email}
              <span className="text-sm font-normal text-gray-500 ml-4">
                {user.email}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Status: <span className="text-yellow-600 font-medium">{user.status}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Joined: {formatDate(user.createdAt)}
                </p>
              </div>
              <Button
                onClick={() => {
                  alert('User will be activated. Implement activation logic here.');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Activate User
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
