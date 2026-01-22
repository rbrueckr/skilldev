'use client';

import React, { useState } from 'react';
import { MessageSquare, Tag, Users, Home, Award, Gamepad2, ChevronsUpDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import './sidebar.css';

// Animation variants
const sidebarVariants = {
  open: {
    width: '240px',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  closed: {
    width: '55px',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const contentVariants = {
  open: { display: 'block', opacity: 1 },
  closed: { display: 'block', opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

/**
 * The SideBarNav component has menu items: "Questions", "Tags", "Messaging", "Users", "Games", and "Leaderboard".
 * It highlights the currently selected item based on the active page and
 * provides a collapsible interface that expands on hover.
 */
const SideBarNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const location = useLocation();

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <motion.div
      className='sideBarNav fixed left-0 z-40 h-full shrink-0 border-r'
      initial={isCollapsed ? 'closed' : 'open'}
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}>
      <motion.div
        className='relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white transition-all'
        variants={contentVariants}>
        {/* Logo and Title */}
        <div className='flex items-center justify-center h-16 border-b'>
          <div
            className={cn(
              'flex items-center transition-all duration-300',
              isCollapsed ? 'justify-center w-full' : 'pl-4',
            )}
            style={{ minWidth: isCollapsed ? '100%' : 'auto' }}>
            <div className='shadcn-logo' />
            {!isCollapsed && <span className='ml-2 text-base font-bold text-nowrap'>Explore</span>}
          </div>
        </div>

        <motion.ul variants={staggerVariants} className='flex h-full flex-col'>
          <div className='flex grow flex-col items-center'>
            <div className='flex h-full w-full flex-col'>
              <div className='flex grow flex-col p-2'>
                <NavLink
                  to='/home'
                  id='menu_questions'
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                      isActive && 'bg-muted text-blue-600',
                    )
                  }>
                  <div className='flex items-center'>
                    <Home className='h-5 w-5' />
                    <motion.li variants={variants}>
                      {!isCollapsed && <p className='ml-2 text-base font-medium'>Questions</p>}
                    </motion.li>
                  </div>
                </NavLink>

                <NavLink
                  to='/tags'
                  id='menu_tag'
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                      isActive && 'bg-muted text-blue-600',
                    )
                  }>
                  <div className='flex items-center'>
                    <Tag className='h-5 w-5' />
                    <motion.li variants={variants}>
                      {!isCollapsed && <p className='ml-2 text-base font-medium'>Tags</p>}
                    </motion.li>
                  </div>
                </NavLink>

                <div className='relative'>
                  <NavLink
                    to='/messaging'
                    id='menu_messaging'
                    className={({ isActive }) =>
                      cn(
                        'flex h-10 w-full flex-row items-center justify-between rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                        (isActive || location.pathname.includes('/messaging/')) &&
                          'bg-muted text-blue-600',
                      )
                    }
                    onClick={!isCollapsed ? toggleOptions : undefined}>
                    <div className='flex items-center'>
                      <MessageSquare className='h-5 w-5' />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className='ml-2 text-base font-medium'>Messaging</p>}
                      </motion.li>
                    </div>
                    {!isCollapsed && (
                      <ChevronsUpDown className='h-5 w-5 text-muted-foreground/50' />
                    )}
                  </NavLink>

                  {showOptions && !isCollapsed && (
                    <div className='ml-8 pl-2 border-l'>
                      <NavLink
                        to='/messaging'
                        className={({ isActive }) =>
                          cn(
                            'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                            isActive &&
                              location.pathname === '/messaging' &&
                              'bg-muted text-blue-600',
                          )
                        }>
                        <span className='text-base'>Global Messages</span>
                      </NavLink>
                      <NavLink
                        to='/messaging/direct-message'
                        className={({ isActive }) =>
                          cn(
                            'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                            isActive && 'bg-muted text-blue-600',
                          )
                        }>
                        <span className='text-base'>Direct Messages</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink
                  to='/users'
                  id='menu_users'
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                      isActive && 'bg-muted text-blue-600',
                    )
                  }>
                  <div className='flex items-center'>
                    <Users className='h-5 w-5' />
                    <motion.li variants={variants}>
                      {!isCollapsed && <p className='ml-2 text-base font-medium'>Users</p>}
                    </motion.li>
                  </div>
                </NavLink>

                <NavLink
                  to='/games'
                  id='menu_games'
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                      isActive && 'bg-muted text-blue-600',
                    )
                  }>
                  <div className='flex items-center'>
                    <Gamepad2 className='h-5 w-5' />
                    <motion.li variants={variants}>
                      {!isCollapsed && <p className='ml-2 text-base font-medium'>Games</p>}
                    </motion.li>
                  </div>
                </NavLink>

                <NavLink
                  to='/leaderboard'
                  id='menu_leaderboard'
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary',
                      isActive && 'bg-muted text-blue-600',
                    )
                  }>
                  <div className='flex items-center'>
                    <Award className='h-5 w-5' />
                    <motion.li variants={variants}>
                      {!isCollapsed && <p className='ml-2 text-base font-medium'>Leaderboard</p>}
                    </motion.li>
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

export default SideBarNav;
