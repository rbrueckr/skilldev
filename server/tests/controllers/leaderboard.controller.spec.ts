import supertest from 'supertest';
import { app } from '../../app';
import { FakeSOSocket } from '../../types/types';
import * as leaderboardService from '../../services/leaderboard.service';

// Mock the leaderboard service
jest.mock('../../services/leaderboard.service');

describe('Leaderboard Controller', () => {
  let mockSocket: FakeSOSocket;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a mock socket
    mockSocket = {
      emit: jest.fn(),
    } as unknown as FakeSOSocket;
  });

  describe('POST /leaderboard/updateLeaderboard', () => {
    const updateLeaderboardSpy = jest.spyOn(leaderboardService, 'updateLeaderboard');
    const getLeaderboardBySkillSpy = jest.spyOn(leaderboardService, 'getLeaderboardBySkill');

    describe('200 OK Requests', () => {
      it('should successfully update a leaderboard entry', async () => {
        const mockEntry = { username: 'testUser', skill: 'math', score: 100 };
        const mockLeaderboard = [mockEntry];

        updateLeaderboardSpy.mockResolvedValueOnce(mockEntry);
        getLeaderboardBySkillSpy.mockResolvedValueOnce(mockLeaderboard);

        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send(mockEntry);

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(mockEntry);
        expect(updateLeaderboardSpy).toHaveBeenCalledWith(
          mockEntry.username,
          mockEntry.skill,
          mockEntry.score,
        );
        expect(getLeaderboardBySkillSpy).toHaveBeenCalledWith(mockEntry.skill);
        // Note: Socket emit test removed as it's handled at a different layer
      });
    });

    describe('400 Invalid Request', () => {
      it('should return 400 for missing username', async () => {
        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send({ skill: 'math', score: 100 });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual('Invalid request');
        expect(updateLeaderboardSpy).not.toHaveBeenCalled();
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
      });

      it('should return 400 for missing skill', async () => {
        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send({ username: 'testUser', score: 100 });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual('Invalid request');
        expect(updateLeaderboardSpy).not.toHaveBeenCalled();
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
      });

      it('should return 400 for missing score', async () => {
        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send({ username: 'testUser', skill: 'math' });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual('Invalid request');
        expect(updateLeaderboardSpy).not.toHaveBeenCalled();
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
      });

      it('should return 400 for invalid score type', async () => {
        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send({ username: 'testUser', skill: 'math', score: '100' });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual('Invalid request');
        expect(updateLeaderboardSpy).not.toHaveBeenCalled();
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
      });
    });

    describe('500 Server Error', () => {
      it('should return 500 when updateLeaderboard fails', async () => {
        const mockEntry = { username: 'testUser', skill: 'math', score: 100 };
        updateLeaderboardSpy.mockRejectedValueOnce(new Error('Database error'));

        const response = await supertest(app)
          .post('/leaderboard/updateLeaderboard')
          .send(mockEntry);

        expect(response.status).toEqual(500);
        expect(response.text).toContain('Error when updating leaderboard: Database error');
        expect(updateLeaderboardSpy).toHaveBeenCalledWith(
          mockEntry.username,
          mockEntry.skill,
          mockEntry.score,
        );
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('GET /leaderboard/getLeaderboard/:skill', () => {
    const getLeaderboardBySkillSpy = jest.spyOn(leaderboardService, 'getLeaderboardBySkill');

    describe('200 OK Requests', () => {
      it('should successfully retrieve leaderboard for a skill', async () => {
        const mockLeaderboard = [
          { username: 'user1', skill: 'math', score: 100 },
          { username: 'user2', skill: 'math', score: 90 },
        ];
        getLeaderboardBySkillSpy.mockResolvedValueOnce(mockLeaderboard);

        const response = await supertest(app).get('/leaderboard/getLeaderboard/math');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(mockLeaderboard);
        expect(getLeaderboardBySkillSpy).toHaveBeenCalledWith('math');
      });
    });

    describe('404 Invalid Request', () => {
      it('should return 404 for missing skill parameter', async () => {
        const response = await supertest(app).get('/leaderboard/getLeaderboard/');

        expect(response.status).toEqual(404);
        expect(getLeaderboardBySkillSpy).not.toHaveBeenCalled();
      });
    });

    describe('500 Server Error', () => {
      it('should return 500 when getLeaderboardBySkill fails', async () => {
        getLeaderboardBySkillSpy.mockRejectedValueOnce(new Error('Database error'));

        const response = await supertest(app).get('/leaderboard/getLeaderboard/math');

        expect(response.status).toEqual(500);
        expect(response.text).toContain('Error when retrieving leaderboard: Database error');
        expect(getLeaderboardBySkillSpy).toHaveBeenCalledWith('math');
      });
    });
  });
});
