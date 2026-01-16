/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CreateCommentInterface,
  GetCommentInteface,
  LikeDislikeRequest,
  ReplyCommentInterface,
  ReplyCommentResponseInterface,
} from '@/types/comment';
import { ReviewServiceRoutes, UserServiceRoutes } from './api';
import { fetchData, postData } from './helperAPIMethods';

// Fetch total likes for an entity
export const fetchAllLikesForEntityId = async (entityId: string) => {
  const params = new URLSearchParams({ entityId }).toString();

  const url = `${ReviewServiceRoutes.ratings}/totalLikes?${params}`;
  console.log("➡️ URL transmise à fetchData pour les totallikes: "+url);
  
  return fetchData<number>(url);
};

// Fetch total dislikes for an entity
export const fetchAllDislikesForEntityId = async (entityId: string) => {
  
  const params = new URLSearchParams({ entityId }).toString();

  const url = `${ReviewServiceRoutes.ratings}/totalDislikes?${params}`;
  console.log("➡️ URL transmise à fetchData pour les totalDislikes: "+url);
  
  return fetchData<number>(url);
};

// Fetch "has liked" status by userId and entityId
export const fetchHasLikedStatusByUserId = async (
  userId: string,
  entityId: string
) => {
  const url = new URL(`${ReviewServiceRoutes.ratings}/hasLiked`);
  url.searchParams.set('userId', userId);
  url.searchParams.set('entityId', entityId);

  return fetchData<boolean>(url.toString());
};

// Fetch "has disliked" status by userId and entityId
export const fetchHasDislikedStatusByUserId = async (
  userId: string,
  entityId: string
) => {
  const url = new URL(`${ReviewServiceRoutes.ratings}/hasDisliked`);
  url.searchParams.set('userId', userId);
  url.searchParams.set('entityId', entityId);

  return fetchData<boolean>(url.toString());
};

// Fetch all comments on an entity ID
export const fetchAllCommentsByEntityId = async (entityId: string) => {
  const params = new URLSearchParams({ entityId }).toString();

  const url = `${ReviewServiceRoutes.comments}/by-entityId?${params}`;
  console.log("➡️ URL transmise à fetchData pour les comments d'un entityId: "+url);
  
  return fetchData<GetCommentInteface[]>(url);
};

// Function to create a comment
export const createComment = async (commentData: CreateCommentInterface) => {
  return postData<CreateCommentInterface, GetCommentInteface>(
    `${ReviewServiceRoutes.comments}`,
    commentData
  );
};

// Function to reply to a comment
export const replyComment = async (replyCommentData: ReplyCommentInterface) => {
  return postData<ReplyCommentInterface, ReplyCommentResponseInterface>(
    `${ReviewServiceRoutes.commentReply}/${replyCommentData.commentId}`,
    replyCommentData
  );
};

// Fetch all comment replies on an comment ID
export const fetchAllCommentsRepliesForCommentId = async (
  commentId: string
) => {
  return fetchData<ReplyCommentResponseInterface[]>(
    `${ReviewServiceRoutes.commentReply}/${commentId}`
  );
};

//function to like or dislike entity
export const likeOrDislikeEntity = async (params: LikeDislikeRequest) => {
  const url = new URL(`${ReviewServiceRoutes.ratings}/like-or-dislike`);
  url.searchParams.set('userId', params.userId);
  url.searchParams.set('entityId', params.entityId);
  url.searchParams.set('entityType', params.entityType);
  url.searchParams.set('isLike', params.isLike.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to like/dislike entity: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error making POST request', error);
  }
};
