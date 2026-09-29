import { LocalizedText } from '../../Shared/Models/localizedText';

export interface BlogPost {
  id?: string;
  title: LocalizedText;
  content?: LocalizedText;
  excerpt: LocalizedText;
  category: LocalizedText;
  author: LocalizedText;
  imageUrl?: string;
  imageFile?: File | null;
  publishDate: string;
  readTime: number | string;
  featured?: boolean;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}