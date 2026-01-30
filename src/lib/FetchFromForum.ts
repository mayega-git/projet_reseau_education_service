import { API_BASE_URL } from '@/types/constants';

import type { DiscussionGroup, Category, Post, Comment } from '@/types/forum';

// Mapper function to normalize backend Post response to frontend format
function normalizePost(post: any): Post {
  const authorName = post.authorName ||
    (post.authorFirstName && post.authorLastName ? `${post.authorFirstName} ${post.authorLastName}` : null) ||
    post.firstName && post.lastName ? `${post.firstName} ${post.lastName}` : 'Utilisateur';

  return {
    ...post,
    likes: post.numberOfLikes ?? post.likes ?? 0,
    dislikes: post.numberOfDislikes ?? post.dislikes ?? 0,
    createdAt: post.creationDate ?? post.createdAt,
    authorName,
  };
}

function normalizeComment(comment: any): Comment {
  const authorName = comment.authorName ||
    (comment.authorFirstName && comment.authorLastName ? `${comment.authorFirstName} ${comment.authorLastName}` : null) ||
    comment.firstName && comment.lastName ? `${comment.firstName} ${comment.lastName}` : 'Utilisateur';

  return {
    ...comment,
    createdAt: comment.creationDate ?? comment.createdAt,
    authorName,
    replies: comment.replies ? comment.replies.map(normalizeComment) : []
  };
}

class ForumAPI {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private baseURL = API_BASE_URL;
  private async request<T>(endpoint: string, options?: RequestInit & { skipToken?: boolean }): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is available and not skipped
      if (this.token && !options?.skipToken) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      // Merge with any additional headers from options
      const finalHeaders = {
        ...headers,
        ...(options?.headers as Record<string, string>),
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: finalHeaders,
      });

      if (!response.ok) {
        const text = await response.text(); // 🔍 pour debug backend
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      // ✅ NE PAS parser si la réponse est vide
      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // ✅ fallback si pas de JSON
      return null as T;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Discussion Groups
  async getValidatedGroups(): Promise<DiscussionGroup[]> {
    const allGroups = await this.request<DiscussionGroup[]>('/groups/all');
    // Filter only validated groups for regular users
    return allGroups.filter(group => group.status === 'VALIDATED');
  }

  async getAllGroups(): Promise<DiscussionGroup[]> {
    return this.request('/groups/all');
  }

  async validateGroup(groupId: string): Promise<void> {
    await this.request(`/groups/${groupId}/validate`, {
      method: 'PUT'
    });
  }

  async rejectGroup(groupId: string): Promise<void> {
    await this.request(`/groups/${groupId}/reject`, {
      method: 'PUT'
    });
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.request(`/groups/${groupId}`, {
      method: 'DELETE'
    });
  }

  async createGroup(name: string, description: string, creatorId: string): Promise<DiscussionGroup> {
    const body = {
      name,
      description,
      type: 'FORUM',
      creatorId
    };

    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }


  // Categories
  async getCategoriesByGroup(groupId: string): Promise<Category[]> {
    return this.request(`/categories/groupe/${groupId}`);
  }




  async createCategory(groupId: string, categorieName: string): Promise<Category> {
    return this.request(`/categories/${groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categorieName,
      }),
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories/all', {
      method: 'GET',
    });
  }


  async getCategoriesByGroupId(groupeId: string): Promise<Category[]> {
    return this.request<Category[]>(`/categories/groupe/${groupeId}`, {
      method: 'GET',
    });
  }

  async updateCategory(categorieId: string, categorie: Category): Promise<Category> {
    return this.request<Category>(`/categories/${categorieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categorie),
    });
  }

  async deleteCategory(categorieId: string): Promise<void> {
    return this.request<void>(`/categories/${categorieId}`, {
      method: 'DELETE',
    });
  }






  // Posts
  async getPostsByGroup(groupId: string): Promise<Post[]> {
    const posts = await this.request<any[]>(`/posts/groupe/${groupId}`);
    return posts.map(normalizePost);
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.request<any>(`/posts/${postId}`);
    return normalizePost(post);
  }


  async createPost(
    groupId: string,
    title: string,
    content: string,
    memberId: string,
    categoryId?: string
  ) {
    const body = {
      authorId: memberId,
      groupId,
      title,
      content,
      categoriesIds: categoryId ? [categoryId] : [],
    };

    console.log("POST payload :", body);

    return this.request(
      `/posts?memberId=${memberId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
        // No skipToken here, we might need authorization for group membership checks
      }
    );
  }



  async likePost(postId: string, memberId: string): Promise<Post> {
    const post = await this.request<any>(
      `/posts/${postId}/like?memberId=${memberId}`,
      { method: 'POST' }
    );
    return normalizePost(post);
  }
  async dislikePost(postId: string, memberId: string): Promise<Post> {
    const post = await this.request<any>(
      `/posts/${postId}/dislike?memberId=${memberId}`,
      { method: 'POST' }
    );
    return normalizePost(post);
  }


  // Comments
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const comments = await this.request<any[]>(`/commentaires/post/${postId}`);
    return comments.map(normalizeComment);
  }

  async createComment(
    postId: string,
    content: string,
    memberId: string,
    parentCommentId?: string
  ): Promise<Comment> {

    return this.request('/commentaires/', {
      method: 'POST',
      body: JSON.stringify({
        postId: postId,
        authorId: memberId,
        content: content,
        parentCommentId: parentCommentId ?? null
      })
    });
  }


  async updateComment(commentId: string, content: string) {
    return this.request(`/commentaires/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }


  async deleteComment(commentId: string, memberId: string): Promise<void> {
    await this.request(`/commentaires/${commentId}?memberId=${memberId}`, {
      method: 'DELETE'
    });
  }
}

// Factory function to create API instance with token
export function createForumAPI(token?: string): ForumAPI {
  return new ForumAPI(token);
}

// Default instance for backward compatibility
export const api = new ForumAPI();

