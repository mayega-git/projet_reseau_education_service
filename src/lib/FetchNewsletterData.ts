/* eslint-disable @typescript-eslint/no-unused-vars */
import { NewsletterInterface } from '@/types/newsletter';
import { EducationServiceRoutes } from './api';
import { fetchData } from './helperAPIMethods';

/**
 * Fetch all newsletters ever created
 */
export const getAllNewslettersEverCreated = async (): Promise<
  NewsletterInterface[]
> => {
  const url = new URL(EducationServiceRoutes.newsletters).toString();
  return (await fetchData<NewsletterInterface[]>(url)) || [];
};

/**
 * Fetch all newsletters based on status
 * @param {string} status - The status of newsletters to fetch
 */
export const getAllNewsletters = async (
  status: string
): Promise<NewsletterInterface[]> => {
  const url = new URL(`${EducationServiceRoutes.newsletters}/published`);
  url.searchParams.set('status', status);
  return (await fetchData<NewsletterInterface[]>(url.toString())) || [];
};

/**
 * Fetch all newsletters by author ID
 * @param {string} authorId - The ID of the author
 */
export const getAllNewslettersByAuthorId = async (
  authorId: string,
  status: string
): Promise<NewsletterInterface[]> => {
  const url = new URL(EducationServiceRoutes.newsletters);
  url.searchParams.set('authorId', authorId);
  if (status !== '') {
    url.searchParams.set('status', status);
  }
  return (await fetchData<NewsletterInterface[]>(url.toString())) || [];
};

/**
 * Fetch a specific newsletter by ID
 * @param {string} id - The newsletter ID
 */
export const fetchNewsletterById = async (
  id: string
): Promise<NewsletterInterface | null> => {
  const url = new URL(`${EducationServiceRoutes.newsletters}/${id}`).toString();
  return await fetchData<NewsletterInterface>(url);
};
