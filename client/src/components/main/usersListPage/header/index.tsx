import React from 'react';
import { Search } from 'lucide-react';
import './index.css';
import useUserSearch from '../../../../hooks/useUserSearch';
import { Input } from '../../../ui/input';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <div className='space-y-4'>
      <div className='flex flex-col items-center mb-2'>
        <h2 className='text-xl font-semibold mb-1'>Users List</h2>
        <p className='text-sm text-muted-foreground'>{userCount} users available</p>
      </div>

      <div className='relative w-full max-w-sm mx-auto'>
        <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          id='user_search_bar'
          placeholder='Search users...'
          type='text'
          value={val}
          onChange={handleInputChange}
          className='w-full pl-10 h-9'
        />
      </div>
    </div>
  );
};

export default UsersListHeader;
