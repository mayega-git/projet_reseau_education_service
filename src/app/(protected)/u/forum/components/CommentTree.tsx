'use client';

import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight, Reply } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Comment } from '@/types/forum';

interface CommentTreeProps {
  comments: Comment[];
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  level?: number;
}

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  level
}: {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (comment: Comment) => void;
  onDelete: (id: string) => void;
  level: number;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentDate = comment.createdAt || comment.creationDate;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const { user } = useAuth();

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.commentaireId, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true); // Auto-show replies after posting
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group">
      {/* Comment Card */}
      <div
        onClick={() => hasReplies && setShowReplies(!showReplies)}
        className={`bg-white rounded-xl border border-grey-200 p-5 hover:border-primary-purple-200 transition-all ${hasReplies ? 'cursor-pointer' : ''} shadow-sm`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-purple-100 flex items-center justify-center text-primary-purple-700 font-bold text-sm shadow-inner overflow-hidden">
              {comment.authorName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
            </div>
            <div>
              <p className="paragraph-medium-bold text-black-500">{comment.authorName || 'Utilisateur'}</p>
              <p className="text-[12px] text-black-200 mt-0.5 font-inter">
                {commentDate ? new Date(commentDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Date inconnue'}
              </p>
            </div>
          </div>

          {comment.authorId === user?.id && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(comment);
                }}
                className="p-2 text-primary-purple-600 hover:bg-primary-purple-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(comment.commentaireId);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="paragraph-medium-normal text-black-500 mb-4 leading-relaxed pl-1">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t text-black-500 border-grey-500">
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReplyForm(!showReplyForm);
              }}
              className="flex items-center gap-2 text-sm text-black-800 hover:text-primary-purple-600 font-semibold transition-colors group/reply"
            >
              <Reply className="w-4 h-4 group-hover/reply:rotate-12 transition-transform text-black-500" />
              Répondre
            </button>

            {hasReplies && (
              <div className="flex items-center gap-2 text-sm text-primary-purple-600 font-bold select-none cursor-pointer">
                {showReplies ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Masquer ({comment.replies!.length})
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Voir les réponses ({comment.replies!.length})
                  </>
                )}
              </div>
            )}
          </div>
          <div className="text-[11px] font-bold text-grey-400 uppercase tracking-tighter italic">Message #{comment.commentaireId?.substring(0, 4)}</div>
        </div>
      </div>

      {/* Inline Reply Form */}
      {showReplyForm && (
        <div className="mt-4 ml-6 sm:ml-12 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleReplySubmit} className="bg-grey-50 border border-grey-200 rounded-xl p-6 shadow-inner">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-9 h-9 rounded-full bg-primary-purple-600 flex items-center justify-center text-black-500 font-bold text-xs flex-shrink-0 shadow-sm">
                {user?.firstName?.charAt(0).toUpperCase() || 'V'}
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Répondre à ${comment.authorName}...`}
                required
                rows={3}
                autoFocus
                className="custom-input h-auto py-2.5 min-h-[80px] flex-1 bg-white font-inter"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-5 py-2 text-sm bg-white text-black-500 rounded-lg hover:bg-grey-50 transition-colors border border-grey-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-6 py-2 text-sm bg-primary-black-600 text-black-800 rounded-lg hover:bg-primary-black-700 transition-colors disabled:opacity-50 font-bold shadow-sm"
              >
                {isSubmitting ? 'Envoi...' : 'Répondre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="mt-4 ml-6 sm:ml-12 space-y-4 border-l-2 border-primary-purple-100 pl-4 sm:pl-6 animate-in slide-in-from-top-4 duration-300">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.commentaireId}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentTree({
  comments,
  onReply,
  onEdit,
  onDelete,
  level = 0
}: CommentTreeProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentaireId}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level}
        />
      ))}
    </div>
  );
}