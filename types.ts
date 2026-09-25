
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  department: string;
  date: string;
  views: number;
  imageUrl: string;
}

export interface QuickLink {
  id: string;
  title: string;
  iconName: string;
  category: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Upcoming' | 'Past';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

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
