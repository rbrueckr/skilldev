import SkillModel from '../../models/skill.model';
import getAvailableSkills from '../../services/skill.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Skill Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('getAvailableSkills', () => {
    it('should return a list of skills when SkillModel.find resolves successfully', async () => {
      const mockSkills = [
        { _id: '1', skillName: 'JavaScript' },
        { _id: '2', skillName: 'Python' },
      ];

      // Mock SkillModel.find to return the mockSkills
      mockingoose(SkillModel).toReturn(mockSkills, 'find');

      const skills = await getAvailableSkills();

      // Verify that each skill contains the expected skillName.
      expect(skills).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ skillName: 'JavaScript' }),
          expect.objectContaining({ skillName: 'Python' }),
        ]),
      );
    });

    it('should return an empty array when SkillModel.find throws an error', async () => {
      // Simulate a failure by returning an error from the query.
      mockingoose(SkillModel).toReturn(new Error('Database error'), 'find');

      const skills = await getAvailableSkills();

      expect(skills).toEqual([]);
    });
  });
});
