// src/components/verifySkills/VerifySkills.tsx

import React from 'react';
import { Trophy, ChevronLeft, Award, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useVerifySkills from '../../../hooks/useVerifySkills';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import Separator from '../../ui/separator';

const VerifySkillsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  // Use your existing custom hook, but only for fetching user data
  // and controlling selectedSkill/difficulty.
  const { userData, selectedSkill, setSelectedSkill, errorMessage } = useVerifySkills(username);

  if (!userData) {
    return (
      <div className='container mx-auto py-12 px-4 max-w-lg'>
        <Card>
          <CardContent className='flex items-center justify-center py-10'>
            <div className='animate-pulse space-y-2'>
              <div className='h-8 w-32 bg-muted rounded mx-auto'></div>
              <div className='h-4 w-48 bg-muted rounded mx-auto'></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // When the user clicks "Start Challenge," we navigate to the
  // /challenges route, passing along the skill & difficulty in `state`.
  const handleStartChallenge = () => {
    if (!selectedSkill) {
      return;
    }
    navigate('/challenges', {
      state: {
        category: selectedSkill,
        difficulty: '',
      },
    });
  };

  const unverifiedSkills = userData.skills?.filter(skill => !skill.verified) || [];

  return (
    <div className='container mx-auto py-8 px-4 max-w-lg'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Award className='h-5 w-5 text-primary' />
            <CardTitle>Verify Skills</CardTitle>
          </div>
          <CardDescription>
            Complete challenges to verify your skills and showcase your expertise
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className='pt-6'>
          {errorMessage && (
            <Alert variant='destructive' className='mb-6'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {unverifiedSkills.length === 0 ? (
            <div className='text-center py-6 text-muted-foreground'>
              <Trophy className='h-12 w-12 mx-auto mb-3 opacity-20' />
              <p>All your skills are already verified!</p>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium mb-2'>Select a Skill to Verify</h4>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder='Choose a skill' />
                  </SelectTrigger>
                  <SelectContent>
                    {unverifiedSkills.map(skill => (
                      <SelectItem key={skill.skillName} value={skill.skillName}>
                        {skill.skillName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-muted/50 p-4 rounded-md text-sm'>
                <p className='mb-2 font-medium'>What to expect:</p>
                <p className='text-muted-foreground'>
                  You&apos;ll be presented with a series of challenges related to your selected
                  skill. Successfully completing these challenges will verify your skill on your
                  profile.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between pt-2'>
          <Button variant='outline' onClick={() => navigate(-1)}>
            <ChevronLeft className='h-4 w-4 mr-1' /> Back
          </Button>

          <Button
            onClick={handleStartChallenge}
            disabled={!selectedSkill || unverifiedSkills.length === 0}>
            <Trophy className='h-4 w-4 mr-1' /> Start Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifySkillsPage;
