import LeaderboardModel from '../../models/leaderboard.model';
import { updateLeaderboard, getLeaderboardBySkill } from '../../services/leaderboard.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Leaderboard Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('updateLeaderboard', () => {
    const findOneSpy = jest.spyOn(LeaderboardModel, 'findOne');
    const createSpy = jest.spyOn(LeaderboardModel, 'create');

    it('should create a new entry when one does not exist', async () => {
      // Mock findOne to return null (no existing entry)
      mockingoose(LeaderboardModel).toReturn(null, 'findOne');

      // Mock create to return a new entry
      const newEntry = {
        username: 'testUser',
        skill: 'math',
        score: 100,
      };
      mockingoose(LeaderboardModel).toReturn(newEntry, 'create');

      await updateLeaderboard('testUser', 'math', 100);

      expect(findOneSpy).toHaveBeenCalledWith({ username: 'testUser', skill: 'math' });
      expect(createSpy).toHaveBeenCalledWith({ username: 'testUser', skill: 'math', score: 100 });
    });

    it('should update an existing entry by adding the new score', async () => {
      // Mock findOne to return an existing entry
      const existingEntry = {
        username: 'testUser',
        skill: 'math',
        score: 50,
        save: jest.fn().mockResolvedValue({ username: 'testUser', skill: 'math', score: 150 }),
      };
      mockingoose(LeaderboardModel).toReturn(existingEntry, 'findOne');

      const result = await updateLeaderboard('testUser', 'math', 100);

      expect(findOneSpy).toHaveBeenCalledWith({ username: 'testUser', skill: 'math' });
      expect(result.score).toBe(150);
    });
  });

  describe('getLeaderboardBySkill', () => {
    const findSpy = jest.spyOn(LeaderboardModel, 'find');

    it('should retrieve leaderboard entries with default limit', async () => {
      const mockEntries = [
        { username: 'user1', skill: 'math', score: 200 },
        { username: 'user2', skill: 'math', score: 150 },
        { username: 'user3', skill: 'math', score: 100 },
      ];
      mockingoose(LeaderboardModel).toReturn(mockEntries, 'find');

      const result = await getLeaderboardBySkill('math');

      expect(findSpy).toHaveBeenCalledWith({ skill: 'math' });
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should retrieve leaderboard entries with custom limit', async () => {
      const mockEntries = [
        { username: 'user1', skill: 'math', score: 200 },
        { username: 'user2', skill: 'math', score: 150 },
      ];
      mockingoose(LeaderboardModel).toReturn(mockEntries, 'find');

      const result = await getLeaderboardBySkill('math', 2);

      expect(findSpy).toHaveBeenCalledWith({ skill: 'math' });
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });
});
