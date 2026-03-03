CREATE TABLE public.weekly_progress_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  total_exercises INTEGER NOT NULL,
  completed_exercises INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT one_record_per_week UNIQUE (student_id, week_start_date)
);

ALTER TABLE public.weekly_progress_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estudantes leem seu proprio historico" 
ON public.weekly_progress_history FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Estudantes inserem seu proprio historico" 
ON public.weekly_progress_history FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "Estudantes atualizam seu proprio historico" 
ON public.weekly_progress_history FOR UPDATE TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Admins_manage_weekly_progress" 
ON public.weekly_progress_history FOR ALL TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
