-- ==========================================
-- Portfolio Database Setup for Supabase
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ==========================================

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Project Images table
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0
);

-- 3. Project Links table
CREATE TABLE IF NOT EXISTS project_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL
);

-- 4. Site Content table (key-value store)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

-- 5. Experience table
CREATE TABLE IF NOT EXISTS experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT,
  display_order INTEGER DEFAULT 0
);

-- 6. Education table
CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT,
  display_order INTEGER DEFAULT 0
);

-- 7. Page Views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies: Public READ for all tables
-- ==========================================
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);
CREATE POLICY "Public read project_links" ON project_links FOR SELECT USING (true);
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);
CREATE POLICY "Public read page_views" ON page_views FOR SELECT USING (true);

-- ==========================================
-- RLS Policies: Authenticated WRITE for admin tables
-- ==========================================

-- Projects
CREATE POLICY "Auth insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete projects" ON projects FOR DELETE TO authenticated USING (true);

-- Project Images
CREATE POLICY "Auth insert project_images" ON project_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update project_images" ON project_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete project_images" ON project_images FOR DELETE TO authenticated USING (true);

-- Project Links
CREATE POLICY "Auth insert project_links" ON project_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update project_links" ON project_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete project_links" ON project_links FOR DELETE TO authenticated USING (true);

-- Site Content
CREATE POLICY "Auth insert site_content" ON site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update site_content" ON site_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Experience
CREATE POLICY "Auth insert experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update experience" ON experience FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete experience" ON experience FOR DELETE TO authenticated USING (true);

-- Education
CREATE POLICY "Auth insert education" ON education FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete education" ON education FOR DELETE TO authenticated USING (true);

-- Page Views: anyone can insert (visitor tracking)
CREATE POLICY "Anyone insert page_views" ON page_views FOR INSERT WITH CHECK (true);

-- ==========================================
-- Storage Bucket for project images
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read from the bucket
CREATE POLICY "Public read project-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

-- Allow authenticated users to upload
CREATE POLICY "Auth upload project-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users to delete
CREATE POLICY "Auth delete project-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'project-images');

-- ==========================================
-- 8. Documents table (for grade files, transcripts, resumes, certs)
-- ==========================================
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

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Auth insert documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete documents" ON documents FOR DELETE TO authenticated USING (true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read documents bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth upload documents bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Auth update documents bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Auth delete documents bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

