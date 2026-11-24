export interface Goods {
  id: string;
  code: string;
  action_code: string | null;
  source_tag: string | null;
  source_contact: string | null;
  source_type: string | null;
  brand: string;
  model: string;
  storage: string;
  quantity: number;
  status: string | null;
  base_price_rmb_wan: number | null;
  base_price_usd_wan: number | null;
  tax_refund_max_rmb_wan: number | null;
  commission_pct: number | null;
  commission_note: string | null;
  delivery_time: string | null;
  delivery_location: string | null;
  accepted_buyer_types: string[] | null;
  guarantee_requirement: string | null;
  guarantee_status: string | null;
  trade_process: string | null;
  seller_entity: string | null;
  qualification_files: any[];
  data_completeness: number;
  stage: string;
  display_string: string | null;
  created_at: string;
  updated_at: string;
  raw_message: string | null;
  gaps: string[];
  progress_log: string[];
  config_images: string[];
}

export interface FilterState {
  actionCode: string;
  brand: string;
  model: string;
  storage: string;
  deliveryLocation: string;
  stage: string;
  sourceTag: string;
}

export const BRANDS = ['SMC', 'NV', 'Intel', 'AMD'] as const;
export const MODELS = ['B300', 'H200', 'H100', 'A100', 'Gaudi2'] as const;
export const STORAGES = ['2T', '3T', '4T', '8T'] as const;
export const STAGES = ['新收貨', '有合同草案', '待合同簽署', '已結束'] as const;