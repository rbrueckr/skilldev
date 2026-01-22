import React from 'react';
import './index.css';
import { Outlet } from 'react-router-dom';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';

/**
 * Main component represents the layout of the main page, including a collapsible sidebar and the main content area.
 */
const Layout = () => (
  <>
    <Header />
    <div className='flex h-screen'>
      <SideBarNav />
      <main className='flex-1 ml-[70px] overflow-auto transition-all pt-2 px-4'>
        <Outlet />
      </main>
    </div>
  </>
);

export default Layout;
