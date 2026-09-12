-- ==========================================
-- Documents / Files Table & Policies for Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- ==========================================

-- 1. Create documents table (for grade files, transcripts, resumes, certs)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Grade / Transcript',
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 3. Policies: Public can read, authenticated can insert/update/delete
CREATE POLICY "Public read documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Auth insert documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update documents" ON documents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete documents" ON documents
  FOR DELETE TO authenticated USING (true);

-- 4. Storage Bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
CREATE POLICY "Public read documents bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Auth upload documents bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Auth update documents bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Auth delete documents bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');
