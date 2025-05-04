import {React, useState} from 'react';
import './index.css';
import FilterBar from './components/FilterBar';
import VehicleGrid from './components/VehicleGrid'; // Make sure this is correctly pointing to where your VehicleGrid component is located.
import DealershipNavbar from './components/DealershipNavbar';

import DealershipNavBarLogged from './components/DealershipNavbarLogged';
import { useLocation } from 'react-router-dom';

function App() {

  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const { previousUrl } = location.state || {};
  console.log(previousUrl);

  const userId = localStorage.getItem("user_id");
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

export default App;

