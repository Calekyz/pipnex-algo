'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface NewsItem {
  headline: string;
  url: string;
}

export default function NewsTicker({ items }: { items: NewsItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotate headlines every 5 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [items, isPaused]);

  if (items.length === 0) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 text-sm text-gray-500 flex items-center gap-2 rounded-t-lg">
        <span>📰</span> No news available
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-2 px-4 rounded-t-lg flex items-center justify-between overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-blue-600 font-bold text-sm whitespace-nowrap">📰 Latest</span>
        <div className="relative w-full overflow-hidden h-6">
          <div
            className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndex * 100}%)` }}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                className="w-full flex-shrink-0 h-6 flex items-center"
              >
                <a
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-blue-600 truncate block"
                >
                  {item.headline}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Link
        href="/dashboard/news"
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap ml-2 flex-shrink-0"
      >
        View All <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
