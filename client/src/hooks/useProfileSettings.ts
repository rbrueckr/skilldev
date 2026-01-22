import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  setUserDisplayName,
  addSkillToProfile,
  removeSkillFromProfile,
  addEndorsementToSkill,
} from '../services/userService';
import getAvailableSkills from '../services/skillService';
import { SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editNameMode, setEditNameMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [verifySkills, setVerifySkills] = useState<string[]>([]);
  const [addSkillMode, setAddSkillMode] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await getAvailableSkills();
        const skillNames = skills.map((skill: { skillName: string }) => skill.skillName);
        setVerifySkills(skillNames);
      } catch (error) {
        setErrorMessage('Error fetching available skills');
      }
    };

    fetchSkills();
  }, [addSkillMode]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  const handleUpdateDisplayName = async () => {
    try {
      if (!username) return;
      const usr = await setUserDisplayName(username, newName);
      await setUserData(usr);
      setEditNameMode(false);
      setSuccessMessage('Display name updated!');
    } catch (error) {
      setErrorMessage('Failed to update display name.');
      setSuccessMessage(null);
    }
  };

  const addNewSkill = async () => {
    if (!username) return;

    // 1. Front-end check: see if the skill already exists in userData
    if ((userData?.skills ?? []).some(skillObj => skillObj.skillName === newSkill)) {
      setErrorMessage(`You already have the "${newSkill}" skill in your profile!`);
      setSuccessMessage(null);
      return; // Stop here; don't call the backend
    }

    try {
      const updatedUser = await addSkillToProfile(username, newSkill);
      setUserData(updatedUser);
      setSuccessMessage('Skill added!');
      setErrorMessage(null);
      setAddSkillMode(false);
    } catch (error) {
      setErrorMessage('Failed to add skill.');
      setSuccessMessage(null);
    }
  };

  const removeSkill = async (skillName: string) => {
    if (!username) return;
    try {
      const updatedUser = await removeSkillFromProfile(username, skillName);
      setUserData(updatedUser);
      setSuccessMessage(`Skill "${skillName}" removed!`);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to remove skill.');
      setSuccessMessage(null);
    }
  };

  const handleAddEndorsement = async (skillName: string) => {
    if (!username) return;
    try {
      const user = await addEndorsementToSkill(username, skillName, currentUser.username);
      setSuccessMessage(`You endorsed "${skillName}"!`);
      setErrorMessage(null);
      setUserData(user);
    } catch (error) {
      setErrorMessage('Failed to endorse skill.');
      setSuccessMessage(null);
    }
  };

  return {
    userData,
    currentUser,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    setEditBioMode,
    newBio,
    setNewBio,
    successMessage,
    errorMessage,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    editNameMode,
    newName,
    setEditNameMode,
    setNewName,
    handleUpdateDisplayName,
    addNewSkill,
    verifySkills,
    addSkillMode,
    setAddSkillMode,
    setNewSkill,
    newSkill,
    removeSkill,
    handleAddEndorsement,
  };
};

export default useProfileSettings;
