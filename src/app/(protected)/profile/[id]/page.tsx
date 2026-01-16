/* eslint-disable @typescript-eslint/no-unused-vars */
import NotFoundPage from '@/app/not-found';
import ProfileClientComponent from '@/components/Profile/ProfileClientComponent';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/helper/getInitials';
import {
  getAllBlogsByAuthorId,
  getAllPodcastsByAuthorId,
} from '@/lib/FetchBlogAndPodcastData';
import {
  fetchUserData,
  getAllFollowersOfUser,
  getAllUsersAUserIsFollowing,
} from '@/lib/FetchDataFromUserService';
import React from 'react';

export default async function ProfilePage2({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const userData = await fetchUserData(id);
  const blogData = await getAllBlogsByAuthorId(id, 'PUBLISHED');
  const podcastData = await getAllPodcastsByAuthorId(id, 'PUBLISHED');
  const totalPosts = blogData.length + podcastData.length;
  const followers = await getAllFollowersOfUser(id);
  const following = await getAllUsersAUserIsFollowing(id);

  if (!userData) {
    return (
      <div>
        <NotFoundPage />
      </div>
    );
  }

  // Pass data to the Client Component
  return (
    <>
      <ProfileClientComponent
        userData={userData}
        blogData={blogData}
        podcastData={podcastData}
        totalPosts={totalPosts}
        followers={followers}
        following={following}
      />
    </>
  );
}
