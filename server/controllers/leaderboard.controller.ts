import express, { Request, Response } from 'express';
import { FakeSOSocket, DatabaseLeaderboardEntry } from '../types/types';
import { updateLeaderboard, getLeaderboardBySkill } from '../services/leaderboard.service';

const leaderboardController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided leaderboard update request contains the required fields.
   *
   * @param req The request object containing the leaderboard update data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: Request): boolean => {
    const { username, skill, score } = req.body;
    return !!username && !!skill && score !== undefined && typeof score === 'number';
  };

  /**
   * Handles updating a leaderboard entry for the specified user and skill.
   * If the entry exists, it adds the new score to the existing score; otherwise, it creates a new entry.
   * After updating, the controller emits the updated leaderboard for that skill.
   *
   * Expected request body:
   * {
   *   username: string,
   *   skill: string,
   *   score: number
   * }
   *
   * @param req The request object containing the leaderboard update data.
   * @param res The HTTP response object used to send back the result.
   *
   * @returns A Promise that resolves to void.
   */
  const updateLeaderboardRoute = async (req: Request, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { username, skill, score } = req.body;

    try {
      // Update the leaderboard by adding the score if entry exists, or creating a new one.
      const updatedEntry: DatabaseLeaderboardEntry = await updateLeaderboard(
        username,
        skill,
        score,
      );

      // Retrieve the updated leaderboard for the given skill.
      const leaderboard = await getLeaderboardBySkill(skill);

      // Emit a real-time update event with the updated leaderboard.
      socket.emit('leaderboardUpdate', { skill, leaderboard });

      res.json(updatedEntry);
    } catch (err: unknown) {
      res.status(500).send(`Error when updating leaderboard: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves the top leaderboard entries for a specified skill.
   *
   * The skill is provided as a route parameter.
   *
   * @param req The request object containing the skill parameter.
   * @param res The HTTP response object used to send back the leaderboard data.
   *
   * @returns A Promise that resolves to void.
   */
  const getLeaderboardRoute = async (req: Request, res: Response): Promise<void> => {
    const { skill } = req.params;
    try {
      const leaderboard = await getLeaderboardBySkill(skill);
      res.json(leaderboard);
    } catch (err: unknown) {
      res.status(500).send(`Error when retrieving leaderboard: ${(err as Error).message}`);
    }
  };

  router.post('/updateLeaderboard', updateLeaderboardRoute);
  router.get('/getLeaderboard/:skill', getLeaderboardRoute);

  return router;
};

export default leaderboardController;
