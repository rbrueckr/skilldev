import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import Separator from '../../ui/separator';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({ comments, handleAddComment }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
  };

  return (
    <div className='space-y-2'>
      <div className='flex justify-between items-center'>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground flex items-center gap-1 font-normal'
          onClick={() => setShowComments(!showComments)}>
          {showComments ? (
            <>
              <X className='h-4 w-4' />
              <span>Hide Comments</span>
            </>
          ) : (
            <>
              <MessageSquare className='h-4 w-4' />
              <span>{comments.length > 0 ? `${comments.length} Comments` : 'Add Comment'}</span>
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'>
            <Separator className='my-2' />

            <div className='space-y-3'>
              {comments.length > 0 ? (
                <ul className='space-y-2'>
                  {comments.map(comment => (
                    <li key={String(comment._id)} className='bg-muted/50 p-2 rounded-md'>
                      <p className='text-sm'>{comment.text}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        <span className='font-medium'>{comment.commentBy}</span> •{' '}
                        {getMetaData(new Date(comment.commentDateTime))}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-muted-foreground italic'>No comments yet.</p>
              )}

              <div className='pt-2'>
                <div className='flex gap-2'>
                  <Textarea
                    placeholder='Add a comment...'
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className='min-h-[60px] text-sm'
                  />
                  <Button size='icon' onClick={handleAddCommentClick} className='self-end'>
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
                {textErr && <p className='text-xs text-destructive mt-1'>{textErr}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection;
