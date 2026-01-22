import React, { useState, useEffect } from 'react';
import { Clock, Trophy, CheckCircle, Users, Brain, Star, Play } from 'lucide-react';
import { GameInstance, QuizGameState } from '../../../../types/types';
import useUserContext from '../../../../hooks/useUserContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import Separator from '../../../ui/separator';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import ScrollArea from '../../../ui/scroll-area';

/**
 * Component to display the Quiz game page, including the current question, options, and scores.
 * @param gameInstance The current instance of the Quiz game.
 * @returns A React component that shows:
 * - The current question and answer options.
 * - The scores of all players.
 * - A message when the game is over showing the winner(s).
 */
const QuizGamePage = ({ gameInstance }: { gameInstance: GameInstance<QuizGameState> }) => {
  const { user, socket } = useUserContext();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [hasAnsweredLocal, setHasAnsweredLocal] = useState<boolean>(false);

  // Reset local answer state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setHasAnsweredLocal(false);
  }, [gameInstance.state.currentQuestion?.id]);

  const moveToNextQuestion = () => {
    if (!gameInstance.state.currentQuestion) return;

    socket.emit('makeMove', {
      gameID: gameInstance.gameID,
      move: {
        playerID: user.username,
        gameID: gameInstance.gameID,
        move: {
          timeExpired: true,
          questionId: gameInstance.state.currentQuestion.id,
        },
      },
    });
  };

  useEffect(() => {
    // Reset timer when a new question appears
    if (gameInstance.state.currentQuestion && gameInstance.state.status === 'IN_PROGRESS') {
      setTimeLeft(10);

      const timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            // Move to the next question if time runs out
            moveToNextQuestion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameInstance.state.currentQuestion?.id]);

  const handleStartGame = () => {
    socket.emit('makeMove', {
      gameID: gameInstance.gameID,
      move: {
        playerID: user.username,
        gameID: gameInstance.gameID,
        move: {
          type: 'START_GAME',
        },
      },
    });
  };

  const isCurrentPlayer = () => {
    if (!gameInstance.state.currentQuestion) return false;

    // Check if the player has already answered this question
    const hasAnswered = gameInstance.state.moves.some(
      move =>
        move.playerID === user.username &&
        move.questionId === gameInstance.state.currentQuestion?.id,
    );

    return !hasAnswered && !hasAnsweredLocal;
  };

  const handleSubmitAnswer = () => {
    if (!gameInstance.state.currentQuestion) return;
    if (!isCurrentPlayer()) return;

    // Set local state immediately to prevent double submissions
    setHasAnsweredLocal(true);

    socket.emit('makeMove', {
      gameID: gameInstance.gameID,
      move: {
        playerID: user.username,
        gameID: gameInstance.gameID,
        move: {
          playerID: user.username,
          answer: selectedAnswer,
          questionId: gameInstance.state.currentQuestion.id,
        },
      },
    });
  };

  const renderWaitingState = () => (
    <Card className='w-full max-w-3xl mx-auto shadow-sm'>
      <CardHeader className='py-2'>
        <div className='flex items-center justify-center gap-2'>
          <Users className='h-4 w-4 text-primary' />
          <CardTitle className='text-lg'>Waiting for Players</CardTitle>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='py-3'>
        <div className='space-y-3'>
          <p className='text-center text-sm'>
            Players in game: {Object.keys(gameInstance.state.scores).length}/4
          </p>

          <div className='bg-muted/50 rounded-md p-2'>
            <h3 className='font-medium mb-2 text-sm'>Current Players:</h3>
            <div className='space-y-1'>
              {Object.keys(gameInstance.state.scores).map(player => (
                <div
                  key={player}
                  className='flex items-center gap-2 bg-background p-1 rounded-md text-sm'>
                  <Avatar className='h-6 w-6'>
                    <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                      {player.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='font-medium'>{player}</span>
                  {player === gameInstance.state.player1 && (
                    <Badge variant='outline' className='ml-auto text-xs py-0'>
                      Host
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex justify-center py-2'>
        {user.username === gameInstance.state.player1 ? (
          <div className='w-full max-w-xs'>
            <Button
              size='sm'
              className='w-full'
              onClick={handleStartGame}
              disabled={Object.keys(gameInstance.state.scores).length < 2}>
              <Play className='mr-1 h-3 w-3' />
              Start Game
            </Button>

            {Object.keys(gameInstance.state.scores).length < 2 && (
              <p className='text-center text-muted-foreground mt-1 text-xs'>
                Need at least 2 players to start
              </p>
            )}
          </div>
        ) : (
          <Alert variant='default' className='bg-muted/80 py-1 text-xs'>
            <AlertDescription>Waiting for host to start the game...</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );

  const renderGameOver = () => (
    <Card className='w-full max-w-3xl mx-auto shadow-sm'>
      <CardHeader className='text-center bg-muted py-3'>
        <div className='flex justify-center mb-1'>
          <Trophy className='h-6 w-6 text-amber-500' />
        </div>
        <CardTitle className='text-lg'>Game Over!</CardTitle>
      </CardHeader>

      <CardContent className='py-3'>
        <div className='space-y-3'>
          {gameInstance.state.winners && (
            <div className='text-center'>
              <h3 className='text-base font-medium mb-2'>
                Winner{gameInstance.state.winners.length > 1 ? 's' : ''}:
              </h3>
              <div className='flex flex-wrap justify-center gap-1'>
                {gameInstance.state.winners.map(winner => (
                  <Badge key={winner} className='text-sm px-2 py-0.5 bg-primary'>
                    {winner}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className='text-base font-medium mb-2 flex items-center gap-1'>
              <Star className='h-4 w-4 text-amber-500' />
              Final Scores:
            </h3>
            <ScrollArea className='h-[150px]'>
              <div className='space-y-1'>
                {Object.entries(gameInstance.state.scores)
                  .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                  .map(([player, score], index) => (
                    <div
                      key={player}
                      className={`flex items-center justify-between p-1.5 rounded-md text-sm ${
                        gameInstance.state.winners?.includes(player)
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50'
                      }`}>
                      <div className='flex items-center gap-2'>
                        <div className='h-5 w-5 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-medium'>
                          {index + 1}
                        </div>
                        <span className='font-medium'>{player}</span>
                        {gameInstance.state.winners?.includes(player) && (
                          <Trophy className='h-3 w-3 text-amber-500' />
                        )}
                      </div>
                      <Badge variant='outline' className='text-xs px-1.5'>
                        {score} pts
                      </Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInProgress = () => (
    <div className='space-y-3'>
      {gameInstance.state.currentQuestion && (
        <Card className='shadow-sm'>
          <CardHeader className='pb-2 pt-3'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-1.5'>
                <Brain className='h-4 w-4 text-primary' />
                <CardTitle className='text-base'>Topic: {gameInstance.state.topic}</CardTitle>
              </div>
              <Badge
                variant={timeLeft <= 3 ? 'destructive' : 'default'}
                className='flex items-center gap-1 text-xs py-0.5'>
                <Clock className='h-3 w-3' />
                <span>{timeLeft}s</span>
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className='py-3'>
            <div className='space-y-3'>
              <Progress value={(timeLeft / 10) * 100} className='h-1.5' />

              <div className='bg-muted/50 p-2.5 rounded-md'>
                <h3 className='text-base font-medium mb-1.5'>Question:</h3>
                <p className='text-sm'>{gameInstance.state.currentQuestion.text}</p>
              </div>

              <div className='grid grid-cols-1 gap-2'>
                {gameInstance.state.currentQuestion.options.map(option => (
                  <Button
                    key={option}
                    variant={selectedAnswer === option ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedAnswer(option)}
                    disabled={!isCurrentPlayer()}
                    className='h-auto py-2 px-3 justify-start text-left whitespace-normal break-words text-sm'>
                    {selectedAnswer === option && (
                      <CheckCircle className='mr-1.5 h-3 w-3 flex-shrink-0' />
                    )}
                    <span>{option}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className='py-2'>
            <Button
              size='sm'
              className='w-full'
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || !isCurrentPlayer()}>
              Submit Answer
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className='shadow-sm'>
        <CardHeader className='py-2'>
          <CardTitle className='flex items-center gap-1.5 text-base'>
            <Star className='h-4 w-4 text-amber-500' />
            Current Scores
          </CardTitle>
        </CardHeader>
        <CardContent className='py-2'>
          <div className='space-y-1'>
            {Object.entries(gameInstance.state.scores)
              .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
              .map(([player, score], index) => (
                <div
                  key={player}
                  className='flex items-center justify-between p-1.5 rounded-md bg-muted/50 text-sm'>
                  <div className='flex items-center gap-1.5'>
                    <div className='h-5 w-5 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-medium'>
                      {index + 1}
                    </div>
                    <span
                      className={`font-medium ${player === user.username ? 'text-primary' : ''}`}>
                      {player}
                    </span>
                  </div>
                  <Badge variant='outline' className='text-xs px-1.5'>
                    {score} pts
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {!isCurrentPlayer() && gameInstance.state.currentQuestion && (
        <Alert className='bg-muted/70 py-1.5 text-xs shadow-sm'>
          <AlertDescription>
            {hasAnsweredLocal
              ? "You've submitted your answer. Waiting for other players..."
              : "You can't answer this question. Waiting for the next question..."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderContent = () => {
    switch (gameInstance.state.status) {
      case 'OVER':
        return renderGameOver();
      case 'WAITING_TO_START':
        return renderWaitingState();
      default:
        return renderInProgress();
    }
  };

  return <div className='container mx-auto py-3 px-2'>{renderContent()}</div>;
};

export default QuizGamePage;
