// types/types.ts
import { SafeDatabaseUser } from './user';

/**
 * Type definition for a Leaderboard document in the database.
 * Each document includes the following fields:
 * - `username`: A unique identifier for the user.
 * - `skill`: The name of the skill for which the score is recorded.
 * - `score`: The user's score for the specified skill.
 * - `createdAt`: The timestamp when the document was created.
 * - `updatedAt`: The timestamp when the document was last updated.
 */
export interface DatabaseLeaderboardEntry {
  username: string;
  skill: string;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaderboardEntryWithUser {
  entry: DatabaseLeaderboardEntry;
  user: SafeDatabaseUser;
}
