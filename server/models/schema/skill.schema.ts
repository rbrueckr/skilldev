import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Tag collection.
 *
 * This schema defines the structure for storing tags in the database.
 * Each tag includes the following fields:
 * - `name`: The name of the tag. This field is required.
 * - `description`: A brief description of the tag. This field is required.
 */
const skillSchema: Schema = new Schema(
  {
    skillName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { collection: 'Skill' },
);

export default skillSchema;
