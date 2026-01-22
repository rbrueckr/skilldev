import React from 'react';
import { Users, User } from 'lucide-react';
import { GameInstance, GameState, QuizGameState } from '../../../../../types/types';
import { Card, CardContent, CardFooter } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';

/**
 * Component to display a game card with details about a specific game instance.
 * @param game The game instance to display.
 * @param handleJoin Function to handle joining the game. Takes the game ID as an argument.
 * @returns A React component rendering the game details and a join button if the game is waiting to start.
 */
const GameCard = ({
  game,
  handleJoin,
}: {
  game: GameInstance<GameState>;
  handleJoin: (gameID: string) => void;
}) => {
  const isGameFull = game.players.length >= 4;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_TO_START':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'IN_PROGRESS':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-4'>
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='capitalize font-medium'>
                {game.gameType}
              </Badge>
              {game.gameType === 'Quiz' && (
                <Badge variant='secondary' className='font-medium'>
                  {(game.state as QuizGameState).topic}
                </Badge>
              )}
              <Badge className={`${getStatusColor(game.state.status)}`}>
                {game.state.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className='text-xs text-muted-foreground'>ID: {game.gameID}</div>
          </div>

          <div className='flex items-center mt-2'>
            <Users className='h-4 w-4 mr-1 text-muted-foreground' />
            <span className='text-sm font-medium'>Players ({game.players.length}/4):</span>
          </div>

          <div className='flex flex-wrap gap-1'>
            {game.players.map((player: string) => (
              <div
                key={`${game.gameID}-${player}`}
                className='flex items-center bg-muted px-2 py-1 rounded-md text-xs'>
                <User className='h-3 w-3 mr-1' />
                {player}
              </div>
            ))}
            {game.players.length === 0 && (
              <span className='text-xs text-muted-foreground italic'>No players yet</span>
            )}
          </div>
        </div>
      </CardContent>

      {game.state.status === 'WAITING_TO_START' && (
        <CardFooter className='p-4 pt-0 flex justify-end'>
          <Button
            onClick={() => handleJoin(game.gameID)}
            disabled={isGameFull}
            variant={isGameFull ? 'secondary' : 'default'}
            className={isGameFull ? 'cursor-not-allowed' : ''}>
            {isGameFull ? 'Game Full' : 'Join Game'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default GameCard;
