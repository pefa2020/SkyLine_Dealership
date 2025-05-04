import React, { useEffect, useState } from 'react';
import VehicleCard from './VehicleCard';
import '../styles/VehicleGrid.css';

function VehicleGrid({ searchQuery, sortOrder }) {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(15);

  useEffect(() => {
    const fetchVehicles = async () => {
      const url = `http://127.0.0.1:5000/inventoryInStock?page=${currentPage}&limit=${vehiclesPerPage}&searchQuery=${encodeURIComponent(searchQuery)}&sortOrder=${sortOrder}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setVehicles(data.inStockInventory);
      } catch (error) {
        console.error('Error fetching data:', error);
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [currentPage, vehiclesPerPage, searchQuery, sortOrder]);

  return (
    <div>
      <div className="vehicle-grid">
        {vehicles.map((vehicleArray, index) => {
          const [vin, make, model, year, price, exteriorColor, interiorColor, wheelDrive, mileage, transmission, seats] = vehicleArray;
          const vehicleObj = {
            vin,
            make,
            model,
            year,
            price,
            exteriorColor,
            interiorColor,
            wheelDrive,
            mileage,
            transmission,
            seats
          };
          return <VehicleCard key={index} vehicle={vehicleObj} />;
        })}
      </div>
      <div className="pagination" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
        {currentPage > 1 && (
          <button onClick={() => setCurrentPage(currentPage - 1)} aria-label="Previous page">&lt;</button>
        )}
        <div style={{ backgroundColor: 'darkgray', padding: '5px 10px', margin: '0 15px' }}>{currentPage}</div>
        <button onClick={() => setCurrentPage(currentPage + 1)} aria-label="Next page">&gt;</button>
      </div>
    </div>
  );
}

export default VehicleGrid;
