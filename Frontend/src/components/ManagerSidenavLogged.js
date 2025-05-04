import React from 'react';
import '../styles/DealershipNavbar.css';
import { AiFillHome } from 'react-icons/ai';
import { RiAccountPinCircleFill } from "react-icons/ri";
import { MdOutlinePayments } from "react-icons/md";
import * as IoIcons from 'react-icons/io';

// Added from here, percy
import {
    BrowserRouter as Router,
    createBrowserRouter,
    RouterProvider,
    Link,
    Route
  } from "react-router-dom";
  import { FaFileContract } from "react-icons/fa";
  // to here

export const ManagerSidenavLogged = [
{ 
    title: 'Home',
    path : '/',
    icon : <AiFillHome/>,
    cName: 'nav-text'
},
{
    title: 'Reports',
    path : '/viewReports', // Consider changing this path if Reports should go to a different page.
    icon : <IoIcons.IoIosPaper/>,
    cName: 'nav-text'
},
{
    title: 'Inventory',
    path : '/ManagerInventory',
    icon : <IoIcons.IoIosPaper/>,
    cName: 'nav-text'
},
// Added entry for Negotiation Page
{
    title: 'Negotiations',
    path : '/ManagerNegotiation',
    icon : <RiAccountPinCircleFill />, // Change this icon as needed
    cName: 'nav-text'
},
{
    title: 'Loans and Contracts',
    path : '/managerLoansAndContracts',
    icon : <FaFileContract/>,
    cName: 'nav-text'
}
]
