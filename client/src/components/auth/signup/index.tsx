import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Label from '../../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import Checkbox from '../../ui/checkbox';

/**
 * Renders a signup form with username, password, and password confirmation inputs,
 * password visibility toggle, error handling, and a link to the login page.
 */
const Signup = () => {
  const {
    username,
    password,
    passwordConfirmation,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('signup');

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center mb-4'>
            <img
              src='https://i.postimg.cc/nVBtpnNJ/Skilldev2.png'
              alt='SkillDev Logo'
              className='h-10 w-auto'
            />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>Create an Account</CardTitle>
          <CardDescription className='text-center'>
            Enter your information to sign up for a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username-input'>Username</Label>
              <Input
                id='username-input'
                type='text'
                value={username}
                onChange={event => handleInputChange(event, 'username')}
                placeholder='Enter your username'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name-input'>Name</Label>
              <Input
                id='name-input'
                type='text'
                onChange={event => handleInputChange(event, 'name')}
                placeholder='Enter your name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password-input'>Password</Label>
              <Input
                id='password-input'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => handleInputChange(event, 'password')}
                placeholder='Enter your password'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirm-password-input'>Confirm Password</Label>
              <Input
                id='confirm-password-input'
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={e => handleInputChange(e, 'confirmPassword')}
                placeholder='Confirm your password'
                required
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='showPasswordToggle'
                checked={showPassword}
                onCheckedChange={togglePasswordVisibility}
              />
              <label
                htmlFor='showPasswordToggle'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                Show password
              </label>
            </div>

            <Button type='submit' className='w-full'>
              <UserPlus className='mr-2 h-4 w-4' /> Sign Up
            </Button>
          </form>

          {err && (
            <div className='mt-4 text-sm font-medium text-destructive text-center'>{err}</div>
          )}
        </CardContent>
        <CardFooter className='flex flex-col'>
          <Link to='/' className='mx-auto text-sm text-primary hover:underline'>
            Already have an account? Login here.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
