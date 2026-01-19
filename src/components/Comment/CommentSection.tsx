/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Comment from './Comment';
import { useAuth } from '@/context/AuthContext';
import TextArea from '../ui/textarea';
import { Button } from '../ui/button';
import { CreateCommentInterface, GetCommentInteface } from '@/types/comment';
import {
  createComment,
  fetchAllCommentsByEntityId,
} from '@/lib/FetchDataFromReviewService';
import UserAvatar from '../UserAvatar';

interface CommentSectionProps {
  entityType: string;
  entityId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  entityId,
  entityType,
}) => {
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState('');
  const [allComments, setAllComments] = useState<GetCommentInteface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch all comments
  const getAllCommentInformation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllCommentsByEntityId(entityId);
      setAllComments(data || []);
    } catch (err) {
      setError('Failed to load comments.::');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!user || !commentInput.trim()) return;
    setIsSubmitting(true);
    try {
      const commentData: CreateCommentInterface = {
        content: commentInput,
        entityId: entityId,
        commentByUser: user.id,
      };
      await createComment(commentData);
      setCommentInput('');
      await getAllCommentInformation(); // Refresh comments
    } catch (err) {
      setError('Failed to submit comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getAllCommentInformation();
  }, [entityId]);

  return (
    <div className="w-full mt-6">
      <div className="flex items-center gap-2 mb-8">
        <p className="h4-bold font-bold">Comments</p>
        {allComments.length > 0 && (
          <div className="flex h-[30px] w-[30px] text-white rounded-full bg-gray-400 items-center justify-center">
            {allComments.length}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Comment Input Box */}
      {user ? (
        <div className="flex items-start gap-3">
          <UserAvatar size="md" userId={user.id} fullName={user.firstName + user.lastName} />
          <div className="w-full">
            <TextArea
              value={commentInput}
              label="Add Comment"
              height="60px"
              placeholder="Write your comment..."
              maxWords={50}
              onChange={(value) => setCommentInput(value)}
            />
            <div className="flex w-full justify-end mt-1">
              <Button
                disabled={!commentInput.trim() || isSubmitting}
                size="sm"
                className="rounded-full"
                onClick={handleSubmitComment}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Log in to comment.</p>
      )}

      {/* Loading State */}
      {isLoading ? (
        <p className="text-black-300">Loading comments...</p>
      ) : allComments.length > 0 ? (
        allComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))
      ) : (
        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-black-300">Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
