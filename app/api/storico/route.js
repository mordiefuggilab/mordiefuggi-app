import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvqjifmulwtdmmaqsxom.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWppZm11bHd0ZG1tYXFzeG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzM2NDYsImV4cCI6MjA5MDgwOTY0Nn0.Zo94L4yyn7GxgEfY9Fd2owm_vLFfru2O42HwBDMlZZk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const key = new URL(request.url).searchParams.get('k');
  if (key !== 'storico2026') {
    return Response.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { data: storico, error: e1 } = await supabase
    .from('storico_menu')
    .select('data, piatto_nome, categoria')
    .order('data', { ascending: true });

  const { data: ordini, error: e2 } = await supabase
    .from('ordini')
    .select('created_at, dettaglio, orario, totale, stato')
    .order('created_at', { ascending: true });

  if (e1 || e2) {
    return Response.json({ error: (e1 || e2).message }, { status: 500 });
  }

  return Response.json({ storico, ordini });
}
