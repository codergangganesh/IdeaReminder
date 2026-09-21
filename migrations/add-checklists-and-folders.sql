-- Migration: 20260921034154_add-checklists-and-folders.sql
-- Description: Add checklist_folders, checklists, and checklist_items tables with RLS and updated_at triggers

-- 1. Checklist Folders Table
CREATE TABLE IF NOT EXISTS public.checklist_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#D4A72C',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS checklist_folders_user_id_idx ON public.checklist_folders(user_id);

ALTER TABLE public.checklist_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_folders_owner_select" ON public.checklist_folders
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_folders_owner_insert" ON public.checklist_folders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_folders_owner_update" ON public.checklist_folders
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_folders_owner_delete" ON public.checklist_folders
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP TRIGGER IF EXISTS set_checklist_folders_updated_at ON public.checklist_folders;
CREATE TRIGGER set_checklist_folders_updated_at
  BEFORE UPDATE ON public.checklist_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Checklists Table
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.checklist_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📝',
  color TEXT DEFAULT '#D4A72C',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS checklists_user_id_idx ON public.checklists(user_id);
CREATE INDEX IF NOT EXISTS checklists_folder_id_idx ON public.checklists(folder_id);
CREATE INDEX IF NOT EXISTS checklists_created_at_idx ON public.checklists(created_at DESC);
CREATE INDEX IF NOT EXISTS checklists_is_pinned_idx ON public.checklists(is_pinned);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklists_owner_select" ON public.checklists
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "checklists_owner_insert" ON public.checklists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklists_owner_update" ON public.checklists
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklists_owner_delete" ON public.checklists
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP TRIGGER IF EXISTS set_checklists_updated_at ON public.checklists;
CREATE TRIGGER set_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Checklist Items Table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  position INT DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS checklist_items_checklist_id_idx ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS checklist_items_user_id_idx ON public.checklist_items(user_id);
CREATE INDEX IF NOT EXISTS checklist_items_position_idx ON public.checklist_items(position ASC);
CREATE INDEX IF NOT EXISTS checklist_items_is_completed_idx ON public.checklist_items(is_completed);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_items_owner_select" ON public.checklist_items
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_items_owner_insert" ON public.checklist_items
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_items_owner_update" ON public.checklist_items
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "checklist_items_owner_delete" ON public.checklist_items
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP TRIGGER IF EXISTS set_checklist_items_updated_at ON public.checklist_items;
CREATE TRIGGER set_checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_items TO authenticated;
