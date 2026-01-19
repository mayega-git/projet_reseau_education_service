export interface NewsletterInterface {
    id: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'VERIFIED' | 'PUBLISHED';
    createdAt: string;
    authorId?: string;
  }
  