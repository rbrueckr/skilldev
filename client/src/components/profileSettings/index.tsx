import React from 'react';
import {
  PencilIcon,
  CheckIcon,
  X,
  User,
  Calendar,
  Award,
  Trash,
  PlusCircle,
  XCircle,
  ThumbsUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useProfileSettings from '../../hooks/useProfileSettings';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import Label from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Separator from '../ui/separator';
import Checkbox from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();

  const {
    userData,
    currentUser,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    editNameMode,
    newName,
    setEditNameMode,
    setNewName,
    handleUpdateDisplayName,

    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    addNewSkill,
    verifySkills,
    addSkillMode,
    setAddSkillMode,
    newSkill,
    setNewSkill,
    removeSkill,
    handleAddEndorsement,
  } = useProfileSettings();

  if (loading) {
    return (
      <div className='container mx-auto py-6 px-4 max-w-4xl'>
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

  return (
    <div className='container mx-auto py-6 px-4 max-w-4xl'>
      {successMessage && (
        <Alert className='mb-4'>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {userData && (
        <div className='grid grid-cols-1 gap-6'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16 border border-border'>
                  <AvatarFallback className='bg-primary/10 text-primary text-xl'>
                    {userData.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className='text-2xl'>{userData.name || userData.username}</CardTitle>
                  <CardDescription className='flex items-center gap-1'>
                    <User className='h-3.5 w-3.5' />
                    <span>{userData.username}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <Tabs defaultValue='profile' className='px-1'>
              <TabsList className='flex justify-between items-center w-full mt-4 py-4 px-12 bg-gray-200'>
                <TabsTrigger value='profile'>Profile</TabsTrigger>
                <TabsTrigger value='skills'>Skills</TabsTrigger>
                {canEditProfile && <TabsTrigger value='settings'>Settings</TabsTrigger>}
              </TabsList>

              <TabsContent value='profile' className='space-y-6 py-6 px-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <div className='flex items-center mb-2'>
                      <h4 className='text-sm font-medium'>Display Name</h4>
                      {canEditProfile && !editNameMode && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='ml-1 px-1.5 h-6'
                          onClick={() => {
                            setEditNameMode(true);
                            setNewName(userData.name || '');
                          }}>
                          <PencilIcon className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                    {!editNameMode ? (
                      <div className='flex items-center'>
                        <p className='text-base'>{userData.name || 'No display name yet.'}</p>
                      </div>
                    ) : (
                      <div className='flex gap-2 items-center'>
                        <Input
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder='Enter your display name'
                        />
                        <Button size='sm' onClick={handleUpdateDisplayName}>
                          <CheckIcon className='h-4 w-4' />
                        </Button>
                        <Button size='sm' variant='ghost' onClick={() => setEditNameMode(false)}>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className='text-sm font-medium mb-2'>Member Since</h4>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span>
                        {userData.dateJoined
                          ? new Date(userData.dateJoined).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='flex items-center mb-2'>
                    <h4 className='text-sm font-medium'>Biography</h4>
                    {canEditProfile && !editBioMode && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='ml-1 px-1.5 h-6'
                        onClick={() => {
                          setEditBioMode(true);
                          setNewBio(userData.biography || '');
                        }}>
                        <PencilIcon className='h-3 w-3' />
                      </Button>
                    )}
                  </div>

                  {!editBioMode ? (
                    <p className='text-muted-foreground text-sm'>
                      {userData.biography || 'No biography yet.'}
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      <Textarea
                        value={newBio}
                        onChange={e => setNewBio(e.target.value)}
                        placeholder='Tell us about yourself...'
                        className='min-h-[100px]'
                      />
                      <div className='flex gap-2 justify-end'>
                        <Button size='sm' onClick={handleUpdateBiography}>
                          Save
                        </Button>
                        <Button size='sm' variant='ghost' onClick={() => setEditBioMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='skills' className='py-6 px-4'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-medium'>Skills & Endorsements</h4>
                    {canEditProfile && !addSkillMode && (
                      <Button variant='outline' size='sm' onClick={() => setAddSkillMode(true)}>
                        <PlusCircle className='h-4 w-4 mr-1' /> Add Skill
                      </Button>
                    )}
                  </div>

                  {addSkillMode ? (
                    <div className='flex flex-col gap-2'>
                      <Select value={newSkill} onValueChange={setNewSkill}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a skill' />
                        </SelectTrigger>
                        <SelectContent>
                          {verifySkills.map(skill => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className='flex gap-2 mt-2'>
                        <Button size='sm' onClick={addNewSkill} disabled={!newSkill}>
                          Save
                        </Button>
                        <Button size='sm' variant='ghost' onClick={() => setAddSkillMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {userData?.skills && userData.skills.length > 0 ? (
                        <div className='space-y-3'>
                          {userData.skills.map(skill => {
                            const alreadyEndorsed = skill.endorsements?.includes(
                              currentUser.username,
                            );
                            return (
                              <div
                                key={skill.skillName}
                                className='flex items-center justify-between px-3 bg-muted/50 rounded-md'>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant={skill.verified ? 'default' : 'outline'}
                                    className='capitalize'>
                                    {skill.skillName}
                                    {skill.verified && <CheckIcon className='h-3 w-3 ml-1' />}
                                  </Badge>
                                  {skill.endorsements && skill.endorsements.length > 0 && (
                                    <div className='text-xs text-muted-foreground flex items-center'>
                                      <ThumbsUp className='h-3 w-3 mr-1' />
                                      {skill.endorsements.length}
                                    </div>
                                  )}
                                </div>
                                <div className='flex gap-2'>
                                  {!canEditProfile && !alreadyEndorsed && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() => handleAddEndorsement(skill.skillName)}>
                                      <ThumbsUp className='h-3 w-3 mr-1' /> Endorse
                                    </Button>
                                  )}
                                  {canEditProfile && (
                                    <Button
                                      size='sm'
                                      variant='ghost'
                                      onClick={() => removeSkill(skill.skillName)}>
                                      <XCircle className='h-3.5 w-3.5 mr-1' /> Remove
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-muted-foreground'>
                          No skills added yet.
                        </div>
                      )}

                      {canEditProfile && userData?.skills && userData.skills.length > 0 && (
                        <div className='flex justify-center mt-4'>
                          <Button
                            variant='secondary'
                            onClick={() => navigate(`/verifySkills/${userData?.username}`)}>
                            <Award className='h-4 w-4 mr-2' /> Verify Skills
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              {canEditProfile && (
                <TabsContent value='settings' className='py-6 px-4'>
                  <div className='space-y-6'>
                    <div className='space-y-3'>
                      <h4 className='text-sm font-medium'>Change Password</h4>
                      <div className='space-y-2'>
                        <div className='space-y-1'>
                          <Label htmlFor='password'>New Password</Label>
                          <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder='Enter new password'
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='confirmPassword'>Confirm Password</Label>
                          <Input
                            id='confirmPassword'
                            type={showPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            placeholder='Confirm new password'
                          />
                        </div>
                        <div className='flex items-center space-x-2 pt-1'>
                          <Checkbox
                            id='showPassword'
                            checked={showPassword}
                            onCheckedChange={togglePasswordVisibility}
                          />
                          <label
                            htmlFor='showPassword'
                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Show password
                          </label>
                        </div>
                        <Button onClick={handleResetPassword} className='mt-2'>
                          Reset Password
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className='space-y-3'>
                      <h4 className='text-sm font-medium text-destructive'>Danger Zone</h4>
                      <p className='text-sm text-muted-foreground'>
                        Permanently delete your account and all of your content.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='destructive'>
                            <Trash className='h-4 w-4 mr-2' /> Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant='ghost' onClick={() => setShowConfirmation(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant='destructive'
                              onClick={pendingAction || handleDeleteUser}>
                              Delete Account
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
