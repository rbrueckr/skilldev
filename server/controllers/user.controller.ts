import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import {
  UserRequest,
  User,
  UserCredentials,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  VerifyGoogleTokenRequest,
  AddSkillToProfileRequest,
  UpdateDisplayNameRequest,
  VerifySkillRequest,
  EndorseSkillRequest,
} from '../types/types';
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
} from '../services/user.service';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUserBodyValid = (req: UserRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username !== '' &&
    req.body.password !== undefined &&
    req.body.password !== '';

  /**
   * Validates that the request body contains all required fields to update a biography.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUpdateBiographyBodyValid = (req: UpdateBiographyRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.biography !== undefined;

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).send('Invalid user body');
      return;
    }

    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      biography: requestUser.biography ?? '',
      name: requestUser.name ?? '',
      dateJoined: new Date(),
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const loginCredentials: UserCredentials = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Login failed');
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const user = await getUserByUsername(username);
      if ('error' in user) {
        if (user.error.includes('user-not-found')) {
          res.status(404).send('User not found');
          return;
        }
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      if (!isUpdateBiographyBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  const verifyGoogleCredentials = async (
    req: VerifyGoogleTokenRequest,
    res: Response,
  ): Promise<void> => {
    if (req.body.token === undefined) {
      res.status(400).send('Invalid Google token');
      return;
    }

    try {
      const userInfo = await getUserByGoogleToken(req.body.token);
      if ('error' in userInfo) throw new Error(userInfo.error);
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).send(`Error when verifying Google token: ${error}`);
    }
  };

  const updateUserDisplayName = async (
    req: UpdateDisplayNameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (req.body.name === undefined) {
        res.status(400).send('Invalid display name');
        return;
      }

      const updatedUser = await updateUser(req.body.username, { name: req.body.name });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user display name: ${error}`);
    }
  };

  /**
   * Adds a skill to the user profile.
   * @param req The request containing the username and skill in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const addSkillByUsername = async (
    req: AddSkillToProfileRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (req.body.skillName === undefined) {
        res.status(400).send('Invalid skill name');
        return;
      }

      // Retrieve the current user data
      const user = await getUserByUsername(req.body.username);

      if ('error' in user) {
        throw new Error(user.error);
      }

      // Add the new skill to the existing skills array
      const updatedSkills = [
        ...(user.skills ?? []),
        { skillName: req.body.skillName, endorsements: [], verified: false },
      ];

      // Update the user with the modified skills array
      const updatedUser = await updateUser(req.body.username, { skills: updatedSkills });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding skill to user: ${error}`);
    }
  };

  const verifySkillForUser = async (req: VerifySkillRequest, res: Response): Promise<void> => {
    try {
      if (req.body.skillName === undefined) {
        res.status(400).send('Invalid skill name');
        return;
      }
      // Retrieve the current user data
      const user = await verifySkill(req.body.username, req.body.skillName);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when adding skill to user: ${error}`);
    }
  };

  const removeSkillFromProfile = async (
    req: AddSkillToProfileRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (req.body.skillName === undefined) {
        res.status(400).send('Invalid skill name');
        return;
      }

      const user = await getUserByUsername(req.body.username);
      if ('error' in user) throw new Error(user.error);
      const updatedSkills = (user.skills ?? []).filter(
        skill => skill.skillName !== req.body.skillName,
      );
      const updatedUser = await updateUser(req.body.username, { skills: updatedSkills });
      if ('error' in updatedUser) throw new Error(updatedUser.error);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when removing skill from user: ${error}`);
    }
  };

  const addEndorsementToSkill = async (req: EndorseSkillRequest, res: Response): Promise<void> => {
    try {
      if (req.body.skillName === undefined || req.body.endorser === undefined) {
        res.status(400).send('Invalid skill name or endorser');
        return;
      }

      const updatedUser = await updateEndorsements(
        req.body.username,
        req.body.skillName,
        req.body.endorser,
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when endorsing skill for user: ${error}`);
    }
  };

  /**
   * Initiates GitHub OAuth by redirecting the client to GitHub's OAuth screen.
   * @param req The incoming request object.
   * @param res The response object, which is used to redirect to GitHub's OAuth page.
   */
  const githubAuth = (req: Request, res: Response): void => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user&redirect_uri=${process.env.SERVER_URL + (process.env.GITHUB_REDIRECT_URI || '/defaultRedirect')}`;
    res.redirect(githubAuthUrl);
  };

  /**
   * Handles the GitHub OAuth callback. Exchanges the authorization code for an access token,
   * retrieves user info from GitHub, and performs a "find or create" in the local database.
   * @param req The incoming request, expected to contain a "code" query parameter from GitHub.
   * @param res The response object, which is used to redirect the user to the frontend.
   */
  const githubCallback = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;
    if (!code) {
      res.status(400).send('GitHub OAuth flow: No code provided');
      return;
    }

    try {
      const githubCallbackString = `${process.env.SERVER_URL}/user/githubCallback`;
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: githubCallbackString,
        },
        {
          headers: { Accept: 'application/json' },
        },
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        res.status(400).send('No access token received from GitHub');
        return;
      }

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const githubUser = userResponse.data; // e.g. { login, id, avatar_url, name, ... }

      const existingUser = await getUserByUsername(githubUser.login);

      if ('error' in existingUser && existingUser.error.includes('user-not-found')) {
        // No user found, create one
        const newUser: User = {
          username: githubUser.login,
          password: '', // no password for OAuth
          name: githubUser.name || '',
          biography: '',
          dateJoined: new Date(),
        };

        const saved = await saveUser(newUser);
        if ('error' in saved) throw new Error(saved.error);
      }

      // 4) Redirect to your front end with a success message or token
      res.redirect(
        `${process.env.CLIENT_URL}/?githubLoginSuccess=true&username=${githubUser.login}`,
      );
    } catch (error) {
      res.status(500).send('GitHub authentication failed');
    }
  };

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.post('/verifyGoogleToken', verifyGoogleCredentials);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.patch('/updateDisplayName', updateUserDisplayName);
  router.patch('/addSkillToProfile', addSkillByUsername);
  router.patch('/verifySkill', verifySkillForUser);
  router.patch('/removeSkillFromProfile', removeSkillFromProfile);
  router.patch('/addEndorsementToSkill', addEndorsementToSkill);
  router.get('/githubAuth', githubAuth);
  router.get('/githubCallback', githubCallback);
  return router;
};

export default userController;
