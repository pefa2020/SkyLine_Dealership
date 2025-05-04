import "../styles/PurchasePage.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DealershipNavbar from "../components/DealershipNavbarLogged";
import { Container } from "react-bootstrap";
import carMakeImages from "../components/carMakeImages"; // Adjust the path as needed

function PurchasePage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [carDetails, setCarDetails] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/vehicleDetails/${vehicleId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCarDetails(data.carDetails);
        } else {
          throw new Error("Vehicle details not found");
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    };

    fetchCarDetails();
  }, [vehicleId]);

  const handleNegotiate = () => {
    navigate(`/negotiate/${vehicleId}`);
  };

  const handlePurchase = () => {
    navigate("/payment", { state: { data: { carDetails } } });
  };

  if (!carDetails) {
    return <div>Loading...</div>;
  }

  const { make, model, year, price } = carDetails;
  const makeKey = make.toLowerCase();
  const imageSrc = carMakeImages[makeKey]?.main || carMakeImages.default;

  return (
    <div>
      <DealershipNavbar />
      <Container className="purchase-page-container">
        <h1>Purchase Your Car</h1>
        <div className="purchase-page-vehicle-info">
          <img
            src={imageSrc}
            alt={`${make} Main View`}
            className="purchase-page-car-image-small"
          />
          <div className="purchase-page-vehicle-details">
            <h2>
              {make} {model} ({year})
            </h2>
            <p>
              <strong>Price:</strong> ${price}
            </p>
            <button
              className="btn-primary"
              onClick={handlePurchase}
              id="purchasePagePurchaseButton"
            >
              Purchase
            </button>
            <button
              className="btn-secondary"
              onClick={handleNegotiate}
              id="purchasePageNegotiateButton"
            >
              Negotiate
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PurchasePage;
