import type { ElementType, ReactNode } from 'react';

export interface Agent {
  userid: string;
  email: string;
  full_name: string;
  phone_number: string;
  company: string;
  access_role: string;
  professional_role: string;
  status: string;
  job_title: string;
  location: string;
  license_number: string;
  license_expiry: string | null;
  profile_photo: string;
  last_active: string | null;
  company_banner: string;
}

export interface NewsArticle {
  id: string | number;
  title: string;
  excerpt?: string;
  department?: string;
  published_at: string;
}

export interface PortalEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface Resource {
  id: number;
  title: string;
  url?: string;
  file?: string;
}

export interface ResourceCategory {
  id: number;
  name: string;
  description?: string;
  resources: Resource[];
}

export interface PageDefinition {
  category: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
  children?: ReactNode;
}
