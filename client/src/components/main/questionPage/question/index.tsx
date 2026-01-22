import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';
import { upvoteQuestion, downvoteQuestion } from '../../../../services/questionService';
import useUserContext from '../../../../hooks/useUserContext';
import { Button } from '../../../ui/button';
import { cn } from '../../../../lib/utils';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [voteCount, setVoteCount] = useState<number>(
    (question.upVotes?.length || 0) - (question.downVotes?.length || 0),
  );
  const [userVote, setUserVote] = useState<number>(0);

  // Determine if user has already voted
  useEffect(() => {
    if (user.username && question?.upVotes?.includes(user.username)) {
      setUserVote(1);
    } else if (user.username && question?.downVotes?.includes(user.username)) {
      setUserVote(-1);
    } else {
      setUserVote(0);
    }

    // Update vote count when question changes
    setVoteCount((question.upVotes?.length || 0) - (question.downVotes?.length || 0));
  }, [question, user.username]);

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };

  /**
   * Function to handle upvoting a question.
   * Stops event propagation to prevent navigating to the question.
   */
  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.username || !question._id) return;

    try {
      const result = await upvoteQuestion(question._id, user.username);
      setVoteCount((result.upVotes?.length || 0) - (result.downVotes?.length || 0));

      // Update userVote state based on the response
      if (result.upVotes?.includes(user.username)) {
        setUserVote(1);
      } else {
        setUserVote(0);
      }
    } catch (error) {
      // do nothing
    }
  };

  /**
   * Function to handle downvoting a question.
   * Stops event propagation to prevent navigating to the question.
   */
  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.username || !question._id) return;

    try {
      const result = await downvoteQuestion(question._id, user.username);
      setVoteCount((result.upVotes?.length || 0) - (result.downVotes?.length || 0));

      // Update userVote state based on the response
      if (result.downVotes?.includes(user.username)) {
        setUserVote(-1);
      } else {
        setUserVote(0);
      }
    } catch (error) {
      // do nothing
    }
  };

  return (
    <div
      className='question right_padding'
      onClick={() => {
        if (question._id) {
          handleAnswer(question._id);
        }
      }}>
      <div className='postStats'>
        <Button
          variant='ghost'
          size='icon'
          className={cn('vote-button', userVote === 1 && 'upvote-active')}
          onClick={handleUpvote}>
          <ChevronUp className='h-5 w-5' />
        </Button>

        <div
          className={cn(
            'vote-count',
            voteCount > 0 && 'text-primary',
            voteCount < 0 && 'text-destructive',
          )}>
          {voteCount}
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={cn('vote-button', userVote === -1 && 'downvote-active')}
          onClick={handleDownvote}>
          <ChevronDown className='h-5 w-5' />
        </Button>
      </div>
      <div className='question_mid'>
        <div className='postTitle'>{question.title}</div>
        <div className='question_tags'>
          {question.tags.map(tag => (
            <button
              key={String(tag._id)}
              className='question_tag_button'
              onClick={e => {
                e.stopPropagation();
                clickTag(tag.name);
              }}>
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      <div className='lastActivity'>
        <div className='question_author'>{question.askedBy}</div>
        <div>&nbsp;</div>
        <div className='question_meta'>asked {getMetaData(new Date(question.askDateTime))}</div>
      </div>
      <div className='question_stats'>
        <div>{question.answers.length || 0} answers</div>
        <div>{question.views.length} views</div>
      </div>
    </div>
  );
};

export default QuestionView;
