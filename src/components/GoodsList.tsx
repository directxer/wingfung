'use client';

import { useState, useEffect, useMemo } from 'react';
import { Goods } from '@/types';

interface GoodsListProps {
  initialGoods: Goods[];
}

export default function GoodsList({ initialGoods }: GoodsListProps) {
  const [goods, setGoods] = useState<Goods[]>(initialGoods);
  const [showArchived, setShowArchived] = useState(false);

  // 從 URL 讀取 archive 狀態
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowArchived(params.get('archived') === '1');
  }, []);

  // 更新 URL
  const updateURL = (showArchivedParam: boolean) => {
    const params = new URLSearchParams();
    if (showArchivedParam) params.set('archived', '1');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // 篩選邏輯：只處理 archive 顯示/隱藏
  const filteredGoods = useMemo(() => {
    return goods.filter((item) => {
      const isArchived = item.stage === '已結束' || 
                         (item.status && (item.status.includes('已售罄') || item.status.includes('失效')));
      if (!showArchived && isArchived) return false;
      return true;
    });
  }, [goods, showArchived]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case '新收貨': return 'bg-blue-100 text-blue-800';
      case '有合同草案': return 'bg-yellow-100 text-yellow-800';
      case '待合同簽署': return 'bg-orange-100 text-orange-800';
      case '已結束': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.includes('期貨')) return 'bg-blue-100 text-blue-800';
    if (status.includes('現貨')) return 'bg-green-100 text-green-800';
    if (status.includes('獨家')) return 'bg-purple-100 text-purple-800';
    if (status.includes('失效') || status.includes('售罄')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const copyShareLink = (item: Goods) => {
    const url = `${window.location.origin}${window.location.pathname}?action_code=${encodeURIComponent(item.action_code || '')}&code=${encodeURIComponent(item.code)}`;
    navigator.clipboard.writeText(url);
    alert('分享連結已複製！');
  };

  if (filteredGoods.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">沒有符合條件的貨源</p>
        {showArchived ? null : (
          <p className="text-sm mt-2">嘗試勾選「顯示已結束/失效貨源」</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Archive toggle - minimal */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              updateURL(e.target.checked);
            }}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span>顯示已結束/失效貨源</span>
        </label>
      </div>

      {/* Card Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGoods.map((item) => (
          <GoodsCard key={item.id} item={item} onShare={() => copyShareLink(item)} />
        ))}
      </div>
    </div>
  );
}

function GoodsCard({ item, onShare }: { item: Goods; onShare: () => void }) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case '新收貨': return 'bg-blue-100 text-blue-800';
      case '有合同草案': return 'bg-yellow-100 text-yellow-800';
      case '待合同簽署': return 'bg-orange-100 text-orange-800';
      case '已結束': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.includes('期貨')) return 'bg-blue-100 text-blue-800';
    if (status.includes('現貨')) return 'bg-green-100 text-green-800';
    if (status.includes('獨家')) return 'bg-purple-100 text-purple-800';
    if (status.includes('失效') || status.includes('售罄')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="font-semibold text-gray-900 text-lg">{item.action_code || '無行動代號'}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${getStageColor(item.stage)}`}>
          {item.stage}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-mono text-xs text-gray-500 truncate">{item.code}</p>
        <p className="font-medium">{item.brand} {item.model} {item.storage}</p>
        <p className="text-gray-600">{item.quantity} 台</p>
        <p className="font-semibold text-primary-600">
          {item.base_price_rmb_wan ? `${item.base_price_rmb_wan} 萬 RMB` : ''}
          {item.base_price_usd_wan ? ` / ${item.base_price_usd_wan} 萬 USD` : ''}
        </p>
        <p className="text-gray-500 flex items-center gap-1">
          <span>📍</span>
          <span>{item.delivery_location || '—'}</span>
        </p>
        <p className="text-gray-500 flex items-center gap-1">
          <span>⏱</span>
          <span>{item.delivery_time || '—'}</span>
        </p>
        <p className="text-gray-500 flex items-center gap-1">
          <span>🏷</span>
          <span>{item.source_tag || '—'}</span>
        </p>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
          {item.status || '—'}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={onShare}
          className="flex-1 text-center py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
        >
          分享連結
        </button>
      </div>
    </div>
  );
}