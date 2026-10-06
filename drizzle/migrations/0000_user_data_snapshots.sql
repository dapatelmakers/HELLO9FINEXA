CREATE TABLE public.user_data_snapshots (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_data_snapshots TO authenticated;
GRANT ALL ON public.user_data_snapshots TO service_role;
ALTER TABLE public.user_data_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshot select" ON public.user_data_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own snapshot insert" ON public.user_data_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own snapshot update" ON public.user_data_snapshots FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own snapshot delete" ON public.user_data_snapshots FOR DELETE TO authenticated USING (auth.uid() = user_id);