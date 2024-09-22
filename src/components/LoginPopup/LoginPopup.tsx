"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import styles from "./LoginPopup.module.css"; // Import the CSS module

interface LoginPopupProps {
  closePopup: () => void; // Function passed from parent to close the popup
}

const LoginPopup: React.FC<LoginPopupProps> = ({ closePopup }) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Get router for navigation

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      // Send the Google ID token to the backend
      const res = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }), // Using the Google ID token
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        if (data.token) {
          // If JWT token is returned, registration is complete (OTP verified)
          localStorage.setItem("token", data.token);
          alert("Login successful");
          closePopup(); // Close the popup on success
        } else {
          // If no token, OTP verification is required
          alert("OTP sent to your email. Please verify.");
          router.push(`/verify-otp?userId=${data.userId}`); // Redirect to OTP verification page with userId
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("An error occurred during login.");
    }
  };

  const handleGoogleFailure = () => {
    setError("Google login failed.");
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={closePopup}>
          &times;
        </button>
        <h2 className={styles.popupHeading}>Login with Google</h2>

        <div className={styles.popupGoogleButton}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPopup;
