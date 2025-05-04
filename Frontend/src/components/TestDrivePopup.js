// TestDrivePopup.js
import React, { useState, useEffect } from "react";

import "../styles/TestDrivePopup.css";

function TestDrivePopup({ onClose, userId }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");  // Retrieve the token from local storage

    if (selectedDate !== "") {
      fetch("http://127.0.0.1:5000/availableTestDriveTimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // Include the token in the Authorization header
        },
        body: JSON.stringify({ date: selectedDate }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTimeSlots(data.availableTimes || []);
        })
        .catch((error) =>
          console.error("Error fetching available times:", error)
        );
    }
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedTime(""); // Reset selected time when date changes
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleSchedule = () => {
    if (selectedTime !== "" && userId) {
      console.log("Scheduling Test Drive for", selectedDate, selectedTime);

      fetch("http://127.0.0.1:5000/scheduleTestDriveAppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custID: userId,
          datetime: `${selectedDate} ${selectedTime}`,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not ok.");
        })
        .then((data) => {
          console.log(data.message); // Log the success message
          onClose(); // Close the modal on success
        })
        .catch((error) => console.error("Error scheduling test drive:", error));
    }
  };

  return (
    <div className="test-drive-modal-backdrop">
      <div className="test-drive-modal">
        <h2>Book a Test Drive</h2>
        <div className="test-drive-form">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="TestDrivePopupDate"
            value={selectedDate}
            onChange={handleDateChange}
          />

          <label htmlFor="time">Select Time:</label>
          <select
            id="TestDrivePopupTime"
            value={selectedTime}
            onChange={handleTimeChange}
            disabled={timeSlots.length === 0}
          >
            <option value="">Select Time</option>
            {timeSlots.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="schedule-button"
            onClick={handleSchedule}
            id="testDriveButton"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestDrivePopup;
