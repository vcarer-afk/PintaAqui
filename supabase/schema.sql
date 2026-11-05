-- ==============================================================================
-- PINTORPRO - ESQUEMA DO BANCO DE DADOS RELACIONAL SUPABASE
-- Executar no SQL Editor do painel do Supabase
-- ==============================================================================

-- 1. Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PERFIS DOS PINTORES (profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  trade_name TEXT,
  document TEXT,
  phone TEXT,
  email TEXT,
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  logo_url TEXT,
  standard_daily_rate NUMERIC(10,2) DEFAULT 220.00,
  standard_sqm_rate NUMERIC(10,2) DEFAULT 22.00,
  bio_terms TEXT DEFAULT 'Orçamento válido por 15 dias. Pagamento conforme etapas acordadas. Garantia de 12 meses sobre mão de obra.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode visualizar seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário pode atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuário pode inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao cadastrar novo usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Pintor Profissional'), new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. TABELA DE CLIENTES (clients)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus próprios clientes"
  ON public.clients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE OBRAS / PROJETOS (projects)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'residential_apartment',
  wall_condition TEXT NOT NULL DEFAULT 'good',
  address TEXT,
  estimated_sqm NUMERIC(10,2) NOT NULL DEFAULT 0,
  ceiling_height NUMERIC(4,2) NOT NULL DEFAULT 2.70,
  difficulty_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  photos TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'survey',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas suas próprias obras"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE SERVIÇOS E MÃO DE OBRA (services)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'painting',
  default_unit TEXT NOT NULL DEFAULT 'sqm',
  default_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  estimated_sqm_per_day NUMERIC(10,2) DEFAULT 40.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus próprios serviços"
  ON public.services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);

-- ------------------------------------------------------------------------------
-- 6. TABELA DE MATERIAIS E INSUMOS (materials)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'paint',
  brand TEXT,
  unit TEXT NOT NULL DEFAULT 'can_18l',
  coverage_per_unit NUMERIC(10,2) NOT NULL DEFAULT 100.0,
  recommended_coats INTEGER NOT NULL DEFAULT 2,
  average_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus próprios materiais"
  ON public.materials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);

-- ------------------------------------------------------------------------------
-- 7. TABELA DE ORÇAMENTOS (budgets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  valid_days INTEGER NOT NULL DEFAULT 15,
  labor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  materials_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_days INTEGER NOT NULL DEFAULT 3,
  materials_provision TEXT NOT NULL DEFAULT 'client_buys',
  payment_method TEXT NOT NULL DEFAULT 'pix',
  payment_terms TEXT,
  warranty_terms TEXT,
  client_signature_data TEXT,
  signed_at TIMESTAMPTZ,
  signed_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus próprios orçamentos"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets(client_id);

-- ------------------------------------------------------------------------------
-- 8. TABELA DE ITENS DO ORÇAMENTO (budget_items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'sqm',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa itens de seus orçamentos"
  ON public.budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = budget_items.budget_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = budget_items.budget_id AND b.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 9. TABELA DE MATERIAIS DO ORÇAMENTO (budget_materials)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'paint',
  unit TEXT NOT NULL DEFAULT 'can_18l',
  quantity_needed NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  who_buys TEXT NOT NULL DEFAULT 'client'
);

ALTER TABLE public.budget_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa insumos de seus orçamentos"
  ON public.budget_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = budget_materials.budget_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = budget_materials.budget_id AND b.user_id = auth.uid()
    )
  );
