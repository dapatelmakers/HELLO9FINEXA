import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';

export const isCloudSyncEnabled = () => storage.get<boolean>('cloudSyncEnabled', false);
export const setCloudSyncEnabled = (v: boolean) => storage.set('cloudSyncEnabled', v);

export async function pushToCloud(): Promise<{ ok: boolean; error?: string }> {
  if (!navigator.onLine) return { ok: false, error: 'Offline – will sync when back online' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in to cloud' };
  const data = JSON.parse(storage.exportAll());
  const { error } = await supabase
    .from('user_data_snapshots')
    .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  storage.set('lastCloudSync', new Date().toISOString());
  return { ok: true };
}

export async function pullFromCloud(): Promise<{ ok: boolean; data?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in to cloud' };
  const { data, error } = await supabase
    .from('user_data_snapshots')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'No cloud backup found yet' };
  return { ok: true, data: JSON.stringify(data.data) };
}
