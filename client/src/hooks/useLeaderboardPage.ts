// src/hooks/useLeaderboardPage.ts
import { useState, useEffect } from 'react';
import useUserContext from './useUserContext';
import { DatabaseLeaderboardEntry, LeaderboardEntryWithUser } from '../types/types';
import { getLeaderboardBySkill } from '../services/leaderboardService';
import getAvailableSkills from '../services/skillService';
import { getUserByUsername } from '../services/userService';

const useLeaderboardPage = () => {
  const { socket } = useUserContext();
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<DatabaseLeaderboardEntry[]>([]);
  const [leaderboardWithUsers, setLeaderboardWithUsers] = useState<LeaderboardEntryWithUser[]>([]);
  const [error, setError] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Fetch available skills and set default selected skill (first available)
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await getAvailableSkills();
        const skillNames = skills.map((skill: { skillName: string }) => skill.skillName);
        setAvailableSkills(skillNames);
        if (skillNames.length > 0 && !selectedSkill) {
          setSelectedSkill(skillNames[0]);
        }
      } catch (err) {
        setError('Error fetching available skills');
      }
    };

    fetchSkills();
  }, [selectedSkill]);

  // Fetch leaderboard and corresponding user data when the selected skill changes.
  useEffect(() => {
    if (!selectedSkill) return;

    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboardBySkill(selectedSkill);
        setLeaderboard(leaderboardData);

        // For each leaderboard entry, fetch the full user data.
        const leaderboardWithUserData = await Promise.all(
          leaderboardData.map(async entry => {
            const user = await getUserByUsername(entry.username);
            return { entry, user } as LeaderboardEntryWithUser;
          }),
        );
        setLeaderboardWithUsers(leaderboardWithUserData);
      } catch (err) {
        setError('Failed to fetch leaderboard');
      }
    };

    fetchLeaderboard();
  }, [selectedSkill]);

  // Listen for real-time leaderboard updates via socket.
  useEffect(() => {
    const handleLeaderboardUpdate = async (data: {
      skill: string;
      leaderboard: DatabaseLeaderboardEntry[];
    }) => {
      if (data.skill === selectedSkill) {
        setLeaderboard(data.leaderboard);

        // Update the leaderboardWithUsers list when an update is received.
        try {
          const updatedLeaderboardWithUsers = await Promise.all(
            data.leaderboard.map(async entry => {
              const user = await getUserByUsername(entry.username);
              return { entry, user } as LeaderboardEntryWithUser;
            }),
          );
          setLeaderboardWithUsers(updatedLeaderboardWithUsers);
        } catch (err) {
          setError('Failed to fetch updated user data');
        }
      }
    };

    socket.on('leaderboardUpdate', handleLeaderboardUpdate);
    return () => {
      socket.off('leaderboardUpdate', handleLeaderboardUpdate);
    };
  }, [socket, selectedSkill]);

  return {
    selectedSkill,
    setSelectedSkill,
    leaderboard,
    leaderboardWithUsers,
    error,
    availableSkills,
  };
};

export default useLeaderboardPage;
