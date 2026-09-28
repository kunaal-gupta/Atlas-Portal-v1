import type { ElementType, ReactNode } from 'react';

export interface Agent {
  userid: string;
  email: string;
  full_name: string;
  phone_number: string;
  agency: {
    agency_id: string;
    company_name: string;
    company_logo: string;
    company_banner: string;
    email: string;
    website: string;
    company_phone: string;
  } | null;
  status: string;
  job_title: string;
  location: string;
  license_number: string;
  license_expiry: string | null;
  profile_photo: string;
  last_active: string | null;
}

export interface NewsItem {
  id: string | number;
  title: string;
  url: string;
  summary: string;
  published_at: string;
  keywords: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  url: string;
  updated_date: string;
}

export interface PageDefinition {
  category: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
  children?: ReactNode;
}
