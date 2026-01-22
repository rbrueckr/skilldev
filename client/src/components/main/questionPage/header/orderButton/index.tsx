import React, { useState, useEffect } from 'react';
import './index.css';
import { OrderType } from '../../../../../types/types';
import { orderTypeDisplayName } from '../../../../../types/constants';

/**
 * Interface representing the props for the OrderButton component.
 *
 * name - The text to be displayed on the button.
 * setQuestionOrder - A function that sets the order of questions based on the message.
 */
interface OrderButtonProps {
  orderType: OrderType;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * OrderButton component renders a button that, when clicked, triggers the setQuestionOrder function
 * with the provided message.
 * It will update the order of questions based on the input message.
 *
 * @param orderType - The label for the button and the value passed to setQuestionOrder function.
 * @param setQuestionOrder - Callback function to set the order of questions based on the input message.
 */
const OrderButton = ({ orderType, setQuestionOrder }: OrderButtonProps) => {
  const [isSelected, setIsSelected] = useState(orderType === 'newest');

  useEffect(() => {
    // Default to 'newest' being selected
    setIsSelected(orderType === 'newest');
  }, [orderType]);

  return (
    <button
      className={`order_button ${isSelected ? 'order_selected' : ''}`}
      onClick={() => {
        setQuestionOrder(orderType);
        setIsSelected(true);
      }}>
      {orderTypeDisplayName[orderType]}
    </button>
  );
};

export default OrderButton;
