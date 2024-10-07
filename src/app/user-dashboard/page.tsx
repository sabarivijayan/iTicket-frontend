"use client"
// Import necessary libraries and hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './user-dashboard.module.css'

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch bookings for the logged-in user
  const fetchUserBookings = async () => {
    try {
      // Get token from sessionStorage (assumes user is logged in and token is stored)
      const token = sessionStorage.getItem('token');

      // API call to fetch bookings for the user
      const response = await axios.get('http://localhost:4000/api/booking/list', {
        headers: {
          Authorization: `Bearer ${token}` // Include token in headers for verification
        }
      });

      if (response.data.success) {
        setBookings(response.data.data); // Set the bookings data
      } else {
        setError("Failed to fetch bookings.");
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Use polling to fetch bookings every 5 seconds
  useEffect(() => {
    fetchUserBookings(); // Fetch bookings on component mount

    const fetchInterval = setInterval(fetchUserBookings, 5000); // Poll every 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(fetchInterval);
  }, []); // Empty dependency array ensures this effect runs only on mount/unmount

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the bookings list
  return (
    <div>
      <h2>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((booking) => (
            <div key={booking._id} className={styles.bookingItem}>
              <h3>{booking.movieName}</h3>
              <p>Theatre: {booking.theatreName}</p>
              <p>Date: {new Date(booking.date).toLocaleDateString('en-IN')}</p>
              <p>Showtime: {booking.showtime}</p>
              <p>Seats: {booking.bookedSeats.join(', ')}</p>
              <p>Total Price: ₹{booking.totalPrice}</p>
              <p>Payment Status: {booking.paymentStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
