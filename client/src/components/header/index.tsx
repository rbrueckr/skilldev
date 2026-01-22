import React from 'react';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  return (
    <div id='header' className='header'>
      <div className='logo-container'>
        <img
          src='https://i.postimg.cc/nVBtpnNJ/Skilldev2.png'
          alt='Skilldev Logo'
          className='skilldev-logo'
        />
      </div>
      <input
        id='searchBar'
        placeholder='Search Questions...'
        type='text'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <div className='user-controls'>
        <button
          className='view-profile-button'
          onClick={() => navigate(`/user/${currentUser.username}`)}>
          View Profile
        </button>
        <button onClick={handleSignOut} className='logout-button'>
          Log out
        </button>
      </div>
    </div>
  );
};

export default Header;
