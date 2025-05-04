import React, { useState, useEffect } from 'react';
import heartIcon from '../images/Heart.png'; // Path to heart icon image
import heartIconFilled from '../images/heart_red.png'; // Path to filled heart icon image
import { FaHeart } from 'react-icons/fa';

function FavoriteButton({ make, model, year }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("access_token");  // Assuming token is stored with this key

  useEffect(() => {
      const checkFavoriteStatus = async () => {
          const data = { custID: userId, make, model, year };
          try {
              const response = await fetch('http://127.0.0.1:5000/checkFavorite', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
                  },
                  body: JSON.stringify(data),
              });
              if (response.ok) {
                  const result = await response.json();
                  setIsFavorited(result.isFavorited);
              } else {
                  throw new Error('Failed to check favorite status');
              }
          } catch (error) {
              console.error('Error checking favorite status', error);
          }
      };

      checkFavoriteStatus();
  }, [userId, make, model, year, token]);

  const toggleFavorite = async () => {
      const data = { custID: userId, make, model, year };
      const url = isFavorited ? 'http://127.0.0.1:5000/delFavorite' : 'http://127.0.0.1:5000/addFavorite';
      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
              },
              body: JSON.stringify(data),
          });
          if (response.ok) {
              setIsFavorited(!isFavorited);
          } else {
              throw new Error('Failed to toggle favorite');
          }
      } catch (error) {
          console.error('Error toggling favorite', error);
      }
  };

  return (
      <FaHeart
          style={{color:isFavorited ? "pink" : "gray", fontSize: '2rem'}}
          className="heart-icon"
          alt={isFavorited ? 'Unfavorite' : 'Favorite'}
          onClick={toggleFavorite}
      />
  );
}

export default FavoriteButton;

