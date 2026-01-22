// models/leaderboard.model.ts

import mongoose, { Model } from 'mongoose';
import leaderboardSchema from './schema/leaderboard.schema';
import { DatabaseLeaderboardEntry } from '../types/types';

/**
 * Mongoose model for the Leaderboard collection.
 */
const LeaderboardModel: Model<DatabaseLeaderboardEntry> = mongoose.model<DatabaseLeaderboardEntry>(
  'Leaderboard',
  leaderboardSchema,
);

export default LeaderboardModel;
