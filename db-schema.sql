-- Copie todo este conteúdo e cole no SQL Editor do Supabase, depois clique em RUN.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'client',
  status TEXT DEFAULT 'pending',
  name TEXT,
  avatar TEXT,
  id_document TEXT,
  selfie TEXT,
  phone TEXT,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT,
  delivery_type TEXT DEFAULT 'platform',
  lat NUMERIC DEFAULT 0,
  lng NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "restaurantId" UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
  "driverId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
  "restaurantId" UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  total_price NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  distance NUMERIC DEFAULT 0,
  client_lat NUMERIC DEFAULT 0,
  client_lng NUMERIC DEFAULT 0,
  address TEXT,
  payment_status TEXT DEFAULT 'awaiting_payment',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  "menuItemId" UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para rastrear localização em tempo real dos entregadores
CREATE TABLE IF NOT EXISTS public.entregadores_localizacao (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  posicao GEOGRAPHY(POINT, 4326),
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entregadores_localizacao_updated 
ON public.entregadores_localizacao(ultima_atualizacao DESC);

-- Criar policy RLS para permitir leitura/escrita
ALTER TABLE public.entregadores_localizacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads" ON public.entregadores_localizacao FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON public.entregadores_localizacao FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON public.entregadores_localizacao FOR UPDATE USING (true);

-- Índices para performance nas tabelas principais
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_userid ON public.restaurants("userId");
CREATE INDEX IF NOT EXISTS idx_orders_clientid ON public.orders("clientId");
CREATE INDEX IF NOT EXISTS idx_orders_driverid ON public.orders("driverId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurantid ON public.menu_items("restaurantId");
CREATE INDEX IF NOT EXISTS idx_order_items_orderid ON public.order_items("orderId");

-- Inserir usuário Administrador Padrão (usuário: admin / senha: Admin@123)
INSERT INTO public.users (username, password, role, status, name) 
VALUES ('admin', 'Admin@123', 'admin', 'approved', 'Administrador')
ON CONFLICT (username) DO NOTHING;
