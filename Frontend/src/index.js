import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

import { useParams, useLocation} from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ManagerPage from './pages/ManagerPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import ManageAccounts from './pages/ManageAccounts';
import PurchasePage from './pages/PurchasePage'; 

import ViewReports from './pages/ViewReports';



//Added by Krishna
import AppointmentsPage from './pages/AppointmentsPage'

import LandingPage from './pages/LandingPage';
import ServiceApptPage from './pages/ServiceApptPage';
import VehicleDetails from './pages/VehicleDetails';
import PaymentProcess from './pages/PaymentProcess';
import MyTicketsHistory from './pages/MyTicketHistory';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import CustomerPurchaseHistory from './pages/CustomerPurchaseHistory';
import UserProfileMgmt from './pages/UserProfileMgmt';
// Added from here 
import CustomerGarage from './pages/CustomerGarage';

import TechnicianAvailable from './pages/TechnicianAvailable';
import MyTickets from './pages/MyTickets';
import ManagerInventory from './pages/ManagerInventory';
import ManagerUpdateCar from './pages/ManagerUpdateCar';
import ManagerAddCar from './pages/ManagerAddCar';
import ManagerAddCarMMY from './pages/ManagerAddCarMMY';

import NegotiationPage from './pages/NegotiationPage';
import ManagerNegotiationPage from './pages/ManagerNegotiationPage'; // Ensure this path is correct

  

import ChatPage from './pages/ChatPage'; // Import the ChatPage component
import ManagerLoanNSign from './pages/ManagerLoanNSign';


function RouteHandler() {
  const location = useLocation();
  const jobTitle = localStorage.getItem('job_title')

  // Your logic that uses location and userId

  if(jobTitle == 'Manager'){
    return (<Routes>
    <Route path="/" exact element={<ManagerPage/>} />
    <Route path="/viewReports" element={<ViewReports />} />
    <Route path="/ManagerUpdateCar/:userId" element={<ManagerUpdateCar/>}/>
    <Route path="/ManagerNegotiation" element={<ManagerNegotiationPage />} />
    <Route path="/ManagerAddCarMMY/:userId" element={<ManagerAddCarMMY/>}/>
    <Route path="/ManagerInventory" element={<ManagerInventory/>} />
    <Route path="/ManagerAddCar/:userId" element={<ManagerAddCar/>}/>
    <Route path='/managerLoansAndContracts' element={<ManagerLoanNSign />}/>
    <Route path="/chat/:vehicleId/:managerId/:userId" element={<ChatPage />} />

    </Routes>);
  }
  else if (jobTitle == 'Customer') {
    return <Routes>
    <Route path="/" exact element={<App/>} />
    <Route path="/App" exact element={<App/>} />
    <Route path="/Login" element={<Login/>} />
    <Route path="/vehicleDetails/:vehicleId" element={<VehicleDetails />} />
    <Route path="/vehicleDetails/:vehicleId/:userId" element={<VehicleDetails />} />
    <Route path="/SignUp" element={<SignUp/>} />
    <Route path="/CustomerPurchaseHistory" element={<CustomerPurchaseHistory />} />
    <Route path="/CustomerPurchaseHistory/:userId" element={<CustomerPurchaseHistory />} />
    <Route path="/UserProfileMgmt" element={<UserProfileMgmt/>} />
    <Route path="/UserProfileMgmt/:userId" element={<UserProfileMgmt/>} />
    <Route path="/CustomerGarage" element={<CustomerGarage />} />
    <Route path="/CustomerGarage/:userId" element={<CustomerGarage />} />
    <Route path="/ServiceApptPage/:userId/:carId" element={<ServiceApptPage />} />
    <Route path="/Payment" element={<PaymentProcess/>} />
    <Route path="/Appointments" element={<AppointmentsPage/>} />
    <Route path="/negotiate/:vehicleId" element={<NegotiationPage />} />
    <Route path="/favorites"  element= {<FavoritesPage />} />
    <Route path="/purchase/:vehicleId" element={<PurchasePage />} />


    </Routes>
  }
  else if(jobTitle == 'Technician'){
    return <Routes>
    <Route path="/" element={<TechnicianAvailable/>} />
    <Route path="/mytickets" element={<MyTickets/>}/>
    <Route path="/ticketHistory" element={<MyTicketsHistory/>} />

    </Routes>
  }
  else if (jobTitle =='Admin'){
    return <Routes>
    <Route path="/viewReports" element={<ViewReports />} />
    <Route path="/" element={<AdminPage />} />
    <Route path="/adminDashboard" element={<AdminPage/>}/>
    <Route path="/manageAccounts" element={<ManageAccounts />} />
    </Routes>
  }
  else {
    return (<Routes>
    <Route path="/" element={<LandingPage/>} />
    <Route path="/Skyline" exact element={<App/>} />
    <Route path="/Login" element={<Login/>} />
    <Route path="/SignUp" element={<SignUp/>} />
    <Route path="/vehicleDetails/:vehicleId" element={<VehicleDetails />} />
    <Route path="/vehicleDetails/:vehicleId/:userId" element={<VehicleDetails />} />
    </Routes>);
  }

  return null; // or any other appropriate return value
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(  
  <React.StrictMode>
    <BrowserRouter>
    <link href='https://fonts.googleapis.com/css?family=Abel' rel='stylesheet'></link>

  <RouteHandler />
  </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
