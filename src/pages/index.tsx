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