'use client';

import { useState, useEffect } from 'react';

export function useAdminStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/status');
        if (res.ok) {
          const data = await res.json();
          setIsOnline(data.isOnline);
        }
      } catch (err) {
        console.error('Failed to fetch admin status:', err);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return isOnline;
}
