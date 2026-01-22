import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';
import { UserCredentials, SafeDatabaseUser, GoogleUserResponse } from '../types/types';
import api from './config';

const USER_API_URL = `${process.env.REACT_APP_SERVER_URL}/user`;

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUsers = async (): Promise<SafeDatabaseUser[]> => {
  const res = await api.get(`${USER_API_URL}/getUsers`);
  if (res.status !== 200) {
    throw new Error('Error when fetching users');
  }
  return res.data;
};

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUserByUsername = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.get(`${USER_API_URL}/getUser/${username}`);
  if (res.status === 404) {
    throw new Error('User not found');
  }
  return res.data;
};

/**
 * Sends a POST request to create a new user account.
 *
 * @param user - The user credentials (username and password) for signup.
 * @returns {Promise<User>} The newly created user object.
 * @throws {Error} If an error occurs during the signup process.
 */
const createUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
  try {
    const res = await api.post(`${USER_API_URL}/signup`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while signing up: ${error.response.data}`);
    } else {
      throw new Error('Error while signing up');
    }
  }
};

/**
 * Sends a POST request to authenticate a user.
 *
 * @param user - The user credentials (username and password) for login.
 * @returns {Promise<User>} The authenticated user object.
 * @throws {Error} If an error occurs during the login process.
 */
const loginUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
  try {
    const res = await api.post(`${USER_API_URL}/login`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while logging in: ${error.response.data}`);
    } else {
      throw new Error('Error while logging in');
    }
  }
};

/**
 * Deletes a user by their username.
 * @param username - The unique username of the user
 * @returns A promise that resolves to the deleted user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const deleteUser = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.delete(`${USER_API_URL}/deleteUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when deleting user');
  }
  return res.data;
};

/**
 * Resets the password for a user.
 * @param username - The unique username of the user
 * @param newPassword - The new password to be set for the user
 * @returns A promise that resolves to the updated user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const resetPassword = async (username: string, newPassword: string): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/resetPassword`, {
    username,
    password: newPassword,
  });
  if (res.status !== 200) {
    throw new Error('Error when resetting password');
  }
  return res.data;
};

/**
 * Updates the user's biography.
 * @param username The unique username of the user
 * @param newBiography The new biography to set for this user
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const updateBiography = async (
  username: string,
  newBiography: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/updateBiography`, {
    username,
    biography: newBiography,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating biography');
  }
  return res.data;
};

/**
 * Verifies the Google credentials of a user.
 * @param credentialResponse the response from the Google login
 * @returns the data of the verified user
 * @throws Error if the request fails
 */
const verifyGoogleCredentials = async (
  credentialResponse: CredentialResponse,
): Promise<GoogleUserResponse> => {
  const res = await api.post(`${USER_API_URL}/verifyGoogleToken`, {
    token: credentialResponse.credential,
  });
  if (res.status !== 200) {
    throw new Error('Error when verifying Google credentials');
  }
  return res.data;
};

/**
 * set the display name of a user
 * @param username the username of the user
 * @param name the display name to set
 * @returns the user object with the updated display name
 * @throws Error if the request fails
 */
const setUserDisplayName = async (username: string, name: string): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/updateDisplayName`, {
    username,
    name,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating user display name');
  }
  return res.data;
};

const addSkillToProfile = async (
  username: string,
  skillName: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/addSkillToProfile`, {
    username,
    skillName,
  });
  if (res.status !== 200) {
    throw new Error('Error when adding skill to profile');
  }
  return res.data;
};

const getAvailableSkills = async (): Promise<string[]> => {
  const res = await api.get(`${USER_API_URL}/getAvailableSkills`);
  if (res.status !== 200) {
    throw new Error('Error when fetching available skills');
  }
  return res.data;
};

const verifySkill = async (username: string, skillName: string): Promise<void> => {
  const res = await api.patch(`${USER_API_URL}/verifySkill`, {
    username,
    skillName,
  });
  if (res.status !== 200) {
    throw new Error('Error when verifying skill');
  }
};

const removeSkillFromProfile = async (
  username: string,
  skillName: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/removeSkillFromProfile`, {
    username,
    skillName,
  });
  if (res.status !== 200) {
    throw new Error('Error when removing skill from profile');
  }
  return res.data;
};

const addEndorsementToSkill = async (
  username: string,
  skillName: string,
  endorser: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/addEndorsementToSkill`, {
    username,
    skillName,
    endorser,
  });
  if (res.status !== 200) {
    throw new Error('Error when adding endorsement to skill');
  }
  return res.data;
};

export {
  getUsers,
  getUserByUsername,
  loginUser,
  createUser,
  deleteUser,
  resetPassword,
  updateBiography,
  verifyGoogleCredentials,
  setUserDisplayName,
  addSkillToProfile,
  getAvailableSkills,
  verifySkill,
  removeSkillFromProfile,
  addEndorsementToSkill,
};
