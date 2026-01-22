import { ChevronUp, ChevronDown } from 'lucide-react';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className='flex flex-col items-center gap-2'>
      <Button
        variant='ghost'
        size='icon'
        className={cn('vote-button', voted === 1 && 'upvote-active')}
        onClick={() => handleVote('upvote')}>
        <ChevronUp className='h-6 w-6' />
      </Button>

      <div
        className={cn(
          'text-lg font-semibold',
          count > 0 && 'text-primary',
          count < 0 && 'text-destructive',
        )}>
        {count}
      </div>

      <Button
        variant='ghost'
        size='icon'
        className={cn('vote-button', voted === -1 && 'downvote-active')}
        onClick={() => handleVote('downvote')}>
        <ChevronDown className='h-6 w-6' />
      </Button>
    </div>
  );
};

export default VoteComponent;
