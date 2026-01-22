import React from 'react';
import './index.css';

/**
 * Component to display an item card with details.
 * @param letter The letter that this multiple choice option is represented by (usually a, b, c, or d)
 * @param description Description of the multiple choice option
 * @param handleSelect Function to handle when this multiple choice option is selected
 * @returns A React component rendering a multiple choice option
 */
const MultipleChoiceOption = ({
  letter,
  description,
  handleSelect,
  isAnswerSubmitted,
}: {
  letter: string;
  description: string;
  handleSelect: () => void;
  isAnswerSubmitted: boolean;
}) => (
  <div className='multiple-choice-option'>
    <p>
      {letter}: {description}
      {!isAnswerSubmitted && (
        <button className='btn-action' onClick={handleSelect}>
          Select
        </button>
      )}
    </p>
  </div>
);

export default MultipleChoiceOption;
