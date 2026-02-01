// src/lib/fetchers/newsletter.ts
// Server-only newsletter service fetchers using authFetch.

import {
  LecteurRegistrationRequest,
  LecteurResponse,
  NewsletterCategory,
  NewsletterCreateRequest,
  NewsletterResponse,
  NewsletterStatus,
} from '@/types/newsletter';
import { NewsletterRoutes } from '@/lib/server/services';
import { authFetch, authFetchJson } from '@/lib/server/auth-fetch';

// Helper to unwrap { data: T } envelope used by newsletter service
async function unwrap<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (json && typeof json === 'object' && 'data' in json) return json.data as T;
  return json as T;
}

export async function fetchNewsletterCategories(): Promise<NewsletterCategory[]> {
  const res = await authFetch(NewsletterRoutes.categories);
  const data = await unwrap<NewsletterCategory[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchNewslettersByStatus(
  status?: NewsletterStatus,
): Promise<NewsletterResponse[]> {
  const url = new URL(NewsletterRoutes.newsletters);
  if (status) url.searchParams.set('statut', status);
  const res = await authFetch(url.toString());
  const data = await unwrap<NewsletterResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchNewslettersByRedacteur(
  redacteurId: string,
): Promise<NewsletterResponse[]> {
  if (!redacteurId) return [];
  const res = await authFetch(
    `${NewsletterRoutes.newsletters}/redacteur/${redacteurId}`,
  );
  const data = await unwrap<NewsletterResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function createNewsletter(
  redacteurId: string,
  payload: NewsletterCreateRequest,
): Promise<NewsletterResponse | null> {
  if (!redacteurId) return null;
  const url = new URL(NewsletterRoutes.newsletters);
  url.searchParams.set('redacteurId', redacteurId);
  const res = await authFetch(url.toString(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap<NewsletterResponse>(res);
}

export async function updateNewsletter(
  newsletterId: string,
  payload: NewsletterCreateRequest,
): Promise<NewsletterResponse | null> {
  if (!newsletterId) return null;
  const res = await authFetch(`${NewsletterRoutes.newsletters}/${newsletterId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return unwrap<NewsletterResponse>(res);
}

export async function submitNewsletter(
  newsletterId: string,
  redacteurId: string,
): Promise<NewsletterResponse | null> {
  if (!newsletterId || !redacteurId) return null;
  const url = new URL(`${NewsletterRoutes.newsletters}/${newsletterId}/submit`);
  url.searchParams.set('redacteurId', redacteurId);
  const res = await authFetch(url.toString(), { method: 'POST' });
  return unwrap<NewsletterResponse>(res);
}

export async function validateNewsletter(
  newsletterId: string,
): Promise<NewsletterResponse | null> {
  if (!newsletterId) return null;
  const res = await authFetch(
    `${NewsletterRoutes.newsletters}/${newsletterId}/validate`,
    { method: 'POST' },
  );
  return unwrap<NewsletterResponse>(res);
}

export async function rejectNewsletter(
  newsletterId: string,
): Promise<NewsletterResponse | null> {
  if (!newsletterId) return null;
  const res = await authFetch(
    `${NewsletterRoutes.newsletters}/${newsletterId}/reject`,
    { method: 'POST' },
  );
  return unwrap<NewsletterResponse>(res);
}

export async function publishNewsletter(
  newsletterId: string,
): Promise<NewsletterResponse | null> {
  if (!newsletterId) return null;
  const res = await authFetch(
    `${NewsletterRoutes.newsletters}/${newsletterId}/publish`,
    { method: 'POST' },
  );
  return unwrap<NewsletterResponse>(res);
}

export async function registerLecteur(
  payload: LecteurRegistrationRequest,
): Promise<LecteurResponse | null> {
  const res = await authFetch(NewsletterRoutes.lecteursRegister, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap<LecteurResponse>(res);
}

export async function subscribeLecteurToCategories(
  lecteurId: string,
  categorieIds: string[],
): Promise<LecteurResponse | null> {
  const res = await authFetch(
    `${NewsletterRoutes.lecteurs}/${lecteurId}/subscribe`,
    {
      method: 'POST',
      body: JSON.stringify({ categorieIds }),
    },
  );
  return unwrap<LecteurResponse>(res);
}

export async function fetchLecteurPreferences(
  lecteurId: string,
): Promise<LecteurResponse | null> {
  if (!lecteurId) return null;
  const res = await authFetch(
    `${NewsletterRoutes.lecteurs}/${lecteurId}/preferences`,
  );
  return unwrap<LecteurResponse>(res);
}

export async function updateLecteurCategories(
  lecteurId: string,
  categorieIds: string[],
): Promise<LecteurResponse | null> {
  if (!lecteurId) return null;
  const res = await authFetch(
    `${NewsletterRoutes.lecteurs}/${lecteurId}/categories`,
    {
      method: 'PUT',
      body: JSON.stringify({ categorieIds }),
    },
  );
  return unwrap<LecteurResponse>(res);
}
