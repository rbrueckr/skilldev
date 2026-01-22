import React from 'react';
import './index.css';
import { OrderType } from '../../../../types/types';
import { orderTypeDisplayName } from '../../../../types/constants';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * qcnt - The number of questions to be displayed in the header.
 * setQuestionOrder - A function that sets the order of questions based on the selected message.
 */
interface QuestionHeaderProps {
  titleText: string;
  qcnt: number;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * QuestionHeader component displays the header section for a list of questions.
 * It includes the title, a button to ask a new question, the number of the quesions,
 * and a dropdown to set the order of questions.
 *
 * @param titleText - The title text to display in the header.
 * @param qcnt - The number of questions displayed in the header.
 * @param setQuestionOrder - Function to set the order of questions based on selected option.
 */
const QuestionHeader = ({ titleText, qcnt, setQuestionOrder }: QuestionHeaderProps) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setQuestionOrder(event.target.value as OrderType);
  };

  return (
    <div className='question-header'>
      <div className='question-title-row'>
        <div className='bold_title'>{titleText}</div>
        <AskQuestionButton />
      </div>
      <div className='space_between'>
        <div id='question_count'>{qcnt} questions</div>
        <div className='sort-container'>
          <span className='sort-text'>Sort by:</span>
          <select className='sort-dropdown' onChange={handleSortChange} defaultValue='newest'>
            {Object.entries(orderTypeDisplayName).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuestionHeader;
