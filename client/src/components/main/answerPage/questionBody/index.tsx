import React from 'react';
import { Eye, Clock, User } from 'lucide-react';
import './index.css';
import { handleHyperlink } from '../../../../tool';
import { Badge } from '../../../ui/badge';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 */
const QuestionBody = ({ views, text, askby, meta }: QuestionBodyProps) => (
  <div className='space-y-4'>
    <div className='flex justify-between items-start'>
      <div className='prose prose-sm max-w-none'>{handleHyperlink(text)}</div>
      <Badge variant='outline' className='flex items-center gap-1'>
        <Eye className='h-3 w-3' /> {views}
      </Badge>
    </div>

    <div className='flex items-center justify-end gap-4 text-sm text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <User className='h-3 w-3' />
        <span className='font-medium text-primary'>{askby}</span>
      </div>
      <div className='flex items-center gap-1'>
        <Clock className='h-3 w-3' />
        <span>asked {meta}</span>
      </div>
    </div>
  </div>
);

export default QuestionBody;
