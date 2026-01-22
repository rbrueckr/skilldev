import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Leaderboard collection.
 *
 * This schema defines the structure of a leaderboard document in the database.
 * Each leaderboard entry includes the following fields:
 * - `username`: A unique identifier for the user.
 * - `skill`: The name of the skill for which the score is recorded.
 * - `score`: The user's score for the specified skill.
 */
const leaderboardSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    collection: 'Leaderboard',
    timestamps: true,
  },
);

// Create a compound index for efficient querying by skill and sorting by score in descending order
leaderboardSchema.index({ skill: 1, score: -1 });

export default leaderboardSchema;
