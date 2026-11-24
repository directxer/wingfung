import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase';
import { Goods } from '@/types';

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Goods[] | ErrorResponse>
) {
  const supabase = createServerClient();

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  let query = supabase
    .from('goods')
    .select('*')
    .order('updated_at', { ascending: false });

  const { action_code, brand, model, storage, delivery_location, stage, source_tag, limit } = req.query;

  if (action_code) query = query.ilike('action_code', `%${action_code}%`);
  if (brand) query = query.eq('brand', brand);
  if (model) query = query.eq('model', model);
  if (storage) query = query.eq('storage', storage);
  if (delivery_location) query = query.ilike('delivery_location', `%${delivery_location}%`);
  if (stage) query = query.eq('stage', stage);
  if (source_tag) query = query.eq('source_tag', source_tag);
  if (limit) query = query.limit(parseInt(limit as string));

  const { data, error } = await query.limit(200);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data as Goods[]);
}