import React, { useState, useEffect } from 'react';
import '../styles/ComparePopup.css'; // Ensure this CSS file exists and is correct

// Car images import, ensure paths are correct
import defaultVehicleImage from '../images/default.png';
import audiImage from '../images/cars/audi.png';
import bmwImage from '../images/cars/bmw.png';
import chevroletImage from '../images/cars/chevrolet.png';
import fordImage from '../images/cars/ford.png';
import gmcImage from '../images/cars/gmc.png';
import hondaImage from '../images/cars/honda.png';
import infinitiImage from '../images/cars/infiniti.png';
import jaguarImage from '../images/cars/jaguar.png';
import jeepImage from '../images/cars/jeep.png';
import nissanImage from '../images/cars/nissan.png';
import porscheImage from '../images/cars/porsche.png';

const carImages = {
  audi: audiImage,
  bmw: bmwImage,
  chevrolet: chevroletImage,
  ford: fordImage,
  gmc: gmcImage,
  honda: hondaImage,
  infiniti: infinitiImage,
  jaguar: jaguarImage,
  jeep: jeepImage,
  nissan: nissanImage,
  porsche: porscheImage,
  default: defaultVehicleImage
};

function ComparePopup({ cars, onClose }) {
    const [vehicleDetails, setVehicleDetails] = useState([]);

    useEffect(() => {
        const fetchDetails = async () => {
            const details = await Promise.all(cars.map(async (car) => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/vehicleDetails/${car.vin}`);
                    if (response.ok) {
                        const data = await response.json();
                        return data.carDetails; // Assuming API returns car details in this format
                    } else {
                        console.error('Failed to fetch car details:', response.statusText);
                        return null;
                    }
                } catch (error) {
                    console.error('Error fetching car details:', error);
                    return null;
                }
            }));
            setVehicleDetails(details.filter(detail => detail !== null));
        };

        fetchDetails();
    }, [cars]); // Rerun the effect if cars array changes

    return (
        <div className="compare-popup-overlay">
            <div className="compare-popup">
                <button onClick={onClose} className="compare-popup-close">&times;</button>
                <div className="compare-vehicle-container">
                    {vehicleDetails.map((detail, index) => {
                        const imageSrc = carImages[detail.make.toLowerCase().replace(/\s+/g, '')] || carImages.default;
                        return (
                            <div key={index} className="compare-vehicle-details">
                                <img src={imageSrc} alt={`${detail.make} ${detail.model}`} className="compare-vehicle-image" />
                                <h3>{`${detail.make} ${detail.model} - ${detail.year}`}</h3>
                                <ul>
                                    <li>Price: ${detail.price}</li>
                                    <li>Transmission: {detail.transmission}</li>
                                    <li>Drive Type: {detail.wheel_drive}</li>
                                    <li>Interior Color: {detail.interior_color}</li>
                                    <li>Exterior Color: {detail.exterior_color}</li>
                                    <li>Keys Given: {detail.keys_given}</li>
                                    <li>Seats: {detail.seats}</li>
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ComparePopup;