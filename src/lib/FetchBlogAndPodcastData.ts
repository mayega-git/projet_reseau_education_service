/* eslint-disable @typescript-eslint/no-unused-vars */
import { BlogInterface } from '@/types/blog';
import { EducationServiceRoutes, UserServiceRoutes } from './api';
import { PodcastInterface } from '@/types/podcast';
import { GetUser, User } from '@/types/User';
import { fetchData } from './helperAPIMethods';
import { fetchBinaryData } from './helperAPIMethods';

/**
 * Fetch all blogs ever created
 */
export const getAllBlogsEverCreated = async (): Promise<BlogInterface[]> => {
  const url = new URL(EducationServiceRoutes.blogs).toString();
  return (await fetchData<BlogInterface[]>(url)) || [];
};

/**
 * Fetch all podcasts ever created
 */
export const getAllPodcastsEverCreated = async (): Promise<
  PodcastInterface[]
> => {
  const url = new URL(EducationServiceRoutes.podcasts).toString();
  return (await fetchData<PodcastInterface[]>(url)) || [];
};

/**
 * Fetch all blogs based on status
 * @param {string} status - The status of blogs to fetch
 */
export const getAllBlogs = async (status: string): Promise<BlogInterface[]> => {
  const url = new URL(`${EducationServiceRoutes.blogs}/published`);
  url.searchParams.set('status', status);
  return (await fetchData<BlogInterface[]>(url.toString())) || [];
};

/**
 * Fetch all blogs by author ID
 * @param {string} authorId - The ID of the author
 */
export const getAllBlogsByAuthorId = async (
  authorId: string,
  status: string
): Promise<BlogInterface[]> => {
  const url = new URL(EducationServiceRoutes.blogs);
  url.searchParams.set('authorId', authorId);
  if (status !== '') {
    url.searchParams.set('status', status);
  }
  return (await fetchData<BlogInterface[]>(url.toString())) || [];
};

/**
 * Fetch all podcasts based on status
 * @param {string} status - The status of podcasts to fetch
 */
export const getAllPodcasts = async (
  status: string
): Promise<PodcastInterface[]> => {
  const url = new URL(EducationServiceRoutes.podcasts);
  url.searchParams.set('status', status);
  return (await fetchData<PodcastInterface[]>(url.toString())) || [];
};

/**
 * Fetch all podcasts by author ID
 * @param {string} authorId - The ID of the author
 */
export const getAllPodcastsByAuthorId = async (
  authorId: string,
  status: string
): Promise<PodcastInterface[]> => {
  const url = new URL(EducationServiceRoutes.podcasts);
  url.searchParams.set('authorId', authorId);
  if (status !== '') {
    url.searchParams.set('status', status);
  }
  return (await fetchData<PodcastInterface[]>(url.toString())) || [];
};

/**
 * Fetch a specific blog by ID
 * @param {string} id - The blog ID
 */
export const fetchBlogById = async (
  id: string
): Promise<BlogInterface | null> => {

  const blogUrl = `${EducationServiceRoutes.blogs}/${id}`;
  const tagsUrl = `${EducationServiceRoutes.blogs}/${id}/tags`;
  const categoriesUrl = `${EducationServiceRoutes.blogs}/${id}/categories`;

  // ⚡ Exécute les 3 appels en parallèle
  const [blog, tags, categories] = await Promise.all([
    fetchData<BlogInterface>(blogUrl),
    fetchData<string[]>(tagsUrl),
    fetchData<string[]>(categoriesUrl)
  ]);

  if (!blog) return null;

  return {
    ...blog,
    tags: tags ?? [],
    category: categories ?? []
  };
};


/**
 * Fetch a specific podcast by ID
 * @param {string} id - The podcast ID
 */
export const fetchPodcastById = async (
  id: string
): Promise<PodcastInterface | null> => {
  const url = new URL(`${EducationServiceRoutes.podcasts}/${id}`).toString();
  return await fetchData<PodcastInterface>(url);
};

/**
 * Fetch images for an array of blogs
 * @param {BlogInterface[]} blogs - The blog ID
 */
export const fetchBlogImages = async (blogs: BlogInterface[]) => {
  const imageMap: { [key: string]: number[] } = {};

  await Promise.all(
    blogs.map(async (blog) => {
      try {
        const imageData = await fetchBinaryData(
          `${EducationServiceRoutes.blogs}/${blog.id}/streamCoverImage`
        );
        imageMap[blog.id] = imageData;
      } catch (err) {
        console.error('Error fetching image for blog ${blog.id}:', err);
      }
    })
  );

  return imageMap;
};

/**
 * Fetch images for an array of podcasts
 * @param {PodcastInterface[]} podcasts - The blog ID
 */
export const fetchPodcastImages = async (podcasts: PodcastInterface[]) => {
  const imageMap: { [key: string]: number[] } = {};

  await Promise.all(
    podcasts.map(async (podcast) => {
      try {
        const imageData = await fetchBinaryData(
          `${EducationServiceRoutes.podcasts}/${podcast.id}/stream-coverImage`
        );
        imageMap[podcast.id] = imageData;
      } catch (err) {
        console.error(`Error fetching image for podcast ${podcast.id}:`, err);
      }
    })
  );

  return imageMap;
};

//fetch single blog image
export const fetchBlogImage = async (blogId: string) => {
  const imageMap: { [key: string]: number[] } = {};

  try {
    const imageData = await fetchBinaryData(
      `${EducationServiceRoutes.blogs}/${blogId}/coverblog`
    );
    imageMap[blogId] = imageData;
  } catch (err) {
    console.error(`Error fetching image for blog ${blogId}:`, err);
  }

  return imageMap;
};

export const fetchPodcastImage = async (podcastId: string) => {
  const imageMap: { [key: string]: number[] } = {};

  try {
    const imageData = await fetchBinaryData(
      `${EducationServiceRoutes.podcasts}/${podcastId}/stream-coverImage`
    );
    imageMap[podcastId] = imageData;
  } catch (err) {
    console.error(`Error fetching image for podcast ${podcastId}:`, err);
  }

  return imageMap;
};

// function to fetch blog audio
export const fetchBlogAudio = async (blogId: string) => {
  const audioMap: { [key: string]: number[] } = {};

  try {
    const audioData = await fetchBinaryData(
      `${EducationServiceRoutes.blogs}/${blogId}/audio`
    );
    audioMap[blogId] = audioData;
  } catch (err) {
    console.error(`Error fetching audio for blog ${blogId}:`, err);
  }

  return audioMap;
};

// function to fetch blog audio
export const fetchPodcastAudio = async (podcastId: string) => {
  const audioMap: { [key: string]: number[] } = {};

  try {
    const audioData = await fetchBinaryData(
      `${EducationServiceRoutes.podcasts}/${podcastId}/stream`
    );
    audioMap[podcastId] = audioData;
  } catch (err) {
    console.error(`Error fetching audio for podcast ${podcastId}:`, err);
  }

  return audioMap;
};
