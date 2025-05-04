import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/chatPage.css'; // Adjust the path according to your project structure
import DealershipNavbar from "../components/ManagerDealershipNavbarLogged";


function ChatPage() {
    const { userId, vehicleId, managerId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
    }, [userId, vehicleId, managerId]);

    const fetchMessages = async () => {
        const response = await fetch(`http://127.0.0.1:5000/messages/${vehicleId}/${managerId}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            setMessages(data);
        } else {
            console.error("Failed to fetch messages");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const messageData = {
            from_id: parseInt(localStorage.getItem("user_id"), 10),
            to_id: parseInt(userId, 10),
            vehicle_id: vehicleId,
            description: newMessage,
        };
        const response = await fetch('http://127.0.0.1:5000/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(messageData)
        });
        if (response.ok) {
            setMessages(messages => [...messages, {...messageData, insert_date: new Date().toISOString()}]);
            setNewMessage("");
        } else {
            console.error("Failed to send message", await response.text());
        }
    };

    return (
        <div>
            <DealershipNavbar />
            <h1 className="chatHeader">Chat with Customer</h1>
            <div className="messageBox">
                {messages.map((msg, index) => (
                    <p key={index} className="messageItem">
                        <strong>{msg.from_id === parseInt(localStorage.getItem("user_id"), 10) ? 'Me' : 'Customer'}:</strong> {msg.description || "No message content"}
                    </p>
                ))}
            </div>
            <textarea
                className="textInput"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
            />
            <button className="sendButton" onClick={sendMessage}>Send Message</button>
        </div>
    );
}

export default ChatPage;
