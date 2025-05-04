import React, { useEffect, useState } from 'react';
import DealershipNavbar from '../components/DealershipNavbarLogged'; // Make sure the path is correct
import VehicleCard from '../components/VehicleCard'; // Make sure the path is correct
import { FaHeart } from 'react-icons/fa'; // Importing a heart icon
import CompareButton from '../components/CompareButton'; // Import the CompareButton
import ComparePopup from '../components/ComparePopup';
import '../styles/FavoritesPage.css'; 

function FavoritesPage() {
  const userId = localStorage.getItem("user_id");
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [selectedCars, setSelectedCars] = useState([]);
  const [showComparePopup, setShowComparePopup] = useState(false);


  useEffect(() => {
    const fetchFavoriteCars = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch('http://localhost:5000/favoriteCars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userID: userId })
        });
        if (response.ok) {
          const data = await response.json();
          setFavoriteCars(data.favoriteCars);
        } else {
          throw new Error('Failed to fetch favorite cars');
        }
      } catch (error) {
        console.error('Error fetching favorite cars', error);
      }
    };

    fetchFavoriteCars();
  }, [userId]);

  const handleSelectCar = (car) => {
    const isAlreadySelected = selectedCars.find(c => c.vin === car.vin);
    if (isAlreadySelected) {
      setSelectedCars(selectedCars.filter(c => c.vin !== car.vin));
    } else if (selectedCars.length < 2) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const handleClosePopup = () => {
    setShowComparePopup(false);
};

  const handleCompareClick = () => {
    if (selectedCars.length === 2) {
        setShowComparePopup(true);
    } else {
        alert('Please select exactly two cars to compare.');
    }
};

return (
  <div>
      <DealershipNavbar />
      <div className="favorites-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1><FaHeart style={{ color: 'blue', marginRight: '20px', fontSize: '30px' }} />My Favorites</h1>
              <CompareButton onCompare={handleCompareClick} />
          </div>
          {favoriteCars.length > 0 ? (
              <div className="favorites-list">
                  {favoriteCars.map((vehicle, index) => (
                      <VehicleCard
                          key={index}
                          vehicle={vehicle}
                          userId={userId}
                          onSelect={handleSelectCar}
                          isChecked={selectedCars.some(c => c.vin === vehicle.vin)}
                          showCheckbox={true}
                      />
                  ))}
              </div>
          ) : (
              <p>No favorite cars found.</p>
          )}
            {showComparePopup && <ComparePopup cars={selectedCars} onClose={handleClosePopup} />}
      </div>
  </div>
);
}

export default FavoritesPage;
