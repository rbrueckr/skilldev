import React, { useState } from 'react';
import { RefreshCcw, Plus } from 'lucide-react';
import useAllGamesPage from '../../../../hooks/useAllGamesPage';
import GameCard from './gameCard';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';

const GameTypeSelector = ({
  onSelectGameType,
  onCancel,
}: {
  onSelectGameType: (gameType: 'Nim' | 'Quiz') => void;
  onCancel: () => void;
}) => (
  <div className='flex flex-col space-y-4'>
    <h2 className='text-xl font-bold'>Select Game Type</h2>
    <div className='grid grid-cols-2 gap-4'>
      <Button variant='outline' size='lg' onClick={() => onSelectGameType('Nim')}>
        Nim Game
      </Button>
      <Button variant='outline' size='lg' onClick={() => onSelectGameType('Quiz')}>
        Quiz Game
      </Button>
    </div>
    <Button variant='ghost' onClick={onCancel}>
      Cancel
    </Button>
  </div>
);

const QuizTopicSelector = ({
  topics,
  onSelectTopic,
  onBack,
  onCancel,
}: {
  topics: string[];
  onSelectTopic: (topic: string) => void;
  onBack: () => void;
  onCancel: () => void;
}) => (
  <div className='flex flex-col space-y-4'>
    <h3 className='text-xl font-bold'>Select Quiz Topic</h3>
    <div className='grid grid-cols-2 gap-2'>
      {topics.map(topic => (
        <Button key={topic} onClick={() => onSelectTopic(topic)} variant='outline'>
          {topic}
        </Button>
      ))}
    </div>
    <div className='flex justify-between pt-2'>
      <Button variant='secondary' onClick={onBack}>
        Back
      </Button>
      <Button variant='ghost' onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
);

/**
 * Component to display the "All Games" page, which provides functionality to view, create, and join games.
 * @returns A React component that includes:
 * - A "Create Game" button to open a modal for selecting a game type.
 * - A list of available games, each rendered using the `GameCard` component.
 * - A refresh button to reload the list of available games from the server.
 */
const AllGamesPage = () => {
  const {
    availableGames,
    handleJoin,
    fetchGames,
    isModalOpen,
    handleToggleModal,
    setIsModalOpen,
    handleSelectGameType,
    error,
    topics,
  } = useAllGamesPage();

  const [selectedGameType, setSelectedGameType] = useState<'Nim' | 'Quiz' | null>(null);

  const handleGameTypeSelect = (gameType: 'Nim' | 'Quiz') => {
    setSelectedGameType(gameType);
    if (gameType === 'Nim') {
      handleSelectGameType('Nim');
      setSelectedGameType(null);
    }
  };

  const handleTopicSelect = (topic: string) => {
    handleSelectGameType('Quiz', topic);
    setSelectedGameType(null);
    setIsModalOpen(false);
  };

  const handleBack = () => {
    setSelectedGameType(null);
  };

  const renderModalContent = () => {
    if (!selectedGameType) {
      return (
        <GameTypeSelector onSelectGameType={handleGameTypeSelect} onCancel={handleToggleModal} />
      );
    }

    if (selectedGameType === 'Quiz') {
      return (
        <QuizTopicSelector
          topics={topics}
          onSelectTopic={handleTopicSelect}
          onBack={handleBack}
          onCancel={handleToggleModal}
        />
      );
    }

    return null;
  };

  return (
    <div className='container mx-auto py-6 px-4 max-w-5xl'>
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Games</CardTitle>
              <CardDescription>
                Create or join interactive games to test your knowledge and earn points
              </CardDescription>
            </div>
            <Button onClick={handleToggleModal} className='shrink-0'>
              <Plus className='mr-2 h-4 w-4' /> Create Game
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='bg-destructive/15 text-destructive p-3 rounded-md mb-4'>{error}</div>
          )}

          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-medium'>Available Games</h2>
            <Button variant='outline' size='sm' onClick={fetchGames}>
              <RefreshCcw className='mr-2 h-4 w-4' /> Refresh
            </Button>
          </div>

          <div className='grid gap-4'>
            {availableGames.length === 0 ? (
              <p className='text-center text-muted-foreground py-6'>
                No games available. Create one to get started!
              </p>
            ) : (
              availableGames.map(game => (
                <GameCard key={game.gameID} game={game} handleJoin={handleJoin} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='bg-card rounded-lg shadow-lg p-6 max-w-md w-full'>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllGamesPage;
