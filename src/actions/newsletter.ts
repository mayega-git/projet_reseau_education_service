'use server';

// src/actions/newsletter.ts
// Server Actions exposing newsletter operations to Client Components.

import {
  fetchNewsletterCategories,
  fetchNewslettersByStatus,
  fetchNewslettersByRedacteur,
  createNewsletter,
  updateNewsletter,
  submitNewsletter,
  validateNewsletter,
  rejectNewsletter,
  publishNewsletter,
  registerLecteur,
  subscribeLecteurToCategories,
  fetchLecteurPreferences,
  updateLecteurCategories,
} from '@/lib/fetchers/newsletter';

export {
  fetchNewsletterCategories,
  fetchNewslettersByStatus,
  fetchNewslettersByRedacteur,
  createNewsletter,
  updateNewsletter,
  submitNewsletter,
  validateNewsletter,
  rejectNewsletter,
  publishNewsletter,
  registerLecteur,
  subscribeLecteurToCategories,
  fetchLecteurPreferences,
  updateLecteurCategories,
};
