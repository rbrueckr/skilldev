import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a skill that a user can add to their profile.
 * - `skillName`: The name of the skill.
 */

export interface Skill {
  skillName: string;
}

export interface DatabaseSkill extends Skill {
  _id: ObjectId;
}

export interface GetSkillsRequest extends Request {
  // No body needed for retrieving all available skills
}
