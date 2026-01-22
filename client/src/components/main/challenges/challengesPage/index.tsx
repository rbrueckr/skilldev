// src/components/main/challenges/MultipleChoiceQuestionCard.tsx

import React, { useEffect, useState } from 'react';
import { MCQuestion } from '@fake-stack-overflow/shared';
import { getMCQuestion } from '../../../../services/gamesService';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../ui/card';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import Separator from '../../../ui/separator';
import Skeleton from '../../../ui/skeleton';

enum UserAnswer {
  NotAnswered = 'notAnswered',
  Correct = 'correct',
  Incorrect = 'incorrect',
}

interface MultipleChoiceQuestionCardProps {
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  handleQuestionSubmitted: (answerCorrect: boolean) => void;
}

const MultipleChoiceQuestionCard: React.FC<MultipleChoiceQuestionCardProps> = ({
  category,
  difficulty,
  handleQuestionSubmitted,
}) => {
  const [question, setQuestion] = useState<MCQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<UserAnswer>(UserAnswer.NotAnswered);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getMCQuestion(category);
        if (!response || !response.answers) {
          setError('No valid question data returned.');
          return;
        }
        setQuestion(response);
      } catch (err) {
        setError('Error fetching questions. Please try again later.');
      }
    };

    fetchQuestions();
  }, [category, difficulty]);

  const handleUserSubmit = (letter: string) => {
    if (!question || !question.correct_answers) return;
    const correctAnswerKey = `answer_${letter}_correct` as keyof typeof question.correct_answers;
    const isCorrect = question.correct_answers[correctAnswerKey] === 'true';

    if (isCorrect) {
      setUserAnswer(UserAnswer.Correct);
      handleQuestionSubmitted(true);
    } else {
      setUserAnswer(UserAnswer.Incorrect);
      handleQuestionSubmitted(false);
    }
  };

  if (error) {
    return (
      <Alert variant='destructive' className='my-4'>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Loading skeleton
  if (!question) {
    return (
      <Card className='my-4'>
        <CardContent>
          <Skeleton className='h-6 w-3/4 mb-2' />
          <Skeleton className='h-4 w-1/2 mb-4' />
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-10 w-full mb-2' />
        </CardContent>
      </Card>
    );
  }

  const { answers } = question;
  if (!answers) {
    return (
      <Alert variant='destructive' className='my-4'>
        <AlertDescription>Invalid question format (no answers found).</AlertDescription>
      </Alert>
    );
  }

  const allOptions = Object.entries(answers).filter(([key, val]) => val !== null);

  return (
    <Card className='my-4'>
      <CardHeader>
        <CardTitle>{question.question}</CardTitle>
        <CardDescription>
          Category: {question.category} | Difficulty: {question.difficulty}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-3'>
        {allOptions.map(([answerKey, description]) => {
          // 'answer_a' => 'a'
          const letter = answerKey.slice(-1);
          return (
            <Button
              key={answerKey}
              variant='outline'
              className='w-full justify-start'
              disabled={userAnswer !== UserAnswer.NotAnswered}
              onClick={() => handleUserSubmit(letter)}>
              {description}
            </Button>
          );
        })}
      </CardContent>
      {(userAnswer === UserAnswer.Correct || userAnswer === UserAnswer.Incorrect) && (
        <>
          <Separator />
          <CardFooter>
            {userAnswer === UserAnswer.Correct && (
              <p className='text-green-600 font-semibold'>Correct!</p>
            )}
            {userAnswer === UserAnswer.Incorrect && (
              <p className='text-red-600 font-semibold'>Incorrect!</p>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default MultipleChoiceQuestionCard;
