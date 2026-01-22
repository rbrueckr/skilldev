import React from 'react';
import { LogOut, Gamepad2 } from 'lucide-react';
import './index.css';
import NimGamePage from '../nimGamePage';
import QuizGamePage from '../quizGamePage';
import useGamePage from '../../../../hooks/useGamePage';
import { GameInstance, NimGameState, QuizGameState } from '../../../../types/types';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';

/**
 * Component to display the game page for a specific game type, including controls and game state.
 * @returns A React component rendering:
 * - A header with the game title and current game status.
 * - A "Leave Game" button to exit the current game.
 * - The game component specific to the game type (e.g., `NimGamePage` for "Nim").
 * - An error message if an error occurs during the game.
 */
const GamePage = () => {
  const { gameInstance, error, handleLeaveGame } = useGamePage();

  /**
   * Renders the appropriate game component based on the game type.
   * @param gameType The type of the game to render (e.g., "Nim").
   * @returns A React component corresponding to the specified game type, or a
   * fallback message for unknown types.
   */
  const renderGameComponent = (gameType: string) => {
    if (!gameInstance) return null;

    switch (gameType) {
      case 'Nim':
        return <NimGamePage gameInstance={gameInstance as GameInstance<NimGameState>} />;
      case 'Quiz':
        return <QuizGamePage gameInstance={gameInstance as GameInstance<QuizGameState>} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  // Helper function to determine the badge variant based on game status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'default';
      case 'OVER':
        return 'destructive';
      case 'WAITING_TO_START':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='game-page'>
      <header className='game-header'>
        <div className='flex items-center gap-2'>
          <Gamepad2 className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold'>
            {gameInstance ? `${gameInstance.gameType} Game` : 'Game'}
          </h1>
        </div>

        {gameInstance && (
          <Badge variant={getStatusVariant(gameInstance.state.status)}>
            {gameInstance.state.status}
          </Badge>
        )}

        {!gameInstance && <Badge variant='secondary'>Not started</Badge>}
      </header>

      <div className='game-controls'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleLeaveGame}
          className='flex items-center gap-1'>
          <LogOut className='h-4 w-4' />
          Leave Game
        </Button>
      </div>

      {gameInstance && renderGameComponent(gameInstance.gameType)}

      {error && (
        <Alert variant='destructive' className='mt-4'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GamePage;
