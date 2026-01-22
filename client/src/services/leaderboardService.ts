import api from './config';
import { DatabaseLeaderboardEntry } from '../types/types';

const LEADERBOARD_API_URL = `${process.env.REACT_APP_SERVER_URL}/leaderboard`;

interface UpdateLeaderboardRequestBody {
  username: string;
  skill: string;
  score: number;
}

/**
 * Updates (or creates) a leaderboard entry by adding the new score for a given user and skill.
 *
 * @param username - The unique username.
 * @param skill - The skill for which the score applies.
 * @param score - The score to be added.
 * @throws an error if the request fails or the response status is not 200.
 * @returns The updated or newly created leaderboard entry.
 */
const updateLeaderboard = async (
  username: string,
  skill: string,
  score: number,
): Promise<DatabaseLeaderboardEntry> => {
  const reqBody: UpdateLeaderboardRequestBody = { username, skill, score };
  const res = await api.post(`${LEADERBOARD_API_URL}/updateLeaderboard`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while updating the leaderboard');
  }
  return res.data;
};

/**
 * Retrieves the top leaderboard entries for a specified skill.
 *
 * @param skill - The skill to filter the leaderboard by.
 * @throws an error if the request fails or the response status is not 200.
 * @returns An array of leaderboard entries sorted by score descending.
 */
const getLeaderboardBySkill = async (skill: string): Promise<DatabaseLeaderboardEntry[]> => {
  const res = await api.get(`${LEADERBOARD_API_URL}/getLeaderboard/${skill}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching the leaderboard');
  }
  return res.data;
};

export { updateLeaderboard, getLeaderboardBySkill };
