import express from 'express';
import supertest from 'supertest';
import skillController from '../../controllers/skill.controller';
import getAvailableSkills from '../../services/skill.service';
import { FakeSOSocket } from '../../types/types';

// Automatically mock the getAvailableSkills service.
jest.mock('../../services/skill.service');

describe('Skill Controller', () => {
  let app: express.Application;
  let socket: FakeSOSocket;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Create a fake socket with an emit function.
    socket = { emit: jest.fn() } as unknown as FakeSOSocket;
    // Mount the skill controller at /skills.
    app.use('/skills', skillController(socket));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /skills/getSkills', () => {
    it('should return 200 and a list of skills when getAvailableSkills resolves successfully', async () => {
      const mockSkills = { skill1: 10, skill2: 5 };
      (getAvailableSkills as jest.Mock).mockResolvedValueOnce(mockSkills);

      const response = await supertest(app).get('/skills/getSkills');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSkills);
    });

    it('should return 500 when getAvailableSkills returns an error object', async () => {
      // Simulate an error response from the service.
      (getAvailableSkills as jest.Mock).mockResolvedValueOnce({ error: 'some error' });

      const response = await supertest(app).get('/skills/getSkills');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching skills: Error while fetching skills');
    });

    it('should return 500 when getAvailableSkills throws an error', async () => {
      (getAvailableSkills as jest.Mock).mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app).get('/skills/getSkills');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching skills: test error');
    });
  });
});
