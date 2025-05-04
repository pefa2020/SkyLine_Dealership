import React from 'react';
import { FaHistory, FaTasks} from 'react-icons/fa'
import { IoTicketOutline } from 'react-icons/io5';


export const TechnicianSidenav = [ // export const SideNav =  [
{ 
    title: 'Available Tickets',
    path : '/',
    icon : <FaTasks/>,
    cName: 'nav-text'
},
{
    title: 'My Tickets',
    path : '/mytickets',
    icon : <IoTicketOutline/>,
    cName: 'nav-text'
},
{
    title: 'My History',
    path : '/ticketHistory',
    icon : <FaHistory/>,
    cName: 'nav-text'
}
]