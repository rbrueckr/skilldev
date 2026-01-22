import { useNavigate, useLocation } from 'react-router-dom';
import { ChangeEvent, useState, useEffect } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import useLoginContext from './useLoginContext';
import {
  createUser,
  getUserByUsername,
  loginUser,
  verifyGoogleCredentials,
  setUserDisplayName,
} from '../services/userService';

/**
 * Custom hook to manage authentication logic, including handling input changes,
 * form submission, password visibility toggling, and error validation for both
 * login and signup processes.
 *
 * @param authType - Specifies the authentication type ('login' or 'signup').
 * @returns {Object} An object containing:
 *   - username, password, passwordConfirmation, showPassword, err
 *   - handleInputChange, handleSubmit, togglePasswordVisibility
 *   - handleGoogleSuccess, handleGoogleError
 */
const useAuth = (authType: 'login' | 'signup') => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string>('');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Toggles the visibility of the password input field.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Handles changes in input fields and updates the corresponding state.
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: 'username' | 'password' | 'confirmPassword' | 'name',
  ) => {
    const fieldText = e.target.value.trim();

    if (field === 'username') {
      setUsername(fieldText);
    } else if (field === 'password') {
      setPassword(fieldText);
    } else if (field === 'confirmPassword') {
      setPasswordConfirmation(fieldText);
    } else if (field === 'name') {
      setName(fieldText);
    }
  };

  /**
   * Validates the input fields for the form.
   * Ensures required fields are filled and passwords match (for signup).
   */
  const validateInputs = (): boolean => {
    if (username === '' || password === '') {
      setErr('Please enter a username and password');
      return false;
    }

    if (authType === 'signup' && password !== passwordConfirmation) {
      setErr('Passwords do not match');
      return false;
    }

    return true;
  };

  /**
   * Handles the submission of the form.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    let user;

    try {
      if (authType === 'signup') {
        user = await createUser({ username, password });
        user = await setUserDisplayName(user.username, name);
      } else if (authType === 'login') {
        user = await loginUser({ username, password });
      } else {
        throw new Error('Invalid auth type');
      }

      setUser(user);
      navigate('/home');
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  /**
   * Handles success callback for Google OAuth
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const googleUserInfo = await verifyGoogleCredentials(credentialResponse);

      if (!googleUserInfo.sub) {
        throw new Error('Missing Google user ID (sub)');
      }

      let user;

      try {
        user = await getUserByUsername(googleUserInfo.email ?? googleUserInfo.sub);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          user = await createUser({
            username: googleUserInfo.email ?? googleUserInfo.sub,
            password: 'GOOGLE_OAUTH',
          });
        } else {
          throw error;
        }
      }

      if (googleUserInfo.name && user.name !== googleUserInfo.name) {
        await setUserDisplayName(user.username, googleUserInfo.name);
      }

      setUser(user);
      navigate('/home');
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  /**
   * Handles error callback for Google OAuth
   */
  const handleGoogleError = () => {
    setErr('Error logging in with Google');
  };

  /**
   * Detect GitHub success redirect (?githubLoginSuccess=true&username=xxx)
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const githubSuccess = params.get('githubLoginSuccess');
    const githubUsername = params.get('username');
    if (githubSuccess && githubUsername) {
      (async () => {
        try {
          const user = await getUserByUsername(githubUsername);
          setUser(user);
          navigate('/home');
        } catch (githubError) {
          setErr('GitHub login error');
        }
      })();
    }
  }, [location, navigate, setUser]);

  return {
    username,
    password,
    passwordConfirmation,
    showPassword,
    err,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
    handleGoogleSuccess,
    handleGoogleError,
  };
};

export default useAuth;
