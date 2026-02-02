
import type { DiscussionGroup, Category, Post, Comment } from '@/types/forum';

// Server Actions imports
import {
  getValidatedGroups,
  getAllGroups,
  validateGroup,
  rejectGroup,
  deleteGroup,
  createGroup,
  getCategoriesByGroup,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPostsByGroup,
  getPostById,
  createPost,
  likePost,
  dislikePost,
  getCommentsByPost,
  createForumComment,
  updateForumComment,
  deleteForumComment,
} from '@/actions/forum';

class ForumAPI {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  // Discussion Groups
  async getValidatedGroups(): Promise<DiscussionGroup[]> {
    try {
      return await getValidatedGroups();
    } catch (error) {
      console.error('Failed to get validated rules', error);
      return [];
    }
  }

  async getAllGroups(): Promise<DiscussionGroup[]> {
    try {
      return await getAllGroups();
    } catch (error) {
      console.error('Failed to get all groups', error);
      return [];
    }
  }

  async validateGroup(groupId: string): Promise<void> {
    await validateGroup(groupId);
  }

  async rejectGroup(groupId: string): Promise<void> {
    await rejectGroup(groupId);
  }

  async deleteGroup(groupId: string): Promise<void> {
    await deleteGroup(groupId);
  }

  async createGroup(name: string, description: string, creatorId: string): Promise<DiscussionGroup> {
    return await createGroup(name, description, creatorId);
  }


  // Categories
  async getCategoriesByGroup(groupId: string): Promise<Category[]> {
    try {
      return await getCategoriesByGroup(groupId);
    } catch (error) {
      console.error('Failed to get categories by group', error);
      return [];
    }
  }


  async createCategory(groupId: string, categorieName: string): Promise<Category> {
    return await createCategory(groupId, categorieName);
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      return await getAllCategories();
    } catch (error) {
      console.error('Failed to get all categories', error);
      return [];
    }
  }


  async getCategoriesByGroupId(groupeId: string): Promise<Category[]> {
    return this.getCategoriesByGroup(groupeId);
  }

  async updateCategory(categorieId: string, categorie: Category): Promise<Category> {
    return await updateCategory(categorieId, categorie);
  }

  async deleteCategory(categorieId: string): Promise<void> {
    await deleteCategory(categorieId);
  }


  // Posts
  async getPostsByGroup(groupId: string): Promise<Post[]> {
    try {
      return await getPostsByGroup(groupId);
    } catch (error) {
      console.error('Failed to get posts by group', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<Post> {
    return await getPostById(postId);
  }


  async createPost(
    groupId: string,
    title: string,
    content: string,
    memberId: string,
    categoryId?: string
  ) {
    return await createPost(groupId, title, content, memberId, categoryId);
  }



  async likePost(postId: string, memberId: string): Promise<Post> {
    return await likePost(postId, memberId);
  }
  async dislikePost(postId: string, memberId: string): Promise<Post> {
    return await dislikePost(postId, memberId);
  }


  // Comments
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    try {
      return await getCommentsByPost(postId);
    } catch (error) {
      console.error('Failed to get comments by post', error);
      return [];
    }
  }

  async createComment(
    postId: string,
    content: string,
    memberId: string,
    parentCommentId?: string
  ): Promise<Comment> {
    return await createForumComment(postId, content, memberId, parentCommentId);
  }


  async updateComment(commentId: string, content: string) {
    return await updateForumComment(commentId, content);
  }


  async deleteComment(commentId: string, memberId: string): Promise<void> {
    await deleteForumComment(commentId, memberId);
  }
}

// Factory function to create API instance with token
export function createForumAPI(token?: string): ForumAPI {
  return new ForumAPI(token);
}

// Default instance for backward compatibility
export const api = new ForumAPI();

