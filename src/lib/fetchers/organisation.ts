// src/lib/fetchers/organisation.ts
// Server-only organisation service fetchers using authFetch.

import { GetOrganisation } from '@/types/organisation';
import { OrganisationRoutes } from '@/lib/server/services';
import { authFetchJson } from '@/lib/server/auth-fetch';

export async function fetchAllOrganisations(): Promise<GetOrganisation[]> {
  return (
    (await authFetchJson<GetOrganisation[]>(OrganisationRoutes.organisation)) ?? []
  );
}
