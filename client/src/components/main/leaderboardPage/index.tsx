// src/pages/LeaderboardPage.tsx
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLeaderboardPage from '../../../hooks/useLeaderboardPage';
import { LeaderboardEntryWithUser } from '../../../types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Alert, AlertDescription } from '../../ui/alert';

const LeaderboardPage = () => {
  const {
    selectedSkill,
    setSelectedSkill,
    leaderboardWithUsers,
    leaderboard,
    error,
    availableSkills,
  } = useLeaderboardPage();
  const navigate = useNavigate();

  const handleUserCardClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  // Use leaderboardWithUsers if available; fallback to raw leaderboard entries
  const entries: (
    | LeaderboardEntryWithUser
    | { entry: (typeof leaderboard)[number]; user: null }
  )[] =
    leaderboardWithUsers.length > 0
      ? leaderboardWithUsers
      : leaderboard.map(entry => ({ entry, user: null }));

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 1:
        return <Medal className='h-5 w-5 text-gray-400' />;
      case 2:
        return <Award className='h-5 w-5 text-amber-700' />;
      default:
        return <span className='text-muted-foreground font-medium'>{index + 1}</span>;
    }
  };

  return (
    <div className='container mx-auto py-6 px-4 max-w-4xl'>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-2xl'>Leaderboard</CardTitle>
              <CardDescription>
                Top performers in {selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)}
              </CardDescription>
            </div>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select skill' />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[80px]'>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className='text-right'>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((item, index) => {
                const { username, score } = item.entry;
                return (
                  <TableRow
                    key={username}
                    className='cursor-pointer hover:bg-accent/50'
                    onClick={() => handleUserCardClick(username)}>
                    <TableCell className='font-medium'>
                      <div className='flex justify-center items-center'>{getRankIcon(index)}</div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-3'>
                        <Avatar className='h-8 w-8 border border-border'>
                          <AvatarFallback className='bg-primary/10 text-primary'>
                            {username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{username}</div>
                          {item.user && item.user.name && (
                            <div className='text-xs text-muted-foreground'>{item.user.name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Badge variant='secondary' className='text-md font-mono'>
                        {score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {entries.length === 0 && (
            <div className='text-center py-6 text-muted-foreground'>
              No data available for this skill yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
