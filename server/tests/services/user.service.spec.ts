/* eslint-disable import/first */
import mongoose from 'mongoose';
import UserModel from '../../models/users.model';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => {
  const originalModule = jest.requireActual('google-auth-library');
  return {
    ...originalModule,
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});
// had to put the lint disable because it only worked when it was at the top of the file
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
  getUserByGoogleToken,
  updateEndorsements,
  verifySkill,
} from '../../services/user.service';
import { SafeDatabaseUser, User, UserCredentials } from '../../types/types';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeDatabaseUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const retrievedUser = (await getUserByUsername(user.username)) as SafeDatabaseUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });
});

describe('getUsersList', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the users', async () => {
    mockingoose(UserModel).toReturn([safeUser], 'find');

    const retrievedUsers = (await getUsersList()) as SafeDatabaseUser[];

    expect(retrievedUsers[0].username).toEqual(safeUser.username);
    expect(retrievedUsers[0].dateJoined).toEqual(safeUser.dateJoined);
  });

  it('should throw an error if the users cannot be found', async () => {
    mockingoose(UserModel).toReturn(null, 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const loggedInUser = (await loginUser(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.username).toEqual(user.username);
    expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return the user if the password fails', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: 'wrongPassword',
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });

  it('should return the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: 'wrongUsername',
      password: user.password,
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error deleting object'), 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeDatabaseUser = {
    _id: new mongoose.Types.ObjectId(),
    username: user.username,
    dateJoined: user.dateJoined,
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

    const result = (await updateUser(user.username, updates)) as SafeDatabaseUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should update the biography if the user is found', async () => {
    const newBio = 'This is a new biography';
    // Make a new partial updates object just for biography
    const biographyUpdates: Partial<User> = { biography: newBio };

    // Mock the DB to return a safe user (i.e., no password in results)
    mockingoose(UserModel).toReturn({ ...safeUpdatedUser, biography: newBio }, 'findOneAndUpdate');

    const result = await updateUser(user.username, biographyUpdates);

    // Check that the result is a SafeUser and the biography got updated
    if ('username' in result) {
      expect(result.biography).toEqual(newBio);
    } else {
      throw new Error('Expected a safe user, got an error object.');
    }
  });

  it('should return an error if biography update fails because user not found', async () => {
    // Simulate user not found
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const newBio = 'No user found test';
    const biographyUpdates: Partial<User> = { biography: newBio };
    const updatedError = await updateUser(user.username, biographyUpdates);

    expect('error' in updatedError).toBe(true);
  });
});
describe('getUserByGoogleToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return Google user data if verification succeeds', async () => {
    // Mock a successful verifyIdToken call
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: '12345',
        email: 'test@example.com',
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        picture: 'http://test.com/avatar.png',
      }),
    });

    const result = await getUserByGoogleToken('valid-google-token');
    expect(result).toEqual({
      sub: '12345',
      email: 'test@example.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'http://test.com/avatar.png',
    });
  });

  it('should return an error object if payload is null', async () => {
    // Mock a successful verify, but no payload
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => null,
    });

    const result = await getUserByGoogleToken('some-token');
    expect(result).toHaveProperty('error');
    if ('error' in result) {
      expect(result.error).toMatch(
        'Error occurred when verifying Google token: Error: Invalid token payload',
      );
    } else {
      throw new Error('Expected an error object, got a user object');
    }
  });

  it('should return an error object if verifyIdToken throws', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('Network failure'));

    const result = await getUserByGoogleToken('some-token');
    expect(result).toHaveProperty('error');
    if ('error' in result) {
      expect(result.error).toMatch(
        'Error occurred when verifying Google token: Error: Network failure',
      );
    } else {
      throw new Error('Expected an error object, got a user object');
    }
  });
});

describe('User Service - Error Branches', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it('updateEndorsements should throw an error when UserModel.findOneAndUpdate returns null', async () => {
    // Simulate findOneAndUpdate returning null for updating endorsements.
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');
    const mockUser1 = {
      username: 'testUser',
      password: 'testPassword',
      dateJoined: new Date(),
      skills: [],
    };

    await expect(
      updateEndorsements(mockUser1.username, 'JavaScript', 'endorserUser') as Promise<unknown>,
    ).rejects.toThrow('Error updating endorsements');
  });

  it('verifySkill should throw an error when UserModel.findOneAndUpdate returns null', async () => {
    // Simulate findOneAndUpdate returning null for verifying a skill.
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const mockUser1 = {
      username: 'testUser',
      password: 'testPassword',
      dateJoined: new Date(),
      skills: [],
    };

    await expect(verifySkill(mockUser1.username, 'JavaScript') as Promise<unknown>).rejects.toThrow(
      'Error when verifying skill',
    );
  });
});

describe('updateEndorsements', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when update is successful', async () => {
    // Create a mock updated user
    const updatedUser: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testUser',
      dateJoined: new Date('2024-12-03'),
      biography: '',
      name: '',
      skills: [],
    };

    // Simulate a successful update by having findOneAndUpdate return the updated user.
    mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

    const result = await updateEndorsements('testUser', 'JavaScript', 'endorserUser');
    expect(result).toMatchObject(updatedUser);
  });
});
