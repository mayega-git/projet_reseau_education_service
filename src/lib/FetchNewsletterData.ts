import {
  BASE_URL_NEWSLETTER_API,
  NewsletterServiceRoutes,
} from './api';
import type {
  LecteurRegistrationRequest,
  LecteurResponse,
  NewsletterCategory,
  NewsletterCreateRequest,
  NewsletterResponse,
  NewsletterStatus,
  RedacteurRequestResponse,
  RedacteurRequestSubmission,
} from '@/types/newsletter';

const resolvePayload = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as unknown;
  }
  return payload;
};

export const fetchNewsletterCategories = async (): Promise<
  NewsletterCategory[]
> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return [];
  }

  try {
    const response = await fetch(NewsletterServiceRoutes.categories, {
      method: 'GET',
    });
    const data = (await resolvePayload(response)) as NewsletterCategory[] | null;
    if (!response.ok || !Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch newsletter categories.', error);
    return [];
  }
};

export const createNewsletterCategory = async (
  payload: Pick<NewsletterCategory, 'nom' | 'description'>
): Promise<NewsletterCategory | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  try {
    const response = await fetch(NewsletterServiceRoutes.categories, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await resolvePayload(response)) as NewsletterCategory | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to create newsletter category.', error);
    return null;
  }
};

export const updateNewsletterCategory = async (
  categoryId: string,
  payload: Pick<NewsletterCategory, 'nom' | 'description'>
): Promise<NewsletterCategory | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!categoryId) {
    return null;
  }

  try {
    const url = new URL(`${NewsletterServiceRoutes.categories}/${categoryId}`);
    if (payload.description) {
      url.searchParams.set('description', payload.description);
    }
    if (payload.nom) {
      url.searchParams.set('nom', payload.nom);
    }
    const response = await fetch(url.toString(), {
      method: 'PUT',
    });
    const data = (await resolvePayload(response)) as NewsletterCategory | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to update newsletter category.', error);
    return null;
  }
};

export const deleteNewsletterCategory = async (
  categoryId: string
): Promise<boolean> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return false;
  }

  if (!categoryId) {
    return false;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.categories}/${categoryId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Failed to delete newsletter category.', error);
    return false;
  }
};

export const fetchNewslettersByStatus = async (
  status?: NewsletterStatus
): Promise<NewsletterResponse[]> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return [];
  }

  try {
    const url = new URL(NewsletterServiceRoutes.newsletters);
    if (status) {
      url.searchParams.set('statut', status);
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    const data = (await resolvePayload(response)) as
      | NewsletterResponse[]
      | null;
    if (!response.ok || !Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch newsletters by status.', error);
    return [];
  }
};

export const fetchNewslettersByRedacteur = async (
  redacteurId: string
): Promise<NewsletterResponse[]> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return [];
  }

  if (!redacteurId) {
    return [];
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.newsletters}/redacteur/${redacteurId}`,
      {
        method: 'GET',
      }
    );
    const data = (await resolvePayload(response)) as
      | NewsletterResponse[]
      | null;
    if (!response.ok || !Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch newsletters by redacteur.', error);
    return [];
  }
};

export const createNewsletter = async (
  redacteurId: string,
  payload: NewsletterCreateRequest
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!redacteurId) {
    return null;
  }

  try {
    const url = new URL(NewsletterServiceRoutes.newsletters);
    url.searchParams.set('redacteurId', redacteurId);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to create newsletter.', error);
    return null;
  }
};

export const updateNewsletter = async (
  newsletterId: string,
  payload: NewsletterCreateRequest
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!newsletterId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.newsletters}/${newsletterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to update newsletter.', error);
    return null;
  }
};

export const submitNewsletter = async (
  newsletterId: string,
  redacteurId: string
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!newsletterId || !redacteurId) {
    return null;
  }

  try {
    const url = new URL(
      `${NewsletterServiceRoutes.newsletters}/${newsletterId}/submit`
    );
    url.searchParams.set('redacteurId', redacteurId);
    const response = await fetch(url.toString(), {
      method: 'POST',
    });
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to submit newsletter.', error);
    return null;
  }
};

export const validateNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!newsletterId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.newsletters}/${newsletterId}/validate`,
      {
        method: 'POST',
      }
    );
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to validate newsletter.', error);
    return null;
  }
};

