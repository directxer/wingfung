'use client';

import { useState, useEffect, useMemo } from 'react';
import { Goods, FilterState, BRANDS, MODELS, STORAGES, STAGES } from '@/types';

interface GoodsListProps {
  initialGoods: Goods[];
}

export default function GoodsList({ initialGoods }: GoodsListProps) {
  const [goods, setGoods] = useState<Goods[]>(initialGoods);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    actionCode: '',
    brand: '',
    model: '',
    storage: '',
    deliveryLocation: '',
    stage: '',
    sourceTag: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showArchived, setShowArchived] = useState(false);

  // 從 URL 讀取初始篩選
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newFilters: FilterState = {
      actionCode: params.get('action_code') || '',
      brand: params.get('brand') || '',
      model: params.get('model') || '',
      storage: params.get('storage') || '',
      deliveryLocation: params.get('delivery_location') || '',
      stage: params.get('stage') || '',
      sourceTag: params.get('source_tag') || '',
    };
    setFilters(newFilters);
    setSearchQuery(params.get('q') || '');
    setShowArchived(params.get('archived') === '1');
  }, []);

  // 更新 URL
  const updateURL = (newFilters: FilterState, query: string, showArchivedParam: boolean) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key.replace(/([A-Z])/g, '_$1').toLowerCase(), value);
    });
    if (query) params.set('q', query);
    if (showArchivedParam) params.set('archived', '1');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // 篩選邏輯
  const filteredGoods = useMemo(() => {
    return goods.filter((item) => {
      // 預設隱藏已結束/已失效貨源
      const isArchived = item.stage === '已結束' || 
                         (item.status && (item.status.includes('已售罄') || item.status.includes('失效')));
      if (!showArchived && isArchived) return false;

      if (filters.actionCode && !item.action_code?.includes(filters.actionCode)) return false;
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.model && item.model !== filters.model) return false;
      if (filters.storage && item.storage !== filters.storage) return false;
      if (filters.deliveryLocation && !item.delivery_location?.includes(filters.deliveryLocation)) return false;
      if (filters.stage && item.stage !== filters.stage) return false;
      if (filters.sourceTag && item.source_tag !== filters.sourceTag) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${item.code} ${item.action_code || ''} ${item.brand} ${item.model} ${item.storage} ${item.delivery_location || ''} ${item.source_tag || ''}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [goods, filters, searchQuery, showArchived]);

  // 統計資料
  const stats = useMemo(() => {
    const active = goods.filter(g => g.stage !== '已結束');
    const totalQty = active.reduce((sum, g) => sum + g.quantity, 0);
    const sources = new Set(active.map(g => g.source_tag).filter(Boolean)).size;
    return { total: active.length, totalQty, sources };
  }, [goods]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters, searchQuery, showArchived);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL(filters, value, showArchived);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      actionCode: '', brand: '', model: '', storage: '',
      deliveryLocation: '', stage: '', sourceTag: '',
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    updateURL(emptyFilters, '', showArchived);
  };

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

  const formatPrice = (rmb?: number | null, usd?: number | null) => {
    const parts = [];
    if (rmb) parts.push(`${rmb} 萬 RMB`);
    if (usd) parts.push(`${usd} 萬 USD`);
    return parts.join(' / ') || '—';
  };

  const copyShareLink = (item: Goods) => {
    const url = `${window.location.origin}${window.location.pathname}?action_code=${encodeURIComponent(item.action_code || '')}&code=${encodeURIComponent(item.code)}`;
    navigator.clipboard.writeText(url);
    alert('分享連結已複製！');
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">活躍貨源</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">總數量</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalQty} 台</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">來源數</p>
          <p className="text-2xl font-bold text-gray-900">{stats.sources}</p>
        </div>
      </div>

      {/* 篩選列 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜尋代號、行動代號、品牌、型號..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  updateURL(filters, searchQuery, e.target.checked);
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span>顯示已結束/失效貨源</span>
            </label>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'cards' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              卡片
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              表格
            </button>
            {(Object.values(filters).some(v => v) || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                清除篩選
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">品牌</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">型號</option>
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filters.storage}
            onChange={(e) => handleFilterChange('storage', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">儲存</option>
            {STORAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">階段</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            placeholder="行動代號"
            value={filters.actionCode}
            onChange={(e) => handleFilterChange('actionCode', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="交貨地"
            value={filters.deliveryLocation}
            onChange={(e) => handleFilterChange('deliveryLocation', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 min-w-[120px]"
          />
          <input
            type="text"
            placeholder="來源"
            value={filters.sourceTag}
            onChange={(e) => handleFilterChange('sourceTag', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 min-w-[100px]"
          />
        </div>
      </div>

      {/* 結果列表 */}
      {filteredGoods.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">沒有符合條件的貨源</p>
          <p className="text-sm">嘗試調整篩選條件或清除篩選</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGoods.map((item) => (
            <GoodsCard key={item.id} item={item} onShare={() => copyShareLink(item)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3">行動代號</th>
                <th className="px-4 py-3">代號</th>
                <th className="px-4 py-3">品牌/型號/儲存</th>
                <th className="px-4 py-3">數量</th>
                <th className="px-4 py-3">價格</th>
                <th className="px-4 py-3">交地/交期</th>
                <th className="px-4 py-3">階段</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGoods.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-600">{item.action_code || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                  <td className="px-4 py-3">{item.brand} {item.model} {item.storage}</td>
                  <td className="px-4 py-3">{item.quantity} 台</td>
                  <td className="px-4 py-3">{formatPrice(item.base_price_rmb_wan, item.base_price_usd_wan)}</td>
                  <td className="px-4 py-3">
                    <div>{item.delivery_location || '—'}</div>
                    <div className="text-xs text-gray-500">{item.delivery_time || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(item.stage)}`}>
                      {item.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyShareLink(item)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      分享
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredGoods.length !== goods.length && (
        <p className="text-center text-gray-500 text-sm">
          顯示 {filteredGoods.length} / {goods.length} 筆貨源
        </p>
      )}
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