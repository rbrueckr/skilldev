import LeaderboardModel from '../models/leaderboard.model';
import { DatabaseLeaderboardEntry } from '../types/types';

/**
 * Updates (or creates) a leaderboard entry for a given username and skill.
 * @param username - The unique username.
 * @param skill - The skill for which the score applies.
 * @param score - The new score value.
 * @returns The updated or created leaderboard entry.
 */
export const updateLeaderboard = async (
  username: string,
  skill: string,
  score: number,
): Promise<DatabaseLeaderboardEntry> => {
  // Find the existing entry for the given username and skill.
  let entry = await LeaderboardModel.findOne({ username, skill });
  if (entry) {
    entry.score += score;
    await entry.save();
  } else {
    entry = await LeaderboardModel.create({ username, skill, score });
  }
  return entry;
};

/**
 * Retrieves the top leaderboard entries for a specific skill.
 * @param skill - The skill to query.
 * @param limit - The maximum number of entries to return (default is 10).
 * @returns An array of leaderboard entries sorted by score descending.
 */
export const getLeaderboardBySkill = async (
  skill: string,
  limit: number = 10,
): Promise<DatabaseLeaderboardEntry[]> =>
  LeaderboardModel.find({ skill }).sort({ score: -1 }).limit(limit);
