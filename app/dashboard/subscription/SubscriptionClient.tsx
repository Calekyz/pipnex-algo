'use client';

import { useState, useEffect } from 'react';

interface SubscriptionClientProps {
  expiryDate: string | null;
  daysLeft: number;
}

export default function SubscriptionClient({ expiryDate, daysLeft: initialDays }: SubscriptionClientProps) {
  const [daysLeft, setDaysLeft] = useState(initialDays);

  useEffect(() => {
    if (!expiryDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diff = expiry.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate]);

  return null; // This component just handles the live countdown logic
}
