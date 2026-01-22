import React from 'react';
import './index.css';
import AskQuestionButton from '../../askQuestionButton';
import { Badge } from '../../../ui/badge';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
}

/**
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title }: AnswerHeaderProps) => (
  <div className='flex flex-col gap-2'>
    <div className='flex justify-between items-center'>
      <h1 className='text-2xl font-bold'>{title}</h1>
      <AskQuestionButton />
    </div>
    <Badge variant='outline' className='w-fit'>
      {ansCount} {ansCount === 1 ? 'answer' : 'answers'}
    </Badge>
  </div>
);

export default AnswerHeader;
