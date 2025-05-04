import React from 'react';
import '../styles/DealershipNavbar.css';
import { FaCartPlus, FaTasks} from 'react-icons/fa'
import { AiFillHome} from 'react-icons/ai'
import { RiAccountPinCircleFill } from "react-icons/ri";
import { MdOutlinePayments } from "react-icons/md";
import { FaHeart } from 'react-icons/fa';


export const SideNav = [ // export const SideNav =  [
{ 
    title: 'Home',
    path : '/',
    icon : <AiFillHome/>,
    cName: 'nav-text'
},
{
    title: 'Payment History',
    path : '/CustomerPurchaseHistory',
    icon : <MdOutlinePayments/>,
    cName: 'nav-text'
},
{
    title: 'My Account',
    path : '/UserProfileMgmt',
    icon : <RiAccountPinCircleFill/>,
    cName: 'nav-text'
}, 
{
    title: 'My Garage',
    path : '/CustomerGarage',
    icon : <AiFillHome/>,
    cName: 'nav-text'
},
{
    title: 'Favorites',
    icon: <FaHeart />,  // Make sure to import FaHeart from 'react-icons/fa'
    path: '/favorites',
    cName: 'nav-text'
},
{
    title: 'My Appointments',
    path : '/appointments',
    icon : <FaTasks/>,
    cName: 'nav-text'
}
]