export const rejectNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!newsletterId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.newsletters}/${newsletterId}/reject`,
      {
        method: 'POST',
      }
    );
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to reject newsletter.', error);
    return null;
  }
};

export const publishNewsletter = async (
  newsletterId: string
): Promise<NewsletterResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!newsletterId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.newsletters}/${newsletterId}/publish`,
      {
        method: 'POST',
      }
    );
    const data = (await resolvePayload(response)) as NewsletterResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to publish newsletter.', error);
    return null;
  }
};

export const registerLecteur = async (
  payload: LecteurRegistrationRequest
): Promise<LecteurResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  try {
    const response = await fetch(NewsletterServiceRoutes.lecteursRegister, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await resolvePayload(response)) as LecteurResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to register lecteur.', error);
    return null;
  }
};

export const subscribeLecteurToCategories = async (
  lecteurId: string,
  categorieIds: string[]
): Promise<LecteurResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.lecteurs}/${lecteurId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categorieIds }),
      }
    );
    const data = (await resolvePayload(response)) as LecteurResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to subscribe lecteur to categories.', error);
    return null;
  }
};

export const fetchLecteurPreferences = async (
  lecteurId: string
): Promise<LecteurResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!lecteurId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.lecteurs}/${lecteurId}/preferences`,
      {
        method: 'GET',
      }
    );
    const data = (await resolvePayload(response)) as LecteurResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch lecteur preferences.', error);
    return null;
  }
};

export const updateLecteurCategories = async (
  lecteurId: string,
  categorieIds: string[]
): Promise<LecteurResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!lecteurId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.lecteurs}/${lecteurId}/categories`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categorieIds }),
      }
    );
    const data = (await resolvePayload(response)) as LecteurResponse | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to update lecteur categories.', error);
    return null;
  }
};

export const fetchRedacteurRequests = async (): Promise<
  RedacteurRequestResponse[]
> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return [];
  }

  try {
    const response = await fetch(NewsletterServiceRoutes.redacteursAdminRequests, {
      method: 'GET',
    });
    const data = (await resolvePayload(response)) as
      | RedacteurRequestResponse[]
      | null;
    if (!response.ok || !Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch redacteur requests.', error);
    return [];
  }
};

export const approveRedacteurRequest = async (
  requestId: string
): Promise<RedacteurRequestResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!requestId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.redacteursAdminRequests}/${requestId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );
    const data = (await resolvePayload(response)) as
      | RedacteurRequestResponse
      | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to approve redacteur request.', error);
    return null;
  }
};

export const rejectRedacteurRequest = async (
  requestId: string,
  reason: string
): Promise<RedacteurRequestResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!requestId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.redacteursAdminRequests}/${requestId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );
    const data = (await resolvePayload(response)) as
      | RedacteurRequestResponse
      | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to reject redacteur request.', error);
    return null;
  }
};

export const submitRedacteurRequest = async (
  payload: RedacteurRequestSubmission
): Promise<RedacteurRequestResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  try {
    const response = await fetch(NewsletterServiceRoutes.redacteursRequest, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await resolvePayload(response)) as
      | RedacteurRequestResponse
      | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to submit redacteur request.', error);
    return null;
  }
};

export const fetchRedacteurRequestStatus = async (
  requestId: string
): Promise<RedacteurRequestResponse | null> => {
  if (!BASE_URL_NEWSLETTER_API) {
    console.error('Missing NEXT_PUBLIC_NEWSLETTER_API.');
    return null;
  }

  if (!requestId) {
    return null;
  }

  try {
    const response = await fetch(
      `${NewsletterServiceRoutes.redacteursRequest}/${requestId}`,
      {
        method: 'GET',
      }
    );
    const data = (await resolvePayload(response)) as
      | RedacteurRequestResponse
      | null;
    if (!response.ok || !data) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch redacteur request status.', error);
    return null;
  }
};
