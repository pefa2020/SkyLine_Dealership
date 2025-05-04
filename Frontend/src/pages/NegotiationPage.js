import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/negotiationPage.css"; // Adjust the path according to your project structure
import DealershipNavbarLogged from "../components/DealershipNavbarLogged";

function NegotiationPage() {
  const { vehicleId } = useParams();
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(
    localStorage.getItem(`selectedManager_${vehicleId}`)
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const userId = parseInt(localStorage.getItem("user_id"), 10);

  useEffect(() => {
    if (selectedManager) {
      fetchMessages(); // Ensure messages are fetched whenever the selected manager changes
    }
  }, [selectedManager, vehicleId]); // Fetch messages when vehicleId or selectedManager changes

  const fetchMessages = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/messages/${vehicleId}/${selectedManager}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages:", await response.text());
      }
    } catch (error) {
      console.error("Fetch messages failed:", error);
    }
  };

  useEffect(() => {
    if (!selectedManager) {
      fetchManagers();
    }
  }, [selectedManager]);

  const fetchManagers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/managers");
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      } else {
        console.error("Failed to fetch managers:", await response.text());
      }
    } catch (error) {
      console.error("Fetch managers failed:", error);
    }
  };

  const handleSelectManager = async (managerId) => {
    setSelectedManager(managerId);
    localStorage.setItem(`selectedManager_${vehicleId}`, managerId);
    startNegotiation(managerId); // Start negotiation when a manager is selected
  };

  const startNegotiation = async (managerId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch("http://127.0.0.1:5000/negotiations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, managerId, vehicleId }),
      });
      if (response.ok) {
        fetchMessages(); // Fetch messages after starting the negotiation
        console.log("Negotiation started successfully");
      } else {
        console.error("Failed to start negotiation:", await response.text());
      }
    } catch (error) {
      console.error("Start negotiation failed:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedManager || isNaN(userId) || !input.trim()) return;
    const token = localStorage.getItem("access_token");
    const messageData = {
      from_id: userId,
      to_id: selectedManager,
      vehicle_id: vehicleId,
      description: input,
    };
    const response = await fetch("http://127.0.0.1:5000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    if (response.ok) {
      const newMessage = await response.json();
      setMessages([
        ...messages,
        { ...newMessage, description: input, from_id: userId },
      ]);
      setInput("");
    } else {
      console.error("Failed to send message:", await response.text());
    }
  };

  const proposePrice = async () => {
    if (!selectedManager || isNaN(userId) || !proposedPrice.trim()) return;
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/negotiations/propose_price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            negotiation_id: vehicleId,
            user_id: userId,
            manager_id: selectedManager,
            proposed_price: proposedPrice,
          }),
        }
      );
      if (response.ok) {
        //alert("Price proposal sent.");
        setProposedPrice(""); // Reset proposed price input
      } else {
        console.error("Failed to propose price:", await response.text());
      }
    } catch (error) {
      console.error("Propose price failed:", error);
    }
  };

  return (
    <div>
      <DealershipNavbarLogged />

      <h1 className="negotiationHeader">
        Negotiating for Vehicle ID: {vehicleId}
      </h1>
      {!selectedManager ? (
        <div className="managerSelection">
          <h2>Select a Manager:</h2>
          {managers.map((manager) => (
            <button
              key={manager.id}
              onClick={() => handleSelectManager(manager.id)}
              className="managerButton"
              id={"negotiationManagerSelect" + manager.id}
            >
              {manager.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="messageList">
          {messages.map((msg, index) => (
            <p key={index} className="messageItem">{`${
              msg.from_id === userId ? "Me" : "Manager"
            }: ${msg.description}`}</p>
          ))}
          <textarea
            className="textInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            id="negotiateTextBox"
          />
          <button
            className="sendButton"
            onClick={sendMessage}
            id="negotiateSendMessageButton"
          >
            Send
          </button>
          <input
            type="number"
            className="textInput"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder="Propose a price..."
            id="negotiatePropsePriceInput"
          />
          <button
            className="priceButton"
            onClick={proposePrice}
            id="negotiateProposePriceButton"
          >
            Propose Price
          </button>
        </div>
      )}
    </div>
  );
}

export default NegotiationPage;