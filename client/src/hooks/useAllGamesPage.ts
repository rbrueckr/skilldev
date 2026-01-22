import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, getGames } from '../services/gamesService';
import { GameInstance, GameState, GameType, Skill } from '../types/types';
import getAvailableSkills from '../services/skillService';

/**
 * Custom hook to manage the state and logic for the "All Games" page, including fetching games,
 * creating a new game, and navigating to game details.
 * @returns An object containing the following:
 * - `availableGames`: The list of available game instances.
 * - `handleJoin`: A function to navigate to the game details page for a selected game.
 * - `fetchGames`: A function to fetch the list of available games.
 * - `isModalOpen`: A boolean indicating whether the game creation modal is open.
 * - `handleToggleModal`: A function to toggle the visibility of the game creation modal.
 * - `handleSelectGameType`: A function to select a game type, create a new game, and close the modal.
 */
const useAllGamesPage = () => {
  const navigate = useNavigate();
  const [availableGames, setAvailableGames] = useState<GameInstance<GameState>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  const fetchGames = async () => {
    try {
      const games = await getGames(undefined, undefined);
      setAvailableGames(games);
    } catch (getGamesError) {
      setError('Error fetching games');
    }
  };

  const fetchTopics = async () => {
    try {
      const skills = await getAvailableSkills();
      const skillList: string[] = skills.map((skill: Skill) => skill.skillName);
      setTopics(skillList);
    } catch (getTopicsError) {
      setError('Error fetching topics');
    }
  };

  const handleCreateGame = async (gameType: GameType, topic?: string) => {
    try {
      await createGame(gameType, topic);
      await fetchGames(); // Refresh the list after creating a game
    } catch (createGameError) {
      setError('Error creating game');
    }
  };

  const handleJoin = (gameID: string) => {
    navigate(`/games/${gameID}`);
  };

  useEffect(() => {
    fetchGames();
    fetchTopics();
  }, []);

  const handleToggleModal = () => {
    setIsModalOpen(prevState => !prevState);
  };

  const handleSelectGameType = (gameType: GameType, topic?: string) => {
    handleCreateGame(gameType, topic);
    handleToggleModal();
  };

  return {
    availableGames,
    handleJoin,
    fetchGames,
    isModalOpen,
    handleToggleModal,
    setIsModalOpen,
    handleSelectGameType,
    error,
    topics,
  };
};

export default useAllGamesPage;
