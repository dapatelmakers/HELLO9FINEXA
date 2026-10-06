import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useData } from '@/context/DataContext';
import { isCloudSyncEnabled, setCloudSyncEnabled, pushToCloud, pullFromCloud } from '@/lib/cloudSync';
import { storage, formatDate } from '@/lib/storage';
import { Cloud, CloudOff, UploadCloud, DownloadCloud, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const CloudSyncPanel: React.FC = () => {
  const { importData } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cloudUser, setCloudUser] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(isCloudSyncEnabled());
  const [busy, setBusy] = useState(false);
  const last = storage.get<string | null>('lastCloudSync', null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setCloudUser(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setCloudUser(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (mode: 'in' | 'up') => {
    setBusy(true);
    const res = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === 'up' && !res.data.session) toast.success('Check your email to confirm your account');
    else toast.success('Connected to cloud');
  };

  const toggle = () => { setCloudSyncEnabled(!enabled); setEnabled(!enabled); toast.success(!enabled ? 'Auto cloud sync on' : 'Auto cloud sync off'); };
  const push = async () => { setBusy(true); const r = await pushToCloud(); setBusy(false); r.ok ? toast.success('Data backed up to cloud') : toast.error(r.error); };
  const pull = async () => {
    if (!window.confirm('Replace local data with your cloud copy?')) return;
    setBusy(true); const r = await pullFromCloud(); setBusy(false);
    if (r.ok && r.data && importData(r.data)) toast.success('Cloud data restored'); else toast.error(r.error || 'Restore failed');
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        {cloudUser ? <Cloud className="text-primary" /> : <CloudOff className="text-muted-foreground" />}
        <div>
          <h2 className="text-xl font-semibold">Cloud Storage (Online + Offline)</h2>
          <p className="text-sm text-muted-foreground">Your data always stays on this device. Connect to also keep a safe online copy and use it on other devices.</p>
        </div>
      </div>

      {!cloudUser ? (
        <div className="space-y-3 max-w-sm">
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button disabled={busy} className="btn-primary" onClick={() => signIn('in')}>Sign in</button>
            <button disabled={busy} className="btn-secondary" onClick={() => signIn('up')}>Create account</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Connected as <strong>{cloudUser}</strong>{last && <> · last synced {formatDate(last)} {new Date(last).toLocaleTimeString()}</>}</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={toggle} className="w-5 h-5" />
            <span>Auto-sync to cloud every minute and whenever you come back online</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} className="btn-primary flex items-center gap-2" onClick={push}><UploadCloud size={18} /> Back up now</button>
            <button disabled={busy} className="btn-secondary flex items-center gap-2" onClick={pull}><DownloadCloud size={18} /> Restore from cloud</button>
            <button className="btn-secondary flex items-center gap-2" onClick={() => supabase.auth.signOut()}><LogOut size={18} /> Disconnect</button>
          </div>
        </div>
      )}
    </div>
  );
};
