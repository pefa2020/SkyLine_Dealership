import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DealershipNavbar from "../components/ManagerDealershipNavbarLogged";
import "../styles/managerNegotiationsPage.css";

function ManagerNegotiationsPage() {
  const [negotiations, setNegotiations] = useState([]);
  const navigate = useNavigate();
  const managerId = parseInt(localStorage.getItem("user_id"), 10);

  useEffect(() => {
    fetchNegotiations();
  }, [managerId]);

  const fetchNegotiations = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/negotiations/manager/${managerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Negotiations:", data);
        setNegotiations(data);
        localStorage.setItem(
          `manager_negotiations_${managerId}`,
          JSON.stringify(data)
        );
      } else {
        console.error("Failed to fetch negotiations", await response.text());
      }
    } catch (error) {
      console.error("Error fetching negotiations:", error);
    }
  };

  const handleSelectUser = (userId, vin) => {
    navigate(`/chat/${vin}/${managerId}/${userId}`);
  };

  const handlePriceResponse = async (vin, decision) => {
    try {
      const priceResponse = await fetch(
        `http://127.0.0.1:5000/negotiations/price_response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ vin, managerId, response: decision }),
        }
      );

      if (priceResponse.ok && decision === "accepted") {
        const responseData = await priceResponse.json();
        if (responseData.proposed_price) {
          await updateCarPrice(vin, responseData.proposed_price);
          fetchNegotiations(); // Refresh negotiations to update the status
        } else {
          console.error("Proposed price not available:", responseData.message);
        }
      } else {
        console.error(
          "Failed to update price response:",
          await priceResponse.text()
        );
      }
    } catch (error) {
      console.error("Error handling price response:", error);
    }
  };

  const updateCarPrice = async (vin, proposedPrice) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update_car_price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({ vin, proposed_price: proposedPrice })
        }
      );
      if (response.ok) {
        console.log("Price updated successfully.");
        alert("Price updated successfully.");
      } else {
        const errorText = await response.text();
        console.error("Failed to update price:", errorText);
        alert("Failed to update price: " + errorText);
      }
    } catch (error) {
      console.error("Error updating car price:", error);
      alert("Error updating car price: " + error);
    }
  };

  return (
    <div>
      <DealershipNavbar />
      <h1 className="managerNegotiationsHeader">Negotiations</h1>
      <ul className="managerNegotiationsList">
        {negotiations.length > 0 ? (
          negotiations.map((negotiation) => (
            <li
              className="managerNegotiationItem"
              key={`${negotiation.user_id}-${negotiation.vin}`}
            >
              {`${negotiation.user_name} - Vehicle ID: ${negotiation.vin} - Proposed Price: ${negotiation.proposed_price || "None"}`}
              <button
                className="managerNegotiationButton"
                onClick={() => handleSelectUser(negotiation.user_id, negotiation.vin)}
              >
                Chat
              </button>
              {negotiation.price_status === "pending" ? (
                <>
                  <button
                    className="managerNegotiationButton"
                    onClick={() => handlePriceResponse(negotiation.vin, "accepted")}
                  >
                    Accept Price
                  </button>
                  <button
                    className="managerNegotiationButton"
                    onClick={() => handlePriceResponse(negotiation.vin, "rejected")}
                  >
                    Reject Price
                  </button>
                </>
              ) : (
                <span className="managerNegotiationStatus">
                  Status: {negotiation.price_status}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className="managerNoNegotiations">No negotiations found.</li>
        )}
      </ul>
    </div>
  );
}

export default ManagerNegotiationsPage;
