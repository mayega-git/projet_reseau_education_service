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
  return fetchData<number>(
    `${ReviewServiceRoutes.ratings}/totalLikes/${entityId}`
  );
};

// Fetch total dislikes for an entity
export const fetchAllDislikesForEntityId = async (entityId: string) => {
  return fetchData<number>(
    `${ReviewServiceRoutes.ratings}/totalDislikes/${entityId}`
  );
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
  return fetchData<GetCommentInteface[]>(
    `${ReviewServiceRoutes.comments}/${entityId}`
  );
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
  const url = new URL(`${ReviewServiceRoutes.ratings}/likeOrDislike`);
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
