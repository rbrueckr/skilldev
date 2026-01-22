import supertest from 'supertest';
import mongoose from 'mongoose';
import axios from 'axios';
import { app } from '../../app';
import * as util from '../../services/user.service';
import {
  SafeDatabaseUser,
  User,
  UserSkill,
  UserResponse,
  SafeGoogleUserResponse,
} from '../../types/types';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  skills: [],
};

const mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  skills: [],
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
  skills: [],
};

const mockGoogleUserResponse: SafeGoogleUserResponse = {
  sub: 'google-sub-123',
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  picture: 'https://example.com/picture.jpg',
  locale: 'en-US',
};

const mockUserSkill: UserSkill = {
  skillName: 'JavaScript',
  endorsements: [],
  verified: false,
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const getUserByGoogleTokenSpy = jest.spyOn(util, 'getUserByGoogleToken');
const verifySkillSpy = jest.spyOn(util, 'verifySkill');
const updateEndorsementsSpy = jest.spyOn(util, 'updateEndorsements');

describe('Test userController', () => {
  jest.setTimeout(15000);

  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
      };

      saveUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        biography: mockReqBody.biography,
        skills: [],
      });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [],
        biography: mockReqBody.biography,
      });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        name: '',
        dateJoined: expect.any(Date),
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({ error: 'Error authenticating user' });

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 404 if user.error is "user-not-found"', async () => {
      // Mock the service returning { error: 'user-not-found' }
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'user-not-found' });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('User not found');
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error deleting user' });

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).delete('/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      // Simulate a DB error
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user biography: Error: Error updating user',
      );
    });
  });

  describe('PATCH /updateDisplayName', () => {
    it('should successfully update display name', async () => {
      const mockReqBody = {
        username: mockUser.username,
        name: 'New Display Name',
      };

      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        name: mockReqBody.name,
      });

      const response = await supertest(app).patch('/user/updateDisplayName').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        name: mockReqBody.name,
      });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, {
        name: mockReqBody.name,
      });
    });

    it('should return 400 for request missing displayName', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateDisplayName').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid display name');
    });

    it('should return 500 for a database error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        name: 'New Display Name',
      };

      updatedUserSpy.mockResolvedValueOnce({
        error: 'Error updating display name',
      } as UserResponse);

      const response = await supertest(app).patch('/user/updateDisplayName').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /verifyGoogleToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 if no token is provided', async () => {
      const response = await supertest(app).post('/user/verifyGoogleToken').send({
        /* no token field */
      });

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid Google token');
    });

    it('should return 200 and user info if token is valid', async () => {
      // 1) Mock a successful token verification
      getUserByGoogleTokenSpy.mockResolvedValueOnce(mockGoogleUserResponse);

      const response = await supertest(app)
        .post('/user/verifyGoogleToken')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoogleUserResponse);
      expect(getUserByGoogleTokenSpy).toHaveBeenCalledWith('valid-google-token');
    });

    it('should return 500 if getUserByGoogleToken returns an error', async () => {
      // 2) Simulate an error from the service
      getUserByGoogleTokenSpy.mockResolvedValueOnce({
        error: 'Something went wrong',
      } as SafeGoogleUserResponse);

      const response = await supertest(app)
        .post('/user/verifyGoogleToken')
        .send({ token: 'bad-token' });

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when verifying Google token: Error: Something went wrong',
      );
    });
  });

  describe('POST /verifyGoogleCredentials', () => {
    it('should successfully verify Google credentials', async () => {
      const mockReqBody = {
        token: 'mock-google-token',
      };

      getUserByGoogleTokenSpy.mockResolvedValueOnce(mockGoogleUserResponse);

      const response = await supertest(app).post('/user/verifyGoogleToken').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoogleUserResponse);
      expect(getUserByGoogleTokenSpy).toHaveBeenCalledWith(mockReqBody.token);
    });

    it('should return 400 for request missing token', async () => {
      const mockReqBody = {};

      const response = await supertest(app).post('/user/verifyGoogleToken').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid Google token');
    });

    it('should return 500 for a database error', async () => {
      const mockReqBody = {
        token: 'mock-google-token',
      };

      getUserByGoogleTokenSpy.mockResolvedValueOnce({
        error: 'Error verifying Google credentials',
      } as SafeGoogleUserResponse);

      const response = await supertest(app).post('/user/verifyGoogleToken').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /addSkillToProfile', () => {
    it('should successfully add a skill to user profile', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
      };

      // First mock getUserByUsername which is called first
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [],
      });

      // Then mock the update response
      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [mockUserSkill],
      } as UserResponse);

      const response = await supertest(app).patch('/user/addSkillToProfile').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [mockUserSkill],
      });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, {
        skills: [{ skillName: mockReqBody.skillName, endorsements: [], verified: false }],
      });
    });

    it('should return 400 for request missing skill', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/addSkillToProfile').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid skill name');
    });

    it('should return 500 for getUserByUsername error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error getting user',
      });

      const response = await supertest(app).patch('/user/addSkillToProfile').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 for updateUser error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      // First success
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [],
      });

      // Then error
      updatedUserSpy.mockResolvedValueOnce({
        error: 'Error adding skill',
      } as UserResponse);

      const response = await supertest(app).patch('/user/addSkillToProfile').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should handle a user with undefined skills array', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      // First mock getUserByUsername to return a user WITHOUT a skills array
      // This will force line 315 (user.skills ?? []) to use the empty array fallback
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: undefined, // Explicitly undefined to trigger the ?? operator
      });

      // Then mock the update response
      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [mockUserSkill],
      } as UserResponse);

      const response = await supertest(app).patch('/user/addSkillToProfile').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [mockUserSkill],
      });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, {
        skills: [{ skillName: mockReqBody.skillName, endorsements: [], verified: false }],
      });
    });
  });

  describe('PATCH /verifySkill', () => {
    it('should successfully verify a skill and return undefined', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
      };

      // verifySkill returns void/undefined
      verifySkillSpy.mockResolvedValueOnce(null as unknown as SafeDatabaseUser);

      const response = await supertest(app).patch('/user/verifySkill').send(mockReqBody);

      // Since the controller tries to JSON.stringify undefined, we'll get a 200 status
      // but the response body will be empty or null
      expect(response.status).toBe(200);

      // Verify the function was called
      expect(verifySkillSpy).toHaveBeenCalledWith(mockReqBody.username, mockReqBody.skillName);
    });

    it('should return 400 for request missing required fields', async () => {
      const mockReqBody = {
        username: mockUser.username,
        // skillName is missing
      };

      const response = await supertest(app).patch('/user/verifySkill').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid skill name');
    });

    it('should return 500 for a database error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
      };

      verifySkillSpy.mockRejectedValueOnce(new Error('Error when verifying skill'));

      const response = await supertest(app).patch('/user/verifySkill').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /removeSkillFromProfile', () => {
    it('should successfully remove a skill from user profile', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      // First mock getUserByUsername which is called first
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [mockUserSkill],
      });

      // Then mock the update response
      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [],
      } as UserResponse);

      const response = await supertest(app).patch('/user/removeSkillFromProfile').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [],
      });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, {
        skills: [],
      });
    });

    it('should return 400 for request missing skill', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/removeSkillFromProfile').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid skill name');
    });

    it('should return 500 for getUserByUsername error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error getting user',
      });

      const response = await supertest(app).patch('/user/removeSkillFromProfile').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 for updateUser error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      // First success
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [mockUserSkill],
      });

      // Then error
      updatedUserSpy.mockResolvedValueOnce({
        error: 'Error removing skill',
      } as UserResponse);

      const response = await supertest(app).patch('/user/removeSkillFromProfile').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should handle a user with undefined skills array when removing skills', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: 'JavaScript',
      };

      // Mock getUserByUsername to return a user WITHOUT a skills array
      // This will force line 360 (user.skills ?? []) to use the empty array fallback
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: undefined, // Explicitly undefined to trigger the ?? operator
      });

      // Then mock the update response with still no skills
      updatedUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [],
      } as UserResponse);

      const response = await supertest(app).patch('/user/removeSkillFromProfile').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [],
      });
      // The important assertion - updatedSkills should be [] when filtering from undefined
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, {
        skills: [],
      });
    });
  });

  describe('PATCH /addEndorsementToSkill', () => {
    it('should successfully endorse a skill', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
        endorser: 'endorser1',
      };

      updateEndorsementsSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        skills: [mockUserSkill],
      } as SafeDatabaseUser);

      const response = await supertest(app).patch('/user/addEndorsementToSkill').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        skills: [mockUserSkill],
      });
      expect(updateEndorsementsSpy).toHaveBeenCalledWith(
        mockReqBody.username,
        mockReqBody.skillName,
        mockReqBody.endorser,
      );
    });

    it('should return 400 for request missing required fields', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
      };

      const response = await supertest(app).patch('/user/addEndorsementToSkill').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid skill name or endorser');
    });

    it('should return 500 for a database error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        skillName: mockUserSkill.skillName,
        endorser: 'endorser1',
      };

      updateEndorsementsSpy.mockRejectedValueOnce(new Error('Error updating endorsements'));

      const response = await supertest(app).patch('/user/addEndorsementToSkill').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });
  describe('GET /githubAuth', () => {
    it('should redirect to GitHub OAuth URL with client_id and redirect_uri', async () => {
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.SERVER_URL = 'http://localhost:3000';
      process.env.GITHUB_REDIRECT_URI = '/user/githubCallback';

      const response = await supertest(app).get('/user/githubAuth');

      expect(response.status).toBe(302); // Redirect
      expect(response.header.location).toContain('https://github.com/login/oauth/authorize');
      expect(response.header.location).toContain('client_id=test-client-id');
      expect(response.header.location).toContain(
        'redirect_uri=http://localhost:3000/user/githubCallback',
      );
    });
    it('should fall back to /defaultRedirect if GITHUB_REDIRECT_URI is not set', async () => {
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.SERVER_URL = 'http://localhost:3000';
      delete process.env.GITHUB_REDIRECT_URI;

      const response = await supertest(app).get('/user/githubAuth');

      expect(response.status).toBe(302);
      expect(response.header.location).toContain(
        'redirect_uri=http://localhost:3000/defaultRedirect',
      );
    });
  });

  describe('GET /githubCallback', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 if no code is provided', async () => {
      const response = await supertest(app).get('/user/githubCallback');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('GitHub OAuth flow: No code provided');
    });

    it('should redirect to frontend with username if GitHub login succeeds and user is new', async () => {
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
      process.env.SERVER_URL = 'http://localhost:3000';
      process.env.CLIENT_URL = 'http://localhost:5173';

      // Mock GitHub token and user responses
      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { access_token: 'mock-access-token' },
      });

      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          login: 'githubUser',
          name: 'GitHub User',
        },
      });

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'user-not-found' });
      saveUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        username: 'githubUser',
      });

      const response = await supertest(app).get('/user/githubCallback?code=mock-code');

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('githubLoginSuccess=true');
      expect(response.header.location).toContain('username=githubUser');
    });

    it('should return 500 if GitHub returns no access token', async () => {
      jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: {} });

      const response = await supertest(app).get('/user/githubCallback?code=bad-code');

      expect(response.status).toBe(400);
      expect(response.text).toEqual('No access token received from GitHub');
    });

    it('should return 500 if GitHub auth flow fails at any point', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('GitHub error'));

      const response = await supertest(app).get('/user/githubCallback?code=mock-code');

      expect(response.status).toBe(500);
      expect(response.text).toEqual('GitHub authentication failed');
    });
  });
  it('should use default values for name and biography if not provided by GitHub', async () => {
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.SERVER_URL = 'http://localhost:3000';
    process.env.CLIENT_URL = 'http://localhost:5173';

    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { access_token: 'mock-access-token' },
    });

    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: {
        login: 'githubUserNoName',
        // no name provided
      },
    });

    getUserByUsernameSpy.mockResolvedValueOnce({ error: 'user-not-found' });

    const expectedUser = {
      ...mockSafeUser,
      username: 'githubUserNoName',
      name: '', // default fallback
      biography: '', // explicitly set
      dateJoined: expect.any(Date), // dynamic
    };

    saveUserSpy.mockResolvedValueOnce(expectedUser);

    const response = await supertest(app).get('/user/githubCallback?code=mock-code');

    expect(response.status).toBe(302);
    expect(saveUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'githubUserNoName',
        name: '',
        biography: '',
        dateJoined: expect.any(Date),
      }),
    );
  });
  it('should return 500 if saving the new GitHub user fails', async () => {
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.SERVER_URL = 'http://localhost:3000';
    process.env.CLIENT_URL = 'http://localhost:5173';

    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { access_token: 'mock-access-token' },
    });

    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: {
        login: 'githubUser',
        name: 'GitHub User',
      },
    });

    getUserByUsernameSpy.mockResolvedValueOnce({ error: 'user-not-found' });

    saveUserSpy.mockResolvedValueOnce({
      error: 'failed to save user',
    });

    const response = await supertest(app).get('/user/githubCallback?code=mock-code');

    expect(response.status).toBe(500);
    expect(response.text).toEqual('GitHub authentication failed');
  });
});
