/**
 * Conexão do Cliente Supabase
 * PintorPro - Orçamentos de Pintura
 */
import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente configuráveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validação se o Supabase está configurado corretamente
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
};

// Instância singleton do Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Obter mensagem de status de conexão
export const getSupabaseConfigStatus = () => {
  if (isSupabaseConfigured()) {
    return {
      status: 'ready' as const,
      message: 'Supabase configurado e pronto para conexão na nuvem.',
      url: supabaseUrl,
    };
  }
  return {
    status: 'unconfigured' as const,
    message: 'Chaves do Supabase não configuradas no arquivo .env.',
    url: supabaseUrl || 'Não definida',
  };
};
