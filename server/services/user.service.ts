import { OAuth2Client } from 'google-auth-library';
import UserModel from '../models/users.model';
import {
  DatabaseUser,
  SafeDatabaseUser,
  User,
  UserCredentials,
  UserResponse,
  UsersResponse,
  GoogleUserResponse,
  SafeGoogleUserResponse,
} from '../types/types';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client();

/**
 * Saves a new user to the database.
 *
 * @param {User} user - The user object to be saved, containing user details like username, password, etc.
 * @returns {Promise<UserResponse>} - Resolves with the saved user object (without the password) or an error message.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const result: DatabaseUser = await UserModel.create(user);

    if (!result) throw Error('Failed to create user');

    // Remove password field from returned object
    const safeUser: SafeDatabaseUser = {
      _id: result._id,
      username: result.username,
      dateJoined: result.dateJoined,
      biography: result.biography,
      name: result.name,
    };

    return safeUser;
  } catch (error) {
    return { error: `Error occurred when saving user: ${error}` };
  }
};

/**
 * Retrieves a user from the database by their username.
 *
 * @param {string} username - The username of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw Error('user-not-found');
    }

    return user;
  } catch (error) {
    return { error: `${error}` };
  }
};

/**
 * Retrieves all users from the database.
 * Users documents are returned in the order in which they were created, oldest to newest.
 *
 * @returns {Promise<UsersResponse>} - Resolves with the found user objects (without the passwords) or an error message.
 */
export const getUsersList = async (): Promise<UsersResponse> => {
  try {
    const users: SafeDatabaseUser[] = await UserModel.find().select('-password');

    if (!users) {
      throw Error('Users could not be retrieved');
    }

    return users;
  } catch (error) {
    return { error: `Error occurred when finding users: ${error}` };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 *
 * @param {UserCredentials} loginCredentials - An object containing the username and password.
 * @returns {Promise<UserResponse>} - Resolves with the authenticated user object (without the password) or an error message.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  const { username, password } = loginCredentials;

  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username, password }).select(
      '-password',
    );

    if (!user) {
      throw Error('Authentication failed');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when authenticating user: ${error}` };
  }
};

/**
 * Deletes a user from the database by their username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<UserResponse>} - Resolves with the deleted user object (without the password) or an error message.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser: SafeDatabaseUser | null = await UserModel.findOneAndDelete({
      username,
    }).select('-password');

    if (!deletedUser) {
      throw Error('Error deleting user');
    }

    return deletedUser;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Updates user information in the database.
 *
 * @param {string} username - The username of the user to update.
 * @param {Partial<User>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object (without the password) or an error message.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

/**
 * Attempts to verify the provided Google ID token and return user info.
 * @param token - The Google token from the client side.
 * @returns A `GoogleUserResponse` with user info or an error object.
 */
export const getUserByGoogleToken = async (token: string): Promise<SafeGoogleUserResponse> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    if (!ticket) throw new Error('Invalid token');

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const googleUser: GoogleUserResponse = {
      sub: payload.sub,
      email: payload.email ?? '',
      name: payload.name ?? '',
      given_name: payload.given_name ?? '',
      family_name: payload.family_name ?? '',
      picture: payload.picture ?? '',
    };

    return googleUser;
  } catch (error) {
    return {
      error: `Error occurred when verifying Google token: ${error}`,
    };
  }
};

export const updateEndorsements = async (
  username: string,
  skill: string,
  endorser: string,
): Promise<SafeDatabaseUser> => {
  const usr = await UserModel.findOneAndUpdate(
    { username, 'skills.skillName': skill },
    { $push: { 'skills.$.endorsements': endorser } },
    { new: true },
  ).select('-password');
  if (!usr) {
    throw new Error('Error updating endorsements');
  }
  return usr;
};

export const verifySkill = async (
  username: string,
  skillName: string,
): Promise<SafeDatabaseUser> => {
  const res = await UserModel.findOneAndUpdate(
    { username, 'skills.skillName': skillName },
    { $set: { 'skills.$.verified': true } },
  );
  if (!res) {
    throw new Error('Error when verifying skill');
  }
  return res;
};
