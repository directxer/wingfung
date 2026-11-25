'use client';

import { useState, useEffect, useMemo } from 'react';
import { Goods } from '@/types';

interface GoodsListProps {
  initialGoods: Goods[];
}

export default function GoodsList({ initialGoods }: GoodsListProps) {
  const [goods, setGoods] = useState<Goods[]>(initialGoods);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Goods | null>(null);
  const [loading, setLoading] = useState(initialGoods.length === 0);

  // 客戶端 fetch 貨源資料（靜態導出時使用）
  useEffect(() => {
    if (initialGoods.length === 0) {
      // 直連 Vercel API，EdgeOne Pages 不支援 API Routes
      const apiBase = 'https://wingfung.vercel.app';
      fetch(`${apiBase}/api/goods`)
        .then((res) => res.json())
        .then((data) => {
          setGoods(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [initialGoods.length]);

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

  const copyShareLink = (item: Goods, e: React.MouseEvent) => {
    e.stopPropagation();
    const tradeProcess = item.trade_process || '無交易流程';
    navigator.clipboard.writeText(tradeProcess);
    alert('交易流程已複製！');
  };

  const copyRawMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('貨源訊息文字版已複製！');
  };

  const downloadContract = (item: Goods) => {
    // 從 config_images 找到合同相關連結
    const contractImages = item.config_images?.filter((img: string) =>
      img.includes('合同') || img.includes('contract') || img.includes('Contract') || img.includes('DOCX') || img.includes('docx')
    ) || [];

    if (contractImages.length > 0) {
      const firstContract = contractImages[0];
      // 直接用完整 URL 下載
      const url = firstContract.startsWith('http') ? firstContract : `${window.location.origin}${firstContract}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || 'contract.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('此貨源暫無合同檔案可供下載。');
    }
  };

  const hasContract = (item: Goods) => {
      return item.config_images?.some((img: string) =>
        img.includes('合同') || img.includes('contract') || img.includes('Contract') || img.includes('DOCX') || img.includes('docx')
      ) || false;
    };

    // 載入中狀態
    if (loading) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent" />
            <p className="text-lg">載入貨源資料中...</p>
          </div>
        </div>
      );
    }

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
          <GoodsCard 
            key={item.id} 
            item={item} 
            onShare={(e) => copyShareLink(item, e)}
            onClick={() => setSelectedItem(item)}
            hasContract={hasContract(item)}
            onDownloadContract={() => downloadContract(item)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          onCopyRawMessage={copyRawMessage}
          onDownloadContract={downloadContract}
        />
      )}
    </div>
  );
}

function GoodsCard({ 
  item, 
  onShare, 
  onClick, 
  hasContract,
  onDownloadContract 
}: { 
  item: Goods; 
  onShare: (e: React.MouseEvent) => void;
  onClick: () => void;
  hasContract: boolean;
  onDownloadContract: () => void;
}) {
  const getStatusBadge = (status: string | null) => {
    if (!status) return { label: '—', className: 'bg-gray-100 text-gray-600' };
    if (status.includes('現貨')) return { label: '⚡ 現貨', className: 'bg-green-100 text-green-800' };
    if (status.includes('期貨')) return { label: '📦 期貨', className: 'bg-blue-100 text-blue-800' };
    if (status.includes('獨家')) return { label: '🔒 獨家', className: 'bg-purple-100 text-purple-800' };
    if (status.includes('失效') || status.includes('售罄')) return { label: '❌ 已失效', className: 'bg-red-100 text-red-800' };
    return { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const statusBadge = getStatusBadge(item.status);

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-semibold text-gray-900 text-lg">{item.action_code || '無行動代號'}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge.className}`}>
          {statusBadge.label}
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
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(e);
          }}
          className="flex-1 text-center py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
        >
          複製交易流程
        </button>
        {hasContract && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadContract();
            }}
            className="flex-1 text-center py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            下載合同
          </button>
        )}
      </div>
    </div>
  );
}

function DetailModal({ 
  item, 
  onClose, 
  onCopyRawMessage,
  onDownloadContract 
}: { 
  item: Goods; 
  onClose: () => void;
  onCopyRawMessage: (text: string) => void;
  onDownloadContract: (item: Goods) => void;
}) {
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

  const hasContract = () => {
    return item.config_images?.some((img: string) => 
      img.includes('合同') || img.includes('contract') || img.includes('Contract') || img.includes('DOCX') || img.includes('docx')
    ) || false;
  };

  const hasGuarantee = () => {
    const req = item.guarantee_requirement || '';
    const noGuaranteeKeywords = ['不提供', '無特定要求', '不需要', '無', '不適用'];
    return !noGuaranteeKeywords.some(kw => req.includes(kw));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.action_code || '無行動代號'}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStageColor(item.stage)}`}>{item.stage}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>{item.status || '—'}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{item.code}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">品牌/型號/儲存</p>
              <p className="font-medium">{item.brand} {item.model} {item.storage}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">數量</p>
              <p className="font-medium">{item.quantity} 台</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">價格</p>
              <p className="font-medium text-primary-600">
                {item.base_price_rmb_wan ? `${item.base_price_rmb_wan} 萬 RMB` : ''}
                {item.base_price_usd_wan ? ` / ${item.base_price_usd_wan} 萬 USD` : ''}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">來源</p>
              <p className="font-medium">{item.source_tag || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
              <p className="text-xs text-gray-500">交地/交期</p>
              <p className="font-medium">{item.delivery_location || '—'} / {item.delivery_time || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">接受買方主體</p>
              <p className="font-medium text-sm">{item.accepted_buyer_types?.join('、') || '—'}</p>
            </div>
            {hasGuarantee() && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">提供保函</p>
                  <p className="font-medium text-sm">{item.guarantee_requirement || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">付款方法</p>
                  <p className="font-medium">{item.guarantee_status || '—'}</p>
                </div>
              </>
            )}
          </div>

          {/* Trade Process */}
          {item.trade_process && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">交易流程</h3>
                <button
                  onClick={() => onCopyRawMessage(item.trade_process || '無交易流程')}
                  className="px-3 py-1.5 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  📋 複製交易流程
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">
                {item.trade_process}
              </div>
            </div>
          )}

          {/* Config Images / Contract Files */}
          {item.config_images && item.config_images.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">配置圖片 / 合同文件</h3>
              <div className="space-y-2">
                {item.config_images.map((img, idx) => {
                  const isImage = img.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  const isLocalPath = img.startsWith('/images/');
                  const downloadUrl = isLocalPath ? img : (img.startsWith('http') ? img : null);
                  
                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isImage && downloadUrl && (
                          <ImagePreview src={downloadUrl} alt={`配置圖片 ${idx + 1}`} />
                        )}
                        <span className="text-sm text-gray-700 truncate max-w-md">{img}</span>
                      </div>
                      <div className="flex gap-2">
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            download
                            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            {isImage ? '📥 下載圖片' : '📥 下載檔案'}
                          </a>
                        )}
                        {hasContract() && img.match(/合同|contract|Contract|DOCX|docx/i) && (
                          <button
                            onClick={() => onDownloadContract(item)}
                            className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                          >
                            下載合同
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 flex gap-3 justify-end">
          {hasContract() && (
            <button
              onClick={() => onDownloadContract(item)}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              下載合同
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [showFull, setShowFull] = useState(false);
  
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className="w-16 h-16 object-cover rounded cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity"
        onClick={() => setShowFull(true)}
        loading="lazy"
      />
      {showFull && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={() => setShowFull(false)}>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setShowFull(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}