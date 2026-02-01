'use server';

// src/actions/review.ts
// Server Actions exposing review service operations to Client Components.

import {
  fetchAllLikesForEntityId,
  fetchAllDislikesForEntityId,
  fetchHasLikedStatusByUserId,
  fetchHasDislikedStatusByUserId,
  fetchAllCommentsByEntityId,
  createComment,
  replyComment,
  fetchAllCommentsRepliesForCommentId,
  likeOrDislikeEntity,
} from '@/lib/fetchers/review';

export {
  fetchAllLikesForEntityId,
  fetchAllDislikesForEntityId,
  fetchHasLikedStatusByUserId,
  fetchHasDislikedStatusByUserId,
  fetchAllCommentsByEntityId,
  createComment,
  replyComment,
  fetchAllCommentsRepliesForCommentId,
  likeOrDislikeEntity,
};
