import express, { Response, Router } from 'express';
import getAvailableSkills from '../services/skill.service';
import { GetSkillsRequest, FakeSOSocket } from '../types/types';

const skillController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Retrieves a list of tags along with the number of questions associated with each tag.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param _ The HTTP request object (not used in this function).
   * @param res The HTTP response object used to send back the tag count mapping.
   *
   * @returns A Promise that resolves to void.
   */
  const getSkills = async (_: GetSkillsRequest, res: Response): Promise<void> => {
    try {
      const skills = await getAvailableSkills();

      if (!skills || 'error' in skills) {
        throw new Error('Error while fetching skills');
      }

      res.json(skills);
    } catch (err) {
      res.status(500).send(`Error when fetching skills: ${(err as Error).message}`);
    }
  };

  router.get('/getSkills', getSkills);
  return router;
};

export default skillController;
