// src/hooks/useVerifySkills.ts

import { useState, useEffect } from 'react';
import { verifySkill, getUserByUsername } from '../services/userService';
import { SafeDatabaseUser, MCQuestion } from '../types/types';

/**
 * A custom hook to manage the logic for verifying a skill via multiple-choice questions.
 * @param username The username of the user whose skill is being verified.
 * @returns An object with states and handlers for verifying skills.
 */
export default function useVerifySkills(username?: string) {
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(5).fill(null));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * 1. Fetch the user's data (to display their skills, etc.)
   */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      try {
        const user = await getUserByUsername(username);
        setUserData(user);
      } catch (error) {
        setErrorMessage('Failed to load user data.');
      }
    };
    fetchUserData();
  }, [username]);

  /**
   * 2. Whenever the user selects a skill or changes difficulty, fetch 5 questions
   */
  useEffect(() => {
    const fetchFiveQuestions = async () => {
      if (!selectedSkill) {
        setQuestions([]);
        setUserAnswers(Array(5).fill(null));
        return;
      }

      try {
        // fetch 5 questions
        // Reset userAnswers
        setUserAnswers(Array(5).fill(null));
        setErrorMessage('');
        setSuccessMessage('');
      } catch (error) {
        setErrorMessage('Error fetching questions.');
        setQuestions([]);
        setUserAnswers(Array(5).fill(null));
      }
    };

    fetchFiveQuestions();
  }, [selectedSkill]);

  /**
   * 3. Handle when the user selects an option for a specific question
   */
  const handleOptionChange = (questionIndex: number, optionLetter: string) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[questionIndex] = optionLetter; // store the selected letter
      return updated;
    });
  };

  /**
   * 4. On Submit, check all answers at once
   */
  const handleSubmit = async () => {
    if (!username || !selectedSkill) {
      setErrorMessage('Please select a skill first.');
      return;
    }

    if (userAnswers.includes(null)) {
      setErrorMessage('Please answer all questions before submitting.');
      return;
    }

    let allCorrect = true;
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userLetter = userAnswers[i];
      const correctAnswerKey =
        `answer_${userLetter}_correct` as keyof typeof question.correct_answers;
      const isCorrect = question.correct_answers[correctAnswerKey] === 'true';

      if (!isCorrect) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      setErrorMessage('Some answers are incorrect. Please try again.');
      setSuccessMessage('');
      return;
    }

    // If it got here, user answered all questions correctly
    try {
      await verifySkill(username, selectedSkill);
      setSuccessMessage(`Skill "${selectedSkill}" verified successfully!`);
      setErrorMessage('');
      const updatedUser = await getUserByUsername(username);
      setUserData(updatedUser);
    } catch (error) {
      setErrorMessage('Failed to verify skill on the server.');
      setSuccessMessage('');
    }
  };

  return {
    userData,
    selectedSkill,
    setSelectedSkill,
    questions,
    userAnswers,
    errorMessage,
    successMessage,
    handleOptionChange,
    handleSubmit,
  };
}
