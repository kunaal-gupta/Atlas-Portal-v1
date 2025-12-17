
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
