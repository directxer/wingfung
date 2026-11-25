'use client';

import { useState, useEffect } from 'react';

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 直連 Vercel API，EdgeOne Pages 不支援 API Routes
    const apiBase = 'https://wingfung.vercel.app';
    fetch(`${apiBase}/api/visits`)
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(data.count);
        }
      })
      .catch(() => {
        // Silently fail, counter just won't show
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>访客统计加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span className="font-mono font-semibold text-gray-900">{count.toLocaleString()}</span>
      <span className="text-xs">人次</span>
    </div>
  );
}