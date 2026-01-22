import { Skill } from '../types/types';
import SkillModel from '../models/skill.model';

/**
 * Checks if given question contains any tags from the given list.
 *
 * @param {Question} q - The question to check
 * @param {string[]} taglist - The list of tags to check for
 *
 * @returns {boolean} - `true` if any tag is present in the question, `false` otherwise
 */
const getAvailableSkills = async (): Promise<Skill[]> => {
  try {
    const skills = await SkillModel.find().lean().exec();
    return skills as Skill[];
  } catch (error) {
    return [];
  }
};

export default getAvailableSkills;
