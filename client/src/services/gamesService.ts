import { GameInstance, GameState, GameStatus, GameType, MCQuestion } from '../types/types';
import api from './config';

const GAMES_API_URL = `${process.env.REACT_APP_SERVER_URL}/games`;

/**
 * Function to create a new game of the specified type.
 * @param gameType The type of game to create.
 * @param topic Optional topic for quiz games.
 * @returns A promise resolving to the created game instance.
 * @throws Error if there is an issue while creating the game.
 */
const createGame = async (gameType: GameType, topic?: string): Promise<GameInstance<GameState>> => {
  const res = await api.post(`${GAMES_API_URL}/create`, {
    gameType,
    topic,
  });

  if (res.status !== 200) {
    throw new Error('Error while creating a new game');
  }

  return res.data;
};

/**
 * Function to fetch a list of games based on optional filters for game type and status.
 * @param gameType (Optional) The type of games to filter by.
 * @param status (Optional) The status of games to filter by.
 * @returns A promise resolving to a list of game instances.
 * @throws Error if there is an issue while fetching the games.
 */
const getGames = async (
  gameType: GameType | undefined,
  status: GameStatus | undefined,
): Promise<GameInstance<GameState>[]> => {
  const params = new URLSearchParams();

  if (gameType) {
    params.append('gameType', gameType);
  }

  if (status) {
    params.append('status', status);
  }

  const res = await api.get(`${GAMES_API_URL}/games`, {
    params,
  });

  if (res.status !== 200) {
    throw new Error('Error while getting games');
  }

  return res.data;
};

/**
 * Function to join an existing game.
 * @param gameID The ID of the game to join.
 * @param playerID The ID of the player joining the game.
 * @returns A promise resolving to the updated game instance.
 * @throws Error if there is an issue while joining the game.
 */
const joinGame = async (gameID: string, playerID: string): Promise<GameInstance<GameState>> => {
  const res = await api.post(`${GAMES_API_URL}/join`, {
    gameID,
    playerID,
  });

  if (res.status !== 200) {
    throw new Error('Error while joining a game');
  }

  return res.data;
};

/**
 * Function to leave a game.
 * @param gameID The ID of the game to leave.
 * @param playerID The ID of the player leaving the game.
 * @returns A promise resolving to the updated game instance.
 * @throws Error if there is an issue while leaving the game.
 */
const leaveGame = async (gameID: string, playerID: string): Promise<GameInstance<GameState>> => {
  const res = await api.post(`${GAMES_API_URL}/leave`, {
    gameID,
    playerID,
  });

  if (res.status !== 200) {
    throw new Error('Error while leaving a game');
  }

  return res.data;
};

/**
 * Fetches a multiple choice question based on the provided category and optional difficulty.
 * @param category The category of the question to fetch
 * @param difficulty Optional difficulty level for the question ('easy', 'medium', or 'hard').
 * @returns A promise that resolves to the multiple choice question retrieved from the API.
 * @throws Error if there is an issue with the API request or if the response is not successful.
 */
const getMCQuestion = async (
  category: string,
  difficulty?: 'easy' | 'medium' | 'hard',
): Promise<MCQuestion> => {
  const res = await api.post(`${GAMES_API_URL}/getMCQuestion`, {
    category,
    difficulty,
  });

  if (res.status !== 200) {
    throw new Error('Error while retrieving MC question');
  }

  return res.data;
};

export { createGame, getGames, joinGame, leaveGame, getMCQuestion };
