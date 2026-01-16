import { GetOrganisation } from '@/types/organisation';
import { OrganisationServiceRoutes } from './api';
import { fetchData } from './helperAPIMethods';

export const fetchAllOrganisations = async (): Promise<GetOrganisation[]> => {
  const url = new URL(OrganisationServiceRoutes.organisation);
  return (await fetchData<GetOrganisation[]>(url.toString())) || [];
};
