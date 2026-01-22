import mongoose, { Model } from 'mongoose';
import skillSchema from './schema/skill.schema';
import { DatabaseSkill } from '../types/types';

/**
 * Mongoose model for the `Tag` collection.
 *
 * This model is created using the `Tag` interface and the `tagSchema`, representing the
 * `Tag` collection in the MongoDB database, and provides an interface for interacting with
 * the stored tags.
 *
 * @type {Model<DatabaseSkill>}
 */
const SkillModel: Model<DatabaseSkill> = mongoose.model<DatabaseSkill>('Skill', skillSchema);

export default SkillModel;
