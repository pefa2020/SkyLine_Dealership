import {React, useState} from 'react';
import './index.css';
import FilterBar from './components/FilterBar';
import VehicleGrid from './components/VehicleGrid'; // Make sure this is correctly pointing to where your VehicleGrid component is located.
import DealershipNavbar from './components/DealershipNavbar';

// Added from here
import { useParams} from 'react-router-dom';

import DealershipNavBarLogged from './components/DealershipNavbarLogged';
import { useLocation } from 'react-router-dom';

function Browsing() {

  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const { previousUrl } = location.state || {};
  console.log(previousUrl);

  const { userId } = useParams();
  console.log("User id is: ", userId);


  return (
      <div>
      <div className="app">
      {/* User will see Log In button if they are not logged in*/}
      {userId == undefined && <DealershipNavbar />}
      {/* User will see Log Out button if they are logged in*/}
      {userId != undefined && <DealershipNavBarLogged userId={userId} />}
      


      {/* Old stuff (by percy)
       <FilterBar />
      <VehicleGrid /> 
      <Pagination /> */}
      <FilterBar setSearchQuery={setSearchQuery} /> {/* Pass setSearchQuery as a prop */}
      <VehicleGrid searchQuery={searchQuery} userId={userId} />
      {/* Removed Pagination component */}
    </div>
      </div>
  );
}

export default Browsing;

{/* 
<Route path="/" exact element={<LandingPage/>} />
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
<Route path="/Landing" element={<LandingPage/>} />
<Route path="/ServiceApptPage/:userId/:carId" element={<ServiceApptPage />} />
<Route path="/Payment" element={<PaymentProcess/>} />
<Route path="/Appointments/:user_id" element={<AppointmentsPage/>} />
<Route path="/ManagerPage/:manager_id" element={<ManagerPage />} /> 
*/}