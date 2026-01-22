// src/components/auth/login/index.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { LogIn, Github } from 'lucide-react';
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
import Separator from '../../ui/separator';

const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
    handleGoogleSuccess,
    handleGoogleError,
  } = useAuth('login');

  /**
   * Redirect user to server route that initiates GitHub OAuth
   * e.g. "/users/githubAuth"
   */
  const handleGitHubSignIn = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/user/githubAuth`;
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center mb-4'>
            <img
              src='https://i.postimg.cc/nVBtpnNJ/Skilldev2.png'
              alt='SkillDev Logo'
              className='h-12 w-auto'
            />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>Welcome Back</CardTitle>
          <CardDescription className='text-center'>
            Enter your credentials to access your account
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
                onChange={e => handleInputChange(e, 'username')}
                placeholder='Enter your username'
                required
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password-input'>Password</Label>
              </div>
              <Input
                id='password-input'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => handleInputChange(e, 'password')}
                placeholder='Enter your password'
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
              <LogIn className='mr-2 h-4 w-4' /> Sign In
            </Button>
          </form>

          {err && (
            <div className='mt-4 text-sm font-medium text-destructive text-center'>{err}</div>
          )}

          <div className='mt-4'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <Separator />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
              </div>
            </div>

            {/* Social logins: Google & GitHub */}
            <div className='mt-4 flex items-center justify-center gap-4'>
              {/* Wrap GoogleLogin in a flex container to help align it */}
              <div className='flex items-center h-[44px]'>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              </div>

              {/* Match the height for the GitHub button */}
              <Button
                variant='outline'
                className='h-[44px] flex items-center'
                onClick={handleGitHubSignIn}>
                <Github className='mr-2 h-4 w-4' />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col'>
          <Link to='/signup' className='mx-auto text-sm text-primary hover:underline'>
            Don&apos;t have an account? Sign up here.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
