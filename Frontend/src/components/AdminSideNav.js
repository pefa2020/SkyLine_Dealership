import React from 'react';
import { AiOutlineUserAdd, AiOutlineFileText } from 'react-icons/ai';
import { BsFillPersonLinesFill } from 'react-icons/bs';  // Suggested icon for managing accounts

export const AdminSideNav = [
  {
    title: 'Create Account',
    path: '/',
    icon: <AiOutlineUserAdd />,
    cName: 'nav-text'
  },
  {
    title: 'Manage Accounts',
    path: '/manageAccounts',
    icon: <BsFillPersonLinesFill />,
    cName: 'nav-text'
  },
  {
    title: 'View Reports',
    path: '/viewReports',
    icon: <AiOutlineFileText />,
    cName: 'nav-text'
  }
];
