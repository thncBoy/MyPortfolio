// ==========================================
// TypeScript interfaces for portfolio data
// Field names use snake_case to match PostgreSQL
// ==========================================

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_tags: string[];
  features: string[];
  display_order: number;
  created_at: string;
  project_images?: ProjectImage[];
  project_links?: ProjectLink[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  label: string;
  url: string;
}

export interface SiteContent {
  key: string;
  value: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string | null;
  display_order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  description: string;
  start_date: string;
  end_date: string | null;
  display_order: number;
}

export interface PageView {
  id: string;
  visited_at: string;
  session_id: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ViewStats {
  total: number;
  today: number;
  daily: { date: string; count: number }[];
}

export interface PortfolioDocument {
  id: string;
  title: string;
  description?: string;
  category: string;
  file_url: string;
  storage_path: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  display_order?: number;
  is_public: boolean;
  created_at?: string;
}

