import React from 'react';
import { User, MessageSquarePlus } from 'lucide-react';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import { Button } from '../../ui/button';
import Separator from '../../ui/separator';
import { Card, CardContent } from '../../ui/card';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const { questionID, question, handleNewComment, handleNewAnswer } = useAnswerPage();

  if (!question) {
    return null;
  }

  return (
    <div className='container mx-auto py-6 px-4 max-w-5xl'>
      <Card className='mb-6 overflow-hidden'>
        <CardContent className='p-0'>
          <div className='flex w-full'>
            <div className='p-4 flex-none'>
              <VoteComponent question={question} />
            </div>
            <div className='flex-1 p-4'>
              <AnswerHeader ansCount={question.answers.length} title={question.title} />

              <Separator className='my-4' />

              <QuestionBody
                views={question.views.length}
                text={question.text}
                askby={question.askedBy}
                meta={getMetaData(new Date(question.askDateTime))}
              />

              <Separator className='my-4' />

              <CommentSection
                comments={question.comments}
                handleAddComment={(comment: Comment) =>
                  handleNewComment(comment, 'question', questionID)
                }
              />

              {question.answers.length > 0 && (
                <>
                  <Separator className='my-4' />
                  <h3 className='text-lg font-medium mb-4'>Answers</h3>

                  <div className='space-y-6'>
                    {question.answers.map(a => (
                      <div key={String(a._id)} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4' />
                            <span className='font-medium text-primary'>{a.ansBy}</span>
                            <span className='text-sm text-muted-foreground'>
                              {getMetaData(new Date(a.ansDateTime))}
                            </span>
                          </div>
                        </div>

                        <AnswerView
                          text={a.text}
                          ansBy={a.ansBy}
                          meta={getMetaData(new Date(a.ansDateTime))}
                          comments={a.comments}
                          handleAddComment={(comment: Comment) =>
                            handleNewComment(comment, 'answer', String(a._id))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='mt-6'>
        <Button onClick={() => handleNewAnswer()} className='w-full' size='lg'>
          <MessageSquarePlus className='mr-2 h-5 w-5' />
          Answer This Question
        </Button>
      </div>
    </div>
  );
};

export default AnswerPage;
