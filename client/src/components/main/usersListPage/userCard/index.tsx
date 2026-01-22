import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import './index.css';
import { SafeDatabaseUser } from '../../../../types/types';
import { Avatar, AvatarFallback } from '../../../ui/avatar';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  return (
    <div
      className='bg-card hover:bg-accent/50 rounded-lg border border-border p-4 transition-colors duration-200 cursor-pointer flex justify-between items-center'
      onClick={() => handleUserCardViewClickHandler(user)}>
      <div className='flex items-center space-x-4'>
        <Avatar className='h-10 w-10 border border-border'>
          <AvatarFallback className='bg-primary/10 text-primary'>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className='font-medium text-primary'>{user.username}</div>
          {user.name && <div className='text-sm text-muted-foreground'>{user.name}</div>}
        </div>
      </div>

      <div className='flex items-center text-sm text-muted-foreground'>
        <Calendar className='mr-1 h-4 w-4' />
        <span>Joined {format(new Date(user.dateJoined), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};

export default UserCardView;
