import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Post } from '@/app/forum-app/lib/types';
import {type   User} from '@/types/User';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-grey-200 p-6 hover:border-primary-purple-200 hover:shadow-sm transition-all cursor-pointer group"
    >
      <h4 className="h6-bold text-black-500 mb-2 group-hover:text-primary-purple-600 transition-colors">{post.title}</h4>
      <p className="paragraph-small-normal text-black-300 mb-4 line-clamp-2">{post.content}</p>
      <div className="flex items-center gap-6 text-[13px] text-black-200 font-inter">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 hover:text-primary-purple-500 transition-colors">
            <MessageSquare className="w-4 h-4" />
            {post.commentCount || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4" />
            {post.likes || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsDown className="w-4 h-4" />
            {post.dislikes || 0}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="bg-grey-100 px-2 py-0.5 rounded text-[11px] font-bold text-black-300 uppercaseTracking">Discussion</span>
          <span className="text-grey-400">|</span>
          <span>Créé par <span className="font-semibold text-black-400">{post?.authorName || 'Utilisateur'}</span></span>
          <span className="text-grey-400">•</span>
          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Date inconnue'}</span>
        </div>
      </div>
    </div>
  );
}