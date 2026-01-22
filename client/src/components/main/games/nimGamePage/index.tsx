import React, { useState } from 'react';
import { Users, Minus, Plus, Send, Trophy, Info, Gem, HandMetal } from 'lucide-react';
import './index.css';
import { GameInstance, NimGameState } from '../../../../types/types';
import useNimGamePage from '../../../../hooks/useNimGamePage';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { Avatar, AvatarFallback } from '../../../ui/avatar';

/**
 * Component to display the "Nim" game page, including the rules, game details, and functionality to make a move.
 * @param gameInstance The current instance of the Nim game, including player details, game status, and remaining objects.
 * @returns A React component that shows:
 * - The rules of the Nim game.
 * - The current game details, such as players, current turn, remaining objects, and winner (if the game is over).
 * - An input field for making a move (if the game is in progress) and a submit button to finalize the move.
 */
const NimGamePage = ({ gameInstance }: { gameInstance: GameInstance<NimGameState> }) => {
  const { user, move, handleMakeMove, handleInputChange } = useNimGamePage(gameInstance);
  const [localMove, setLocalMove] = useState(move);

  const handleIncrement = () => {
    const newValue = Math.min(3, Number(localMove) + 1);
    setLocalMove(newValue);
    handleInputChange({
      target: { value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleDecrement = () => {
    const newValue = Math.max(1, Number(localMove) - 1);
    setLocalMove(newValue);
    handleInputChange({
      target: { value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const isMyTurn = gameInstance.players[gameInstance.state.moves.length % 2] === user.username;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const TOTAL_OBJECTS = 21; // Define the total objects constant for clarity
  const progressValue = (gameInstance.state.remainingObjects / TOTAL_OBJECTS) * 100;
  const isGameOver = gameInstance.state.status === 'OVER';
  const isGameWaiting = gameInstance.state.status === 'WAITING_TO_START';
  const isGameInProgress = gameInstance.state.status === 'IN_PROGRESS';
  const player1 = gameInstance.state.player1 || 'Waiting...';
  const player2 = gameInstance.state.player2 || 'Waiting...';
  const currentPlayer = gameInstance.players[gameInstance.state.moves.length % 2];
  const winner = gameInstance.state.winners?.join(', ') || 'No winner';

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl'>
      <Tabs defaultValue='game' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='game'>
            <Gem className='mr-2 h-4 w-4' />
            Game
          </TabsTrigger>
          <TabsTrigger value='rules'>
            <Info className='mr-2 h-4 w-4' />
            Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value='game' className='mt-4'>
          <Card className='border-2'>
            <CardContent className='py-6'>
              <div className='space-y-6'>
                {/* Players Section */}
                <div className='flex flex-col sm:flex-row justify-between gap-4'>
                  <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-md'>
                    <Avatar
                      className={
                        player1 === currentPlayer && isGameInProgress ? 'ring-2 ring-primary' : ''
                      }>
                      <AvatarFallback className='bg-primary/20'>
                        {player1.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium flex items-center gap-1'>
                        Player 1: {player1}
                        {winner === player1 && <Trophy className='h-4 w-4 text-amber-500' />}
                      </div>
                      {player1 === currentPlayer && isGameInProgress && (
                        <Badge variant='outline' className='mt-1'>
                          Current Turn
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-md'>
                    <Avatar
                      className={
                        player2 === currentPlayer && isGameInProgress ? 'ring-2 ring-primary' : ''
                      }>
                      <AvatarFallback className='bg-secondary/20'>
                        {player2.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium flex items-center gap-1'>
                        Player 2: {player2}
                        {winner === player2 && <Trophy className='h-4 w-4 text-amber-500' />}
                      </div>
                      {player2 === currentPlayer && isGameInProgress && (
                        <Badge variant='outline' className='mt-1'>
                          Current Turn
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Game Progress */}
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm font-medium'>Remaining Objects</div>
                    <div className='flex items-center gap-2'>
                      <HandMetal className='h-4 w-4 text-primary' />
                      <span className='font-bold text-lg'>
                        {gameInstance.state.remainingObjects}
                      </span>
                    </div>
                  </div>
                  <Progress value={progressValue} className='h-3' />
                </div>

                {/* Game Status */}
                {isGameOver && (
                  <Alert variant='default' className='bg-green-50 border-green-200'>
                    <Trophy className='h-5 w-5 text-green-600' />
                    <AlertTitle>Game Over!</AlertTitle>
                    <AlertDescription>
                      <span className='font-bold'>{winner}</span> has won the game!
                    </AlertDescription>
                  </Alert>
                )}

                {isGameWaiting && (
                  <Alert variant='default' className='bg-blue-50 border-blue-200'>
                    <Users className='h-5 w-5 text-blue-600' />
                    <AlertTitle>Waiting for Players</AlertTitle>
                    <AlertDescription>
                      The game is waiting for players to join before it can start.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>

            {isGameInProgress && (
              <CardFooter className='flex flex-col border-t pt-6'>
                <div className='w-full space-y-4'>
                  <h3 className='text-lg font-medium'>Make Your Move</h3>

                  <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                    <div className='flex items-center space-x-2'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={handleDecrement}
                              disabled={Number(localMove) <= 1 || !isMyTurn}>
                              <Minus className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Decrease</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Input
                        type='number'
                        className='w-20 text-center'
                        value={localMove}
                        onChange={e => {
                          setLocalMove(Number(e.target.value));
                          handleInputChange(e);
                        }}
                        onKeyDown={e => e.preventDefault()}
                        readOnly
                        min={1}
                        max={3}
                        disabled={!isMyTurn}
                      />

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={handleIncrement}
                              disabled={Number(localMove) >= 3 || !isMyTurn}>
                              <Plus className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Increase</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Button
                      variant='default'
                      onClick={handleMakeMove}
                      disabled={!isMyTurn}
                      className='sm:ml-auto'>
                      <Send className='mr-2 h-4 w-4' />
                      Submit Move
                    </Button>
                  </div>

                  {!isMyTurn && isGameInProgress && (
                    <Alert variant='default' className='bg-muted'>
                      <Info className='h-4 w-4' />
                      <AlertDescription>
                        It&apos;s {currentPlayer}&apos;s turn to make a move
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value='rules' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Rules of Nim</CardTitle>
              <CardDescription>The classic game of mathematical strategy</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>The game of Nim is played as follows:</p>
              <ol className='list-decimal pl-5 space-y-2'>
                <li>The game starts with a pile of 15 objects.</li>
                <li>Players take turns removing objects from the pile.</li>
                <li>On their turn, a player must remove 1, 2, or 3 objects from the pile.</li>
                <li className='font-semibold'>
                  The player who removes the last object loses the game.
                </li>
              </ol>
              <Alert className='mt-4'>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  Think strategically and try to force your opponent into a losing position!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NimGamePage;
