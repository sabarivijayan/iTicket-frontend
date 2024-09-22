"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Use for getting query params

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null); // Handle errors
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params from URL
  const userId = searchParams.get("userId"); // Get userId from URL params

  useEffect(() => {
    if (!userId) {
      setError("User ID not provided.");
    }
  }, [userId]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User ID is missing.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }), // Send userId and OTP
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          // OTP verified successfully, store token and redirect
          localStorage.setItem("token", data.token);
          router.push("/dashboard"); // Redirect to dashboard or home page
        } else {
          setError("OTP verification failed. Please try again.");
        }
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      setError("An error occurred during OTP verification.");
    }
  };

  return (
    <div className="otpModal">
      <div className="otpContent">
        <h2>Verify OTP</h2>
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="submitButton">
            Verify OTP
          </button>
        </form>
        {error && <p className="errorMessage">{error}</p>}
      </div>
    </div>
  );
};

export default OtpVerification;
