import { Skill } from '../types/types';
import api from './config';

const SKILL_API_URL = `${process.env.REACT_APP_SERVER_URL}/skills`;

/**
 * Gets the availalbe skills to verify.
 *
 * @throws Error if there is an issue fetching tags with the skills.
 */
const getAvailableSkills = async (): Promise<Skill[]> => {
  const res = await api.get(`${SKILL_API_URL}/getSkills`);
  if (res.status !== 200) {
    throw new Error('Error when fetching tags with question number');
  }
  return res.data;
};

export default getAvailableSkills;
