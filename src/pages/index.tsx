import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Goods } from '@/types';
import { createServerClient } from '@/lib/supabase';
import GoodsList from '@/components/GoodsList';

interface HomeProps {
  initialGoods: Goods[];
}

export default function Home({ initialGoods }: HomeProps) {
  return (
    <>
      <Head>
        <title>居間江湖 - 貨源管理看板</title>
        <meta name="description" content="高價值硬體居間撮合：SMC B300、H200、H100 等伺服器/GPU 貨源查詢與分享" />
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
                <h1 className="text-xl font-bold text-gray-900">居間江湖</h1>
                <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">貨源看板</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                <span>資料即時同步自 Obsidian Vault</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">手上貨源總覽</h2>
            <p className="text-gray-500 mt-1">
              共 {initialGoods.length} 筆貨源資料 · 來源：Obsidian Vault → Supabase 即時同步
            </p>
          </div>

          <GoodsList initialGoods={initialGoods} />
        </div>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>居間江湖內部工具 · 僅供團隊查詢分享 · 資料來源：Obsidian Vault</p>
          </div>
        </footer>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const supabase = createServerClient();

  if (!supabase) {
    return { props: { initialGoods: [] } };
  }

  const { data, error } = await supabase
    .from('goods')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Supabase error:', error);
    return { props: { initialGoods: [] } };
  }

  return { props: { initialGoods: (data as Goods[]) || [] } };
};