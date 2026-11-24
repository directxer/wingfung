import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number; debug?: string } | { error: string; debug?: string }>
) {
  const supabase = createServerClient();

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured', debug: 'No client' });
  }

  try {
    // Get current count and increment atomically
    const { data, error } = await supabase.rpc('increment_visit');

    if (error) {
      // Fallback: manual increment if RPC doesn't exist
      const { data: visitData, error: selectError } = await supabase
        .from('visits')
        .select('count, id')
        .limit(1)
        .single();

      if (selectError || !visitData) {
        return res.status(500).json({ error: 'Failed to get visit count', debug: `selectError: ${JSON.stringify(selectError)}` });
      }

      const newCount = visitData.count + 1;
      const { error: updateError } = await supabase
        .from('visits')
        .update({ count: newCount, updated_at: new Date().toISOString() })
        .eq('id', visitData.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update visit count', debug: `updateError: ${JSON.stringify(updateError)}` });
      }

      return res.status(200).json({ count: newCount, debug: 'fallback success' });
    }

    return res.status(200).json({ count: data, debug: 'rpc success' });
  } catch (err) {
    console.error('Visit counter error:', err);
    return res.status(500).json({ error: 'Internal server error', debug: String(err) });
  }
}