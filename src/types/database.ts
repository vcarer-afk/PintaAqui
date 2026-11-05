/**
 * Tipagens do Banco de Dados Relacional Supabase
 * PintorPro - Orçamentos de Pintura
 */

export type UserRole = 'painter_admin' | 'painter_assistant';

export interface Profile {
  id: string; // matches auth.users.id
  full_name: string;
  trade_name?: string | null; // Nome Fantasia / Empresa
  document?: string | null; // CPF ou CNPJ
  phone?: string | null;
  email?: string | null;
  pix_key?: string | null;
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null;
  logo_url?: string | null;
  standard_daily_rate?: number; // Diária padrão em R$
  standard_sqm_rate?: number; // Preço médio por m²
  bio_terms?: string | null; // Termos/Garantia padrão (ex: "Garantia de 1 ano...")
  created_at?: string;
  updated_at?: string;
}

export type PropertyType = 'residential_house' | 'residential_apartment' | 'commercial' | 'facade' | 'industrial';
export type WallCondition = 'new_drywall' | 'new_plaster' | 'good' | 'repainting' | 'damaged' | 'humid' | 'flaking';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string | null;
  document?: string | null; // CPF / CNPJ
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  property_type: PropertyType;
  wall_condition: WallCondition;
  address?: string | null;
  estimated_sqm: number;
  ceiling_height: number; // Pé direito em metros (padrão 2.7m; acima de 3.5m aplica multiplicador)
  difficulty_multiplier: number; // 1.0 = normal, 1.2 = pé direito alto / escadas, etc.
  photos?: string[];
  status: 'survey' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ServiceUnit = 'sqm' | 'daily' | 'room' | 'fixed' | 'linear_meter';

export interface ServiceItem {
  id: string;
  user_id: string;
  name: string; // Ex: "Pintura Látex PVA 2 demãos", "Aplicação de Massa Corrida", "Esmalte em Portas"
  category: 'preparation' | 'painting' | 'special_effects' | 'wood_metal' | 'finishing';
  default_unit: ServiceUnit;
  default_price: number; // Preço padrão em R$
  description?: string | null;
  estimated_sqm_per_day?: number; // Rendimento de produção por dia (m²/dia)
  created_at?: string;
}

export type MaterialCategory = 'paint' | 'primer' | 'spackle' | 'sandpaper' | 'roller_brush' | 'masking_tape' | 'solvent' | 'accessory';

export interface MaterialItem {
  id: string;
  user_id: string;
  name: string; // Ex: "Tinta Acrílica Fosca Premium 18L"
  category: MaterialCategory;
  brand?: string | null; // Ex: "Suvinil", "Coral", "Sherwin-Williams"
  unit: 'can_18l' | 'gallon_3_6l' | 'quarter_0_9l' | 'kg' | 'unit' | 'meter' | 'roll';
  coverage_per_unit: number; // Rendimento por embalagem em m² por demão
  recommended_coats: number; // Demãos recomendadas (ex: 2)
  average_price: number; // Preço médio de mercado em R$
  created_at?: string;
}

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'completed';
export type PaymentMethod = 'pix' | 'cash' | 'credit_card' | 'split_installments';

export interface BudgetItem {
  id?: string;
  budget_id?: string;
  service_id?: string | null;
  service_name: string;
  unit: ServiceUnit;
  quantity: number; // m², dias, cômodos, etc.
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface BudgetMaterial {
  id?: string;
  budget_id?: string;
  material_id?: string | null;
  material_name: string;
  category: MaterialCategory;
  unit: string;
  quantity_needed: number;
  unit_price: number;
  total_price: number;
  who_buys: 'painter' | 'client'; // O pintor fornece ou o cliente compra na loja
}

export interface Budget {
  id: string;
  user_id: string;
  client_id: string;
  project_id?: string | null;
  code: string; // Código amigável, ex: "ORC-2025-001"
  title: string;
  status: BudgetStatus;
  valid_days: number; // Validade da proposta (ex: 15 dias)
  
  // Totais calculados
  labor_total: number;
  materials_total: number;
  discount: number;
  final_total: number;
  estimated_days: number;

  // Condições comerciais
  materials_provision: 'painter_includes' | 'client_buys' | 'mixed';
  payment_method: PaymentMethod;
  payment_terms?: string | null; // Ex: "30% na entrada, 40% no meio da obra, 30% na entrega"
  warranty_terms?: string | null;

  // Assinatura digital
  client_signature_data?: string | null; // Base64 da assinatura desenhada
  signed_at?: string | null;
  signed_by_name?: string | null;

  items?: BudgetItem[];
  materials?: BudgetMaterial[];
  
  created_at?: string;
  updated_at?: string;
}
