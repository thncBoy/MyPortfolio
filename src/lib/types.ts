// ==========================================
// TypeScript interfaces for portfolio data
// ==========================================

export interface Project {
  id: string;
  title: string;
  description: string;
  techTags: string[];
  displayOrder: number;
  createdAt: string;
  images?: ProjectImage[];
  links?: ProjectLink[];
}

export interface ProjectImage {
  id: string;
  projectId: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
}

export interface ProjectLink {
  id: string;
  projectId: string;
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
  startDate: string;
  endDate: string | null;
  displayOrder: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  description: string;
  startDate: string;
  endDate: string | null;
  displayOrder: number;
}

export interface PageView {
  id: string;
  visitedAt: string;
  sessionId: string;
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
