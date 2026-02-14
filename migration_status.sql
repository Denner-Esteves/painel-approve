-- 1. Add column if not exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'EM PRODUÇÃO';

-- 2. Drop constraint if it exists to allow data cleanup
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- 3. Clean up data: ensure all existing rows have a valid status
UPDATE public.tasks 
SET status = 'EM PRODUÇÃO' 
WHERE status IS NULL OR status NOT IN ('EM PRODUÇÃO', 'AGUARDANDO APROVAÇÃO', 'APROVADA', 'REJEITADA');

-- 4. Re-add the constraint
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('EM PRODUÇÃO', 'AGUARDANDO APROVAÇÃO', 'APROVADA', 'REJEITADA'));
