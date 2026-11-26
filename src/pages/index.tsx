import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Goods } from '@/types';
import GoodsList from '@/components/GoodsList';
import VisitorCounter from '@/components/VisitorCounter';

interface HomeProps {
  initialGoods: Goods[];
}

export default function Home({ initialGoods }: HomeProps) {
  return (
    <>
      <Head>
        <title>永丰算力顾问团队 - 货源管理看板</title>
        <meta name="description" content="永丰算力顾问团队：高价值硬件撮合 SMC B300、H200、H100 等服务器/GPU 货源查询与分享" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">永丰算力顾问团队</h1>
                <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">货源看板</span>
              </div>
              <VisitorCounter />
            </div>
          </div>
        </header>

        {/* Announcement Banners */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          {/* 1. Welcome to Telegram Group */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <span className="font-medium text-primary-800">
                  欢迎加入团队 Telegram 群组。入群后，有新货源会自动广播通知，即时掌握最新货源。
                </span>
              </div>
              <a 
                href="https://t.me/+Pbs_YzMj9g83NWFl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13l-4.5 4.5V15h3v4h2v-4h3v-3h-3V9c0-1.66-1.34-3-3-3S8.5 7.34 8.5 9v2.5H6v3h2.5v6.5l4.5-4.5z"/>
                </svg>
                加入群组
              </a>
            </div>
          </div>

          {/* 2. Price Notice: Cost Price Only */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="font-medium">价格说明：</span>
              <span className="text-amber-700">本网站所有价钱均为<strong>来货价</strong>，未加上任何利润。</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GoodsList initialGoods={initialGoods} />
        </div>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>居间江湖内部工具 · 仅供团队查询分享 · 数据来源：Obsidian Vault</p>
          </div>
        </footer>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  // 靜態導出時不預取資料，由客戶端 fetch API
  return { props: { initialGoods: [] } };
};