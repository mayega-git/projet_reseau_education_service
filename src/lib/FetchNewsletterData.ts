import type {
  LecteurRegistrationRequest,
  LecteurResponse,
  NewsletterCategory,
  NewsletterCreateRequest,
  NewsletterResponse,
  NewsletterStatus,
} from '@/types/newsletter';

// Server Actions imports
import {
  fetchNewsletterCategories as fetchNewsletterCategoriesAction,
  fetchNewslettersByStatus as fetchNewslettersByStatusAction,
  fetchNewslettersByRedacteur as fetchNewslettersByRedacteurAction,
  createNewsletter as createNewsletterAction,
  updateNewsletter as updateNewsletterAction,
  submitNewsletter as submitNewsletterAction,
  validateNewsletter as validateNewsletterAction,
  rejectNewsletter as rejectNewsletterAction,
  publishNewsletter as publishNewsletterAction,
  registerLecteur as registerLecteurAction,
  subscribeLecteurToCategories as subscribeLecteurToCategoriesAction,
  fetchLecteurPreferences as fetchLecteurPreferencesAction,
  updateLecteurCategories as updateLecteurCategoriesAction,
} from '@/actions/newsletter';


export const fetchNewsletterCategories = async (): Promise<
  NewsletterCategory[]
> => {
  try {
    return await fetchNewsletterCategoriesAction();
  } catch (error) {
    console.error('Failed to fetch newsletter categories.', error);
    return [];
  }
};

export const fetchNewslettersByStatus = async (
  status?: NewsletterStatus
): Promise<NewsletterResponse[]> => {
  try {
    return await fetchNewslettersByStatusAction(status);
  } catch (error) {
    console.error('Failed to fetch newsletters by status.', error);
    return [];
  }
};

export const fetchNewslettersByRedacteur = async (
  redacteurId: string
): Promise<NewsletterResponse[]> => {
  if (!redacteurId) return [];

  try {
    return await fetchNewslettersByRedacteurAction(redacteurId);
  } catch (error) {
    console.error('Failed to fetch newsletters by redacteur.', error);
    return [];
  }
};

export const createNewsletter = async (
  redacteurId: string,
  payload: NewsletterCreateRequest
): Promise<NewsletterResponse | null> => {
  if (!redacteurId) return null;

  try {
    return await createNewsletterAction(redacteurId, payload);
  } catch (error) {
    console.error('Failed to create newsletter.', error);
    return null;
  }
};

export const updateNewsletter = async (
  newsletterId: string,
  payload: NewsletterCreateRequest
): Promise<NewsletterResponse | null> => {
  if (!newsletterId) return null;

  try {
    return await updateNewsletterAction(newsletterId, payload);
  } catch (error) {
    console.error('Failed to update newsletter.', error);
    return null;
  }
};

export const submitNewsletter = async (
  newsletterId: string,
  redacteurId: string
): Promise<NewsletterResponse | null> => {
  if (!newsletterId || !redacteurId) return null;

  try {
    return await submitNewsletterAction(newsletterId, redacteurId);
  } catch (error) {
    console.error('Failed to submit newsletter.', error);
    return null;
  }
};

export const validateNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!newsletterId) return null;

  try {
    return await validateNewsletterAction(newsletterId);
  } catch (error) {
    console.error('Failed to validate newsletter.', error);
    return null;
  }
};

export const rejectNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!newsletterId) return null;

  try {
    return await rejectNewsletterAction(newsletterId);
  } catch (error) {
    console.error('Failed to reject newsletter.', error);
    return null;
  }
};

export const publishNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!newsletterId) return null;

  try {
    return await publishNewsletterAction(newsletterId);
  } catch (error) {
    console.error('Failed to publish newsletter.', error);
    return null;
  }
};

export const registerLecteur = async (
  payload: LecteurRegistrationRequest
): Promise<LecteurResponse | null> => {
  try {
    return await registerLecteurAction(payload);
  } catch (error) {
    console.error('Failed to register lecteur.', error);
    return null;
  }
};

export const subscribeLecteurToCategories = async (
  lecteurId: string,
  categorieIds: string[]
): Promise<LecteurResponse | null> => {
  try {
    return await subscribeLecteurToCategoriesAction(lecteurId, categorieIds);
  } catch (error) {
    console.error('Failed to subscribe lecteur to categories.', error);
    return null;
  }
};

export const fetchLecteurPreferences = async (
  lecteurId: string
): Promise<LecteurResponse | null> => {
  if (!lecteurId) return null;

  try {
    return await fetchLecteurPreferencesAction(lecteurId);
  } catch (error) {
    console.error('Failed to fetch lecteur preferences.', error);
    return null;
  }
};

export const updateLecteurCategories = async (
  lecteurId: string,
  categorieIds: string[]
): Promise<LecteurResponse | null> => {
  if (!lecteurId) return null;

  try {
    return await updateLecteurCategoriesAction(lecteurId, categorieIds);
  } catch (error) {
    console.error('Failed to update lecteur categories.', error);
    return null;
  }
};
