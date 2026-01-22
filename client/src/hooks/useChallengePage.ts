// src/components/main/challenges/useChallenges.tsx
import { useState, useEffect, useCallback } from 'react';
import { verifySkill } from '../services/userService';
import useUserContext from './useUserContext';

interface UseChallengesParams {
  category: string;
  difficulty: string;
  numQuestions?: number;
  numQuestionsToPass?: number;
}

function useChallenges({
  category,
  difficulty,
  numQuestions = 5,
  numQuestionsToPass = 3,
}: UseChallengesParams) {
  const { user } = useUserContext();
  const username = user?.username || '';
  const [numQuestionsCorrect, setNumQuestionsCorrect] = useState(0);
  const [numQuestionsAnswered, setNumQuestionsAnswered] = useState(0);
  const [challengeSuccessful, setChallengeSuccessful] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Called once all questions are answered
  const updateDatabaseWithCompletedChallenge = useCallback(
    (wasChallengePassed: boolean) => {
      if (wasChallengePassed) {
        try {
          verifySkill(username, category);
        } catch (error) {
          setErrorMessage('Error verifying skill');
        }
      }
    },
    [username, category],
  );

  // Called whenever a question is answered
  const questionAnswered = (wasAnswerCorrect: boolean) => {
    setNumQuestionsAnswered(prev => prev + 1);
    if (wasAnswerCorrect) {
      setNumQuestionsCorrect(prev => prev + 1);
    }
  };

  // Check if all questions are answered, then decide pass/fail
  useEffect(() => {
    if (numQuestionsAnswered === numQuestions) {
      const wasChallengePassed = numQuestionsCorrect >= numQuestionsToPass;
      setChallengeSuccessful(wasChallengePassed);
      setAllQuestionsAnswered(true);
      updateDatabaseWithCompletedChallenge(wasChallengePassed);
    }
  }, [
    numQuestionsAnswered,
    numQuestionsCorrect,
    numQuestions,
    numQuestionsToPass,
    updateDatabaseWithCompletedChallenge,
  ]);

  return {
    numQuestionsCorrect,
    numQuestionsAnswered,
    challengeSuccessful,
    allQuestionsAnswered,
    questionAnswered,
    numQuestions,
    numQuestionsToPass,
    category,
    difficulty,
    errorMessage,
  };
}

export default useChallenges;
